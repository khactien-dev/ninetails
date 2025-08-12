import StaticTab from '@/components/home/static-tab';
import useStaticTab from '@/components/home/static-tab/index.utils';
import _ from 'lodash';
import React, { useState } from 'react';

import { WrapAntdCustom } from './index.styles';
import * as S from './index.styles';

interface IProps {
  onComplete: () => void;
  onBack: () => void;
  isPending: boolean;
}

export const PolicyAndTerms: React.FC<IProps> = ({ onComplete, onBack, isPending }) => {
  const staticTabs = useStaticTab({ isFreeHeightTabContent: true });
  const [acceptAll, setAcceptAll] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>();

  const PrivacyPolicy = _.find(staticTabs.items, { key: '2' })?.children ?? null;
  const TermServices = _.find(staticTabs.items, { key: '3' })?.children ?? null;

  const onCheckBoxChange = (value: boolean) => {
    setAcceptAll(value);
  };

  return (
    <WrapAntdCustom>
      {!!activeTab && (
        <StaticTab activeKey={activeTab ?? '1'} toggleOpenPolicy={(key) => setActiveTab(key)} />
      )}
      <S.WrapContentHeader>
        <S.WrapTitle>
          <S.Title>개인정보 처리방침</S.Title>
          <S.ReadButton type="primary" onClick={() => setActiveTab('3')}>
            읽기
          </S.ReadButton>
        </S.WrapTitle>
      </S.WrapContentHeader>
      <S.WrapContent>{TermServices}</S.WrapContent>

      <S.ContentGap />

      <S.WrapContentHeader>
        <S.WrapTitle>
          <S.Title>서비스 이용약관</S.Title>
          <S.ReadButton type="primary" onClick={() => setActiveTab('2')}>
            읽기
          </S.ReadButton>
        </S.WrapTitle>
      </S.WrapContentHeader>

      <S.WrapContent>{PrivacyPolicy}</S.WrapContent>

      <S.WrapAcceptBoth>
        <S.Checkbox
          checked={acceptAll}
          onChange={(event) => onCheckBoxChange(event.target.checked)}
        >
          전체 약관에 동의합니다.
        </S.Checkbox>
      </S.WrapAcceptBoth>

      <S.WrapButton>
        <S.ActionButton
          type="primary"
          onClick={onComplete}
          actionType="complete"
          disabled={!acceptAll}
          loading={isPending}
        >
          완료
        </S.ActionButton>
        <S.ActionButton type="default" onClick={onBack} actionType="back">
          이전 단계
        </S.ActionButton>
      </S.WrapButton>
    </WrapAntdCustom>
  );
};
