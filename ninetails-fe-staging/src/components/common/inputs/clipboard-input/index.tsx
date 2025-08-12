import { useFeedback } from '@/hooks/useFeedback';
import { CopyOutlined } from '@ant-design/icons';
import React, { useCallback } from 'react';

import { BaseButton } from '../../base-button';
import { BaseTooltip } from '../../base-tooltip';
import { BaseInputProps } from '../base-input';
import { SuffixInput } from '../suffix-input';

interface ClipboardInputProps extends BaseInputProps {
  valueToCopy?: string;
}

export const ClipboardInput: React.FC<ClipboardInputProps> = ({ valueToCopy, ...props }) => {
  const { notification } = useFeedback();

  const handleCopy = useCallback(
    () =>
      valueToCopy &&
      navigator.clipboard.writeText(valueToCopy).then(() => {
        notification.info({ message: 'copied' });
      }),
    [valueToCopy, notification]
  );

  return (
    <SuffixInput
      suffix={
        <BaseTooltip title="Copy">
          <BaseButton
            size="small"
            disabled={!valueToCopy}
            type="text"
            icon={<CopyOutlined />}
            onClick={handleCopy}
          />
        </BaseTooltip>
      }
      {...props}
    />
  );
};
