import { Alert as AntAlert } from 'antd';
import styled from 'styled-components';

export const Alert = styled(AntAlert)`
  &.ant-alert {
    padding-inline: 15px;
  }

  .ant-alert-action {
    margin-inline-start: 8px;
  }
`;
