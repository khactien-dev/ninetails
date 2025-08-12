import { BaseTabsProps } from '@/components/common/base-tabs';
import { COLLECT_VIEW } from '@/constants';
import { IIllegalData } from '@/interfaces';
import React from 'react';

import CollectTab from './illegal-tab';
import * as S from './index.style';

interface CollectionTabProps {
  view: string;
  illegalData: IIllegalData;
  setView: React.Dispatch<React.SetStateAction<string>>;
}

const CollectionTab = ({ view, illegalData, setView }: CollectionTabProps) => {
  const tabsCollection: BaseTabsProps['items'] = [
    {
      key: COLLECT_VIEW.ALL,
      label: '전체',
      children: <CollectTab data={illegalData} view={view} />,
    },
    {
      key: COLLECT_VIEW.NOT_COLLECTED,
      label: '생성',
      children: <CollectTab data={illegalData} view={view} />,
    },
    {
      key: COLLECT_VIEW.COLLECTED,
      label: '수거',
      children: <CollectTab data={illegalData} view={view} />,
    },
  ];

  return (
    <S.Collection>
      <S.CollectionTabs
        defaultActiveKey={view}
        items={tabsCollection}
        onChange={(val) => setView(val as string)}
      />
    </S.Collection>
  );
};

export default CollectionTab;
