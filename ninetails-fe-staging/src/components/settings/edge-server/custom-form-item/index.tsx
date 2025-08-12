import { Rule } from 'antd/es/form';
import React, { ReactElement } from 'react';

import * as S from './index.styled';

interface IProps {
  children: ReactElement;
  required?: boolean;
  rules?: Rule[];
  label: string;
  subLabel?: string;
  name?: string;
  type?: 'checkbox' | 'preset';
  onClickPreset?: () => void;
}

export const CustomFormItem: React.FC<IProps> = ({
  children,
  required,
  rules,
  label,
  subLabel,
  name,
  type = 'checkbox',
  onClickPreset,
}) => {
  return (
    <S.WrapFormItem>
      <S.WrapLabel>
        {type === 'checkbox' ? (
          <S.CheckBoxFormItem name={`${name}_checkbox`} valuePropName="checked">
            <S.CheckBox>{subLabel}</S.CheckBox>
          </S.CheckBoxFormItem>
        ) : (
          <>
            <S.Button
              onClick={() => {
                onClickPreset && onClickPreset();
              }}
              type="primary"
            >
              {subLabel}
            </S.Button>
          </>
        )}
      </S.WrapLabel>
      <S.FormItem required={required} rules={rules} label={label} name={name}>
        {children}
      </S.FormItem>
    </S.WrapFormItem>
  );
};
