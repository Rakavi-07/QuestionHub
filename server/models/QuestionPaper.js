import mongoose from 'mongoose';

/**
 * QuestionPaper stores the Cloudinary metadata for one PDF per subject.
 * Unique index on subjectCode enforces the ONE PDF per subject rule.
 */
const questionPaperSchema = new mongoose.Schema(
  {
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    subjectCode: {
      type: String,
      required: [true, 'Subject code is required'],
      trim: true,
      unique: true,          // ONE paper per subject, always
    },
    subjectName: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    publicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    originalFileName: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,          // bytes
      default: 0,
    },
  },
  { timestamps: true }       // provides createdAt (uploadedAt) and updatedAt automatically
);

// Compound index for semester + subjectCode queries (used in list filtering)
questionPaperSchema.index({ semester: 1, subjectCode: 1 });

export default mongoose.model('QuestionPaper', questionPaperSchema);
