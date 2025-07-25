import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_PUB,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
});

export default cloudinary;
