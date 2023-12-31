import { join } from 'path';
import * as bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { ServerAppException } from '~/http/exceptions/ServerAppException';
import { ResponseMessage } from '~/constant/ResponseMessageEnums';
import { Response, Request, Express } from 'express';
import { Multer } from 'multer';
import slugify from 'slugify';
import processEnvObj from '~/config/envs';
import streamifier from 'streamifier';
import { PaginationData } from '~/constant/interface';
import { File, Web3Storage } from 'web3.storage';
import { generateFromEmail, generateUsername } from 'unique-username-generator';

cloudinary.config({
  cloud_name: processEnvObj.CLOUDINARY_CLOUD_NAME,
  api_key: processEnvObj.CLOUDINARY_API_KEY,
  api_secret: processEnvObj.CLOUDINARY_API_SECRET,
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
export const generateSlug = (text: string) => {
  return slugify(text, {
    lower: true,
    strict: true,
    replacement: '-',
    remove: /[*+~.()'"!:@%]/g,
  });
};

// export const fileUpload = async (
//   assets: Express.Multer.File | Express.Multer.File[],
// ) => {
//   try {
//     console.log(assets);
//     const url = [];
//     assets = assets as Express.Multer.File[];
//     if (assets.length) {
//       for (const asset of assets as Express.Multer.File[]) {
//         const uploadStr =
//           'data:image/jpeg;base64,' + asset.buffer.toString('base64');
//         const result = await cloudinary.uploader.upload(uploadStr);
//         url.push(result.secure_url);

//         // fs.unlinkSync(asset.path);
//       }
//     } else {
//       assets = assets as unknown as Express.Multer.File;

//       const uploadStr =
//         'data:image/jpeg;base64,' + assets.buffer.toString('base64');
//       const result = await cloudinary.uploader.upload(uploadStr);
//       url.push(result.secure_url);
//       //fs.unlinkSync(assets.path);
//     }

//     return url;
//   } catch (error) {
//     console.log(error);
//     throw new ServerAppException(ResponseMessage.SERVER_ERROR);
//   }
// };

export const fileUpload = async (assets: Express.Multer.File[]) => {
  const client = new Web3Storage({ token: processEnvObj.WEB3STORAGE_API_KEY });
  try {
    const url = [];

    if (assets.length) {
      for (const asset of assets) {
        const content = asset.buffer;
        const name = asset.originalname;
        const file = new File([content], name);
        const cid = await client.put([file]);
        url.push(`https://${cid}.ipfs.w3s.link/${name}`);
      }
    }

    return url;
  } catch (error) {
    console.log(error);
    throw new ServerAppException(ResponseMessage.SERVER_ERROR);
  }
};

export const calculateTotalPages = (total: number, limit: number): number => {
  const numberToRound = total / limit;
  const remainder = total % limit;
  let totalPages = Math.round(numberToRound);
  if (remainder) {
    totalPages = totalPages + 1;
  }
  return totalPages;
};
export const generatePaginationMeta = (
  take: number,
  page: number,
  total: number,
  path: string,
): PaginationData => {
  const totalPages = calculateTotalPages(total, take);
  const nextPage = page >= totalPages ? totalPages : page + 1;
  const previousPage = page == 1 ? page : page - 1;
  const meta: PaginationData = {
    total,

    perPage: take,

    currentPage: page,
    totalPages,
    first: `${processEnvObj.APP_URL}/api/v1/${path}?pageSize=${take}&page=${page}`,
    last: `${processEnvObj.APP_URL}/api/v1/${path}?pageSize=${take}&page=${totalPages}`,
    prev: `${processEnvObj.APP_URL}/api/v1/${path}?pageSize=${take}&page=${previousPage}`,
    next: `${processEnvObj.APP_URL}/api/v1/${path}?pageSize=${take}&page=${nextPage}`,
  };
  return meta;
};
export const calculateAge = (dateOfBirth: string): number => {
  const currentDate = new Date();
  const dob = new Date(dateOfBirth);
  let age = currentDate.getFullYear() - dob.getFullYear();

  // Check if the birthday for this year has already occurred
  if (
    currentDate.getMonth() < dob.getMonth() ||
    (currentDate.getMonth() === dob.getMonth() &&
      currentDate.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
};
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) {
    return 0; // Return 0 for an empty array (you can also handle this differently)
  }

  const sum = numbers.reduce((total, num) => total + num, 0);
  const average = sum / numbers.length;
  return average;
};
export const suggestUserNameFromEmail = (email: string): string => {
  return generateFromEmail(email, 4);
};
export function isImage(file: any) {
  return file.mimetype.startsWith('image/');
}

// Example function to check if the file is a video based on MIME type
export function isVideo(file: any) {
  return file.mimetype.startsWith('video/');
}
