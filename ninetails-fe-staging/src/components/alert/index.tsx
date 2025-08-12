import React, { useState } from 'react';

import * as S from './index.styles';

export interface AlertInfo {
  title?: string;
  status: boolean;
  content?: string | null;
}
const Alert: React.FC<AlertInfo> = ({ title, status, content }) => {
  const [open, setOpen] = useState(false);
  const handleOk = () => {
    setOpen(false);
  };

  return (
    <S.Modal
      title={title}
      open={open}
      onCancel={() => setOpen(false)}
      footer={[
        <S.Button $status={status ?? true} key="ok" type="primary" onClick={handleOk}>
          {'확인'}
        </S.Button>,
      ]}
    >
      <p>{content}</p>
    </S.Modal>
  );
};

export default Alert;
