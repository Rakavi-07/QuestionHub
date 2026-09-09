import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';
import QuestionPaper from '../models/QuestionPaper.js';
import {
  isValidSemester,
  isValidSubjectCode,
  getSubjectsForSemester,
} from '../utils/subjects.js';

// 20 MB — must mirror uploadMiddleware.js limit
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

/**
 * Helper: upload a buffer to Cloudinary via upload_stream.
 * Returns the Cloudinary upload result (secure_url, public_id, bytes, …).
 */
function uploadBufferToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    if (!Buffer.isBuffer(buffer) && !(buffer instanceof Uint8Array)) {
      return reject(new TypeError('Expected raw file buffer for Cloudinary upload.')); 
    }

    const binaryBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

    console.log('DEBUG uploadBufferToCloudinary');
    console.log('binaryBuffer length:', binaryBuffer.length);
    console.log('resource_type:', options.resource_type);
    console.log('format:', options.format);

    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      console.log('Cloudinary result bytes:', result?.bytes);
      console.log('Cloudinary result format:', result?.format);
      console.log('Cloudinary result secure_url:', result?.secure_url);
      resolve(result);
    });

    // Keep the PDF bytes untouched as binary data; do not stringify or base64 encode.
    streamifier.createReadStream(binaryBuffer).pipe(stream);
  });
}

// We don't need buildPublicId because we are passing the 'folder' option to Cloudinary.
// We will just use the subjectCode as the public_id within that folder.

// ─── GET ALL /api/admin/question-papers ──────────────────────────────────────
/**
 * @route   GET /api/admin/question-papers
 * @desc    List all uploaded question papers (optionally filtered by semester/subjectCode)
 * @access  Admin
 */
export async function getAllQuestionPapers(req, res, next) {
  try {
    const filter = {};
    if (req.query.semester) {
      const sem = Number(req.query.semester);
      if (!isValidSemester(sem)) {
        return res.status(400).json({ message: 'Invalid semester value.' });
      }
      filter.semester = sem;
    }
    if (req.query.subjectCode) {
      filter.subjectCode = req.query.subjectCode.trim();
    }

    const papers = await QuestionPaper.find(filter).sort({ semester: 1, subjectCode: 1 }).lean();
    return res.status(200).json({ papers });
  } catch (error) {
    next(error);
  }
}

// ─── GET ONE /api/admin/question-papers/:subjectCode ─────────────────────────
/**
 * @route   GET /api/admin/question-papers/:subjectCode
 * @desc    Get metadata for a single subject's question paper
 * @access  Admin
 */
export async function getQuestionPaperBySubjectCode(req, res, next) {
  try {
    const { subjectCode } = req.params;
    const paper = await QuestionPaper.findOne({ subjectCode: subjectCode.trim() }).lean();
    if (!paper) {
      return res.status(404).json({ message: 'No question paper found for this subject.' });
    }
    return res.status(200).json({ paper });
  } catch (error) {
    next(error);
  }
}

// ─── UPLOAD /api/admin/question-papers ───────────────────────────────────────
/**
 * @route   POST /api/admin/question-papers
 * @desc    Upload a new PDF for a subject (must not already have one)
 * @access  Admin
 * Body (multipart/form-data): semester, subjectCode, subjectName, pdf (file)
 */
export async function uploadQuestionPaper(req, res, next) {
  try {
    const { semester, subjectCode, subjectName } = req.body;
    const file = req.file;

    // ── Field validation ────────────────────────────────────────────────────
    if (!semester || !subjectCode || !subjectName) {
      return res.status(400).json({
        message: 'semester, subjectCode, and subjectName are required fields.',
      });
    }

    const numSemester = Number(semester);
    if (!isValidSemester(numSemester)) {
      return res.status(400).json({ message: 'Invalid semester value.' });
    }

    if (!isValidSubjectCode(numSemester, subjectCode.trim())) {
      return res.status(400).json({
        message: 'Invalid subject code for the selected semester.',
      });
    }

    // ── File validation ─────────────────────────────────────────────────────
    if (!file) {
      return res.status(400).json({ message: 'A PDF file is required.' });
    }
    console.log(req.file.originalname);
    console.log(req.file.mimetype);
    console.log(req.file.size);
    console.log(req.file.buffer.length);
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Only PDF files are allowed.' });
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({ message: 'PDF file size must be 20 MB or less.' });
    }

    // ── Duplicate check ─────────────────────────────────────────────────────
    const existing = await QuestionPaper.findOne({ subjectCode: subjectCode.trim() });
    if (existing) {
      return res.status(409).json({
        message:
          'A question paper already exists for this subject. Use the Replace endpoint to update it.',
      });
    }

    // ── Cloudinary upload ───────────────────────────────────────────────────
    const uploadResult = await uploadBufferToCloudinary(file.buffer, {
      resource_type: 'raw',         // 'raw' is required for PDFs to avoid 401 errors on delivery
      public_id: `${subjectCode.trim()}.pdf`, // Include extension for raw files
      folder: `questionhub/question-papers/semester-${numSemester}`,
      overwrite: false,
      type: 'upload',
      access_mode: 'public',
      timeout: 120000,
    });

    // ── MongoDB record ──────────────────────────────────────────────────────
    const paper = await QuestionPaper.create({
      semester: numSemester,
      subjectCode: subjectCode.trim(),
      subjectName: subjectName.trim(),
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      originalFileName: file.originalname,
      fileSize: file.size,
    });

    return res.status(201).json({
      message: 'Question paper uploaded successfully.',
      paper,
    });
  } catch (error) {
    next(error);
  }
}

// ─── REPLACE /api/admin/question-papers/:subjectCode ─────────────────────────
/**
 * @route   PUT /api/admin/question-papers/:subjectCode
 * @desc    Replace the PDF for an existing subject's question paper.
 *          Upload new first; delete old only on success.
 * @access  Admin
 * Body (multipart/form-data): pdf (file)
 */
export async function replaceQuestionPaper(req, res, next) {
  try {
    const { subjectCode } = req.params;
    const file = req.file;

    // ── Find existing record ────────────────────────────────────────────────
    const existing = await QuestionPaper.findOne({ subjectCode: subjectCode.trim() });
    if (!existing) {
      return res.status(404).json({
        message: 'No question paper found for this subject. Use upload to add a new one.',
      });
    }

    // ── File validation ─────────────────────────────────────────────────────
    if (!file) {
      return res.status(400).json({ message: 'A replacement PDF file is required.' });
    }
    console.log(req.file.originalname);
    console.log(req.file.mimetype);
    console.log(req.file.size);
    console.log(req.file.buffer.length);
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Only PDF files are allowed.' });
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({ message: 'PDF file size must be 20 MB or less.' });
    }

    const oldPublicId = existing.publicId;

    // ── Upload new PDF first ────────────────────────────────────────────────
    const uploadResult = await uploadBufferToCloudinary(file.buffer, {
      resource_type: 'raw',
      public_id: `${subjectCode.trim()}.pdf`,
      folder: `questionhub/question-papers/semester-${existing.semester}`,
      overwrite: true,           // overwrite the existing Cloudinary asset
      type: 'upload',
      access_mode: 'public',
      timeout: 120000,
    });

    // ── Delete old only if it's a different public_id ───────────────────────
    // (overwrite:true already handles same public_id; this is a safety guard)
    if (oldPublicId && oldPublicId !== uploadResult.public_id) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'raw' });
      } catch (cloudErr) {
        // Log but do not fail — old file cleanup is best-effort
        console.error('Failed to delete old Cloudinary asset:', cloudErr.message);
      }
    }

    // ── Update MongoDB ──────────────────────────────────────────────────────
    const updated = await QuestionPaper.findOneAndUpdate(
      { subjectCode: subjectCode.trim() },
      {
        fileUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        originalFileName: file.originalname,
        fileSize: file.size,
      },
      { new: true }
    );

    return res.status(200).json({
      message: 'Question paper replaced successfully.',
      paper: updated,
    });
  } catch (error) {
    next(error);
  }
}

// ─── DELETE /api/admin/question-papers/:subjectCode ──────────────────────────
/**
 * @route   DELETE /api/admin/question-papers/:subjectCode
 * @desc    Delete the question paper (Cloudinary + MongoDB)
 * @access  Admin
 */
export async function deleteQuestionPaper(req, res, next) {
  try {
    const { subjectCode } = req.params;

    const existing = await QuestionPaper.findOne({ subjectCode: subjectCode.trim() });
    if (!existing) {
      return res.status(404).json({ message: 'No question paper found for this subject.' });
    }

    // ── Delete from Cloudinary ──────────────────────────────────────────────
    try {
      await cloudinary.uploader.destroy(existing.publicId, { resource_type: 'raw' });
    } catch (cloudErr) {
      // Surface as a server error — we should not silently claim success
      return res.status(502).json({
        message: 'Cloudinary deletion failed. The paper has not been removed.',
        detail: cloudErr.message,
      });
    }

    // ── Delete from MongoDB ─────────────────────────────────────────────────
    await QuestionPaper.deleteOne({ subjectCode: subjectCode.trim() });

    return res.status(200).json({
      message: `Question paper for ${subjectCode} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}
