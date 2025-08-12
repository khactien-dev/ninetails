import { Breadcrumb as AntBreadcrumb } from 'antd';
import styled from 'styled-components';

export const Breadcrumb = styled(AntBreadcrumb)`
  &.ant-breadcrumb {
    li:last-child {
      .ant-breadcrumb-link {
        color: var(--text-main-color);
      }
    }
  }
`;
