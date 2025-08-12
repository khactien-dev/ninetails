import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { responseHelper } from 'libs/utils/helper.util';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('File')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(pdf|jpeg|jpg|png|gif)' }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body('isPublic') isPublic: boolean,
  ) {
    const result = await this.fileService.uploadSingleFile({
      file,
      isPublic: isPublic,
    });
    return responseHelper(result);
  }

  @Get('/:key')
  async getFileUrl(@Param('key') key: string) {
    return this.fileService.getFileUrl(key);
  }

  @Get('/signed-url/:key')
  async getSingedUrl(@Param('key') key: string) {
    return this.fileService.getPresignedSignedUrl(key);
  }

  @Delete('/:key')
  async deleteFile(@Param('key') key: string) {
    return this.fileService.deleteFile(key);
  }
}
