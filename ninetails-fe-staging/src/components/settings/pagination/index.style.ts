import styled from 'styled-components';

export const BtnWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  div {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;

    &:hover {
      background-color: #0000000f;
    }
  }
`;

export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;

  .ant-pagination {
    display: flex;
    align-items: center;

    .ant-pagination-prev {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .ant-pagination-next {
      align-items: center;
      display: flex;
      justify-content: center;
    }
  }

  .ant-pagination-disabled {
    div {
      div {
        &:hover {
          background-color: transparent !important;
        }
      }
    }
  }

  .ant-pagination-item {
    border: none !important;
    width: 30px !important;
    height: 30px !important;
    line-height: 30px !important;
    text-align: center;
    margin: 0 2px; /* Reduced space between items */
    display: block;
    float: left;
    color: #111 !important;
    font-size: 15px;
    font-weight: 400;
    border-radius: 5px;
    min-width: unset;

    &:hover {
      border: none;
    }
  }

  .ant-pagination-item-active {
    background-color: #57ba00 !important;
    border: none !important;
    a {
      color: #fff !important;
    }
  }

  .ant-pagination-jump-prev,
  .ant-pagination-jump-next {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .ant-pagination-item-link {
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
  }

  .ant-btn {
    border: none;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;
