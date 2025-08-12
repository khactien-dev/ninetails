import { Body, Controller, Delete, Get, Post, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SignatureService } from '../services/signature.service';
import {
  GetSignedDto,
  SignatureCreateDto,
  SignatureResDto,
  SignDto,
} from '../dtos/signature.dto';
import { responseHelper } from 'libs/utils/helper.util';
import { EUserRole } from 'libs/enums/common.enum';

@Controller('signature')
@ApiTags('Signature')
@ApiBearerAuth()
export class SignatureController {
  constructor(private signatureService: SignatureService) {}

  @Post('create')
  @ApiOperation({ summary: 'Save Signature' })
  @ApiCreatedResponse({ type: SignatureResDto })
  async createSignature(
    @Body() body: SignatureCreateDto,
    @Request()
    req: { auth: { id: number; tenant: string }; headers: { schema: string } },
  ) {
    body.master_id = req.auth.id;
    body.url = body.url.replace(
      `https://kr.object.ncloudstorage.com/${process.env.NCLOUD_STORAGE_BUCKET_NAME}/`,
      '',
    );
    return responseHelper(
      await this.signatureService.save(body, req.headers?.schema),
    );
  }

  @Get('get')
  @ApiOperation({ summary: 'Get Signature' })
  @ApiOkResponse({ type: SignatureResDto })
  async getSignature(@Request() req: { auth: { id: number } }) {
    return responseHelper(
      await this.signatureService.findOneByUser(req.auth.id),
    );
  }

  @Post('sign')
  @ApiOperation({ summary: 'Sign' })
  @ApiOkResponse({ type: SignatureResDto })
  async sign(@Request() req: { auth: { id: number } }, @Body() body: SignDto) {
    return responseHelper(
      await this.signatureService.sign(req.auth.id, body.vehicle_id),
    );
  }

  @Post('signed')
  @ApiOperation({ summary: 'Get Signed' })
  @ApiOkResponse({ type: SignatureResDto })
  async getSigned(
    @Body() body: GetSignedDto,
    @Request() req: { auth: { id: number } },
  ) {
    const signed = await this.signatureService.getSigned({
      date: body.date,
      vehicleId: body.vehicle_id,
    });
    const user = await this.signatureService.findOneByUser(req.auth.id);
    return responseHelper({ signed, user });
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete Signed' })
  async deleteSigned(
    @Request() req: { auth: { id: number; role: EUserRole } },
    @Body() body: SignDto,
  ) {
    return responseHelper(
      await this.signatureService.delSigned(req.auth.role, body.vehicle_id),
    );
  }
}
