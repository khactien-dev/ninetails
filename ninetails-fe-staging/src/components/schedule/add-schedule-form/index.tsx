import Calendar from '@/assets/images/schedule/icon-calendar.svg';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseInput } from '@/components/common/inputs/base-input';
import { BaseSelect } from '@/components/common/selects/base-select';
import { DATE_FORMAT } from '@/constants';
import { STATUS_VEHICLE_EN } from '@/constants/settings';
import { useGetRoute } from '@/hooks/features/useRoute';
import {
  useCreatSchedule,
  useGetAgentStaff,
  useGetDrivingRegularStaff,
} from '@/hooks/features/useSchedule';
import { useGetVehicle } from '@/hooks/features/useSettings';
import { useFeedback } from '@/hooks/useFeedback';
import { RecordTypes } from '@/interfaces';
import { queryClient } from '@/utils/react-query';
import { DatePicker, Form } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

import { useScheduleContext } from '../context';
import * as S from './index.styles';

interface IProps {
  onCreatedSusccess: () => void;
}

const PAGE_SIZE = 1000;

export const AddScheduleForm: React.FC<IProps> = ({ onCreatedSusccess }) => {
  const { data: agentStaffData, isLoading: loadingAgentStaffs } = useGetAgentStaff({
    pageSize: PAGE_SIZE,
  });
  const { data: drivingRegularStaffData, isLoading: loadingDrivingStaffs } =
    useGetDrivingRegularStaff({
      pageSize: PAGE_SIZE,
    });
  const { data: dataVehicle, isLoading: loadingVehicles } = useGetVehicle({
    pageSize: PAGE_SIZE,
  });
  const { data: dataRouteList, isLoading: loadingRoutes } = useGetRoute({
    pageSize: PAGE_SIZE,
  });
  const createSchedule = useCreatSchedule();
  const { notification } = useFeedback();
  const { params } = useScheduleContext();

  const listStaff = React.useMemo(() => {
    return drivingRegularStaffData?.data?.data.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }, [drivingRegularStaffData]);

  const listStaffBackup = React.useMemo(() => {
    return agentStaffData?.data?.data.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }, [agentStaffData]);

  const routeOptions = React.useMemo(() => {
    return dataRouteList?.data?.data?.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }, [dataRouteList]);

  const listLicensePlate = React.useMemo(() => {
    return dataVehicle?.data?.data
      ?.filter(
        (item) =>
          !(item.status === STATUS_VEHICLE_EN.RETIRED || item.status === STATUS_VEHICLE_EN.DISPOSED)
      )
      .map((item) => ({
        label: item.vehicle_number,
        value: item.id,
      }));
  }, [dataVehicle]);

  const initialValues = {
    working_date: dayjs(params.working_date),
  };

  const [form] = Form.useForm();
  const handleCreateSchedule = (workingSchedule: Omit<RecordTypes, 'id'>) => {
    const { ...rest } = workingSchedule;

    const transformedData = {
      ...rest,
      working_date: dayjs(workingSchedule.working_date).format(DATE_FORMAT.R_BASIC),
    };

    createSchedule.mutate(transformedData, {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: [`SCHEDULE_${variables.purpose}`, { working_date: params?.working_date }],
        });
        queryClient.invalidateQueries({
          queryKey: [`schedule-statistic`, { working_date: params?.working_date }],
        });
        notification.success({ message: '작업 일정이 성공적으로 생성되었습니다' });
        onCreatedSusccess();
      },
      onError: (err: any) => {
        if (err?.data?.field_name) {
          form.setFields([
            {
              name: err?.data?.field_name,
              errors: [err?.data?.message],
            },
          ]);
        } else {
          notification.error({ message: err?.data?.message });
        }
      },
    });
  };

  return (
    <S.Form
      layout="vertical"
      initialValues={initialValues}
      form={form}
      onFinish={handleCreateSchedule}
    >
      <BaseRow gutter={16}>
        <BaseCol span={24}>
          <BaseForm.Item
            label="근무 날짜"
            name="working_date"
            rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
          >
            <DatePicker
              disabledDate={(current) => {
                return current && current < dayjs().startOf('day');
              }}
              suffixIcon={<Calendar />}
            />
          </BaseForm.Item>
        </BaseCol>
        <BaseCol span={12}>
          <BaseForm.Item
            label="수거지역"
            name="route_id"
            rules={[
              { required: true, message: '이 필드는 필수입니다.' },
              {
                validator: (_, value) => {
                  const result = dataRouteList?.data?.data.find((item) => item.id === value);
                  if (result?.type) {
                    form.setFieldValue('purpose', result?.type);
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <BaseSelect
              placeholder={'수거지역 선택'}
              options={routeOptions}
              loading={loadingRoutes}
            />
          </BaseForm.Item>
        </BaseCol>
        <BaseCol span={12}>
          <BaseForm.Item
            label="용도"
            name="purpose"
            rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
          >
            <BaseInput disabled />
          </BaseForm.Item>
        </BaseCol>

        <BaseCol span={12}>
          <BaseForm.Item
            label="차번"
            name="vehicle_id"
            rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
          >
            <BaseSelect
              placeholder={'차량 선택'}
              options={listLicensePlate}
              loading={loadingVehicles}
            />
          </BaseForm.Item>
        </BaseCol>
        <BaseCol span={12}>
          <S.FormItem
            label="운전원"
            name="driver"
            rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
          >
            <BaseSelect
              placeholder={'운전자 선택'}
              options={listStaff}
              loading={loadingDrivingStaffs}
            />
          </S.FormItem>
        </BaseCol>
        <BaseCol span={12}>
          <S.FormItem
            label="탑승원1"
            name="field_agent_1"
            rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
          >
            <BaseSelect
              placeholder={'탑승원1 선택'}
              options={listStaffBackup}
              loading={loadingAgentStaffs}
            />
          </S.FormItem>
        </BaseCol>
        <BaseCol span={12}>
          <S.FormItem
            label="탑승원2"
            name="field_agent_2"
            rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
          >
            <BaseSelect
              placeholder={'탑승원2 선택'}
              options={listStaffBackup}
              loading={loadingAgentStaffs}
            />
          </S.FormItem>
        </BaseCol>
      </BaseRow>
      <BaseRow justify="center">
        <S.BtnSave htmlType="submit" type="primary" loading={createSchedule.isPending}>
          저장
        </S.BtnSave>
      </BaseRow>
    </S.Form>
  );
};
