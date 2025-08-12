import { SORT_TYPE } from './common';

export const operator = [
  {
    value: '=',
    label: 'Equals',
  },
  {
    value: '>',
    label: 'Greater than',
  },
  {
    value: '>=',
    label: 'Greater than or equals',
  },
  {
    value: '<',
    label: 'Less than',
  },
  {
    value: '<=',
    label: 'Less than or equals',
  },
  {
    value: '!=',
    label: 'Not equal',
  },
];

export const initialQueryValues = {
  column: null,
  operator: null,
  value: null,
};

export const initialValuesImport = {
  format: 'CSV',
  encoding: 'UTF-8',
  delimiter: 'tab',
};

export const inittialParams = {
  page: 1,
  pageSize: 10,
  sortBy: SORT_TYPE.desc,
  query: [],
};

export enum TABLE_NAME {
  ROUTE = 'routes',
  SEGMENT = 'segments',
  SECTION = 'sections',
  POINT = 'point',
  CONGESTION_CODE = 'congestion_codes',
  GUIDE_CODE = 'guide_codes',
  GUIDE = 'guides',
  SEGMENT_ROUTE = 'route_segment_map',
  CORE_SECTION = 'core_sections',
  METADATA = 'metadata',
}
