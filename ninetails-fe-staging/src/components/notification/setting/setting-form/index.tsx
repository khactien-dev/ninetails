import IconInfo from '@/assets/images/svg/notification/info-small.svg';
import IconSuccess from '@/assets/images/svg/notification/success-small.svg';
import { BaseForm } from '@/components/common/forms/base-form';
import { SETTING_NOTIFICATION_KEY } from '@/constants/notification';
import {
  useGetSettingNotification,
  useUpdateSettingNotification,
} from '@/hooks/features/useNotification';
import { useFeedback } from '@/hooks/useFeedback';
import { SettingNotificationDataType } from '@/interfaces';
import { Form } from 'antd';
import React, { memo, useEffect, useState } from 'react';

import { NOTI_ICON_TYPE } from '../../index.ultis';
import * as S from './index.styles';

type FormDataInputType = {
  id: string;
  title: string;
  body: string;
  iconType: NOTI_ICON_TYPE;
  divider?: boolean;
};

export type KeySettingNotificationsType = keyof SettingNotificationDataType;

export const notificationsData: Record<SETTING_NOTIFICATION_KEY, FormDataInputType> = {
  [SETTING_NOTIFICATION_KEY.START_OPERATE]: {
    id: 'Noti_01',
    title: '운행 (재)시작',
    body: '배차 차량이 운행을 (재)시작했어요.',
    iconType: NOTI_ICON_TYPE.SUCCESS,
  },
  [SETTING_NOTIFICATION_KEY.END_OPERATE]: {
    id: 'Noti_02',
    title: '운행 종료 (휴식)',
    body: '배차 차량이 운행을 종료했어요.',
    iconType: NOTI_ICON_TYPE.SUCCESS,
  },
  [SETTING_NOTIFICATION_KEY.TO_TRASH_COLLECTION_POINT]: {
    id: 'Noti_03',
    title: '수거지 도착',
    body: '배차 차량이 수거지에 도착했어요.',
    iconType: NOTI_ICON_TYPE.SUCCESS,
  },
  [SETTING_NOTIFICATION_KEY.TO_LANDFILL]: {
    id: 'Noti_04',
    title: '매립지 도착',
    body: '배차 차량이 매립지에 도착했어요.',
    iconType: NOTI_ICON_TYPE.SUCCESS,
  },
  [SETTING_NOTIFICATION_KEY.COMPLETE_ROUTE]: {
    id: 'Noti_05',
    title: '수거동선 완주',
    body: '배차 차량이 오늘 수거동선을 완주했어요.',
    iconType: NOTI_ICON_TYPE.SUCCESS,
  },
  [SETTING_NOTIFICATION_KEY.BACK_TO_PARKING]: {
    id: 'Noti_06',
    title: '차고지 복귀',
    body: '배차 차량이 차고지에 복귀했어요.',
    iconType: NOTI_ICON_TYPE.SUCCESS,
    divider: true,
  },
  [SETTING_NOTIFICATION_KEY.START_OTHER_OPERATIONS]: {
    id: 'Noti_07',
    title: '기타운행 (미선택)',
    body: '배차 차량이 기타운행을 시작했어요.',
    iconType: NOTI_ICON_TYPE.INFO,
  },
  [SETTING_NOTIFICATION_KEY.END_OTHER_OPERATIONS]: {
    id: 'Noti_08',
    title: '기타운행 종료',
    body: '배차 차량이 기타운행을 종료하고 수거운행을 선택했어요.',
    iconType: NOTI_ICON_TYPE.INFO,
    divider: true,
  },
  [SETTING_NOTIFICATION_KEY.START_STANDBY_STATE]: {
    id: 'Noti_09',
    title: '대기 (공회전)',
    body: '배차 차량이 대기 (공회전) 상태입니다. 5분 경과.',
    iconType: NOTI_ICON_TYPE.INFO,
  },
  [SETTING_NOTIFICATION_KEY.END_STANDBY_STATE]: {
    id: 'Noti_10',
    title: '대기 종료',
    body: '배차 차량이 대기 (공회전) 상태를 종료하고 운행을 시작했어요.',
    iconType: NOTI_ICON_TYPE.INFO,
    divider: true,
  },
  [SETTING_NOTIFICATION_KEY.LOST_SIGNAL]: {
    id: 'Noti_11',
    title: '미관제 (미수신 3회)',
    body: '배차 차량이 미관제 상태가 되었어요.',
    iconType: NOTI_ICON_TYPE.INFO,
  },
  [SETTING_NOTIFICATION_KEY.RECONNECT_SIGNAL]: {
    id: 'Noti_12',
    title: '관제 복귀',
    body: '배차 차량이 관제 복귀했어요.',
    iconType: NOTI_ICON_TYPE.INFO,
  },
};

const NotificationSettingForm: React.FC = () => {
  const [form] = Form.useForm<SettingNotificationDataType>();
  const { notification } = useFeedback();
  const { data: settingDatas, isFetching } = useGetSettingNotification();
  const { mutate, isPending } = useUpdateSettingNotification();
  const [keysDisabled, setKeysDisabled] = useState<
    Partial<Record<KeySettingNotificationsType, boolean>>
  >({
    end_other_operations: false,
    end_standby_state: false,
    reconnect_signal: false,
  });

  const handleSubmit = (data: SettingNotificationDataType) => {
    mutate(data, {
      onSuccess() {
        notification.success({ message: '알림 설정이 업데이트되었습니다!' });
      },
    });
    return data;
  };

  const handleChangeSwitch = (key: KeySettingNotificationsType, value: boolean) => {
    const fieldMapping: Partial<Record<KeySettingNotificationsType, KeySettingNotificationsType>> =
      {
        start_other_operations: 'end_other_operations',
        start_standby_state: 'end_standby_state',
        lost_signal: 'reconnect_signal',
      };

    if (key in fieldMapping) {
      const dependentField = fieldMapping[key];
      if (dependentField) {
        form.setFieldValue(dependentField, false);
        setKeysDisabled((prev) => ({ ...prev, [dependentField]: !value }));
      }
    }
  };

  useEffect(() => {
    if (settingDatas) {
      const { data } = settingDatas;
      form.setFieldsValue(data);
      setKeysDisabled({
        end_other_operations: !data.start_other_operations,
        end_standby_state: !data.start_standby_state,
        reconnect_signal: !data.lost_signal,
      });
    }
  }, [settingDatas, isFetching]);

  return (
    <S.Wrapper>
      <BaseForm form={form} onFinish={handleSubmit}>
        <S.SWitchWrapper>
          {Object.entries(notificationsData).map(([type, { id, title, divider, iconType }]) => {
            const isDisabled = keysDisabled[type as KeySettingNotificationsType];
            return (
              <React.Fragment key={id}>
                <BaseForm.Item
                  name={type}
                  className="switch-item"
                  valuePropName="checked"
                  label={
                    <S.Title>
                      <S.IconType>
                        {iconType === NOTI_ICON_TYPE.SUCCESS ? <IconSuccess /> : <IconInfo />}
                      </S.IconType>
                      <span>{title}</span>
                    </S.Title>
                  }
                >
                  <S.Switch
                    onChange={(value) =>
                      handleChangeSwitch(type as KeySettingNotificationsType, value)
                    }
                    disabled={!!isDisabled}
                    status={iconType}
                  />
                </BaseForm.Item>
                {divider && <S.Divider />}
              </React.Fragment>
            );
          })}
        </S.SWitchWrapper>

        <S.ButtonWrapper className="notificationsSettingButtonGroup">
          <S.Button htmlType="submit" loading={isPending}>
            확인
          </S.Button>
        </S.ButtonWrapper>
      </BaseForm>
    </S.Wrapper>
  );
};

export default memo(NotificationSettingForm);
