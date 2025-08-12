import AnalysisChart from '@/components/analysis/charts';
import { CoreDataSet } from '@/components/analysis/core-data-set';
import LeftContentChart from '@/components/analysis/left-menu';
import { ModuleDataSet } from '@/components/analysis/module-data-set';
import { MainFooter } from '@/layouts/admin-layout/footer';
import React, { useState } from 'react';

import AnalysisProvider from './context';
import * as S from './index.styles';
import { ResultTime } from './result-time';
import { WidgetDataset } from './widget-dataset';

const AnalysisPAge = () => {
  const handleDeleteSection = (key: string) => {
    setSections((prev) => prev?.filter((item) => item.key !== key));
  };

  const [sections, setSections] = useState([
    {
      key: 'widget',
      component: <WidgetDataset onDeleteSection={() => handleDeleteSection('widget')} />,
    },
    {
      key: 'core-dataset',
      component: <CoreDataSet onDeleteSection={() => handleDeleteSection('core-dataset')} />,
    },
    {
      key: 'module-dataset',
      component: <ModuleDataSet onDeleteSection={() => handleDeleteSection('module-dataset')} />,
    },
    {
      key: 'analysis-chart',
      component: <AnalysisChart onDeleteSection={() => handleDeleteSection('analysis-chart')} />,
    },
  ]);

  return (
    <AnalysisProvider>
      <S.TablesWrapper>
        <LeftContentChart />
        <S.WrapContent>
          <S.MainContent>
            <ResultTime />
            {sections.map((item) => {
              return <React.Fragment key={item.key}>{item.component}</React.Fragment>;
            })}
          </S.MainContent>
          <MainFooter isShow={true}></MainFooter>
        </S.WrapContent>
      </S.TablesWrapper>
    </AnalysisProvider>
  );
};

export default AnalysisPAge;
