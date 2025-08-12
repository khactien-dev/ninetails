import DoughnutTooltip from '@/components/analysis/charts/tooltip/doughnut';
import { useEffect, useState } from 'react';

import * as S from './index.styles';

interface IProps {
  tabs: Array<{ key: string; label: string }>;
}

const TabsTooltip = ({ tabs }: IProps) => {
  const [activeKey, setActiveKey] = useState(tabs[0].key);

  const handleChangeTab = (key: string) => {
    setActiveKey(key);
  };

  useEffect(() => {
    if (tabs.length > 0) {
      setActiveKey(tabs[0].key);
    }
  }, [tabs]);

  return (
    <S.Wrapper>
      <S.Tabs>
        {tabs.map(({ key, label }) => (
          <S.Tab active={key === activeKey} key={key} onClick={() => handleChangeTab(key)}>
            {label}
          </S.Tab>
        ))}
      </S.Tabs>
      <S.Content>
        <DoughnutTooltip tab={activeKey} />
      </S.Content>
    </S.Wrapper>
  );
};

export default TabsTooltip;
