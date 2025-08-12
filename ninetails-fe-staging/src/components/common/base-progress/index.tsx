import { Progress, ProgressProps } from 'antd';
import React from 'react';

export type BaseProgressProps = ProgressProps;

export const BaseProgress: React.FC<ProgressProps> = (props) => {
  return <Progress {...props} />;
};
