import { Controller, Post, Body, HttpCode, Res } from '@nestjs/common';
import { EdgeManagementService } from './edge-management.service';
import {
  AuthEdgeManagementDto,
  AuthEdgeManagementDtoRes,
} from './dto/auth-edge-management.dto';
import {
  DispatchConfirmDtoReq,
  DispatchConfirmDtoRes,
} from './dto/dispatch-confirm.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VehicleInfoDtoReq, VehicleInfoDtoRes } from './dto/vehicle-info.dto';
import { RouteInfoDtoReq, RouteInfoDtoRes } from './dto/route-info.dto';
import { CoreSectionDtoReq, CoreSectionDtoRes } from './dto/core-section.dto';
import { EdgeInfoReq } from './dto/edge-info.dto';
import { EdgeSettingDtoReq } from './dto/edge-setting.dto';
import { SegmentInfoDtoReq } from './dto/segment-info.dto';
import { Response } from 'express';
import { RouteSegmentMapInfoDtoReq } from './dto/route-segment-map-info.dto';
import { GuideCodeInfoDtoReq } from './dto/guide-code-info.dto';
import { CongestionCodeInfoDtoReq } from './dto/congestion-code-info.dto';

@ApiTags('Edge Management')
@Controller('edge-management')
export class EdgeManagementController {
  constructor(private readonly edgeManagementService: EdgeManagementService) {}

  @Post('auth')
  @HttpCode(200)
  @ApiOperation({ summary: 'Auth edge server' })
  @ApiOkResponse({ type: AuthEdgeManagementDtoRes })
  async auth(
    @Body() authEdgeManagementDto: AuthEdgeManagementDto,
    @Res() res: Response,
  ) {
    const auth = await this.edgeManagementService.auth(authEdgeManagementDto);
    if (auth.status === 'failure') return res.status(400).json(auth);
    return res.status(200).json(auth);
  }

  @Post('dispatch-confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Dispatch Confirm' })
  @ApiOkResponse({ type: DispatchConfirmDtoRes })
  async dispatchConfirm(
    @Body() dispatchConfirmDtoReq: DispatchConfirmDtoReq,
    @Res() res: Response,
  ) {
    const dispatch = await this.edgeManagementService.dispatchConfirm(
      dispatchConfirmDtoReq,
    );
    if (dispatch.status === 'failure') return res.status(400).json(dispatch);
    return res.status(200).json(dispatch);
  }
  @Post('edge-setting')
  @HttpCode(200)
  @ApiOperation({ summary: 'Edge setting' })
  async edgeSetting(
    @Body() edgeSettingDtoReq: EdgeSettingDtoReq,
    @Res() res: Response,
  ) {
    const edge =
      await this.edgeManagementService.edgeSetting(edgeSettingDtoReq);
    if (edge.status === 'failure') return res.status(400).json(edge);
    return res.status(200).json(edge);
  }
  @Post('vehicle-info')
  @HttpCode(200)
  @ApiOperation({ summary: 'Vehicle info' })
  @ApiOkResponse({ type: VehicleInfoDtoRes })
  async vehicleInfo(
    @Body() vehicleInfoDtoReq: VehicleInfoDtoReq,
    @Res() res: Response,
  ) {
    const edge =
      await this.edgeManagementService.vehicleInfo(vehicleInfoDtoReq);
    if (edge.status === 'failure') return res.status(400).json(edge);
    return res.status(200).json(edge);
  }

  @Post('core-section-info')
  @HttpCode(200)
  @ApiOperation({ summary: 'Core section info' })
  @ApiOkResponse({ type: CoreSectionDtoRes })
  async coreSectionInfo(
    @Body() coreSectionDtoReq: CoreSectionDtoReq,
    @Res() res: Response,
  ) {
    const edge =
      await this.edgeManagementService.coreSectionInfo(coreSectionDtoReq);
    // if (edge.status === 'failure') return res.status(400).json(edge);
    return res.status(200).json(edge);
  }

  @Post('route-info')
  @HttpCode(200)
  @ApiOperation({ summary: 'Route info' })
  @ApiOkResponse({ type: RouteInfoDtoRes })
  async routeInfo(
    @Body() routeInfoDtoReq: RouteInfoDtoReq,
    @Res() res: Response,
  ) {
    const edge = await this.edgeManagementService.routeInfo(routeInfoDtoReq);
    if (edge.status === 'failure') return res.status(400).json(edge);
    return res.status(200).json(edge);
  }

  @Post('segment-info')
  @HttpCode(200)
  @ApiOperation({ summary: 'Segment info' })
  @ApiOkResponse({ type: RouteInfoDtoRes })
  async segmentInfo(
    @Body() segmentInfoDtoReq: SegmentInfoDtoReq,
    @Res() res: Response,
  ) {
    const edge =
      await this.edgeManagementService.segmentInfo(segmentInfoDtoReq);
    // if (edge.status === 'failure') return res.status(400).json(edge);
    return res.status(200).json(edge);
  }

  @Post('route-segment-map-info')
  @HttpCode(200)
  @ApiOperation({ summary: 'Route Segment Map info' })
  @ApiOkResponse({ type: RouteSegmentMapInfoDtoReq })
  async routeSegmentMapInfo(
    @Body() routeSegmentMapInfoDtoReq: RouteSegmentMapInfoDtoReq,
    @Res() res: Response,
  ) {
    const edge =
      await this.edgeManagementService.routeSegmentMapInfo(routeSegmentMapInfoDtoReq);
    if (edge.status === 'failure') return res.status(400).json(edge);
    return res.status(200).json(edge);
  }

  @Post('guide-code-info')
  @HttpCode(200)
  @ApiOperation({ summary: 'Guide Code info' })
  @ApiOkResponse({ type: GuideCodeInfoDtoReq })
  async guideCodeInfo(
    @Body() guideCodeInfoDtoReq: GuideCodeInfoDtoReq,
    @Res() res: Response,
  ) {
    const edge =
      await this.edgeManagementService.guideCodeInfo(guideCodeInfoDtoReq);
    if (edge.status === 'failure') return res.status(400).json(edge);
    return res.status(200).json(edge);
  }

  @Post('congestion-code-info')
  @HttpCode(200)
  @ApiOperation({ summary: 'Congestion Code info' })
  @ApiOkResponse({ type: CongestionCodeInfoDtoReq })
  async congestionCodeInfo(
    @Body() congestionCodeInfoDtoReq: CongestionCodeInfoDtoReq,
    @Res() res: Response,
  ) {
    const edge =
      await this.edgeManagementService.congestionCodeInfo(congestionCodeInfoDtoReq);
    if (edge.status === 'failure') return res.status(400).json(edge);
    return res.status(200).json(edge);
  }

  @Post('edge-info')
  @HttpCode(200)
  @ApiOperation({ summary: 'Edge info' })
  async edgeInfo(@Body() edgeInfoReq: EdgeInfoReq, @Res() res: Response) {
    const edge = await this.edgeManagementService.edgeInfo(edgeInfoReq);
    if (edge.status === 'failure') return res.status(400).json(edge);
    return res.status(200).json(edge);
  }
}
