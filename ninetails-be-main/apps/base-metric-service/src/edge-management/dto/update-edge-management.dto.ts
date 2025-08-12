import { PartialType } from '@nestjs/swagger';
import {CreateEdgeManagementDto} from "./create-edge-management.dto";

export class UpdateEdgeManagementDto extends PartialType(CreateEdgeManagementDto) {}
