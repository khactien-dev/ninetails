import { RESPONSE_CODE } from '@/constants';
import { ApiError, ServerError, ValidationError } from '@/interfaces';
import { removeCredentials } from '@/stores/auth/auth.slice';
import { useAppDispatch } from '@/stores/hooks';
import { FormInstance } from 'antd';
import find from 'lodash/find';
import forEach from 'lodash/forEach';

import { useAppMutationCustomProps } from './useAppMutation';
import { useFeedback } from './useFeedback';

type ARGS = {
  error: ApiError;
  form?: FormInstance;
  customProps?: useAppMutationCustomProps;
};

export default function useLoadServerError() {
  const { notification } = useFeedback();
  const dispatch = useAppDispatch();

  const loadServerErrors = (args: ARGS) => {
    const { error, form, customProps } = args;

    if (!error) {
      return;
    }

    if (error.status == RESPONSE_CODE.UNAUTHORIZED) {
      dispatch(removeCredentials());
    }

    const isClientError = !Object.prototype.hasOwnProperty.call(error, 'response');

    if (isClientError && customProps?.toast && error.status !== RESPONSE_CODE.VALIDATION_ERROR) {
      const response = error.data as ServerError;
      notification.error({ message: response?.message });
      return;
    }

    if (error.status === RESPONSE_CODE.SERVER_ERROR) {
      // show toast notification
      notification.error({ message: 'Server error has occurred. Please try again later.' });
      return;
    }

    if (form !== undefined && error.status === RESPONSE_CODE.VALIDATION_ERROR) {
      const data = error.data as ValidationError;
      attachErrorsIntoForm(data, form);
      return;
    }
    // const data = response.data as ServerError;
    // showError(data || []);
  };

  const attachErrorsIntoForm = (data: ValidationError, form: FormInstance) => {
    let errorLoaded = false;

    const formValues = form.getFieldsValue();
    forEach(formValues, (_: string, key: string) => {
      const info = find(data.detail, (item) => item.field === key);
      if (!info) {
        return;
      }

      errorLoaded = true;
      // TODO handler i18n with item.key
      form.setFieldsValue({
        [key]: {
          value: null,
          error: info.message,
        },
      });
    });

    if (errorLoaded) {
      return;
    }

    // show toast message
    let message = 'Some fields are invalid';
    const info = data.detail[0].message;
    if (info) {
      message = info;
    }
    showError(message);
  };

  const showError = (error: any) => {
    // Custom i18n with error.key
    let message = error[0]?.message || error;

    if (message === 'canceled') {
      return;
    }

    if (message === 'Too Many Attempts.') {
      message = '...';
    }

    notification.error({ message });
  };

  return {
    loadServerErrors,
  };
}
