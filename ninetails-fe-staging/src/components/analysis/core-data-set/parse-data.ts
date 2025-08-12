import {
  CORE_DATASET_UNIT,
  ICoreDataTree,
  IRawCoreDataItem,
  IRawCoreDataItemL2,
  IRawCoreDataItemSection,
  IRawCoreDataItems,
} from '@/interfaces';
import { v4 as uuid } from 'uuid';

const coreDataSetSchema: ICoreDataTree = {
  key: 'mainData',
  schemaKey: 'mainData',
  dispatch_area: '첨단 1',
  diagnosis: false,
  layer: 1,
  unit: 'z',
  titleBold: true,
  parent: null,
  unit_code: CORE_DATASET_UNIT.Z_SCORE,
  children: [
    {
      key: 'distanceRatios',
      schemaKey: 'distanceRatios',
      dispatch_area: '수거/기타 거리',
      diagnosis: true,
      layer: 2,
      unit: '%',
      titleBold: true,
      parent: ['mainData'],
      unit_code: CORE_DATASET_UNIT.PERCENTAGE,
    },
    {
      key: 'collectDistance',
      schemaKey: 'collectDistance',
      dispatch_area: '수거 거리',
      diagnosis: true,
      layer: 2,
      unit: 'km',
      titleBold: true,
      parent: ['mainData'],
      children: [],
      unit_code: CORE_DATASET_UNIT.KILOMETER,
    },
    {
      key: 'otherDistance',
      schemaKey: 'otherDistance',
      dispatch_area: '기타 거리',
      diagnosis: false,
      layer: 2,
      unit: 'km',
      unit_code: CORE_DATASET_UNIT.KILOMETER,
      parent: ['mainData'],
      children: [
        {
          key: 'notSelected',
          schemaKey: 'otherDistance_notSelected',
          dispatch_area: '기타운행',
          diagnosis: false,
          layer: 3,
          unit: 'km',
          unit_code: CORE_DATASET_UNIT.KILOMETER,
          parent: ['mainData', 'otherDistance'],
        },
        {
          key: 'goingToCollectionArea',
          schemaKey: 'otherDistance_goingToCollectionArea',
          dispatch_area: '수거지로 이동',
          diagnosis: false,
          layer: 3,
          unit: 'km',
          unit_code: CORE_DATASET_UNIT.KILOMETER,
          parent: ['mainData', 'otherDistance'],
        },
        {
          key: 'goingToTheLandfill',
          schemaKey: 'otherDistance_goingToTheLandfill',
          dispatch_area: '매립지로 이동',
          diagnosis: false,
          layer: 3,
          unit: 'km',
          unit_code: CORE_DATASET_UNIT.KILOMETER,
          parent: ['mainData', 'otherDistance'],
        },
        {
          key: 'returnToGarage',
          schemaKey: 'otherDistance_returnToGarage',
          dispatch_area: '차고지로 이동',
          diagnosis: false,
          layer: 3,
          unit: 'km',
          unit_code: CORE_DATASET_UNIT.KILOMETER,
          parent: ['mainData', 'otherDistance'],
        },
        {
          key: 'goingToRestaurant',
          schemaKey: 'otherDistance_goingToRestaurant',
          dispatch_area: '식당으로 이동',
          diagnosis: false,
          layer: 3,
          unit: 'km',
          unit_code: CORE_DATASET_UNIT.KILOMETER,
          parent: ['mainData', 'otherDistance'],
        },
        {
          key: 'idling',
          schemaKey: 'otherDistance_idling',
          dispatch_area: '대기 (공회전)',
          diagnosis: false,
          layer: 3,
          unit: 'km',
          unit_code: CORE_DATASET_UNIT.KILOMETER,
          parent: ['mainData', 'otherDistance'],
        },
        {
          key: 'notManaged',
          schemaKey: 'otherDistance_notManaged',
          dispatch_area: '미관제',
          diagnosis: false,
          layer: 3,
          unit: 'km',
          unit_code: CORE_DATASET_UNIT.KILOMETER,
          parent: ['mainData', 'otherDistance'],
        },
        {
          key: 'outOfControl',
          schemaKey: 'otherDistance_outOfControl',
          dispatch_area: '운행종료 (휴식)',
          diagnosis: false,
          layer: 3,
          unit: 'km',
          unit_code: CORE_DATASET_UNIT.KILOMETER,
          parent: ['mainData', 'otherDistance'],
        },
      ],
    },
    {
      key: 'durationRatios',
      schemaKey: 'durationRatios',
      dispatch_area: '수거/기타 시간',
      diagnosis: true,
      layer: 2,
      unit: '%',
      unit_code: CORE_DATASET_UNIT.PERCENTAGE,
      parent: ['mainData'],
      titleBold: true,
    },
    {
      key: 'collectDuration',
      schemaKey: 'collectDuration',
      dispatch_area: '수거 시간',
      diagnosis: true,
      layer: 2,
      unit: '분',
      unit_code: CORE_DATASET_UNIT.MINUTE,
      titleBold: true,
      parent: ['mainData'],
    },
    {
      key: 'otherDuration',
      schemaKey: 'otherDuration',
      dispatch_area: '기타 시간',
      diagnosis: true,
      layer: 2,
      unit: '분',
      unit_code: CORE_DATASET_UNIT.MINUTE,
      parent: ['mainData'],
      children: [
        {
          key: 'notSelected',
          schemaKey: 'otherDuration_notSelected',
          dispatch_area: '기타운행',
          diagnosis: false,
          layer: 3,
          unit: '분',
          unit_code: CORE_DATASET_UNIT.MINUTE,
          parent: ['mainData', 'otherDistance'],
        },
        {
          key: 'goingToCollectionArea',
          schemaKey: 'otherDuration_goingToCollectionArea',
          dispatch_area: '수거지로 이동',
          diagnosis: false,
          layer: 3,
          unit: '분',
          unit_code: CORE_DATASET_UNIT.MINUTE,
          parent: ['mainData', 'otherDistance'],
        },
        {
          key: 'goingToTheLandfill',
          schemaKey: 'otherDuration_goingToTheLandfill',
          dispatch_area: '매립지로 이동',
          diagnosis: false,
          layer: 3,
          unit: '분',
          unit_code: CORE_DATASET_UNIT.MINUTE,
          parent: ['mainData', 'otherDistance'],
        },
        {
          key: 'returnToGarage',
          schemaKey: 'otherDuration_returnToGarage',
          dispatch_area: '차고지로 이동',
          diagnosis: false,
          layer: 3,
          unit: '분',
          unit_code: CORE_DATASET_UNIT.MINUTE,
          parent: ['mainData', 'otherDistance'],
        },
        {
          key: 'goingToRestaurant',
          schemaKey: 'otherDuration_goingToRestaurant',
          dispatch_area: '식당으로 이동',
          diagnosis: false,
          layer: 3,
          unit: '분',
          unit_code: CORE_DATASET_UNIT.MINUTE,
          parent: ['mainData', 'otherDistance'],
        },
        {
          key: 'idling',
          schemaKey: 'otherDuration_idling',
          dispatch_area: '대기 (공회전)',
          diagnosis: false,
          layer: 3,
          unit: '분',
          unit_code: CORE_DATASET_UNIT.MINUTE,
          parent: ['mainData', 'otherDistance'],
        },
        {
          key: 'notManaged',
          schemaKey: 'otherDuration_notManaged',
          dispatch_area: '미관제',
          diagnosis: false,
          layer: 3,
          unit: '분',
          unit_code: CORE_DATASET_UNIT.MINUTE,
          parent: ['mainData', 'otherDistance'],
        },
        {
          key: 'outOfControl',
          schemaKey: 'otherDuration_outOfControl',
          dispatch_area: '운행종료 (휴식)',
          diagnosis: false,
          layer: 3,
          unit: '분',
          unit_code: CORE_DATASET_UNIT.MINUTE,
          parent: ['mainData', 'otherDistance'],
        },
      ],
    },
    {
      key: 'collectCount',
      schemaKey: 'collectCount',
      dispatch_area: '수거량',
      diagnosis: true,
      layer: 2,
      unit: '개',
      titleBold: true,
      parent: ['mainData'],
    },
    {
      key: 'manualCollectDistance',
      schemaKey: 'manualCollectDistance',
      dispatch_area: '도보수거 거리',
      diagnosis: true,
      layer: 2,
      unit: 'km',
      unit_code: CORE_DATASET_UNIT.KILOMETER,
      parent: ['mainData'],
    },
    {
      key: 'manualCollectTime',
      schemaKey: 'manualCollectTime',
      dispatch_area: '도보수거 시간',
      diagnosis: true,
      layer: 2,
      unit: '분',
      unit_code: CORE_DATASET_UNIT.MINUTE,
      titleBold: true,
      parent: ['mainData'],
    },
  ],
};

enum COLLECT_EXPANDED {
  COLLECT_DISTANCE = 'collectDistance',
  COLLECT_DURATION = 'collectDuration',
  COLLECT_COUNT = 'collectCount',
}

enum UNIT_LABEL {
  DISTANCE = 'km',
  DURATION = '분',
  COUNT = '개',
}

const expandedArray = [
  COLLECT_EXPANDED.COLLECT_DISTANCE,
  COLLECT_EXPANDED.COLLECT_DURATION,
  COLLECT_EXPANDED.COLLECT_COUNT,
];

class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  peek(): T | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}

const updateValue = (
  node: ICoreDataTree,
  targetKey: string,
  keyNumber: number,
  rawDataItem: IRawCoreDataItem
) => {
  if (!node) {
    return null;
  }

  try {
    if (node?.schemaKey === targetKey) {
      const prevKey = targetKey.split('_')[0];
      const nodeDetail =
        rawDataItem[targetKey as keyof IRawCoreDataItem] ??
        (rawDataItem as any)['expanded' + prevKey.charAt(0).toUpperCase() + prevKey.slice(1)][
          targetKey.split('_')[1]
        ];

      const parsedNodeDetail: IRawCoreDataItemSection | IRawCoreDataItemL2 | {} = Array.isArray(
        nodeDetail
      )
        ? {}
        : nodeDetail
        ? nodeDetail
        : {};
      const nodeDetailKeys = Object.keys(parsedNodeDetail);
      node.key = keyNumber + '_' + targetKey;
      nodeDetailKeys.forEach((item) => {
        node[item as keyof ICoreDataTree] = (parsedNodeDetail as any)[item];
      });

      if (expandedArray.includes(node?.schemaKey as COLLECT_EXPANDED)) {
        const key = 'expanded' + targetKey.charAt(0).toUpperCase() + targetKey.slice(1);
        const children = (
          rawDataItem[key as keyof IRawCoreDataItem] as IRawCoreDataItemSection[]
        )?.map((item) => ({
          ...item,
          dispatch_area: item?.sectionName,
          key: `${keyNumber}_${targetKey}_${item?.sectionName}_${uuid()}`,
          unit:
            node?.schemaKey === COLLECT_EXPANDED.COLLECT_DISTANCE
              ? UNIT_LABEL.DISTANCE
              : node?.schemaKey === COLLECT_EXPANDED.COLLECT_DURATION
              ? UNIT_LABEL.DURATION
              : UNIT_LABEL.COUNT,
          unit_code:
            node?.schemaKey === COLLECT_EXPANDED.COLLECT_DISTANCE
              ? CORE_DATASET_UNIT.KILOMETER
              : node?.schemaKey === COLLECT_EXPANDED.COLLECT_DURATION
              ? CORE_DATASET_UNIT.MINUTE
              : CORE_DATASET_UNIT.COUNT,
        }));

        if (children?.length) node['children'] = children;
      }

      return node;
    }
  } catch (err) {
    return null;
  }

  if (node?.children) {
    node?.children?.forEach((child: ICoreDataTree) =>
      updateValue(child, targetKey, keyNumber, rawDataItem)
    );
    // recursive here
  }
};

// travel accross schema tree, access to every node - BFS
export const parseDataItem = (rawData: IRawCoreDataItem, keyNumber: number, area: string) => {
  const queue = new Queue<ICoreDataTree>();
  queue.enqueue(coreDataSetSchema);
  const visisted: string[] = [];
  let data = JSON.parse(JSON.stringify(coreDataSetSchema));
  // clone a schema tree

  data.dispatch_area = area;
  while (queue.size() != 0) {
    const currentObject = queue.dequeue();
    const relatedPoints = currentObject?.children;
    const currentKey = currentObject?.schemaKey;
    updateValue(data, currentKey ?? '', keyNumber, rawData);
    // update each node of clone tree with data from api

    if (relatedPoints?.length)
      relatedPoints?.forEach((point: ICoreDataTree) => {
        const n = point.schemaKey;
        if (!visisted.includes(n as string)) {
          visisted.push(n as string);
          queue.enqueue(point);
        }
      });
  }

  return data;
};

export const parseData = (rawData: IRawCoreDataItems) => {
  const data: ICoreDataTree[] = [];

  let collectDistance: string[] = [];
  let collectionDuration: string[] = [];
  let collectAmount: string[] = [];

  if (rawData) {
    const arrayData = Object.keys(rawData).map((item) => {
      return rawData[item];
    });

    if (arrayData?.length) {
      arrayData?.forEach((dataItem, index: number) => {
        // random key row so every change state the collapse of tree table will reset.
        const keyNumber = Math.random();
        const item = parseDataItem(dataItem, keyNumber, Object.keys(rawData)[index]);
        data.push(item);
      });
    }

    collectDistance = arrayData[0]?.expandedCollectDistance?.map((item) => item.sectionName);
    collectionDuration = arrayData[0]?.expandedCollectDuration?.map((item) => item.sectionName);
    collectAmount = arrayData[0]?.expandedCollectCount?.map((item) => item.sectionName);
  }
  return {
    data: data,
    collectDistance,
    collectionDuration,
    collectAmount,
  };
};
