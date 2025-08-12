export interface IAnalysis {
  '5L_gen': number;
  '10L_gen': number;
  '10L_reu': number;
  '20L_gen': number;
  '20L_reu': number;
  '30L_gen': number;
  '50L_gen': number;
  '50L_pub': number;
  '75L_gen': number;
  '75L_pub': number;
  ext: string;
  etc: string;
  collectAmount: number;
  weight: number;
  max: number;
  min: number;
  distanceRatios: number;
  collectDistance: number;
  otherDistance: number;
  durationRatios: number;
  collectDuration: number;
  otherDuration: number;
  collectCount: number;
  manualCollectDistance: number;
  manualCollectTime: number;
  key: string;
  title: string;
  dataIndex: string;
}

export interface IAnalysisParam {
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  vehicleId?: string | null;
  routeName?: string | null;
  routeNames?: string | null;
  updateTime?: string | null;
}

export interface ICoreDataSetParams extends ICoreDataSetConfig {
  startDate?: string | null;
  endDate?: string | null;
  routeNames?: string;
}

export interface IDataAnalysis {
  total: IAnalysis;
  average: IAnalysis;
}

export interface IOperationStatistics {
  operatingRoutes: number;
  minStandardScore: number;
  maxStandardScore: number;
  averageStandardScore: number;
  mean: IAnalysis | any;
  standardDeviation: IAnalysis[] | any;
}

export interface GetCollectionStatistics {
  collectionStatistics: IDataAnalysis;
  operationStatistics: IOperationStatistics;
}

export interface GetRouteList {
  data: string[];
}

export enum CORE_DATASET_UNIT {
  Z_SCORE = 'z',
  MINUTE = 'minute',
  SECOND = 'second',
  KILOMETER = 'kilometer',
  METER = 'meter',
  PERCENTAGE = 'percentage',
  COUNT = 'count',
}

export interface ICoreDataTreeItem<T> {
  key?: string;
  schemaKey?: string;
  dispatch_area?: string;
  diagnosis?: boolean;
  layer?: number;
  unit?: string;
  titleBold?: boolean;
  parent?: string[] | null;
  rating?: string;
  EWM?: number;
  sectionName?: string;
  children?: T[];
  unit_code?: CORE_DATASET_UNIT;
}

export interface ICoreDataTree extends ICoreDataTreeItem<ICoreDataTree> {}

export interface IRawCoreDataItemSection {
  rating: string;
  diagnosis: boolean;
  EWM: number;
  sectionName: string;
}

export interface IRawCoreDataItemL2 {
  notSelected: IRawCoreDataItemSection;
  goingToCollectionArea: IRawCoreDataItemSection;
  goingToTheLandfill: IRawCoreDataItemSection;
  returnToGarage: IRawCoreDataItemSection;
  goingToRestaurant: IRawCoreDataItemSection;
  idling: IRawCoreDataItemSection;
  notManaged: IRawCoreDataItemSection;
  outOfControl: IRawCoreDataItemSection;
}

export interface IRawCoreDataItem {
  mainData: IRawCoreDataItemSection;
  distanceRatios: IRawCoreDataItemSection;
  collectDistance: IRawCoreDataItemSection;
  otherDistance: IRawCoreDataItemSection;
  durationRatios: IRawCoreDataItemSection;
  collectDuration: IRawCoreDataItemSection;
  otherDuration: IRawCoreDataItemSection;
  collectCount: IRawCoreDataItemSection;
  expandedCollectDistance: IRawCoreDataItemSection[];
  expandedCollectDuration: IRawCoreDataItemSection[];
  expandedOtherDistance: IRawCoreDataItemL2;
  expandedOtherDuration: IRawCoreDataItemL2;
  expandedCollectCount: IRawCoreDataItemSection[];
  manualCollectDistance: IRawCoreDataItemSection;
  manualCollectTime: IRawCoreDataItemSection[];
}

export interface IRawCoreDataItems {
  [key: string]: IRawCoreDataItem;
}

export interface ICoreDataSetConfig {
  distanceRatioRate?: number;
  durationRatioRate?: number;
  collectDistanceRate?: number;
  collectDurationRate?: number;
  collectCountRate?: number;
  manualCollectTimeRate?: number;
  alpha?: number;
  pValue?: number;
  percentageAE?: number;
  percentageBD?: number;
  percentageC?: number;
}

export interface ICoreDataSetSections {
  collectDistance: string[];
  collectionDuration: string[];
  collectAmount: string[];
}

export interface IModuleDataSetCondition {
  logicalOperator?: 'AND' | 'OR';
  L2Extension: string;
  L3Extension: {
    L3Extension?: string;
    column: string;
    condition: string;
    value: number;
  };
}

export interface IWeightMetricResponse {
  data: ICoreDataSetConfig;
}

export interface IWidgetDatasetParam {
  startDate?: string | null;
  endDate?: string | null;
  routeNames?: string | null;
  statisticMode?: string | null;
}

export interface IWidgetDataset {
  routeName: string;
  otherNotSelected_sum: number;
  otherNotSelected_average: number;
  goingToCollectionArea_sum: number;
  goingToCollectionArea_average: number;
  goingToTheLandfill_sum: number;
  goingToTheLandfill_average: number;
  goingToRestaurant_sum: number;
  returnToGarage_average: number;
  returnToGarage_sum: number;
  goingToRestaurant_average: number;
  idling_sum: number;
  idling_average: number;
  notManaged_sum: number;
  notManaged_average: number;
  outOfControl_sum: number;
  outOfControl_average: number;
  totalOfAllAverage: number;
  totalOfAllSum: number;
}
export interface IWidgetDatasetCollect {
  route_name: string;
  sections: [
    {
      section_name: string;
      total: number;
      average: number;
    }
  ];

  totalOfAll: number;
  totalOfAllAverage: number;
}
export interface GetWidgetDataset {
  routes?: IWidgetDataset[];
  total?: IWidgetDataset;
  collect?: IWidgetDatasetCollect[];
  totalOfAll?: null;
}

type CollectData = {
  total: Record<string, number | null>;
  average: Record<string, number | null>;
  EWM: Record<string, number | null>;
};

export type AVGDataType = {
  average: Record<string, number | null>;
  EWM: Record<string, number | null>;
};

export type DataRouteGraphType = {
  route: Record<string, Record<string, number | null>>;
  AVG: AVGDataType;
  sectionList?: Array<string>;
};

export type DrivingRouteDataType = {
  mainData: DataRouteGraphType;

  extended: {
    collectDuration: CollectData;
    collectDistance: CollectData;
    otherDuration: CollectData;
    otherDistance: CollectData;
  };
};

export type CollectCountDataColumnType = {
  AVG: AVGDataType;
  route: Record<string, Record<string, number | null>>;
};

export type GraphConditionType = {
  logicalOperator?: 'AND' | 'OR';
  domain: string;
  condition: string;
  value: number;
};

export type GraphCustomPayloadType = {
  routeName1: string;
  routeName2?: string;
  yAxises1: string;
  yAxises2: string;
  conditions1?: Array<GraphConditionType>;
  conditions2?: Array<GraphConditionType>;
  startDate: string;
  endDate: string;
  cumulation_y1?: number;
  cumulation_y2?: number;
};

export type GraphBuilderDataType = {
  mainData: {
    routeY1: Record<
      string,
      Record<
        string,
        {
          [key: string]: number | null;
        }
      >
    >;

    routeY2: Record<
      string,
      Record<
        string,
        {
          [key: string]: number | null;
        }
      >
    >;

    total: {
      totalY1: Record<string, number | null>;
      totalY2: Record<string, number | null>;
    };

    AVG: {
      averageY1: Record<string, number | null>;
      averageY2: Record<string, number | null>;
      EWMY1: Record<string, number | null>;
      EWMY2: Record<string, number | null>;
    };
  };
};
