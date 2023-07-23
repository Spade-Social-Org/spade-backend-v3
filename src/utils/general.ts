import { join } from 'path';
import * as bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { ServerAppException } from '~/http/exceptions/ServerAppException';
import { ResponseMessage } from '~/constant/ResponseMessageEnums';
import { Response, Request, Express } from 'express';
import { Multer } from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const pathFromSrc = (path: string) => {
  return join(__dirname, '../', path);
};

export const hasher = async (text: string): Promise<string> => {
  const salt = await bcrypt.genSalt();

  return await bcrypt.hash(text, salt);
};
export const hashTextComparer = async (
  plaintext: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(plaintext, hash);
};
export const GenerateOTP = () => {
  let code = '';
  const arrChar = '1234567890';
  for (let i = 0; i < 6; i++) {
    code += arrChar[Math.floor(Math.random() * arrChar.length)];
  }

  return code;
};

export const fileUpload = async (
  assets: Express.Multer.File | Express.Multer.File[],
) => {
  try {
    const url = [];
    assets = assets as Express.Multer.File[];
    if (assets.length) {
      for (const asset of assets as Express.Multer.File[]) {
        const result = await cloudinary.uploader.upload(asset.path);
        url.push(result.secure_url);

        fs.unlinkSync(asset.path);
      }
    } else {
      assets = assets as unknown as Express.Multer.File;
      const result = await cloudinary.uploader.upload(assets.path);
      url.push(result.secure_url);
      fs.unlinkSync(assets.path);
    }

    return url;
  } catch (error) {
    throw new ServerAppException(ResponseMessage.SERVER_ERROR);
  }
};
