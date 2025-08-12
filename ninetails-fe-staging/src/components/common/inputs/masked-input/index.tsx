import type { InputRef } from 'antd';
import type { MaskedInput as AntdMaskedInput } from 'antd-mask-input';
import { ComponentPropsWithRef, forwardRef } from 'react';

import * as S from './index.styles';

export type MaskedInputProps = ComponentPropsWithRef<typeof AntdMaskedInput>;

// eslint-disable-next-line react/display-name
export const MaskedInput = forwardRef<InputRef, MaskedInputProps>((props, ref) => {
  return <S.MaskedInput ref={ref} {...props} />;
});
