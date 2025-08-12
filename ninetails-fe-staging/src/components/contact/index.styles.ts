import { BaseButton } from '@/components/common/base-button';
import { BaseCard } from '@/components/common/base-card';
import { BaseCheckbox } from '@/components/common/base-checkbox';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseInput } from '@/components/common/inputs/base-input';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  max-width: 700px;
  padding: 0 20px;
  margin: 0 auto 80px;
  display: block;
  text-align: center;
`;

export const Card = styled(BaseCard)`
  display: block;
  width: 100%;
  border-radius: 20px;
  border: 1px solid var(--lightgray);
  background: var(--white);
  box-shadow: 0 0px 20px 0 rgba(0, 0, 0, 0.1);
  text-align: left;
  padding: 30px 0;

  .ant-card-body {
    padding: 0;
    overflow-x: hidden;
  }
`;

export const Button = styled(BaseButton)`
  width: 100%;
  max-width: 240px;
  margin: 0 auto;
`;

export const Row = styled(BaseRow)``;

export const Col = styled(BaseCol)``;

export const Title = styled.div`
  font-weight: ${FONT_WEIGHT.bold};
  font-size: ${FONT_SIZE.xxl};
  text-align: center;

  div {
    font-size: ${FONT_SIZE.xs};
  }

  ul {
    margin: 20px 0;
    background: #f4f5f6;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    padding: 16px 10px 15px 40px;
    text-align: left;

    li {
      font-size: ${FONT_SIZE.md};
      font-weight: ${FONT_WEIGHT.regular};
      line-height: 26px;
      list-style: square;
      word-break: break-all;

      &::marker {
        color: var(--green);
      }
    }
  }

  .ant-image {
    max-width: 400px;
  }
`;

export const Header = styled.div`
  font-weight: ${FONT_WEIGHT.bold};
  font-size: ${FONT_SIZE.xxl};
  text-align: center;
  padding: 0 30px;

  .ant-image {
    max-width: 400px;
  }
`;

export const Form = styled(BaseForm)`
  min-width: 200px;
  font-size: ${FONT_SIZE.xs};

  .ant-form-item-label {
    padding: 0;

    > label {
      color: var(--gray);
      font-size: ${FONT_SIZE.xs};
      line-height: 23px;
      font-weight: ${FONT_WEIGHT.regular};

      &::before {
        display: none !important;
      }
    }
  }

  .ant-form-item-control-input {
    min-height: auto;
  }
`;

export const Input = styled(BaseInput)`
  &.ant-input {
    height: 34px;
    border-radius: 5px;
    border: 1px solid var(--lightgray);
    background: var(--white);
    color: var(--text);
    font-size: 14px;
    font-weight: 400;
    line-height: 32px;
    padding: 0 13px;
    text-align: left;

    &::placeholder {
      color: var(--lightgray);
    }
  }
`;

export const Checkbox = styled(BaseCheckbox)`
  .ant-checkbox-inner {
    border-radius: 5px;
    border: 1px solid var(--lightgray);
  }
`;

export const Div = styled.div``;

export const Content = styled.div`
  /* overflow-y: scroll; */
  /* max-height: calc(100vh - 340px); */
  padding: 0 30px;

  &::-webkit-scrollbar {
    border-radius: 20px;
    width: 5px;
    height: 8px;
    background-color: var(--white); /* or add it to the track */
  }

  &::-webkit-scrollbar-thumb {
    background: var(--graylight);
  }
`;

export const More = styled.div`
  color: var(--green);
`;
