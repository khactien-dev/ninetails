import useIsTextTruncated from '@/hooks/useTextTruncated';
import { Tooltip } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

import * as S from './index.styles';

interface ContentEditableProps {
  data: any;
  handleConfirm?: (value: string, isColumnError: boolean) => void;
  validate?: (value: string) => boolean;
  required?: boolean;
  disabled?: boolean;
  isRefresh: boolean;
  maxLength?: number;
  activeKey: string;
  deleteRowKeys: React.Key[];
}

export const ContentEditable: React.FC<ContentEditableProps> = ({
  data,
  handleConfirm,
  validate,
  required = false,
  disabled = false,
  isRefresh,
  maxLength,
  activeKey,
  deleteRowKeys,
}) => {
  const [value, setValue] = useState<string>('');

  const formatValue = !isNaN(parseFloat(data)) || data ? data.toString() : '';

  const [isActive, setIsActive] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [isError, setIsError] = useState(false);
  const inputRef = useRef<any>(null);
  const isTruncated = useIsTextTruncated(inputRef.current?.input);

  useEffect(() => {
    setValue(formatValue);
    setIsError(false);
  }, [data, isRefresh]);

  const handleValidate = (value: string) => {
    if (required && !value.trim()) {
      setIsError(true);
      return true;
    }

    if (validate && value.trim()) {
      const isInvalidValue = validate(value.trim());

      if (isInvalidValue) {
        setIsError(true);
        return true;
      }
    }

    setIsError(false);
    return false;
  };

  return (
    <Tooltip
      title={isTruncated && isReadOnly ? value : ''}
      placement="topLeft"
      arrow={false}
      overlayStyle={{ overflow: 'auto', maxHeight: '250px' }}
    >
      <S.CellTable
        selected={deleteRowKeys?.includes(activeKey)}
        ref={inputRef}
        maxLength={maxLength}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        error={isError.toString()}
        active={isActive.toString()}
        readOnly={isReadOnly}
        onClick={() => setIsActive(true)}
        onDoubleClick={() => {
          if (disabled) return;
          setIsReadOnly(false);
        }}
        onBlur={() => {
          setIsActive(false);

          if (isReadOnly) return;
          setIsReadOnly(true);

          const isColumnError = handleValidate(value);

          handleConfirm && handleConfirm(value.trim(), isColumnError);
        }}
      />
    </Tooltip>
  );
};
