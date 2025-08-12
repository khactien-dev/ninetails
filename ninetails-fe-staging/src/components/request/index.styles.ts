import { BaseButton } from '@/components/common/base-button';
import { BaseCard } from '@/components/common/base-card';
import { BaseCheckbox } from '@/components/common/base-checkbox';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseInput } from '@/components/common/inputs/base-input';
import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import Link from 'next/link';
import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto 80px;
  display: block;
  text-align: center;
  padding: 0 20px;

  .ant-form-item-has-error {
    .base-upload-input {
      border: 1px solid var(--red);
      transition: 0.2s ease-in-out border-color;
    }
  }
`;

export const Card = styled(BaseCard)`
  display: block;
  width: 100%;
  border-radius: 20px;
  border: 1px solid var(--lightgray);
  background: var(--white);
  box-shadow: 0 0px 20px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: left;

  @media only screen and ${media.md} {
    padding: 36px;
  }
`;

export const Button = styled(BaseButton)`
  width: 100%;
  max-width: 240px;
  margin: 0 auto;
  font-weight: ${FONT_WEIGHT.medium};
  height: 40px;
  /* background-color: var(--secondary-color) !important; */
`;

export const Row = styled(BaseRow)``;

export const Col = styled(BaseCol)``;

export const Title = styled.div`
  font-weight: ${FONT_WEIGHT.semibold};
  font-size: 28px;
  line-height: 36px;

  ul {
    margin: 24px 0 20px;
    padding-left: 15px;

    li {
      font-size: ${FONT_SIZE.md};
      font-weight: ${FONT_WEIGHT.regular};
      line-height: 26px;
      list-style: square;

      &::marker {
        color: var(--green);
      }
    }
  }

  .ant-image {
    max-width: 400px;
    margin-right: 5px;
  }
`;

export const Form = styled(BaseForm)`
  min-width: 200px;
  font-size: ${FONT_SIZE.xs};

  .ant-form-item {
    margin-bottom: 24px;
    .ant-form-item-label {
      padding: 0 0 4px;
      > label {
        color: #555;
      }
    }

    .ant-form-item-control {
      .ant-form-item-control-input {
        min-height: auto;
      }
      input,
      textarea {
        &::placeholder {
          color: #9d9d9d;
        }

        &::-ms-input-placeholder {
          color: #9d9d9d;
        }
      }
      textarea {
        height: 120px;
      }
    }
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
    font-weight: ${FONT_WEIGHT.regular};
    line-height: 32px;
    padding: 0 13px;
    text-align: left;

    &::placeholder {
      color: var(--lightgray);
    }
  }
`;

export const Checkbox = styled(BaseCheckbox)`
  line-height: 22px;
  font-size: 13px !important;
  font-weight: ${FONT_WEIGHT.regular};
  color: #555;
  .ant-checkbox-inner {
    border-radius: 5px;
    border: 1px solid var(--lightgray);
  }
`;

export const Note = styled(Link)`
  font-weight: ${FONT_WEIGHT.semibold};
  text-decoration: underline;
`;

export const More = styled.div`
  text-align: center;
  margin-top: 30px;
  color: #555;
`;

export const Br = styled.br`
  display: block;
  @media only screen and ${media.md} {
    display: none;
  }
`;
