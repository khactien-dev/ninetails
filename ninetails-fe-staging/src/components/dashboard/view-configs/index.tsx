import IconClose from '@/assets/images/svg/icon-close.svg';
import IconSettings from '@/assets/images/svg/icon-settings.svg';
import cookies from '@/utils/cookie';
import { RadioChangeEvent, Switch } from 'antd';
import React, { useState } from 'react';

import * as S from '../index.styles';
import { CheckboxItem, RadioItem, ViewConfig } from '../index.utils';

interface ViewConfigsProps {
  view: ViewConfig;
  radios: RadioItem[];
  checkboxs: CheckboxItem[];
  analysisTime?: string;
  setView: React.Dispatch<React.SetStateAction<ViewConfig>>;
  handleChangeTime: (date: string) => void;
}

const ViewConfigs: React.FC<ViewConfigsProps> = ({
  view,
  setView,
  radios,
  checkboxs,
  analysisTime,
  handleChangeTime,
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const [viewDraft, setViewDraft] = useState<any>({
    ...view,
    time: analysisTime,
  });

  const onApply = () => {
    setView(viewDraft);
    handleChangeTime(viewDraft.time);
    setShowPopover(false);
    cookies.set('view', JSON.stringify(viewDraft));
  };

  const onChangeTime = (e: RadioChangeEvent) => {
    setViewDraft({ ...viewDraft, time: e.target.value });
  };

  return (
    <S.SettingPopover
      content={
        <S.PopoverContent>
          <S.Section>
            <S.SectionTitle>
              <S.Title>지표설정</S.Title>
              <IconClose onClick={() => setShowPopover(false)} />
            </S.SectionTitle>
            <S.FormRadio onChange={onChangeTime} value={viewDraft.time}>
              {radios.map((item: RadioItem, i: number) => (
                <S.RadioLabel key={i}>
                  <S.Label htmlFor={'date' + item.key}>{item.name}</S.Label>
                  <S.StyledRadio value={item.key} id={'date' + item.key} />
                </S.RadioLabel>
              ))}
            </S.FormRadio>
          </S.Section>
          <S.Section>
            <S.Rectangle></S.Rectangle>
            <S.FormCheckbox>
              {checkboxs.map((item: CheckboxItem, i: number) => (
                <S.CheckboxLabel key={i}>
                  <S.CheckboxText>
                    <S.Label htmlFor={`checkbox-${i}`}>{item.label}</S.Label>
                    <Switch
                      checked={viewDraft[item.key]}
                      onChange={(checked) => setViewDraft({ ...viewDraft, [item.key]: checked })}
                      size="small"
                    />
                  </S.CheckboxText>
                  <S.CheckboxSpan>{item.span}</S.CheckboxSpan>
                </S.CheckboxLabel>
              ))}
            </S.FormCheckbox>
          </S.Section>
          <S.SubmitButton type="primary" onClick={onApply}>
            확인
          </S.SubmitButton>
        </S.PopoverContent>
      }
      trigger="click"
      open={showPopover}
      onOpenChange={(newOpen: boolean) => {
        if (!newOpen) {
          setViewDraft({ ...view, time: analysisTime });
        }
        setShowPopover(newOpen);
      }}
      rootClassName="setting-popover"
      placement="bottomRight"
    >
      <S.Setting>
        지표설정
        <IconSettings />
      </S.Setting>
    </S.SettingPopover>
  );
};

export default ViewConfigs;
