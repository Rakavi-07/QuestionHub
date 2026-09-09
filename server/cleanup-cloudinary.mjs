import 'dotenv/config';
import cloudinary from './config/cloudinary.js';

import mongoose from 'mongoose';
import QuestionPaper from './models/QuestionPaper.js';

async function main() {
  const publicIdRaw = 'questionhub/question-papers/semester-1/BPT19101.pdf';
  const publicIdImg = 'questionhub/question-papers/semester-1/BPT19101';

  const types = ['upload', 'private', 'authenticated'];

  for (const resourceType of ['raw', 'image']) {
    const pId = resourceType === 'raw' ? publicIdRaw : publicIdImg;
    for (const type of types) {
      try {
        console.log(`Destroying ${resourceType} ${type} asset: ${pId}`);
        const result = await cloudinary.uploader.destroy(pId, {
          resource_type: resourceType,
          type: type,
        });
        console.log('Result:', result);
      } catch (err) {
        console.log(`Error destroying ${resourceType} ${type}:`, err.message);
      }
    }
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  const deleteRes = await QuestionPaper.deleteOne({ subjectCode: 'BPT19101' });
  console.log('MongoDB deletion result:', deleteRes);
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

main().catch(console.error);
