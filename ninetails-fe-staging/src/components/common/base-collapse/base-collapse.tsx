import { Collapse as AntdCollapse, CollapseProps } from 'antd';
import React from 'react';

export type BaseCollapseProps = CollapseProps;

interface IBaseCollapse extends React.FC<BaseCollapseProps> {
  Panel: typeof AntdCollapse.Panel;
}

export const BaseCollapse: IBaseCollapse = (props) => {
  return <AntdCollapse {...props} />;
};

BaseCollapse.Panel = AntdCollapse.Panel;
