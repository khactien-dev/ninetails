import { ACTIONS_CHART_KEY } from '@/constants/charts';
import {
  ActionsKeyType,
  ChartDataItemType,
  DataTooltipItemType,
  GraphCustomPayloadType,
} from '@/interfaces';
import React, { Dispatch, SetStateAction, createContext, useContext } from 'react';
import { FullScreenHandle } from 'react-full-screen';

export const DEFAULT_VIEW_PORT = {
  min: 0,
  max: 6,
};
interface BuilderContextType {
  idChart: string;
  datas: Array<ChartDataItemType>;
  dataTemps: Array<ChartDataItemType>;
  y1Axis: string;
  y2Axis: string;
  legendKeys: Array<number | string>;
  dataTooltip?: Array<DataTooltipItemType>;
  positionTooltip: [number, number];
  viewPort: {
    min: number;
    max: number;
  };
  fullScreenChart: FullScreenHandle;
  actionKeys: ActionsKeyType;
  payload?: GraphCustomPayloadType;
  loadingChart: boolean;
  setLoadingChart: Dispatch<SetStateAction<boolean>>;
  setPayload: Dispatch<SetStateAction<GraphCustomPayloadType | undefined>>;
  setDatas: Dispatch<SetStateAction<Array<ChartDataItemType>>>;
  setDataTemps: Dispatch<SetStateAction<Array<ChartDataItemType>>>;
  setLegendKeys: Dispatch<SetStateAction<Array<number | string>>>;
  setDataTooltip: Dispatch<SetStateAction<Array<DataTooltipItemType> | undefined>>;
  setPositionTooltip: Dispatch<SetStateAction<[number, number]>>;
  setViewPort: Dispatch<SetStateAction<{ min: number; max: number }>>;
  setActionKeys: Dispatch<SetStateAction<ActionsKeyType>>;
  generateChart: (routesY1: string, routesY2: string, legendKeys?: Array<string | number>) => void;
}

export const BuilderChartContext = createContext<BuilderContextType>({
  idChart: '',
  datas: [],
  dataTemps: [],
  y1Axis: '',
  y2Axis: '',
  legendKeys: [],
  dataTooltip: undefined,
  positionTooltip: [0, 0],
  viewPort: DEFAULT_VIEW_PORT,
  actionKeys: {
    active: [ACTIONS_CHART_KEY.AVG],
    disable: [ACTIONS_CHART_KEY.CUMULATION, ACTIONS_CHART_KEY.TOTAL],
  },
  payload: undefined,
  loadingChart: false,
  setLoadingChart: () => {},
  setPayload: () => {},
  setDatas: () => {},
  setDataTemps: () => {},
  setLegendKeys: () => {},
  setDataTooltip: () => {},
  setPositionTooltip: () => {},
  setViewPort: () => {},
  fullScreenChart: {
    active: true,
    enter: () => Promise.resolve(),
    exit: () => Promise.resolve(),
    node: React.createRef<HTMLDivElement>(),
  },
  setActionKeys: () => {},
  generateChart: () => {},
});

export const useGraphBuilderContext = () => useContext(BuilderChartContext);
