import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseInput } from '@/components/common/inputs/base-input';
import { BaseSelect } from '@/components/common/selects/base-select';
import { media } from '@/constants';
import styled from 'styled-components';

import { BaseButton } from '../common/base-button';

export const Container = styled.div`
  width: 100%;
  height: auto;
  display: block;
  position: relative;
  flex-direction: column;
  @media only screen and ${media.custom} {
    display: flex;
    flex-direction: row;
  }
`;

export const AdmContentWrap = styled.div`
  display: block;
  width: 100%;
  overflow-x: hidden;
  padding: 8px;
  background-color: #f6f6f9;

  @media only screen and ${media.lg} {
    padding: 30px 16px 30px 30px;
  }
`;

export const MainContent = styled.div`
  display: block;
  border-radius: 20px;
  background: #fff;
  box-shadow: var(--box-shadow);
  padding: 24px 28px 30px;
`;

export const FooterDes = styled.div`
  display: block;
  border-radius: 20px;
  background: #fff;
  box-shadow: var(--box-shadow);
  padding: 24px 64px;
  margin-top: 32px;
`;

export const FooterDesText = styled.span`
  color: #383b40;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

export const HeaderTable = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

export const LeftHeader = styled.div`
  display: flex;
  align-items: center;
`;

export const TooltipBox = styled.div`
  display: flex;
  align-items: center;
  margin-right: 16px;
`;

export const SelectOption = styled(BaseSelect)`
  width: 100%;
  border-radius: 6px;
  height: 33px;
  width: 150px;
  border-radius: 8px;
`;

export const SaveBox = styled(BaseButton)`
  display: flex;
  width: 80px;
  height: 33px;
  padding: 10px;
  justify-content: center;
  align-items: center;
  gap: 5px;
  border-radius: 4px;
  background: var(--primary1-color);
  color: var(--Primary, #57ba00);
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  margin-left: 2.5px;
  border: none !important;
  color: var(--primary-color);

  &:disabled {
    background-color: var(--disabled-bg-color);
    cursor: not-allowed;

    svg {
      path {
        fill: #bec0c6;
      }
    }
  }
`;

export const WorkingSchedule = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  border-radius: 6px;
  border: 1px solid #ebebed !important;
  margin: 32px 0;
`;

export const AboveWorkingSchedule = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  padding: 6px 16px;
`;

export const TitleWorkingSchedule = styled.span`
  flex: 1;
  color: #555;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
`;

export const UnderWorkingSchedule = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border-top: 1px solid rgba(235, 235, 237, 1);
`;

export const UserBox = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: 100%;
`;

export const TextUserBox = styled.span`
  color: #383b40;
  font-family: Montserrat;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  margin-left: 12px;
`;

export const Table = styled.div`
  display: block;
  width: 100%;
  margin: 24px 0 0;
  background-color: none !important;
  overflow-x: auto;

  .ant-checkbox-wrapper .ant-checkbox {
    width: 20px;
    height: 20px;
    border-radius: 2px;
  }

  .ant-checkbox .ant-checkbox-inner {
    width: 20px;
    height: 20px;
  }

  .ant-table-tbody > tr {
    color: #555;
    font-size: 14px;
  }

  .ant-table-tbody > tr > td {
    background: none !important;
  }

  .ant-table-thead > tr > th {
    background: none !important;
    color: #555;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 20px;
  }

  .ant-table-thead > tr > td {
    background: none !important;
    color: #555;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px;
  }

  .ant-table-tbody > tr.ant-table-row:hover > td {
    background: none !important;
  }

  .ant-table-tbody > tr.ant-table-row-selected > td {
    background: none !important;
  }

  .ant-table {
    background: none !important;
  }

  .ant-table-column-sorters {
    display: flex;
    align-items: center;
    justify-content: start;

    &::after {
      display: none;
    }
  }

  .ant-table-column-has-sorters {
    &::before {
      display: none;
    }
  }

  .ant-table-column-title {
    max-width: fit-content;
  }

  /* .ant-btn {
    color: #555;
  } */

  .ant-table-thead th:hover::after {
    content: none !important;
  }

  .ant-table-column-has-actions .ant-tooltip {
    display: none !important;
  }

  .ant-table-expanded-row-level-1 {
    .ant-table-cell {
      padding: 0 !important;
    }
  }
  .custom-summary-row {
    background-color: #fffae7 !important;
  }
`;

export const ModalWrap = styled(BaseModal)`
  width: 100%;
  /* position: relative; */
`;

export const InputWrap = styled(BaseInput)`
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid '#d9d9d9' !important;
  height: 50px;

  &::placeholder {
    color: #d9d9d9;
  }
`;

export const FormItem = styled(BaseFormItem)``;

export const ModalExportContent = styled.div`
  width: 100%;
`;

export const GroupButton = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  padding: 0 8px;
  width: 100%;
  margin: auto;
`;

export const DownloadFileBtn = styled(BaseButton)`
  width: 150px;
  padding: 14px 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background: var(--Primary, #57ba00);
  color: #fff;
`;

export const CancelBtn = styled(BaseButton)`
  display: flex;
  width: 150px;
  padding: 14px 10px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  border: 1px solid var(--Light-Grey, #d9d9d9);
`;

export const NoDataMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-size: 16px;
  color: #555;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-top: 16px;
`;

export const PDFHidden = styled.div`
  width: 0;
  height: 0;
  overflow: hidden;
`;

export const PDFWrap = styled.div`
  margin-top: 40px;
  height: 100%;
  border: 1px solid #d9d9d9;
  background: #fff;
  width: 900px;

  #driving-diary-signature {
    margin-top: 0;
    padding-top: 0;

    > div > span {
      font-size: 14px;
    }

    .signature-item {
      margin-bottom: 0;
      margin-top: 6px;

      img {
        width: 100%;
        height: 100%;
      }
    }
  }
`;

export const PDFDrivingFirstPage = styled.div`
  padding: 24px 30px;
`;

export const PDFDrivingHeader = styled.div``;

export const PDFHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const PDFInfo = styled.div``;

export const PDFTitle = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  line-height: 30px;
`;

export const PDFDate = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 32px;
  line-height: 30px;
`;

export const PDFSignature = styled.div`
  text-align: center;
`;

export const PDFSignatureTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  line-height: 30px;
`;

export const PDFSignatureImage = styled.img`
  width: 82px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  padding: 6px 10px;
`;

export const PDFSignatureList = styled.div`
  display: flex;
  gap: 12px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
`;

export const PDFSignatureItem = styled.div``;

export const PDFSignatureItemTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 30px;
  border-bottom: 1px solid #d9d9d9;
  margin-bottom: 6px;
`;

export const PDFTable = styled(Table)`
  padding: 16px 20px;
  border-radius: 20px;
  border: 1px solid #d6d7de;
`;

export const PDFTableItem = styled.div`
  padding: 0 30px 24px;
`;

export const PDFRecordTableWrap = styled.div`
  display: flex;
  gap: 16px;
`;

export const PDFRecordTable = styled.div`
  flex: 1;
  > span {
    display: block;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    margin-bottom: 15px;
  }

  .ant-table-wrapper {
    padding: 12px;
    border-radius: 6px;
    border: 1px solid #d9d9d9;

    .ant-table-tbody {
      .ant-table-cell {
        border-bottom: none !important;
      }
    }
  }
`;
