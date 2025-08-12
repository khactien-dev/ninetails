import CloseLogin from '@/assets/images/common/close-26-r-b111.png';
import PNext2 from '@/assets/images/common/p-next2.png';
import CheckOff from '@/assets/images/svg/checkbox-off.svg';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseInput as CommonInput } from '@/components/common/inputs/base-input';
import styled from 'styled-components';

export const LoginArea = styled.div`
  position: fixed;
  z-index: 10000;
  top: 100px;
  right: 40px;
  background: #fff;
  border-radius: 15px;
  padding: 20px 24px 20px;
  width: 300px;
  border: 1px solid #d0d0d0;
  /*box-shadow: 0 2px 15px 0 rgba(0,0,0,0.1);*/
  .row {
    display: block;
    width: 100%;
    &:after {
      content: '';
      display: block;
      clear: both;
    }
    & + .row {
      margin: 16px 0 0;
    }
    & .bInput {
      position: relative;
      display: block;
      max-width: 100%;
      float: left;
      height: 30px;
      & input {
        position: absolute;
        clip: rect(0, 0, 0, 0);
        pointer-events: none;
      }
      & input[type='checkbox'] {
        margin: 0;
        box-sizing: border-box;
        padding: 0;
        line-height: normal;
      }
      & input[type='checkbox']:not(:checked) + .txt {
        background: url(${CheckOff.src}) left no-repeat;
        background-size: 18px 18px;
      }
      & input + .txt {
        float: left;
        height: 22px;
        line-height: 22px;
        font-size: 13px;
        font-weight: 400;
        color: #555;
        padding: 0 0 0 24px;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
      }
    }
  }
  & .laLogo {
    display: none;
  }

  & .laMenuWrap {
    display: none;
  }
`;
export const LoginTitle = styled.div`
  display: block;
  text-align: left;
  font-size: 24px;
  font-weight: 600;
  color: #222;
  line-height: 36px;
  padding: 0 0 16px;
`;
export const CloseLoginButton = styled.button`
  display: block;
  position: absolute;
  width: 40px;
  height: 40px;
  top: 16px;
  right: 12px;
  border: none;
  background: url(${CloseLogin.src}) center no-repeat;
  background-size: 14px 14px;
`;

export const Input = styled(CommonInput)`
  display: block;
  width: 100%;
  height: 34px;
  border-radius: 5px;
  border: 1px solid #d0d0d0;
  background: #fff;
  color: #222;
  font-size: 14px;
  font-weight: 400;
  line-height: 32px;
  padding: 0 13px;
  text-align: left;
  &:focus {
    outline: none !important;
    border: 1px solid var(--primary-color) !important;
  }
  &:hover {
    outline: none !important;
    border: 1px solid var(--primary-color) !important;
  }
`;
export const FormItem = styled(BaseForm.Item)`
  & .ant-form-item-control-input {
    min-height: auto !important;
  }
`;
export const ButtonLogin = styled.button`
  width: 100%;
  height: 46px;
  line-height: 46px;
  border-radius: 8px;
  text-align: center;
  color: #fff !important;
  font-size: 16px;
  font-weight: 600;
  background: var(--primary-color);
  border: none;
  cursor: pointer;
`;

export const RowFindIdPw = styled.div`
  display: block;
  width: 100%;
  margin: 14px 0 0;
  & a {
    display: block;
    float: left;
    color: var(--primary-color) !important;
    font-size: 14px;
    font-weight: 500;
    line-height: 30px;
    background: url(${PNext2.src}) right no-repeat;
    background-size: 5px 10px;
    padding: 0 10px 0 0;
  }
  & a + a {
    margin: 0 0 0 25px;
  }
`;

export const GoToJoinRow = styled.div`
  display: block;
  width: 100%;
  font-size: 14px;
  line-height: 20px;
  color: #222 !important;
  font-weight: 500;
  & a {
    font-weight: 600;
    color: var(--primary-color) !important;
    text-decoration: underline;
  }
`;
