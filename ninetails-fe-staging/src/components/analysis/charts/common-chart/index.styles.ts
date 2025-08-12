import styled from 'styled-components';

export const Wrapper = styled.div`
  position: relative;
  margin: 25px 0;
`;

const AxisTitleBase = styled.span`
  position: absolute;
  top: -25px;
  font-size: 14px;
  font-weight: bold;
`;

export const AxisYTitle = styled(AxisTitleBase)``;

export const AxisY2Title = styled(AxisTitleBase)`
  right: 10px;
`;

export const Chart = styled.div``;
