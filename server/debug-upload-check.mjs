import 'dotenv/config';
import fs from 'node:fs';
import mongoose from 'mongoose';
import cloudinary from './config/cloudinary.js';
import QuestionPaper from './models/QuestionPaper.js';

const pdfText = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 18 Tf 50 70 Td (QuestionHub PDF OK) Tj ET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000062 00000 n \n0000000123 00000 n \n0000000245 00000 n \n0000000376 00000 n \ntrailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n462\n%%EOF\n';
const pdfBuffer = Buffer.from(pdfText, 'binary');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await QuestionPaper.findOne({ subjectCode: 'BPT19101' }).lean();
  console.log('existing record before:', existing ? { subjectCode: existing.subjectCode, publicId: existing.publicId, fileUrl: existing.fileUrl } : null);

  if (existing && existing.publicId) {
    try {
      await cloudinary.uploader.destroy(existing.publicId, { resource_type: 'raw' });
      console.log('destroyed cloudinary asset', existing.publicId);
    } catch (cloudErr) {
      console.log('destroy error', cloudErr.message);
    }
    await QuestionPaper.deleteOne({ subjectCode: 'BPT19101' });
    console.log('deleted db record');
  }

  await mongoose.disconnect();

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        public_id: 'BPT19101.pdf',
        folder: 'questionhub/question-papers/semester-1',
        overwrite: true,
        type: 'upload',
        access_mode: 'public',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.write(pdfBuffer);
    stream.end();
  });

  console.log(JSON.stringify(uploadResult, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
