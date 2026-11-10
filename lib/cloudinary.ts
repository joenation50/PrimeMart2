// lib/cloudinary.ts
// Upload signatures + transformation URL builders.

import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
  secure: true,
});

export function generateUploadSignature(folder = 'primemart') {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder, moderation: 'aws_rek' };
  const signature = cloudinary.utils.api_sign_request(params, env.cloudinaryApiSecret);
  return {
    timestamp,
    signature,
    apiKey: env.cloudinaryApiKey,
    cloudName: env.cloudinaryCloudName,
    folder,
    moderation: 'aws_rek',
  };
}

export const transformations = {
  card: (publicId: string) =>
    `https://res.cloudinary.com/${env.cloudinaryCloudName}/image/upload/w_600,h_750,c_fill,q_auto,f_auto/${publicId}`,
  
  carousel: (publicId: string) =>
    `https://res.cloudinary.com/${env.cloudinaryCloudName}/image/upload/w_800,h_1000,c_fill,q_auto,f_auto/${publicId}`,
  
  detail: (publicId: string) =>
    `https://res.cloudinary.com/${env.cloudinaryCloudName}/image/upload/w_1200,q_auto,f_auto/${publicId}`,
  
  detailZoom: (publicId: string) =>
    `https://res.cloudinary.com/${env.cloudinaryCloudName}/image/upload/w_2000,q_auto,f_auto/${publicId}`,
  
  thumb: (publicId: string) =>
    `https://res.cloudinary.com/${env.cloudinaryCloudName}/image/upload/w_200,h_250,c_fill,q_auto,f_auto/${publicId}`,
  
  avatar: (publicId: string) =>
    `https://res.cloudinary.com/${env.cloudinaryCloudName}/image/upload/w_200,h_200,c_fill,r_max,q_auto,f_auto/${publicId}`,
  
  blur: (publicId: string) =>
    `https://res.cloudinary.com/${env.cloudinaryCloudName}/image/upload/w_20,e_blur:1000,q_1/${publicId}`,
  
  og: (publicId: string) =>
    `https://res.cloudinary.com/${env.cloudinaryCloudName}/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/${publicId}`,
};

export { cloudinary };