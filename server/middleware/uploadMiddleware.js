import multer from 'multer';

// 20 MB max — large enough for a multi-year PDF compilation
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

/**
 * Multer configured with memory storage.
 * The file buffer is passed to Cloudinary's upload_stream in the controller.
 * We validate the MIME type here AND again in the controller for defence-in-depth.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter(_req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(
        Object.assign(new Error('Only PDF files are allowed.'), {
          code: 'INVALID_FILE_TYPE',
        }),
        false
      );
    }
  },
});

export default upload;
