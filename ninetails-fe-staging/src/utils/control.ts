import { ConvertDashboardDataOutput, IDataType, IScore } from '@/interfaces';

export const getDriveState = (drive_mode?: number) => {
  switch (drive_mode) {
    case 1:
      return {
        name: '수거지로 이동',
        icon: '/images/map/state/state-1.svg',
        color: 'orange',
      };
    case 2:
      return {
        name: '매립지로 이동',
        icon: '/images/map/state/state-2.svg',
        color: 'yellow',
      };
    case 3:
      return {
        name: '차고지로 복귀',
        icon: '/images/map/state/state-3.svg',
        color: 'green',
      };
    case 4:
      return {
        name: '식당으로 이동',
        icon: '/images/map/state/state-4.svg',
        color: 'blue',
      };
    case 5:
      return {
        name: '수거운행',
        icon: '/images/map/state/state-5.svg',
        color: 'pink',
      };
    case 6:
      return {
        name: '대기 (공회전)',
        icon: '/images/map/state/state-6.svg',
        color: 'purple',
      };
    case 7:
      return {
        name: '미관제',
        icon: '/images/map/state/state-7.svg',
        color: 'gray',
      };
    case 8:
      return {
        name: '운행종료 (휴식)',
        icon: '/images/map/state/state-8.svg',
        color: 'black',
      };
    default:
      return {
        name: '기타운행 (미선택)',
        icon: '/images/map/state/state-0.svg',
        color: 'red',
      };
  }
};

export const convertScore = (data?: IScore) => {
  try {
    if (!data) return;
    const score: IScore = {
      latest: data?.latest,
      mean: data?.mean,
      standardDeviation: data?.standardDeviation,
    };
    const keys = Object.keys(score);
    const result: IDataType = {};

    const innerKeys = Object.keys(score[keys[0]]);

    innerKeys.forEach((innerKey) => {
      const newObj: { [key: string]: number } = {};
      keys.forEach((key) => {
        newObj[key] = score[key][innerKey];
      });

      result[innerKey] = newObj;
    });

    return result;
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

export const dashboardDataConverted = (data: any, tab: string) => {
  try {
    if (!data) return null;
    const { dataNow, dataOld } = data;
    const result = {
      average: {
        ...Object.keys(dataNow).reduce((acc, key) => {
          acc[key] = {
            dataNow: dataNow[key]?.average || 0,
            dataOld: dataOld[key]?.average || 0,
            gap: dataNow[key]?.average - dataOld[key]?.average || 0,
          };
          return acc;
        }, {} as Record<string, { dataNow: number; dataOld: number; gap: number }>),
      },
      total: {
        ...Object.keys(dataNow).reduce((acc, key) => {
          acc[key] = {
            dataNow: dataNow[key]?.total || 0,
            dataOld: dataOld[key]?.total || 0,
            gap: dataNow[key]?.total - dataOld[key]?.total || 0,
          };
          return acc;
        }, {} as Record<string, { dataNow: number; dataOld: number; gap: number }>),
      },
    };

    return result[tab as keyof typeof result];
  } catch (error) {
    return null;
  }
};

export const roundToDecimal = (value: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

export const kmConversion = (value: number) => roundToDecimal(value / 1000, 3);
export const minuteConversion = (value: number) => roundToDecimal(value / 60, 3);

export const unitConverted = (data: any, tab: string) => {
  try {
    const analysisData = dashboardDataConverted(data, tab);
    if (!analysisData) return {};

    const keysToConvert = ['drivingDistance', 'collectionDistance'];
    const keysToConvertMinute = [
      'operatingTime',
      'collectionTime',
      'idling',
      // 'suddenAcceleration',
      // 'suddenBraking',
    ];

    const convertedData = Object.entries(analysisData).reduce((acc, [key, value]) => {
      if (keysToConvert.includes(key)) {
        acc[key] = {
          dataNow: kmConversion(value.dataNow),
          dataOld: kmConversion(value.dataOld),
          gap: kmConversion(value.gap),
        };
      } else if (keysToConvertMinute.includes(key)) {
        acc[key] = {
          dataNow: minuteConversion(value.dataNow),
          dataOld: minuteConversion(value.dataOld),
          gap: minuteConversion(value.gap),
        };
      } else {
        acc[key] = {
          dataNow: roundToDecimal(value.dataNow, 3),
          dataOld: roundToDecimal(value.dataOld, 3),
          gap: roundToDecimal(value.gap, 3),
        };
      }
      return acc;
    }, {} as ConvertDashboardDataOutput);

    return convertedData;
  } catch (error) {
    console.error('An error occurred:', error);
    return {};
  }
};

export const formatNumberShorthand = (value: number | undefined, decimal: number = 1): string => {
  if (value === undefined || value === null || value === 0) return '--';

  if (value >= 1000000) {
    return (value / 1000000).toFixed(decimal).replace(/\.?0+$/, '') + 'M'; // Format for millions
  }

  // if (value >= 1000) {
  //   return (value / 1000).toFixed(decimal).replace(/\.?0+$/, '') + 'K'; // Format for thousands
  // }

  return Number(value.toFixed(decimal)).toString();
};

export const roundingNumber = (value: number | undefined, decimal: number = 3) => {
  try {
    if (value === undefined || value === null || value === 0) return '--';
    return formatNumberShorthand(value, decimal);
  } catch (error) {
    return '--';
  }
};

export const minuteToTime = (value: number | undefined) => {
  if (value === undefined || value === null || value === 0) return '--';
  let seconds = value;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
    Math.floor(seconds)
  ).padStart(2, '0')}`;
};
