import styled from 'styled-components';

import { BaseModal } from '../common/base-modal/BaseModal';

export const Modal = styled(BaseModal)`
  .ant-modal-body {
    padding: 48px 24px 24px 24px;

    @media screen and (max-width: 768px) {
      padding: 20px 10px 10px 10px;
    }
  }
`;

export const Wrapper = styled.div`
  color: #383b40;
  font-size: 16px;

  @media screen and (max-width: 768px) {
    font-size: 14px;
  }
`;

export const Title = styled.h2`
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;

  @media screen and (max-width: 768px) {
    font-size: 18px;
  }
`;

export const Content = styled.div`
  text-align: center;
  margin-bottom: 24px;

  @media screen and (max-width: 768px) {
    margin-bottom: 10px;
  }
`;

export const Description = styled.div`
  margin-bottom: 24px;
  padding-left: 20px;

  @media screen and (max-width: 768px) {
    margin-bottom: 10px;
  }
`;

export const Question = styled.div`
  text-align: center;
  margin-bottom: 24px;

  @media screen and (max-width: 768px) {
    margin-bottom: 12px;
  }
`;

export const NoteWrapper = styled.div`
  > span {
    font-weight: 700;
    text-decoration-line: underline;
  }
`;

export const Notes = styled.ul`
  padding-left: 20px;
`;

export const Note = styled.li`
  margin-bottom: 24px;
  @media screen and (max-width: 768px) {
    margin-bottom: 10px;
  }
`;

export const ButtonGroup = styled.div`
  text-align: center;

  button:last-child {
    margin: auto;
    color: #959291;
    font-weight: 600;
    text-decoration-line: underline;
  }
`;
