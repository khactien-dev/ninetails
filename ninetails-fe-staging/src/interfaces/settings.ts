/* eslint-disable no-undef */
import { StaticImageData } from 'next/image';
import React from 'react';

import { ComboBoxType } from './common';

export interface ISpecial {
  field: string;
}

export interface ILicense_plate {
  id: number;
  vehicle_number: string;
}

export interface IVehicleAbsence {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  id: 1;
  absence_type: any;
  start_date: string;
  end_date: string;
  period: string;
  repeat: 'NONE';
  repeat_days_week: null;
  repeat_days_month: null;
  absence_staff: any;
  replacement_vehicle: any;
  nearest: string;
}

export interface VehicleObj {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  id: number;
  vehicle_number: string;
  operation_start_date: string;
  operation_end_date: string;
  purpose: string;
  absence: any;
}

export interface RecordTypes {
  vehicle: VehicleObj;
  id: number;
  info?: string;
  terms?: string;
  contract?: string;
  rider?: string;
  out?: string;
  contact?: string;
  department: ComboBoxType | null;
  position: ComboBoxType | null;
  email?: string;
  key: string;
  lastLogin?: string;
  max_capacity?: null | ComboBoxType | any;
  name?: string;
  nameEmail?: string;
  capacity?: null | ComboBoxType | any;
  password?: string;
  role?: string;
  status: number | any;
  vehicle_type?: null | ComboBoxType | any;
  vehicle_number: string;
  operation_start_date: string;
  absence?: IVehicleAbsence;
  operation_end_date: string;
  vehicle_model: null | ComboBoxType | any;
  manufacturer?: null | ComboBoxType | any;
  purpose: string;
  coordination_status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  organization_id: number;
  full_name: string;
  race: string;
  route_id: number;
  driver: IDriver;
  wsDriver: IDriver;
  licensePlate: ILicense_plate;
  license_plate: ILicense_plate;
  field_agent_1: IDriver;
  field_agent_2: IDriver;
  wsFieldAgent2: IDriver;
  backup_field_agent_1: IDriver;
  wsFieldAgent1: IDriver;
  backup_field_agent_2: IDriver;
  wsBackupFieldAgent2: IDriver;
  wsBackupFieldAgent1: IDriver;
  backup_driver: IDriver;
  wsBackupDriver: IDriver;
  dispatch_no: string;
  working_date: string;
  note: string;
  driver_id: number;
  vehicle_id: number;
}

export interface IDriver {
  id: number;
  name: string;
  color: string;
  contract_type: string;
  job_contract: string;
}

export interface RecordRequiredTypes {
  key: string;
  status: string;
}

export interface ButtonItem {
  name: string;
  isActive: boolean;
  icon?: JSX.Element;
  pngIcon?: StaticImageData;
  isPrimary?: boolean;
  isFilter?: boolean;
  isOutline?: boolean;
  onClick?: () => void;
}

export interface TabsItem {
  key: string;
  label: string;
}

export interface ColumnsTypes {
  title: string;
  dataIndex: string;
  sorter?: boolean;
  render?: (value?: any, record?: any, index?: number) => React.ReactNode;
  key?: string | number;
  width?: string | number;
}

export interface MenuItem {
  name: string;
  icon: string | StaticImageData;
}

export interface TableSettingsProps {
  tableName: string;
  buttonArr: ButtonItem[];
}

export interface IEdgeServer {
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  id?: number;

  edge_name: string;
  hw_model: string;
  edge_app_version: string;
  os_version: string;
  docker_version: string;
  serial: string;
  kernel_version: string;
  mac_address: string;
  license_plate_id: number;
  password: string;
  status: boolean;

  hw_version?: string;
  edge_setting_version?: string | number;
  jetpack_version?: string;
  edge_metrics?: string;
  collection_metrics?: string;
  operation_metrics?: string;
  operation_status_ui?: string;
  collection_status_ui?: string;
  volume_analysis_ui?: string;
  quantity_analysis_ui?: string;
  video_ui?: string;

  vehicle?: {
    id?: number;
    vehicle_number?: string;
  };

  key?: string;
}

export interface IEdgeServerListResponse {
  data: IEdgeServer[];
}

export interface IEdgeServerResponse {
  data: IEdgeServer;
}

export interface IotButtonTableItem {
  key: string;
  status: string;
  buttonNameHostPhone: string;
  battery: string;
  gpsXY: string;
  button: string;
  finalReportFinalSignal: string;
  pairing: string;
  session: string;
}

export interface IotButtonItem {
  key: string;
  status: string;
  buttonName: string;
  swVersion: string;
  hwModel: string;
  hostPhone: string;
  transmissionFrequency: string;
  identifier: string;
  gpsX: string;
  gpsY: string;
  battery: string;
  pairing: string;
  secureKey: string;
  finalReport: string;
  finalSignal: string;
  button: string;
  session: string;
}

export interface ClusterTableItem {
  key: string;
  clusterNameDescription: string;
  trafficDistanceCongestion: string;
  avrMovementSpeed: string;
  avrCollectionAmount: string;
  situation: number;
}

export interface ClusterItem {
  clusterName: string;
  explanation: string;
  distance: string;
  crowding: string;
  avrMovementSpeed: string;
  avrCollectionAmount: string;
  situation: number;
}

export interface GetVehicleResponse {
  data: RecordTypes[];
}

export interface IWeightConfig {
  [key: string]: number;
}

export interface IWeightConfigResponse {
  data: IWeightConfig;
}
