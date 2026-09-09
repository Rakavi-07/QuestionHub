import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary is configured here for future phases (question paper PDF
 * uploads). No upload logic is implemented yet — this only wires up the
 * SDK with credentials from environment variables so it's ready to use.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
