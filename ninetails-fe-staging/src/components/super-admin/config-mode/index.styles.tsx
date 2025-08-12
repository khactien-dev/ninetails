import EditIcon from '@/assets/images/svg/icon-edit-3.svg';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { FONT_WEIGHT, media } from '@/constants';
import { styled } from 'styled-components';

export const BoxTitle = styled.div`
  display: flex;
  justify-content: space-between;
  height: 34px;
  line-height: 34px;
  text-align: left;
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin-bottom: 1.5rem;
`;
export const EditBtn = styled(EditIcon)`
  cursor: pointer;
`;
export const ConfigForm = styled.div`
  padding: 16px;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 10px;
  @media only screen and ${media.xxl} {
    padding-left: 80px;
    padding-right: 80px;
  }
  height: 300px;
  overflow: visible;
`;
export const EditBtnWrap = styled.div`
  width: 80px;
  height: 33px;
  margin-top: 5px;
  display: flex;
  gap: 5px;
  background: #e4f2fe;
  color: #0085f7 !important;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: ${FONT_WEIGHT.semibold};
  font-size: 14px;
`;
export const FormItemCustom = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;
export const BtnRedirect = styled.div`
  position: absolute;
  margin-top: 3px;
`;
export const FormCustom = styled(BaseFormItem)`
  width: 100%;
  label {
    padding-left: 20px;
  }
  input {
    font-weight: ${FONT_WEIGHT.regular};
    color: #383b40 !important;
  }
`;
