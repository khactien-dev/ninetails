import { BaseButton } from '@/components/common/base-button';
import { BaseCheckbox } from '@/components/common/base-checkbox';
import { BasePopover } from '@/components/common/base-popover';
import { BaseRadio } from '@/components/common/base-radio';
import { BaseDatePicker } from '@/components/common/date-picker';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import { OPERATION_STATUS } from '@/constants/settings';
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

export const Form = styled(BaseForm)`
  .ant-picker {
    width: 100%;
  }
`;

export const OperationText = styled.span<{ $type?: string }>`
  font-size: 400;
  color: ${(props) => {
    switch (props.$type) {
      case OPERATION_STATUS.DISPATCHING:
        return '#555555';
      case OPERATION_STATUS.AVAILABLE:
        return '#57BA00';
      case OPERATION_STATUS.SCHEDULED_MAINTENANCE:
        return '#0EBAFF';
      case OPERATION_STATUS.UNDER_MAINTENANCE:
        return '#0EBAFF';
      case 'area':
        return '#FF2929';
      default:
        return '';
    }
  }};
`;

export const InfoText = styled.p``;

export const BtnSave = styled(BaseButton)`
  width: 100%;
  margin-top: 2rem;
`;

export const FilterContainer = styled.div`
  padding: 16px;
  .ant-modal-footer {
    padding: 0 !important;
    border: none !important;
  }
`;

export const StatusGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
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

export const StatusOption = styled.div`
  display: flex;
  align-items: center;
  line-height: 1;
  label {
    line-height: 1;
  }
`;

export const ResetButton = styled.button`
  background: white;
  color: #57ba00;
  text-align: center;
  text-decoration: none;
  font-size: ${FONT_SIZE.md};
  display: inline-block;
  font-weight: ${FONT_WEIGHT.bold};
  width: 60px;
  height: 32px;
  border: none;
  margin-top: 5px;
`;

export const JobOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 16px;
  margin-left: 50px;
`;

export const CheckBox = styled(BaseCheckbox)`
  font-size: ${FONT_SIZE.xs} !important;
`;

export const CheckBoxContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 20px;
`;

export const ApplyButton = styled(BaseButton)`
  font-size: ${FONT_SIZE.md};
  font-weight: ${FONT_WEIGHT.semibold};
  height: 40px;
  flex: 1;
  border-radius: 8px;
`;

export const CancelButton = styled(BaseButton)`
  font-size: ${FONT_SIZE.md};
  font-weight: ${FONT_WEIGHT.semibold};
  color: var(--primary-color);
  border-color: var(--primary-color);
  height: 40px;
  flex: 1;
  border-radius: 8px;
`;

export const PopoverContent = styled.div`
  padding: 0.4rem 0.4rem 0 0.4rem;
  background: white;
  position: relative;
`;

export const SettingPopover = styled(BasePopover)`
  .ant-popover-inner-content {
    padding-right: 10px;
    transform: translateX(-50%) !important;
  }
`;

export const InfoJob = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  padding-right: 10px;
`;

export const TextA = styled.div`
  width: 16px;
  height: 16px;
  background: #404040;
  font-weight: ${FONT_WEIGHT.bold};
  color: white;
  text-align: center;
  border-radius: 4px !important;
  border: 1px solid #404040;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const Texta = styled.div`
  width: 16px;
  height: 16px;
  background: #7f7f7f;
  font-weight: ${FONT_WEIGHT.bold};
  color: white;
  text-align: center;
  border-radius: 4px !important;
  border: 1px solid #7f7f7f;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const TitleJob = styled.div<{ $color: string }>`
  color: ${(props) => props.$color};
  font-weight: ${FONT_WEIGHT.regular};
  font-size: ${FONT_SIZE.xs};
`;

export const Content = styled.div`
  padding-left: 20px;
  font-weight: ${FONT_WEIGHT.regular};
  font-size: 16px;

  ul {
    color: #555555;
    font-size: ${FONT_SIZE.xs};
  }

  li {
    margin-top: 0.2rem;
  }
`;

export const ContentInfo = styled.div`
  padding-top: 5px;
`;

export const ContentInfoReplacer = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`;

export const TextH = styled.div`
  width: 16px;
  height: 16px;
  background: #fcacee;
  font-weight: ${FONT_WEIGHT.bold};
  color: white;
  text-align: center;
  border-radius: 4px !important;
  border: 1px solid #fcacee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-top: 3px;
`;

export const InfoNote = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

export const TagLongTerm = styled.div`
  color: #f08d14;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px;
  border-radius: 4px;
  background: #fffae7;
  width: 50px;
  height: 22px;
  text-align: center;
`;

export const TextR = styled.div`
  width: 16px;
  height: 16px;
  background: #ff2e92;
  font-weight: ${FONT_WEIGHT.bold};
  color: white;
  text-align: center;
  border-radius: 4px !important;
  border: 1px solid #ff2e92;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-top: 3px;
`;

export const Textr = styled.div`
  width: 16px;
  height: 16px;
  background: #fcacee;
  font-weight: ${FONT_WEIGHT.bold};
  color: white;
  text-align: center;
  border-radius: 4px !important;
  border: 1px solid #fcacee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-top: 3px;
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

export const WrapPopupVehicleName = styled.div`
  font-size: ${FONT_SIZE.xs};
  color: #555555;
`;

export const WrapVehicleStatus = styled.div<{
  $color: string;
  $bg: string;
}>`
  text-align: center;
  height: 22px;
  line-height: 22px;
  min-width: 30px;
  max-width: 66px;
  font-size: 14px;
  border-radius: 4px;
  font-weight: ${FONT_WEIGHT.bold};
  background-color: ${(props) => props.$bg} !important;
  color: ${(props) => props.$color} !important;
`;

export const WrapCloseIcon = styled.div`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  cursor: pointer;
`;
