import styled from 'styled-components';

export const CarInfo = styled.div`
  width: 100%;
  max-height: 94px;
  overflow-y: auto;
  padding: 12px 20px;
  background: #eef8e6;
  border-radius: 8px;
  /* margin: 4px 0 4px; */
`;

export const Item = styled.div`
  margin: 0 0 5px;
  display: inline-block;
  width: 100%;
  cursor: pointer;
  &:last-child {
    margin-bottom: 0;
  }
`;

export const Id = styled.div`
  width: 38px;
  height: 28px;
  border: 1px solid #d0d0d0;
  text-align: center;
  color: var(--green) !important;
  border-radius: 7px;
  line-height: 26px;
  font-size: 14px;
  font-weight: 500;
  background: #fff;
  margin-right: 10px;
  float: left;
`;

export const Title = styled.div`
  font-size: 14px;
  font-weight: 700;
  line-height: 28px;
`;

export const Empry = styled.div`
  font-size: 14px;
  text-align: center;
`;
