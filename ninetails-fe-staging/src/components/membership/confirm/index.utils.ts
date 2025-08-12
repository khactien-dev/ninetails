import { BaseForm } from '@/components/common/forms/base-form';
import { useUpdateTenantByTokenMutate } from '@/hooks/features/useTenant';
import { useFeedback } from '@/hooks/useFeedback';
import { IRegisterResponse } from '@/interfaces';
import { useEffect, useState } from 'react';

export const useConfirmForm = (tenantData?: IRegisterResponse) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [isFormChanged, setIsFormChanged] = useState<boolean>(false);
  const [form] = BaseForm.useForm();
  const { notification } = useFeedback();

  const initValues = {
    organization: tenantData?.organization ?? '',
    department: tenantData?.department ?? '',
    operator: tenantData?.operator ?? '',
    position: tenantData?.position ?? '',
    email: tenantData?.email ?? '',
    phone: tenantData?.phone ?? '',
    fileUpload1: {
      fileName: tenantData?.filename_proof1 ?? '',
      url: tenantData?.proof1 ?? '',
    },
    fileUpload2: {
      fileName: tenantData?.filename_proof2 ?? '',
      url: tenantData?.proof2 ?? '',
    },

    terms: true,
    policy: true,
  };

  const updateTenantRegisterMutation = useUpdateTenantByTokenMutate();

  const onResetForm = () => {
    if (tenantData) {
      form.setFieldsValue(initValues);
    }
  };

  useEffect(() => {
    onResetForm();
  }, [tenantData]);

  const toggleOpenPolicy = (key?: string) => {
    setActiveKey(key ?? '');
  };

  const onSubmit = (values: any) => {
    const token = tenantData?.token;
    const payload = {
      organization: values.organization,
      department: values.department,
      operator: values.operator,
      position: values.position,
      email: values.email,
      phone: values.phone,
      proof1: values.fileUpload1.url,
      proof2: values.fileUpload2.url,
      filename_proof1: values.fileUpload1.fileName,
      filename_proof2: values.fileUpload2.fileName,
    };

    token &&
      updateTenantRegisterMutation.mutate(
        { token: token, body: payload },
        {
          onSuccess() {
            notification.success({
              message: '등록이 완료되었습니다! 안내 이메일을 확인해 주세요.',
            });
            setDisabled(true);
          },
        }
      );
  };

  const onToggleIsFormChanged = (status: boolean) => {
    status !== isFormChanged && setIsFormChanged(status);
  };

  return {
    activeKey,
    disabled,
    setDisabled,
    onResetForm,
    toggleOpenPolicy,
    onSubmit,
    onToggleIsFormChanged,
    isFormChanged,
    loadingComplete: updateTenantRegisterMutation.isPending,
    form,
    initValues,
  };
};
