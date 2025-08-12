import { BaseButton } from '@/components/common/base-button';
import { websitePattern } from '@/constants';
import { FileTextOutlined } from '@ant-design/icons';
import React, { useMemo } from 'react';

import { BaseTooltip } from '../../base-tooltip';
import { BaseInputProps } from '../base-input';
import { SuffixInput } from '../suffix-input';

interface OpenURLInputProps extends BaseInputProps {
  href?: string;
  target?: string;
}

export const OpenURLInput: React.FC<OpenURLInputProps> = ({
  href,
  target = '_blank',
  ...props
}) => {
  const isMatch = useMemo(() => new RegExp(websitePattern).test(href || ' '), [href]);

  return (
    <SuffixInput
      suffix={
        <BaseTooltip title="Title">
          <BaseButton
            size="small"
            href={href}
            target={target}
            disabled={!isMatch}
            type="text"
            icon={<FileTextOutlined />}
          />
        </BaseTooltip>
      }
      {...props}
    />
  );
};
