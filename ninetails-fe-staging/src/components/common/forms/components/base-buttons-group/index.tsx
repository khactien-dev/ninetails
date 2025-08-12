import { BaseButton, BaseButtonProps } from '@/components/common/base-button';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import React from 'react';

interface BaseButtonsGroupProps extends BaseButtonProps {
  className?: string;
  onCancel: () => void;
  loading?: boolean;
}

export const BaseButtonsGroup: React.FC<BaseButtonsGroupProps> = ({
  className,
  onCancel,
  loading,
  ...props
}) => {
  return (
    <BaseRow className={className} gutter={[10, 10]} wrap={false}>
      <BaseCol span={12}>
        <BaseButton block ghost onClick={onCancel} {...props}>
          Cancel
        </BaseButton>
      </BaseCol>
      <BaseCol span={12}>
        <BaseButton block type="primary" loading={loading} htmlType="submit" {...props}>
          Save
        </BaseButton>
      </BaseCol>
    </BaseRow>
  );
};
