import { GlobalSpinner } from '@/components/common/base-spinner/global-spinner';
// import { useAppSelector } from "@/hooks/reduxHooks";
import { themeObject } from '@/styles/themes/theme-variables';
import React from 'react';
import styled from 'styled-components';

interface LoadingProps {
  size?: string;
  color?: string;
}

export const BaseLoading: React.FC<LoadingProps> = ({ size, color }) => {
  // const theme = useAppSelector((state) => state.theme.theme);
  const theme = 'light';
  const spinnerColor = color || themeObject[theme].spinnerBase;

  return (
    <SpinnerContainer>
      <GlobalSpinner size={size} color={spinnerColor} />
    </SpinnerContainer>
  );
};

const SpinnerContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
