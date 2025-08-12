import { parseDataItem } from '@/components/analysis/core-data-set/parse-data';
import { ICoreDataTree, IRawCoreDataItems } from '@/interfaces';

export const parseData = (rawData: IRawCoreDataItems) => {
  const data: ICoreDataTree[] = [];

  if (rawData) {
    const arrayData = Object.keys(rawData).map((item) => {
      return rawData[item as keyof IRawCoreDataItems];
    });

    if (arrayData?.length) {
      arrayData?.forEach((dataItem, index: number) => {
        // random key row so every change state the collapse of tree table will reset.
        const keyNumber = Math.random();
        const item = parseDataItem(dataItem, keyNumber, Object.keys(rawData)[index]);
        data.push(item);
      });
    }
  }
  return data;
};
