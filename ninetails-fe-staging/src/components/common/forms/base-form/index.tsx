import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseFormList } from '@/components/common/forms/components/base-form-list';
import { BaseFormTitle } from '@/components/common/forms/components/base-form-title';
// import { useFeedback } from '@/hooks/useFeedback';
import { Form, FormInstance } from 'antd';
// import { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import React, { ComponentProps } from 'react';

export type BaseFormProps = Omit<ComponentProps<typeof Form>, 'onFinish'> & {
  onFinish?: (values: any) => void;
};

export type BaseFormInstance = FormInstance;

export interface IBaseForm<T> extends React.FC<T> {
  Title: typeof BaseFormTitle;
  Item: typeof BaseFormItem;
  List: typeof BaseFormList;
  useForm: typeof Form.useForm;
  Provider: typeof Form.Provider;
}

export const BaseForm: IBaseForm<BaseFormProps> = ({
  onFinishFailed,
  layout = 'vertical',
  ...props
}) => {
  // const { notification } = useFeedback();

  // const onFinishFailedDefault = (error: ValidateErrorEntity<unknown>) => {
  //   notification.error({
  //     message: 'Error',
  //     description: error.errorFields[0].errors,
  //   });
  // };

  return <Form onFinishFailed={onFinishFailed} layout={layout} {...props} />;
};

BaseForm.Title = BaseFormTitle;
BaseForm.Item = BaseFormItem;
BaseForm.List = BaseFormList;
BaseForm.useForm = Form.useForm;
BaseForm.Provider = Form.Provider;
