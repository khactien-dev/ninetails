import { BaseForm, BaseFormProps, IBaseForm } from '@/components/common/forms/base-form';
import { BaseButtonsGroup } from '@/components/common/forms/components/base-buttons-group';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseFormList } from '@/components/common/forms/components/base-form-list';
import { BaseFormTitle } from '@/components/common/forms/components/base-form-title';
import React from 'react';

export interface BaseButtonsFormProps extends BaseFormProps {
  isFieldsChanged: boolean;
  setFieldsChanged?: (state: boolean) => void;
  footer?: React.ReactElement;
  loading?: boolean;
}

export const BaseButtonsForm: IBaseForm<BaseButtonsFormProps> = ({
  form,
  isFieldsChanged,
  setFieldsChanged,
  footer,
  loading = false,
  children,
  ...props
}) => {
  const [formDefault] = BaseForm.useForm();
  const currentForm = form || formDefault;

  const onCancel = () => {
    currentForm?.resetFields();
    setFieldsChanged && setFieldsChanged(false);
  };

  return (
    <BaseForm form={currentForm} {...props}>
      {children}
      {isFieldsChanged && (footer || <BaseButtonsGroup loading={loading} onCancel={onCancel} />)}
    </BaseForm>
  );
};

BaseButtonsForm.Title = BaseFormTitle;
BaseButtonsForm.Item = BaseFormItem;
BaseButtonsForm.List = BaseFormList;
BaseButtonsForm.useForm = BaseForm.useForm;
BaseButtonsForm.Provider = BaseForm.Provider;
