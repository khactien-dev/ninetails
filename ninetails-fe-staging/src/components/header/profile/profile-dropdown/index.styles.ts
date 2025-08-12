import { FONT_SIZE, media } from '@/constants';
import { DownOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import { HeaderActionWrapper } from '../../index.styles';

export const ProfileDropdownHeader = styled(HeaderActionWrapper)`
  cursor: pointer;
  font-size: ${FONT_SIZE.md};

  .ant-col {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  span {
    display: inline-block;
    margin-left: 10px;

    &:first-of-type {
      margin-left: 0;
    }

    &.company {
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  @media only screen and ${media.md} {
    border-radius: 50px;
    padding: 0 0.2rem;
  }
`;

export const DownArrow = styled(DownOutlined)`
  color: var(--text-secondary-color);

  @media only screen and ${media.md} {
    color: var(--text-main-color);
  }
`;
