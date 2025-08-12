import {
  BadRequestException,
  FileTypeValidator,
  Injectable,
  InternalServerErrorException,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import slugify from 'slugify';

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3 } from 'aws-sdk';
import { DataSource } from 'typeorm';
@Injectable()
export class FileService {
  private readonly client: S3Client;
  private bucketName = this.configService.get('NCLOUD_STORAGE_BUCKET_NAME');
  constructor(
    private readonly configService: ConfigService,
    private dataSource: DataSource,
  ) {
    const s3_region = this.configService.get('NCLOUD_STORAGE_REGION');

    if (!s3_region) {
      throw new Error(
        'NCLOUD_STORAGE_REGION not found in environment variables',
      );
    }
    this.client = new S3Client({
      endpoint: this.configService.get('NCLOUD_STORAGE_ENDPOINT'),
      region: s3_region,
      credentials: {
        accessKeyId: this.configService.get('NCLOUD_STORAGE_ACCESS_KEY'),
        secretAccessKey: this.configService.get(
          'NCLOUD_STORAGE_SECRET_ACCESS_KEY',
        ),
      },
    });
  }
  async uploadSingleFile({
    file,
    isPublic = true,
  }: {
    file: Express.Multer.File;
    isPublic: boolean;
  }) {
    try {
      console.log('file.originalname', file.originalname);
      const decodedOriginalName = Buffer.from(
        file.originalname,
        'latin1',
      ).toString('utf8');
      console.log('Decoded original name:', decodedOriginalName);
      const endCode = slugify(decodedOriginalName, {
        lower: true,
        strict: false, // Allow special characters like Korean letters
        remove: /[*+~.()'"!:@]/g, // Remove unwanted symbols
        replacement: '-',
      })
        .replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s_-]/g, '')
        .trim();
      console.log('endCode', endCode);
      const key = `${endCode}_${uuidv4()}`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: isPublic ? 'public-read' : 'private',
      });
      const uploadResult = await this.client.send(command);
      return {
        // url: isPublic
        //   ? (await this.getFileUrl(key)).url
        //   : (await this.getPresignedSignedUrl(key)).url,
        url: isPublic ? (await this.getFileUrl(key)).url : key,
        key,
        isPublic,
        result: uploadResult,
        name: file.originalname,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getFileUrl(key: string) {
    return {
      url: `https://kr.object.ncloudstorage.com/${this.bucketName}/${key}`,
    };
  }

  async getPresignedSignedUrl(key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, {
        expiresIn: 10, // 10s
      });

      return { url };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async deleteFile(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);

      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async uploadImage(file: any) {
    if (file) {
      const parseFilePipe = new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024,
            message:
              'This file is too large. Please upload the file smaller than 10MB.',
          }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      });
      try {
        await parseFilePipe.transform(file);
        let originalName = file.originalname;
        originalName = Buffer.from(originalName, 'latin1').toString('utf8');
        const sanitizedFileName = originalName.replace(/[\/:*?"<>|]/g, '');
        const fileExtension = sanitizedFileName.split('.').pop();
        const nameWithoutExtension = sanitizedFileName.substring(
          0,
          sanitizedFileName.length - fileExtension.length - 1,
        );
        const truncatedName =
          nameWithoutExtension.length > 50
            ? nameWithoutExtension.substring(0, 50)
            : nameWithoutExtension;
        let encodedName = Buffer.from(truncatedName, 'utf8').toString('base64');
        if (encodedName.length > 50) {
          encodedName = `${encodedName.substring(0, 46)}`;
        }

        file.originalname = `${encodedName}.${fileExtension}`;
        const name = `${truncatedName}.${fileExtension}`;
        const upload = await this.uploadSingleFile({
          file: file,
          isPublic: true,
        });
        return { url: upload.url, name: name };
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    }
  }
}
