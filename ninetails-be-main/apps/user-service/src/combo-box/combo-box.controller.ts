import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { responseHelper } from 'libs/utils/helper.util';
import { ComboBoxService } from './combo-box.service';
import {
  CreateComboBoxReq,
  CreateComboBoxRes,
  SearchComboBoxReq,
  UpdateComboBoxReq,
} from '../dto/combo-box.dto';

@ApiTags('Combo Box')
@Controller('combo-box')
@ApiBearerAuth()
export class ComboBoxController {
  constructor(private readonly comboBoxService: ComboBoxService) {}

  @Get()
  @ApiCreatedResponse({ type: CreateComboBoxRes })
  async getAllComboBox(@Query() payload: SearchComboBoxReq) {
    const combobox = await this.comboBoxService.getAll(payload);
    return responseHelper(combobox);
  }

  @Post('create')
  @ApiCreatedResponse({ type: CreateComboBoxRes })
  async create(@Body() body: CreateComboBoxReq) {
    const comboBox = await this.comboBoxService.create(body);
    return responseHelper(comboBox);
  }

  @Put('update/:id')
  @ApiCreatedResponse({ type: CreateComboBoxRes })
  async update(@Param('id') id: number, @Body() body: UpdateComboBoxReq) {
    const comboBox = await this.comboBoxService.update(id, body);
    return responseHelper(comboBox);
  }

  @Delete('delete/:id')
  @ApiCreatedResponse({ type: CreateComboBoxRes })
  async delete(
    @Param('id') id: number,
    @Request() req: { headers: { schema: string } },
  ) {
    const comboBox = await this.comboBoxService.delete(id, req.headers.schema);
    return responseHelper(comboBox);
  }
}
