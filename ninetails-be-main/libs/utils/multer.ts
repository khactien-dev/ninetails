import { diskStorage } from 'multer';
import * as path from 'path';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { BadRequestException } from '@nestjs/common';
import * as process from 'process';
import { existsSync, mkdirSync } from 'fs';

function genFileName(name: string) {
  name = name.replaceAll(' ', '+');
  return Date.now() + '_' + Math.round(Math.random() * 1e9) + '_' + name;
}

export const uploadFile = (): MulterOptions => {
  return {
    storage: diskStorage({
      destination: (_, __, callback) => {
        // Synchronously retrieve the environment variable
        const destinationPath = process.env.UPLOADED_FILES_DESTINATION;

        if (!destinationPath) {
          return callback(
            new Error('UPLOADED_FILES_DESTINATION is not set'),
            '',
          );
        }

        // Ensure the destination directory exists
        if (!existsSync(destinationPath)) {
          mkdirSync(destinationPath, { recursive: true });
        }

        // Call the callback with the final destination path
        callback(null, destinationPath);
      },
      filename: (req, file, callback) => {
        const originName = path.parse(file.originalname).name;
        const ext = path.extname(file.originalname);
        const filename = `${genFileName(originName)}${ext}`;
        callback(null, filename);
      },
    }),
    // limits: {
    //   fileSize: 1,
    // },
    fileFilter(req, file, cb) {
      // file.mimetype.match(/\/(csv|xlsx|txt)$/);
      if (
        [
          'text/xml',
          'text/plain',
          'text/csv',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'application/json',
        ].includes(file.mimetype)
      ) {
        cb(null, true);
      } else {
        cb(
          new BadRequestException(`Unsupported file type ${file.originalname}`),
          false,
        );
      }
      const fileSize = parseInt(req.headers['content-length']);

      const MAX_SIZE = 20000000;

      if (fileSize > MAX_SIZE) {
        cb(
          new BadRequestException(
            'This file is too large. Please upload the file smaller than 20MB',
          ),
          false,
        );
      } else {
        cb(null, true);
      }
    },
  };
};
