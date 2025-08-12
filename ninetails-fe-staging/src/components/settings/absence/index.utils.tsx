import OpenIcon from '@/assets/images/settings/open_a1.svg';
import CloseIcon from '@/assets/images/settings/open_a2.svg';
import { BaseButton } from '@/components/common/base-button';
import BaseSortTable, { SortValueType } from '@/components/common/base-sort-table';
import { BaseTooltip } from '@/components/common/base-tooltip';
import CarIcon from '@/components/control-status/car-info/car-icon';
import { CrewIcon, StatusIcon, TruckIcon } from '@/components/schedule/left-content/statistic/icon';
import EditAbsenceForm from '@/components/settings/absence/EditAbsenceForm';
import * as SUser from '@/components/settings/user/index.styles';
import { DATE_FORMAT, SORT_TYPE } from '@/constants';
import {
  ABSENCE_DAY_LIST,
  ABSENCE_TYPE,
  ABSENCE_TYPE_STAFF,
  LEAVE_HAFT_DAY,
  LEAVE_HAFT_DAY_STAFF,
  LEAVE_LONG_TERM,
  LEAVE_LONG_TERM_STAFF,
  LEAVE_MORNING_VEHICLE,
  PURPOSE_EN,
  REPEAT_TYPE_EN,
} from '@/constants/settings';
import {
  useAddAbsenceStaff,
  useAddAbsenceVehicle,
  useGetAbsenceStaffList,
  useGetAbsenceVehicleList,
  useGetListVehicle,
  useGetListWorkers,
  useRemoveAbsenceStaff,
  useRemoveAbsenceVehicle,
  useUpdateAbsenceStaff,
  useUpdateAbsenceVehicle,
} from '@/hooks/features/useAbsence';
import { useFeedback } from '@/hooks/useFeedback';
import {
  FormValues,
  IAbsenceData,
  IAbsenceStaffData,
  IAbsenceVehicleParam,
  IUpdateAbsence,
  IUpdateAbsenceStaff,
  PaginationParams,
} from '@/interfaces';
import { CREW_TYPE, STATUS, VEHICLE_TYPE } from '@/interfaces/schedule';
import { getOrdinalSuffix, renderJobContract, renderPurpose, truncateName } from '@/utils';
import { queryClient } from '@/utils/react-query';
import { Form, PaginationProps, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import _, { omit } from 'lodash';
import { useRouter } from 'next/router';
import React, { Key, useMemo, useState } from 'react';

import * as S from './index.styles';

dayjs.extend(utc);

export const enum TYPE_TABS {
  STAFF = 'staff',
  VEHICLE = 'vehicle',
}

export const driveStatus = [
  {
    id: 0,
    label: PURPOSE_EN.COMPOSITE_REGULAR,
    color: 'blue',
  },
  {
    id: 1,
    label: PURPOSE_EN.COMPOSITE_SUPPORT,
    color: '#5FC5ED',
  },
  {
    id: 2,
    label: PURPOSE_EN.FOOD_REGULAR,
    color: 'green',
  },
  {
    id: 3,
    label: PURPOSE_EN.FOOD_SUPPORT,
    color: '#83C257',
  },
  {
    id: 4,
    label: PURPOSE_EN.REUSABLE_REGULAR,
    color: '#ED9201',
  },
  {
    id: 5,
    label: PURPOSE_EN.REUSABLE_SUPPORT,
    color: '#EFE837',
  },
  {
    id: 6,
    label: PURPOSE_EN.TATICAL_MOBILITY_REGULAR,
    color: '#8A29AF',
  },
  {
    id: 7,
    label: PURPOSE_EN.TATICAL_MOBILITY_SUPPORT,
    color: '#ffadff',
  },
];

export default function useAbsence() {
  const route = useRouter();

  const currentDate = dayjs().format(DATE_FORMAT.R_BASIC);
  const initialParams = {
    page: 1,
    pageSize: 1000,
    start_date: dayjs(currentDate).startOf('month').format(DATE_FORMAT.R_BASIC),
    end_date: dayjs(currentDate).endOf('month').format(DATE_FORMAT.R_BASIC),
    type: TYPE_TABS.STAFF,
  };
  const initTypeTab = route.query.type === TYPE_TABS.VEHICLE ? TYPE_TABS.VEHICLE : TYPE_TABS.STAFF;

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedRows, setSelectedRows] = useState<Key[]>([]);
  const [params, setParams] = useState<IAbsenceVehicleParam>(initialParams);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [editingKey, setEditingKey] = useState<string>('');
  const [isViewCalendar, setIsViewCalendar] = useState<boolean>(false);
  const [typeList, setTypeList] = useState<TYPE_TABS>(initTypeTab);
  const [isOpenConfirm, setIsOpenConfirm] = useState<boolean>(false);
  const [isOpenAddAbsence, setIsOpenAddAbsence] = useState<boolean>(false);
  const [activeLegend, setActiveLegend] = useState<string | null>(null);
  const [sortValue, setSortValue] = useState<SortValueType>({
    key: '',
    order: null,
  });

  const filteredParams =
    params.sortField === 'period' ? omit(params, 'sortField', 'sortBy') : params;

  const { data: vehicle } = useGetListVehicle({ page: 1, pageSize: 1000, type: typeList });

  const { data: workers } = useGetListWorkers({ page: 1, pageSize: 1000, type: typeList });

  const { data: absenceVehicle, isLoading: isLoadingAbsenceVehicle } = useGetAbsenceVehicleList({
    ...filteredParams,
    page: 1,
    pageSize: 10000,
    type: typeList,
  });

  const { data: absenceStaff, isLoading: isLoadingAbsenceStaff } = useGetAbsenceStaffList({
    ...params,
    page: 1,
    pageSize: 10000,
    type: typeList,
  });
  const { mutate: addAbsenceVehicle } = useAddAbsenceVehicle();
  const { mutate: addAbsenceStaff } = useAddAbsenceStaff();
  const { mutate: removeAbsence } = useRemoveAbsenceVehicle();
  const { mutate: removeAbsenceStaff } = useRemoveAbsenceStaff();
  const { mutate: updateAbsence } = useUpdateAbsenceVehicle();
  const { mutate: updateAbsenceStaff } = useUpdateAbsenceStaff();
  const [form] = Form.useForm();
  const { notification } = useFeedback();

  const total =
    (TYPE_TABS.VEHICLE === typeList
      ? absenceVehicle?.data.pagination?.total
      : absenceStaff?.data.pagination?.total) || 0;

  type AbsenceTypeKeys = keyof typeof ABSENCE_TYPE;

  const handleSort = (key: string, order: SORT_TYPE.ASC | SORT_TYPE.DESC | null) => {
    setSortValue({ key, order });
    setParams((prev) => ({ ...prev, sortBy: order, sortField: key }));
  };

  const columns: ColumnsType<IAbsenceData> = [
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '이름', key: 'absence_type' },
            { title: '직무[계약]', key: 'purpose' },
          ]}
          onSort={handleSort}
        />
      ),
      key: 'absence_vehicle',
      dataIndex: 'absence_vehicle',
      render: (value, record: IAbsenceData) => {
        return (
          <S.ColContent>
            <S.TableContent>
              {_.includes(
                LEAVE_LONG_TERM,
                ABSENCE_TYPE?.[record?.absence_type as AbsenceTypeKeys]
              ) ? (
                <StatusIcon status={STATUS.ABSENCE_LONG_TERM} />
              ) : (
                <StatusIcon status={STATUS.ABSENCE_SHORT_TERM} />
              )}
              <TruckIcon vehicle_type={record?.absence_vehicle?.purpose as VEHICLE_TYPE} />
              {record?.absence_vehicle?.vehicle_number}
            </S.TableContent>
            <SUser.InfoText>{renderPurpose(record?.absence_vehicle?.purpose)}</SUser.InfoText>
          </S.ColContent>
        );
      },
      width: '25%',
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '시작일', key: 'start_date' },
            { title: '종료일', key: 'end_date' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'start_date',
      key: 'start_date',
      width: '25%',
      render: (value, record: IAbsenceData) => {
        return (
          <S.ColContent>
            <S.TableContent>
              {dayjs(record.start_date).format(DATE_FORMAT.R_BASIC)}&nbsp;
              {_.includes(
                ABSENCE_TYPE.AFTERNOON || ABSENCE_TYPE.PERIODIC_AFTERNOON,
                ABSENCE_TYPE?.[record?.absence_type as AbsenceTypeKeys]
              )
                ? '[오후]'
                : '[오전]'}
            </S.TableContent>
            <S.TableContent>
              {dayjs.utc(record?.end_date).format(DATE_FORMAT.R_BASIC)}&nbsp;
              {_.includes(
                LEAVE_MORNING_VEHICLE,
                ABSENCE_TYPE?.[record?.absence_type as AbsenceTypeKeys]
              )
                ? '[오전]'
                : '[오후]'}
            </S.TableContent>
          </S.ColContent>
        );
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[{ title: '기간', key: 'period' }]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'period',
      key: 'period',
      width: '15%',
      render: (_, record: IAbsenceData) => {
        return (
          <S.ColContent>
            <S.TableContent>{record?.period}</S.TableContent>
          </S.ColContent>
        );
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[{ title: '항목', key: 'absence_type' }]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'absence_type',
      key: 'absence_type',
      width: '25%',
      render: (value, record: IAbsenceData) => {
        return (
          <S.ColContent>
            <S.TableContent>
              {_.includes(
                LEAVE_LONG_TERM,
                ABSENCE_TYPE?.[record?.absence_type as AbsenceTypeKeys]
              ) && <S.TagLongTerm>장기</S.TagLongTerm>}
              {ABSENCE_TYPE?.[record?.absence_type as AbsenceTypeKeys] || record?.absence_type}
            </S.TableContent>
          </S.ColContent>
        );
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[{ title: '대체자', key: 'replacement_vehicle' }]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'replacement_vehicle',
      key: 'replacement_vehicle',
      width: '25%',
      render: (value, record: IAbsenceData) => {
        return (
          <S.ColContent>
            <S.TableContent>
              {_.includes(
                LEAVE_LONG_TERM,
                ABSENCE_TYPE?.[record?.absence_type as AbsenceTypeKeys]
              ) ? (
                <StatusIcon status={STATUS.REPLACE_LONG_TERM} />
              ) : (
                <StatusIcon status={STATUS.REPLACE_SHORT_TERM} />
              )}
              <TruckIcon vehicle_type={record?.replacement_vehicle?.purpose as VEHICLE_TYPE} />
              {record?.replacement_vehicle?.vehicle_number}
            </S.TableContent>
          </S.ColContent>
        );
      },
    },
    {
      title: '',
      dataIndex: 'actions',
      width: '10%',
      sorter: false,
      render: (_, record: IAbsenceData) => (
        <BaseButton
          onClick={() => handleMenuClick(record)}
          type="link"
          icon={
            <S.BoxIconDropdown>
              {expandedRowKeys.includes(record?.key || '') ? <CloseIcon /> : <OpenIcon />}
            </S.BoxIconDropdown>
          }
        />
      ),
    },
  ];

  const columnsStaff: ColumnsType<any> = [
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '이름', key: 'absence_staff' },
            { title: '직무[계약]', key: 'job_contract' },
          ]}
          onSort={handleSort}
        />
      ),
      key: 'absence_staff',
      dataIndex: 'absence_staff',
      render: (value, record: IAbsenceStaffData) => {
        return (
          <S.ColContent>
            <S.TableContent>
              {_.includes(LEAVE_LONG_TERM_STAFF, record?.absence_type) ? (
                <StatusIcon status={STATUS.ABSENCE_LONG_TERM} />
              ) : (
                <StatusIcon status={STATUS.ABSENCE_SHORT_TERM} />
              )}
              <CrewIcon crew_type={record?.absence_staff?.job_contract as CREW_TYPE} />
              <Tooltip
                title={record?.absence_staff?.name?.length > 20 ? record?.absence_staff?.name : ''}
              >
                {record?.absence_staff?.name?.length > 20
                  ? `${truncateName(record?.absence_staff?.name, 21)}...`
                  : record?.absence_staff?.name || '--'}
              </Tooltip>
            </S.TableContent>
            <SUser.InfoText>
              {renderJobContract(record?.absence_staff?.job_contract)}
            </SUser.InfoText>
          </S.ColContent>
        );
      },
      width: '25%',
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '시작일', key: 'start_date' },
            { title: '종료일', key: 'end_date' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'start_date',
      key: 'start_date',

      width: '25%',
      render: (value, record: IAbsenceStaffData) => {
        return (
          <S.ColContent>
            <S.TableContent>
              {dayjs(record?.start_date).format(DATE_FORMAT.R_BASIC)}&nbsp;
              {_.includes(ABSENCE_TYPE_STAFF.AFTERNOON_HALF, record?.absence_type)
                ? '[오후]'
                : '[오전]'}
            </S.TableContent>
            <S.TableContent>
              {dayjs.utc(record?.end_date).format(DATE_FORMAT.R_BASIC)}&nbsp;
              {_.includes(ABSENCE_TYPE_STAFF.MORNING_HALF, record?.absence_type)
                ? '[오전]'
                : '[오후]'}
            </S.TableContent>
          </S.ColContent>
        );
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[{ title: '기간', key: 'period' }]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'period',
      key: 'period',
      width: '15%',
      render: (value, record: IAbsenceStaffData) => {
        const labelContent = _.chain(record?.repeat_days_week?.split(','))
          .map((day) => _.find(ABSENCE_DAY_LIST, { value: day?.trim() }))
          .compact()
          .map('label')
          .join(', ')
          .value();
        return (
          <S.ColContent>
            <S.TableContent>{`${record?.period}`}</S.TableContent>
            {record.repeat !== REPEAT_TYPE_EN.NONE && (
              <div>
                <S.RepairTag>
                  {record.repeat !== REPEAT_TYPE_EN.MONTHLY ? `매주` : '매월'}
                </S.RepairTag>
                {record.repeat === REPEAT_TYPE_EN.MONTHLY ? (
                  <BaseTooltip
                    title={
                      repeatMonthFormat(record?.repeat_days_month).length > 8
                        ? repeatMonthFormat(record?.repeat_days_month)
                        : ''
                    }
                  >
                    <span>
                      {repeatMonthFormat(record?.repeat_days_month).length > 8
                        ? `${repeatMonthFormat(record?.repeat_days_month).slice(0, 8)}...`
                        : repeatMonthFormat(record?.repeat_days_month)}
                    </span>
                  </BaseTooltip>
                ) : (
                  <BaseTooltip title={labelContent.length > 5 ? labelContent : ''}>
                    <span>
                      {labelContent.length > 5
                        ? `${labelContent.substring(0, 5)}...`
                        : labelContent}
                    </span>
                  </BaseTooltip>
                )}
              </div>
            )}
          </S.ColContent>
        );
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[{ title: '항목', key: 'absence_type' }]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'absence_type',
      key: 'absence_type',
      width: '20%',
      render: (value, record: IAbsenceStaffData) => {
        return (
          <S.ColContent>
            <S.TableContent>
              {_.includes(LEAVE_LONG_TERM_STAFF, record.absence_type) && (
                <S.TagLongTerm>장기</S.TagLongTerm>
              )}
              {record?.absence_type}
            </S.TableContent>
          </S.ColContent>
        );
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[{ title: '대체자', key: 'replacer_staff' }]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'replacer_staff',
      key: 'replacer_staff',
      width: '25%',
      render: (value, record: IAbsenceStaffData) => {
        return (
          <S.ColContent>
            <S.TableContent>
              {_.includes(LEAVE_LONG_TERM_STAFF, record?.absence_type) ? (
                <StatusIcon status={STATUS.REPLACE_LONG_TERM} />
              ) : (
                <StatusIcon status={STATUS.REPLACE_SHORT_TERM} />
              )}
              <CrewIcon crew_type={record?.replacer_staff?.job_contract as CREW_TYPE} />
              <Tooltip
                title={
                  record?.replacer_staff?.name?.length > 20 ? record?.replacer_staff?.name : ''
                }
              >
                {record?.replacer_staff?.name?.length > 20
                  ? `${truncateName(record?.replacer_staff?.name, 21)}...`
                  : record?.replacer_staff?.name || '--'}
              </Tooltip>
            </S.TableContent>
          </S.ColContent>
        );
      },
    },
    {
      title: '',
      dataIndex: 'actions',
      width: '5%',
      sorter: false,
      render: (_, record: IAbsenceData) => (
        <BaseButton
          onClick={() => handleMenuClick(record)}
          type="link"
          icon={
            <S.BoxIconDropdown>
              {expandedRowKeys.includes(record?.key || '') ? <CloseIcon /> : <OpenIcon />}
            </S.BoxIconDropdown>
          }
        />
      ),
    },
  ];

  const handleGetPeriod = (type: string, startDate: string, endDate: string) => {
    const isHaftDay = _.includes(LEAVE_HAFT_DAY, ABSENCE_TYPE[type as keyof typeof ABSENCE_TYPE]);
    if (isHaftDay) return '0.5일 [4H]';
    const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
    return `${totalDays}일 [${totalDays * 8}H]`;
  };

  const repeatMonthFormat = (repeatMonth?: string | null) => {
    return _.chain(repeatMonth?.split(','))
      .map((day) => getOrdinalSuffix(Number(day)))
      .join(', ')
      .value();
  };

  const onChangeMonth = (direction: number) => {
    const isHalfYear = Math.abs(direction) === 6;
    const newDate = isHalfYear ? dayjs(currentDate) : currentMonth.add(direction, 'month');

    const startDate = isHalfYear && direction < 0 ? newDate.subtract(6, 'month') : newDate;
    const endDate = isHalfYear && direction > 0 ? newDate.add(6, 'month') : newDate;

    setCurrentMonth(newDate);
    setParams((prevState) => ({
      ...prevState,
      start_date: startDate.startOf('month').format('YYYY-MM-DD'),
      end_date: endDate.endOf('month').format('YYYY-MM-DD'),
    }));
  };

  const handleChangeParams = (params: PaginationParams) => {
    setParams((prev) => ({ ...prev, ...params }));
  };

  const handleChangeTab = (type: TYPE_TABS) => {
    setTypeList(type);
    setSelectedRows([]);
    setExpandedRowKeys([]);
    setParams((prev) => ({
      ...prev,
      page: 1,
      vehicle_id: null,
      staff_id: null,
      sortBy: null,
      sortField: undefined,
    }));
    setSortValue({
      key: '',
      order: null,
    });
  };

  const handleSortPeriod = () => {
    const sortedAbsenceList = (absenceVehicle?.data.data || [])
      .map((vehicle) => ({
        ...vehicle,
        key: vehicle?.id.toString(),
        period: handleGetPeriod(vehicle?.absence_type, vehicle?.start_date, vehicle?.end_date),
      }))
      .sort((a, b) => {
        const valueA = parseFloat(a?.period?.split('일')[0] ?? '0');
        const valueB = parseFloat(b?.period?.split('일')[0] ?? '0');
        return params.sortBy === 'ASC' ? valueA - valueB : valueB - valueA;
      });
    return sortedAbsenceList;
  };

  const handleSelectChange = (selectedRowKeys: Key[]) => {
    setSelectedRows(selectedRowKeys);
  };

  const handleMenuClick = (record: IAbsenceData) => {
    if (record?.key != null) {
      const isExpanded = expandedRowKeys.includes(record?.key);
      setExpandedRowKeys(
        isExpanded ? expandedRowKeys.filter((key) => key !== record.key) : [record.key]
      );
      setEditingKey(isExpanded ? '' : record?.key);
    }
  };

  const expandedRowRender = (record: IAbsenceData | IAbsenceStaffData) => {
    const listOption = typeList === TYPE_TABS.VEHICLE ? vehicle?.data?.data : workers?.data?.data;
    if (Number(editingKey) === Number(record.id)) {
      return (
        <EditAbsenceForm
          key={JSON.stringify(record || '')}
          record={record}
          onSave={(values) => handleUpdateAbsence(values)}
          optionList={listOption}
          type={typeList}
        />
      );
    }
    return null;
  };

  const handleUpdateAbsence = (values: IUpdateAbsence | IUpdateAbsenceStaff) => {
    if (TYPE_TABS.VEHICLE === typeList) {
      const record = values as IUpdateAbsence;
      updateAbsence(record, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['absenceVehicleList'] });
          notification.success({ message: '부재 기록이 성공적으로 업데이트되었습니다!' });
          setEditingKey('');
          setExpandedRowKeys(expandedRowKeys.filter((key) => String(key) !== String(record.id)));
        },
      });
    } else {
      const record = values as IUpdateAbsenceStaff;
      updateAbsenceStaff(record, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['absenceStaffList'] });
          notification.success({ message: '부재 기록이 성공적으로 업데이트되었습니다!' });
          setEditingKey('');
          setExpandedRowKeys(expandedRowKeys.filter((key) => String(key) !== String(record.id)));
        },
      });
    }
  };

  const onFirstPage = () => {
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const onLastPage = () => {
    const lastPage = Math.ceil(total / 10);
    setParams((prev) => ({ ...prev, page: lastPage }));
  };

  const onChange: PaginationProps['onChange'] = (page) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleDeleteAbsence = () => {
    const idsSet = new Set(selectedRows);
    const currentDate = new Date();

    const isStaffType = TYPE_TABS.STAFF === typeList;
    const absenceData = isStaffType ? absenceStaff?.data.data : absenceVehicle?.data.data;

    const oldRecordExists = absenceData?.some(
      (employee) => idsSet.has(String(employee.id)) && new Date(employee.start_date) < currentDate
    );

    if (oldRecordExists) {
      notification.error({
        message: '이전 날짜의 근태 기록은 삭제할 수 없습니다. 다른 항목을 선택해 주세요!',
      });
      setIsOpenConfirm(false);
      return;
    }

    if (!isStaffType) {
      removeAbsence(
        { ids: selectedRows },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['absenceVehicleList'] });
            notification.success({
              message: '부재 기록이 성공적으로 삭제되었습니다!',
            });
            setIsOpenConfirm(false);
          },
        }
      );
    } else {
      removeAbsenceStaff(
        { ids: selectedRows },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['absenceStaffList'] });
            notification.success({
              message: '부재 기록이 성공적으로 삭제되었습니다!',
            });
            setIsOpenConfirm(false);
          },
        }
      );
    }
  };

  const getIconPurposeVehicle = (purpose: string) => {
    const status = driveStatus.find((vehicle) => vehicle.label === purpose);
    return <CarIcon color={status?.color || '#000'} />;
  };

  const handleAddAbsence = (values: FormValues) => {
    if (TYPE_TABS.STAFF === typeList) {
      handleAddAbsenceStaff(values);
    } else {
      handleAddAbsenceVehicle(values);
    }
  };

  const handleAddAbsenceVehicle = (values: FormValues) => {
    const body = {
      absence_vehicle: { id: values?.absence },
      replacement_vehicle: { id: values?.replacement },
      absence_type: values?.absence_type,
      start_date: dayjs(values.start_date).format(DATE_FORMAT.R_BASIC),
      end_date:
        dayjs(values.end_date).format(DATE_FORMAT.END_OF) ||
        dayjs(values.start_date).format(DATE_FORMAT.END_OF),
    };
    addAbsenceVehicle(body, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['absenceVehicleList'] });
        notification.success({ message: '부재 기록이 성공적으로 생성되었습니다!' });
        setIsOpenAddAbsence(false);
        form.resetFields();
      },
    });
  };

  const handleAddAbsenceStaff = (values: FormValues) => {
    const days =
      values?.repeat === REPEAT_TYPE_EN.MONTHLY ? values?.multiple_day : values?.day || [];
    const body = {
      absence_staff: { id: values?.absence },
      replacer_staff: { id: values?.replacement },
      absence_type: values?.absence_type || '',
      start_date: dayjs(values.start_date).format(DATE_FORMAT.R_BASIC),
      end_date:
        dayjs(values.end_date).format(DATE_FORMAT.END_OF) ||
        dayjs(values.start_date).format(DATE_FORMAT.END_OF),
      period: values?.period,
      days: days,
      repeat: values?.repeat || REPEAT_TYPE_EN.NONE,
      ...(values?.other ? { other: values?.other } : {}),
    };
    addAbsenceStaff(body, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['absenceStaffList'] });
        notification.success({ message: '부재 기록이 성공적으로 생성되었습니다!' });
        setIsOpenAddAbsence(false);
        form.resetFields();
      },
    });
  };

  const handleSelectOption = (vehicleId: unknown) => {
    const key = TYPE_TABS.VEHICLE === typeList ? 'vehicle_id' : 'staff_id';
    setParams((prevState) =>
      vehicleId !== 0 ? { ...prevState, [key]: String(vehicleId) } : omit(prevState, key)
    );
  };

  const formatListAbsenceValue = useMemo(() => {
    let dataToFormat;
    if (params.sortField === 'period') {
      dataToFormat = handleSortPeriod() || [];
    } else {
      dataToFormat = absenceVehicle?.data?.data || [];
    }
    const recordsPerPage = 10;
    const currentPage = params?.page || 1;
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;

    return dataToFormat.slice(startIndex, endIndex).map((vehicle) => ({
      ...vehicle,
      key: vehicle.id.toString(),
      period: handleGetPeriod(vehicle?.absence_type, vehicle?.start_date, vehicle?.end_date),
    }));
  }, [absenceVehicle, params.page, params]);

  const formatListAbsenceStaff = useMemo(() => {
    const dataToFormat = absenceStaff?.data?.data || [];
    const recordsPerPage = 10;
    const currentPage = params?.page || 1;
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;

    return dataToFormat.slice(startIndex, endIndex).map((vehicle) => ({
      ...vehicle,
      key: vehicle?.id?.toString(),
    }));
  }, [absenceStaff, params.page, params]);

  const vehicleOptionSelect = [
    {
      value: 0,
      label: <S.ItemsSelect>전체 차량</S.ItemsSelect>,
    },
    ...(vehicle?.data?.data?.map((vehicle) => ({
      value: vehicle.id,
      label: (
        <S.ItemsSelect>
          {_.includes(LEAVE_HAFT_DAY, vehicle?.absence?.absence_type) ? (
            <StatusIcon status={STATUS.ABSENCE_SHORT_TERM} />
          ) : (
            <StatusIcon status={STATUS.ABSENCE_LONG_TERM} />
          )}
          <TruckIcon vehicle_type={vehicle?.purpose as VEHICLE_TYPE} />
          {vehicle?.vehicle_number}
        </S.ItemsSelect>
      ),
    })) ?? []),
  ];

  const workersOptionSelect = [
    {
      value: 0,
      label: <S.ItemsSelect>전체 인력</S.ItemsSelect>,
    },
    ...(workers?.data?.data?.map((workers) => ({
      value: workers.id,
      label: (
        <S.ItemsSelect>
          {_.includes(LEAVE_HAFT_DAY_STAFF, workers?.absence_staff?.absence_type) ? (
            <StatusIcon status={STATUS.ABSENCE_SHORT_TERM} />
          ) : (
            <StatusIcon status={STATUS.ABSENCE_LONG_TERM} />
          )}

          <CrewIcon crew_type={workers?.job_contract as CREW_TYPE} />

          {workers.name.length > 4 ? `${truncateName(workers.name, 5)}...` : workers?.name}
        </S.ItemsSelect>
      ),
    })) ?? []),
  ];

  const optionSelect = typeList === TYPE_TABS.STAFF ? workersOptionSelect : vehicleOptionSelect;
  const optionList = typeList === TYPE_TABS.STAFF ? workers : vehicle;

  return {
    form,
    params,
    currentMonth,
    selectedRows,
    currentPage: params.page || 1,
    isOpenConfirm,
    setIsOpenConfirm,
    isOpenAddAbsence,
    setIsOpenAddAbsence,
    activeLegend,
    setActiveLegend,
    typeList,
    setTypeList,
    columns: TYPE_TABS.STAFF === typeList ? columnsStaff : columns,
    optionList: optionList?.data?.data,
    total,
    isViewCalendar,
    setIsViewCalendar,
    onChangeMonth,
    setCurrentMonth,
    handleChangeParams,
    handleSelectChange,
    expandedRowRender,
    expandedRowKeys,
    setExpandedRowKeys,
    setEditingKey,
    onFirstPage,
    onLastPage,
    onChange,
    handleDeleteAbsence,
    getIconPurposeVehicle,
    handleAddAbsence,
    absenceList: TYPE_TABS.STAFF === typeList ? formatListAbsenceStaff : formatListAbsenceValue,
    handleSelectOption,
    absenceListCalendar:
      TYPE_TABS.VEHICLE === typeList ? absenceVehicle?.data?.data : absenceStaff?.data?.data,
    optionSelect,
    isLoadingTable: isLoadingAbsenceVehicle || isLoadingAbsenceStaff,
    handleChangeTab,
  };
}
