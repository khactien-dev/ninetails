import { useAnalysisContext } from '@/components/analysis/context';
import { CloseOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

import * as S from './index.styles';

interface IProps {
  children: ReactNode;
  title: string;
}

const TooltipChart = ({ children, title }: IProps) => {
  const { setOpenTooltip } = useAnalysisContext();
  return (
    <S.TootipWrapper>
      <S.Header>
        <S.CloseIcon onClick={() => setOpenTooltip(false)}>
          <CloseOutlined />
        </S.CloseIcon>
        <S.Title>{title}</S.Title>
      </S.Header>
      <S.Content>{children}</S.Content>
    </S.TootipWrapper>
  );
};

export default TooltipChart;
