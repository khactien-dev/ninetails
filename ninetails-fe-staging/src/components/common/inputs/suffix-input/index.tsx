import React from 'react';

import { BaseInput, BaseInputProps } from '../base-input';
import * as S from './index.styles';

export interface SuffixInputProps extends BaseInputProps {
  suffix: React.ReactNode;
  isOpenSuffix?: boolean;
}

export const SuffixInput: React.FC<SuffixInputProps> = ({
  suffix,
  isOpenSuffix = true,
  ...props
}) => <BaseInput suffix={<S.Suffix isOpen={isOpenSuffix}>{suffix}</S.Suffix>} {...props} />;
