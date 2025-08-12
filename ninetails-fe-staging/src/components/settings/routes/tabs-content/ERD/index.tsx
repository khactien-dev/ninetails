import dynamic from 'next/dynamic';
import React from 'react';

import { ICheckboxValues } from '../../index.utils';

const VisualizerComponent = dynamic(() => import('@/components/visualizer-flow'), { ssr: false });

interface ERDProps {
  checkboxValues: ICheckboxValues;
}

const ERD: React.FC<ERDProps> = ({ checkboxValues }) => {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 480px)' }}>
      <VisualizerComponent checkboxValues={checkboxValues} />
    </div>
  );
};

export default ERD;
