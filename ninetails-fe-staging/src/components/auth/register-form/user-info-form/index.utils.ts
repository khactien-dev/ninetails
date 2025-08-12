// import { useVerifyMailMutate } from '@/hooks/features/useAuth';
import { useVerifyMailMutate, useVerifyOtpMutate } from '@/hooks/features/useTenant';
import { IRegisterForm } from '@/interfaces';
import { Form, FormInstance } from 'antd';
import { useEffect, useState } from 'react';

export const initValues = {
  organization: '',
  department: '',
  operator: '',
  position: '',
  email: '',
  phone: '',
  fileUpload1: {
    fileName: '',
    url: '',
  },
  fileUpload2: {
    fileName: '',
    url: '',
  },
};

export enum EMAIL_STEP {
  STEP_1 = 'ENTER_EMAIL',
  STEP_2 = 'VALIDATE_CODE',
  STEP_3 = 'COMPLETED',
}

export enum COUNTDOWN_STATE {
  START = 'START',
  COMPLETE = 'COMPLETE',
}

interface IProps {
  onSubmit: (values: IRegisterForm) => void;
  initialValues?: any;
  onToggleIsFormChanged?: (status: boolean) => void;
  formInstance?: FormInstance<any>;
}

export const useRegisterForm = ({
  onSubmit,
  initialValues,
  onToggleIsFormChanged,
  formInstance,
}: IProps) => {
  const [form] = Form.useForm(formInstance);
  const [emailStep, setEmailStep] = useState<EMAIL_STEP>(EMAIL_STEP.STEP_1);
  const [countdownTimer, setCountDownTimer] = useState<Date | string | number | null>(null);
  const [countDownState, setCountDowmState] = useState<COUNTDOWN_STATE | null>(null);
  const watchEmail = Form.useWatch('email', form);
  const [preValidatedEmail, setPreValidatedEmail] = useState<string>(initialValues?.email ?? '');
  const verifyMailMutation = useVerifyMailMutate();
  const verifyOtpMutation = useVerifyOtpMutate();
  const [conFirmMailCode, setConfirmMailCode] = useState<string | null>(
    initialValues?.conFirmMailCode ?? null
  );

  useEffect(() => {
    if (preValidatedEmail === watchEmail && watchEmail?.length && preValidatedEmail?.length) {
      setEmailStep(EMAIL_STEP.STEP_3);
    } else {
      emailStep !== EMAIL_STEP?.STEP_1 && setEmailStep(EMAIL_STEP?.STEP_1);
    }
    form.setFieldValue('emailOTP', '');
  }, [watchEmail, preValidatedEmail]);

  useEffect(() => {
    setPreValidatedEmail(initialValues?.email ?? '');
  }, [initialValues]);

  const onGetOtpRequest = () => {
    return new Promise((resove) => {
      verifyMailMutation.mutate(
        { email: watchEmail },
        {
          onSuccess(response) {
            setCountDownTimer(Date.now() + 5 * 60 * 1000);
            resove(response?.otp);
          },
        }
      );
    });
  };

  const onVerifyOtpRequest = async (mailOtp: string) => {
    return new Promise((resolve) => {
      verifyOtpMutation.mutate(
        {
          otp: mailOtp,
        },
        {
          onSuccess(response) {
            setConfirmMailCode(response.otp);
            resolve(response?.otp);
          },
        }
      );
    });
  };

  const handleSubmit = (values: any) => {
    // submit form here
    const validEmail = EMAIL_STEP.STEP_3 === emailStep || preValidatedEmail === values?.email;
    form.setFields([
      {
        name: 'email',
        errors: validEmail ? [] : ['이메일을 인증해 주세요!'],
      },
    ]);

    if (validEmail) {
      // POST here
      onSubmit({
        ...values,
        conFirmMailCode: conFirmMailCode,
      });
    }
  };

  const onNextStep = () => {
    switch (emailStep) {
      case EMAIL_STEP.STEP_1:
        try {
          form.validateFields(['email']).then(async () => {
            await onGetOtpRequest();
            setEmailStep(EMAIL_STEP.STEP_2);
          });
        } catch (err) {
          return;
        }
        break;
      case EMAIL_STEP.STEP_2:
        try {
          form.validateFields(['emailOTP']).then(async (value) => {
            form.setFields([
              {
                name: 'email',
                errors: [],
              },
            ]);
            await onVerifyOtpRequest(value?.emailOTP);
            setEmailStep(EMAIL_STEP.STEP_3);
            setPreValidatedEmail(watchEmail);
          });
        } catch (err) {
          return;
        }
        break;
      default:
        break;
    }
  };

  const onSetFieldError = (fieldName: string, error: string) => {
    form.setFields([
      {
        name: fieldName,
        errors: error ? [error] : [],
      },
    ]);
  };

  const onChangeValues = (_: any, values: any) => {
    if (onToggleIsFormChanged) {
      const typeValue = values;
      if (
        typeValue.department === initialValues?.department &&
        typeValue.email === initialValues?.email &&
        typeValue.operator === initialValues?.operator &&
        typeValue.organization === initialValues?.organization &&
        typeValue.phone === initialValues?.phone &&
        typeValue.position === initialValues?.position &&
        typeValue.policy === initialValues?.policy &&
        typeValue.terms === initialValues?.terms &&
        typeValue.fileUpload1.fileName === initialValues?.fileUpload1?.fileName &&
        typeValue.fileUpload2.fileName === initialValues?.fileUpload2?.fileName &&
        typeValue.fileUpload1.url === initialValues?.fileUpload1?.url &&
        typeValue.fileUpload2.url === initialValues?.fileUpload2?.url
      ) {
        onToggleIsFormChanged(false);
      } else {
        onToggleIsFormChanged(true);
      }
    }
  };

  return {
    form,
    handleSubmit,
    onNextStep,
    onGetOtpRequest,
    emailStep,
    setEmailStep,
    countdownTimer,
    setCountDownTimer,
    countDownState,
    setCountDowmState,
    initialValues: initialValues ?? initValues,
    onSetFieldError,
    onChangeValues,
  };
};
