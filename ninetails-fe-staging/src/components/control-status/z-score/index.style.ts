import { styled } from 'styled-components';

export const Wrapper = styled.div`
  .ant-tooltip-inner {
    background-color: var(--primary-color);
    font-size: 14px;
    min-height: auto;
    padding: 0.65rem;
  }
  .ant-tooltip-arrow {
    &::before {
      background-color: var(--primary-color);
    }
  }
  .inside {
    display: flex;
    align-items: center;
    gap: 5px;
    justify-content: center;
  }

  .inside:after {
    content: '';
    display: block;
    clear: both;
  }

  .tableD1a {
    display: block;
    width: 100%;
    margin: 15px 0 0;
    position: relative;
  }

  .tableD1a .col1 {
    width: 100px;
    margin-right: auto;
  }
  .tableD1a .thd .col2 {
    width: 80px;
  }
  .tableD1a .col2 {
    width: 80px;
    display: block !important;
  }
  .tableD1a .col3 {
    width: 60px;
  }
  .tableD1a .col4 {
    width: 65px;
  }

  .tableD1a .tbd .rowR.rowChild .col1 {
    padding-left: 20px;
  }

  .tableD1b .col1 {
    width: 50% !important;
  }
  .tableD1b .col2 {
    width: calc(25% - 1px) !important;
    text-align: center !important;
  }
  .tableD1b .col3 {
    width: calc(25% - 1px) !important;
    text-align: center !important;
  }
  .tableD1a.tableD1b .tbd .rowR .tdCol.col2 {
    font-weight: 400;
  }

  .tableD1b .disabled .tdCol {
    color: #aaa !important;
  }
  .tableD1b .strong .tdCol.col2,
  .tableD1b .strong .tdCol.col3 {
    font-weight: 700 !important;
  }

  .tableD1a .thd {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    column-gap: 1px;
    row-gap: 1px;
    padding: 5px 0;
    margin-bottom: 8px;
  }

  .tableD1a .thd .thCol {
    font-size: 13px;
    color: #000;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-weight: 400;
    line-height: 20px;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &:first-child {
      justify-content: flex-start;
    }
  }
  .tableD1a .thd .thCol.col2 {
    line-height: 30px !important;
  }

  .tableD1a .tbd {
    display: block;
    position: relative;
  }

  .tableD1a .rate {
    position: absolute;
    display: none;
    width: 121px;
    height: 100%;
    top: 5px;
    right: 0;
    text-align: center;
    background: #fff;
    padding: 0 0 0 10px;
  }

  .tableD1a .rate.active {
    display: block;
  }

  .tableD1a .rate .row1 {
    padding: 5px 0;
    height: 40px;
    text-align: center;
  }
  .tableD1a .rate .row1:after {
    content: '';
    display: block;
    clear: both;
  }

  .tableD1a .rate .row1 .txt1 {
    display: block;
    float: left;
    font-size: 13px;
    font-weight: 400;
    color: #000;
    line-height: 20px;
    padding: 0 3px 0 0;
  }

  .tableD1a .rate .row2 {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(100% - 40px);
    background: #fff5fa;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
  }

  .tableD1a .rate .row2 .r1 {
    font-size: 40px;
    font-weight: 700;
    color: #ff2e91;
  }

  .txt1a {
    text-align: left;
  }

  .tb12 {
    display: block;
    width: 100%;
    margin: 6px 0;
    text-align: center;
  }
  .tb12 .th1 {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1px;
  }

  .tb12 .th1 .th {
    display: block;
    width: calc((100% - 5px) / 6);
    background: #fff;
    color: #222;
  }

  .tb12 .th2 {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1px;
    margin: 1px 0 0;
  }

  .tb12 .th2 .th {
    display: block;
    width: calc((100% - 5px) / 6);
    background: #fff;
    color: #222;
  }

  .txt2a .dotRow {
    padding: 2px 0 0 7px;
    font-size: 12px;
    font-weight: 400;
  }
  .txt2a .dotRow:before {
    background: rgba(255, 255, 255, 0.6) !important;
  }

  .tableD1a .tbd .rowR {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    column-gap: 1px;
    row-gap: 1px;
    padding: 5px 0;
  }

  .tableD1a .tbd .rowR .tdCol {
    font-size: 13px;
    color: #000;
    font-weight: 400;
    line-height: 20px;
    text-align: right;
  }

  .tableD1a .tbd .rowR .tdCol.col1 {
    text-align: right;
    margin-right: auto;
    white-space: nowrap;
  }

  .tableD1a .tbd .rowR .tdCol.col1 .t1 {
    color: #aaa;
  }

  .tableD1a .tbd .rowR .tdCol.col2 {
    font-weight: 600;
  }

  .toggleTableD1a {
    width: 100%;
    line-height: 20px;
    text-align: center;
    border-radius: 8px;
    color: #fff !important;
    background-color: gray;
    border: none;
    font-size: 13px;
    font-weight: 500;
    max-width: 100px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    outline: none;
    box-shadow: none;
  }
  .toggleTableD1a:hover {
    opacity: 1;
  }

  .toggleTableD1a span {
    line-height: 20px;
    text-align: left;
    color: #fff !important;
    background: #000;
    font-size: 13px;
    font-weight: 500;
    padding: 0 12px 0 0;
    background: url(../images/map/p-prev2w1.png) right no-repeat;
    background-size: 5px 10px;
  }

  .toggleTableD1a.active {
    background: var(--primary-color);
  }

  .toggleTableD1a.active span {
    font-size: 13px;
    font-weight: 500;
    padding: 0 12px 0 0;
    background: url(../images/map/icon-p-prev2w.png) right no-repeat;
    background-size: 5px 10px;
  }

  .h000-select-1 {
    width: 180px !important;
    float: left;
    margin: 0 !important;
  }

  .h000-select-2 {
    width: 180px !important;
    float: left;
    margin: 0 0 0 10px !important;
  }

  .qMarkWrap-H000-1 {
    float: left;
    margin: 7px 6px 0 0;
  }

  .buttonSubGotoSave span {
    display: inline-block;
    text-align: left;
    background: url(../images/save12x13.png) left no-repeat;
    background-size: 12px 13px;
    padding: 0 0 0 18px;
    text-align: left;
  }
  .qMarkWrap .qMark {
    width: 18px !important;
    height: 18px !important;
    border-radius: 50% !important;
    text-align: center !important;
    line-height: 18px !important;
    background: #777 !important;
    color: #fff !important;
    font-weight: 400 !important;
    font-size: 11px !important;
  }
`;
