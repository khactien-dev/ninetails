import { BaseButton } from '@/components/common/base-button';
import { BaseCheckbox } from '@/components/common/base-checkbox';
import { BasePopover } from '@/components/common/base-popover';
import { BaseRadio } from '@/components/common/base-radio';
import { BaseDatePicker } from '@/components/common/date-picker';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const ColInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 8rem;
`;

export const SubmitButton = styled(BaseButton)`
  width: 100%;
  margin-top: 2rem;
`;

export const DatePicker = styled(BaseDatePicker)`
  width: 100%;
  .ant-picker-input input::placeholder {
    font-size: ${FONT_SIZE.md};
    color: #bec0c6;
  }
`;

export const FormItem = styled(BaseFormItem)``;

export const InfoText = styled.p``;
export const FilterContainer = styled.div`
  padding: 16px;
  .ant-modal-footer {
    padding: 0 !important;
    border: none !important;
  }
`;

export const InfoJob = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const InfoNote = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

export const StatusGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const StatusOption = styled.div`
  display: flex;
  align-items: center;
  line-height: 1;
  label {
    line-height: 1;
  }
`;

export const JobOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  margin-bottom: 16px;
`;

export const ApplyButton = styled(BaseButton)`
  height: 40px;
  flex: 1;
`;

export const CancelButton = styled(BaseButton)`
  height: 40px;
  flex: 1;
  color: var(--primary-color);
  border-color: var(--primary-color);
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 20px;
`;
export const Radios = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  background: #e5f3e5;
  padding: 7px 8px 7px 8px;
  border-radius: 4px !important;
  border: 1px solid #e5f3e5;
`;
export const StyledRadio = styled(BaseRadio)`
  line-height: 1;
`;
export const CheckBox = styled(BaseCheckbox)`
  font-size: ${FONT_SIZE.xs} !important;
`;
export const ResetButton = styled.button`
  border: none;
  color: #57ba00;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: ${FONT_SIZE.md};
  font-weight: ${FONT_WEIGHT.bold};
  background-color: white;
  margin-right: 25px;
`;
export const SearchWrapper = styled.div`
  width: 300px;
`;
export const SettingPopover = styled(BasePopover)`
  .ant-popover-inner-content {
    padding-right: 10px;
    transform: translateX(-50%) !important;
  }
`;
export const PopoverContent = styled.div`
  background: white;
  padding: 0.4rem 0.4rem 0 0.4rem;
  position: relative;
`;
export const Section = styled.div``;
export const SectionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;
export const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 5px;
  padding-right: 15px;
`;
export const Content = styled.div`
  padding-left: 20px;
  font-weight: ${FONT_WEIGHT.regular};
  font-size: 16px;

  li {
    font-size: ${FONT_SIZE.xs};
    color: #555555;
    margin-top: 0.2rem;
  }
`;

export const WrapWorkerName = styled.div`
  font-size: ${FONT_SIZE.md};
  color: var(--text-primary-color);
`;

export const ContentInfo = styled.div`
  padding-top: 5px;
`;
export const TitleJob = styled.div<{ $color: string }>`
  color: ${(props) => props.$color};
  font-size: ${FONT_SIZE.md};
  font-weight: ${FONT_WEIGHT.regular};
`;
export const ContentInfoReplacer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;
export const InfoAbsencType = styled.div`
  background-color: #fffae7;
  color: #f08d14;
  width: 50px;
  height: 22px;
  border-radius: 4px;
  text-align: center;
  padding-top: 2px;
  font-weight: ${FONT_WEIGHT.bold};
`;

export const Absence = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const WrapCloseIcon = styled.div`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  cursor: pointer;
`;
