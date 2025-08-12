import {
  useGetTenantDetailForOpQuery,
  useUpdateTenantForOpMutation,
} from '@/hooks/features/useTenant';
import { useFeedback } from '@/hooks/useFeedback';
import dayjs from 'dayjs';
import { omit } from 'lodash';
import { useEffect, useState } from 'react';

import { BaseForm } from './index.style';

export default function useCompany() {
  const [editing, setEditing] = useState<boolean>(false);
  const updateTenantMutation = useUpdateTenantForOpMutation();

  const {
    data: tenantData,
    refetch: refetchTenantData,
    isPending: fetchDataPending,
  } = useGetTenantDetailForOpQuery();
  const [form] = BaseForm.useForm();
  const { notification } = useFeedback();

  const onResetForm = () => {
    handleResetForm();
    setEditing(false);
  };

  const handleResetForm = () => {
    const newData = omit(tenantData?.data, 'contracts', 'token', 'users');
    const contract = tenantData?.data?.contracts?.length ? tenantData?.data?.contracts[0] : null;

    const newFormData = {
      ...newData,
      start_date: contract ? dayjs(contract.start_date) : null,
      end_date: contract ? dayjs(contract.end_date) : null,
      contract_status: contract?.status,
      contract_type: contract?.type,
      logo: tenantData?.data?.logo,
      department:
        typeof tenantData?.data.department === 'object'
          ? {
              value: tenantData?.data.department?.id,
              label: tenantData?.data.department?.data,
            }
          : tenantData?.data.department,
      position:
        typeof tenantData?.data.position === 'object'
          ? {
              value: tenantData?.data.position?.id,
              label: tenantData?.data.position?.data,
            }
          : tenantData?.data.position,
      fileUpload1: {
        fileName: tenantData?.data?.filename_proof1 ?? '',
        url: tenantData?.data?.proof1 ?? '',
      },
      fileUpload2: {
        fileName: tenantData?.data?.filename_proof2 ?? '',
        url: tenantData?.data?.proof2 ?? '',
      },
    };

    form.setFieldsValue(newFormData);
  };

  useEffect(() => {
    if (tenantData?.data) {
      handleResetForm();
    }
  }, [tenantData]);

  const onSubmitForm = () => {
    form.validateFields().then((values) => {
      const dataValues: any = omit(values, ['fileUpload1', 'fileUpload2']);

      updateTenantMutation.mutate(
        {
          ...dataValues,
          organization: values?.organization.trim(),
          operator: values?.operator.trim(),
          department:
            typeof values.department === 'object' ? values?.department?.value : values?.department,
          position:
            typeof values?.position === 'object' ? values?.position?.value : values?.position,
          filename_proof1: values.fileUpload1.fileName,
          filename_proof2: values.fileUpload2.fileName,
          proof1: values.fileUpload1.url,
          proof2: values.fileUpload2.url,
        },
        {
          onSuccess() {
            notification.success({ message: '정보가 성공적으로 업데이트되었습니다!' });
            refetchTenantData();
            setEditing(false);
          },
        }
      );
    });
  };

  return {
    editing,
    setEditing,
    onResetForm,
    onSubmitForm,
    form,
    fetchDataPending,
    updateDataPening: updateTenantMutation.isPending,
  };
}
