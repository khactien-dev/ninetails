import ExclamtionIcon from '@/assets/images/settings/icon-exclamtion.svg';
import FilterIcon from '@/assets/images/settings/icon-filter.svg';
import MinusIcon from '@/assets/images/settings/minus11x1.svg';
import OpenIcon from '@/assets/images/settings/open_a1.svg';
import CloseIcon from '@/assets/images/settings/open_a2.svg';
import PlusIcon from '@/assets/images/settings/plus2.svg';
import IconClose from '@/assets/images/svg/icon-close-modal.svg';
import { BaseButton } from '@/components/common/base-button';
import BaseSortTable, { SortValueType } from '@/components/common/base-sort-table';
import { CrewIcon, StatusIcon, crewInfo } from '@/components/schedule/left-content/statistic/icon';
import EditWorkerForm from '@/components/settings/edit-worker-form';
import * as S from '@/components/settings/table/index.style';
import { DATE_FORMAT, SORT_TYPE } from '@/constants';
import {
  ABSENCE_TYPE_STAFF,
  JOBCONTRACT_EN,
  JOBCONTRACT_KR,
  STATUS,
  STATUS_KR,
} from '@/constants/settings';
import {
  useCreateWorker,
  useCreateWorkerStatus,
  useDeleteWorker,
  useGetWorkers,
  useUpdateWorker,
} from '@/hooks/features/useWorkers';
import { useFeedback } from '@/hooks/useFeedback';
import { usePermissions } from '@/hooks/usePermissions';
import { IWorker, PaginationParams } from '@/interfaces';
import { CREW_TYPE } from '@/interfaces/schedule';
import { truncateName } from '@/utils/common';
import { useQueryClient } from '@tanstack/react-query';
import { Form, PaginationProps, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import _, { omit } from 'lodash';
import { Key, useMemo, useState } from 'react';

import * as SWorker from './index.styles';
import UserIcon from './user-icon';

dayjs.extend(utc);
const inittialParams = {
  page: 1,
  sortBy: null,
  sortField: '',
};
export interface RadioItem {
  key: number;
  name: string;
  label: string;
}

export const AVAILABLE_CONTRACT = [
  'DRIVING_CREW_REGULAR',
  'SUPPORT_CREW_REGULAR',
  'SUPPORT_CREW_FIXED_TERM',
];

const CONTRACTS = [
  ...crewInfo,
  { id: 6, type: 'MECHANIC_REGULAR', label: '정비 [정규]', subLabel: '', color: 'red' },
  { id: 7, type: 'OFFICE_CREW_REGULAR', label: '사무 [정규]', subLabel: '', color: 'red' },
  { id: 8, type: 'MANAGER_REGULAR', label: '간부 [정규]', subLabel: '', color: 'red' },
];

export default function useWorkers() {
  const [params, setParams] = useState<PaginationParams>(inittialParams);
  const permissions = usePermissions();

  const { data: allWorkers } = useGetWorkers(params);

  const deleteWorker = useDeleteWorker();
  const updateWorder = useUpdateWorker();
  const createWorker = useCreateWorker();
  const updateWorkerStatus = useCreateWorkerStatus();
  const { notification } = useFeedback();
  const queryClient = useQueryClient();

  const [form] = Form.useForm();
  const [selectedRows, setSelectedRows] = useState<Key[]>([]);
  const [editingKey, setEditingKey] = useState<string>('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const total = allWorkers?.data.pagination?.total || 0;

  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenDeactive, setIsOpenDeactive] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
  const [sortDirectionStatus, setSortDirectionStatus] = useState<SORT_TYPE>(SORT_TYPE.DESC);
  const [showPopover, setShowPopover] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortValue, setSortValue] = useState<SortValueType>({
    key: '',
    order: null,
  });

  const [isOpenConfirmChangeModal, setIsOpenConfirmChangeModal] = useState<boolean>(false);

  const handleCreateWorker = (
    workerData: Omit<IWorker, 'key' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id'>
  ) => {
    workerData.start_date = dayjs(workerData.start_date).format(DATE_FORMAT.START_OF);
    if (workerData.end_date) {
      workerData.end_date = dayjs(workerData.end_date).format(DATE_FORMAT.END_OF);
    }
    workerData.age = dayjs(workerData.age).format(DATE_FORMAT.R_BASIC);
    workerData.note = _.trim(workerData.note);

    createWorker.mutate(workerData, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['workers'] });
        notification.success({ message: '직원이 성공적으로 생성되었습니다!' });
        setIsOpenCreate(false);
        form.resetFields();
      },
    });
  };

  const handleDeleteWorker = (password: string) => {
    deleteWorker.mutate(
      { id: selectedRows, password },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['workers'] });
          notification.success({ message: '직원이 성공적으로 삭제되었습니다!' });
          setIsOpenConfirmChangeModal(false);
        },
      }
    );
  };

  const handleUpdateWorker = async (updatedRecord: IWorker) => {
    const updatedData = omit(updatedRecord, [
      'key',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'id',
      'absence_staff',
    ]);
    updatedData.age = dayjs(updatedData.age).format(DATE_FORMAT.R_BASIC);
    updatedData.note = _.trim(updatedData.note);
    updatedData.start_date = dayjs(updatedData.start_date).format(DATE_FORMAT.START_OF);
    if (updatedData.end_date && updatedRecord?.absence_staff?.absence_date) {
      const endDate = dayjs(updatedData.end_date);
      const absenceStartDate = dayjs(updatedRecord?.absence_staff?.absence_date);
      if (absenceStartDate.isAfter(endDate)) {
        notification.error({ message: '올바른 계약 기간을 선택해 주세요' });
        return;
      }
    }

    if (updatedData.end_date != updatedRecord.end_date) {
      updatedData.end_date = dayjs(updatedData.end_date).format(DATE_FORMAT.END_OF);
    }
    updateWorder.mutate(
      { data: updatedData, id: updatedRecord.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['workers'] });
          notification.success({ message: '직원이 성공적으로 업데이트되었습니다!' });
        },
      }
    );

    setEditingKey('');
    setExpandedRowKeys(expandedRowKeys.filter((key) => key !== updatedRecord.key));
  };

  const handleDeactiveWorker = () => {
    updateWorkerStatus.mutate(
      { id: selectedRows, status: 0 },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['workers'] });
          notification.success({ message: '직원이 성공적으로 업데이트되었습니다!' });
          setIsOpenDeactive(false);
          setSelectedRows([]);
        },
      }
    );
  };

  const handleChangeParams = (data: PaginationParams) => {
    setParams((prev) => ({ ...prev, ...data }));
  };

  const handleSelectChange = (selectedRowKeys: Key[]) => {
    setSelectedRows(selectedRowKeys);
  };

  const handleMenuClick = (record: IWorker) => {
    const isExpanded = expandedRowKeys.includes(record.key);
    const newExpandedRowKeys = isExpanded
      ? expandedRowKeys.filter((key) => key !== record.key)
      : [record.key];

    setExpandedRowKeys(newExpandedRowKeys);
    setEditingKey(isExpanded ? '' : record.key);
  };

  const toggleSortDirectionStatus = () => {
    setSortDirectionStatus((prev) => (prev === SORT_TYPE.ASC ? SORT_TYPE.DESC : SORT_TYPE.ASC));
  };
  const renderJobContract = (job_contract: string) => {
    switch (job_contract) {
      case JOBCONTRACT_EN.DRIVING_CREW_REGULAR:
        return JOBCONTRACT_KR.DRIVING_CREW_REGULAR;
      case JOBCONTRACT_EN.COLLECT_CREW_REGULAR:
        return JOBCONTRACT_KR.COLLECT_CREW_REGULAR;
      case JOBCONTRACT_EN.SUPPORT_CREW_REGULAR:
        return JOBCONTRACT_KR.SUPPORT_CREW_REGULAR;
      case JOBCONTRACT_EN.COLLECT_CREW_MONTHLY:
        return JOBCONTRACT_KR.COLLECT_CREW_MONTHLY;
      case JOBCONTRACT_EN.COLLECT_CREW_FIXED_TERM:
        return JOBCONTRACT_KR.COLLECT_CREW_FIXED_TERM;
      case JOBCONTRACT_EN.SUPPORT_CREW_FIXED_TERM:
        return JOBCONTRACT_KR.SUPPORT_CREW_FIXED_TERM;
      case JOBCONTRACT_EN.MECHANIC_REGULAR:
        return JOBCONTRACT_KR.MECHANIC_REGULAR;
      case JOBCONTRACT_EN.OFFICE_CREW_REGULAR:
        return JOBCONTRACT_KR.OFFICE_CREW_REGULAR;
      case JOBCONTRACT_EN.MANAGER_REGULAR:
        return JOBCONTRACT_KR.MANAGER_REGULAR;
      default:
        break;
    }
  };
  const renderStatus = (status: string) => {
    switch (status) {
      case STATUS.NORMAL:
        return STATUS_KR.NORMAL;
      case STATUS.LEAVING:
        return STATUS_KR.LEAVING;
      case STATUS.RESIGNED:
        return STATUS_KR.RESIGNED;

      default:
        break;
    }
  };

  const handleSort = (key: string, order: SORT_TYPE.ASC | SORT_TYPE.DESC | null) => {
    setSortValue({ key, order });
    setParams((prev) => ({ ...prev, sortBy: order, sortField: key }));
  };

  const columns: ColumnsType<IWorker> = [
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '이름', key: 'name' },
            { title: '연락처', key: 'phone_number' },
          ]}
          onSort={handleSort}
        />
      ),
      key: 'name',
      render: (_, record: IWorker) => {
        return (
          <SWorker.ColInfo>
            <SWorker.InfoText>{truncateName(record.name, 20)}</SWorker.InfoText>
            <SWorker.InfoText>{record.phone_number}</SWorker.InfoText>
          </SWorker.ColInfo>
        );
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '나이', key: 'age' },
            { title: '운전면허', key: 'driver_license' },
          ]}
          onSort={handleSort}
        />
      ),
      key: 'age',
      render: (_, record: IWorker) => {
        return (
          <SWorker.ColInfo>
            <SWorker.InfoText>
              {new Date().getFullYear() - new Date(record.age).getFullYear() + 1} 세
            </SWorker.InfoText>
            <SWorker.InfoText>
              {record.driver_license === 'NONE' ? 'None' : record.driver_license}
            </SWorker.InfoText>
          </SWorker.ColInfo>
        );
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '계약시작', key: 'start_date' },
            { title: '계약종료', key: 'end_date' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'end_date',
      key: 'end_date',
      render: (_, record: IWorker) => {
        return (
          <SWorker.ColInfo>
            <SWorker.InfoText>
              {dayjs(record.start_date).format(DATE_FORMAT.R_BASIC)}
            </SWorker.InfoText>
            <SWorker.InfoText>
              {record.end_date ? dayjs.utc(record.end_date).format(DATE_FORMAT.R_BASIC) : '--'}
            </SWorker.InfoText>
          </SWorker.ColInfo>
        );
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '부재시작', key: 'absence_date' },
            { title: '부재항목', key: 'absence_type' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'absence_date',
      key: 'absence_date',
      render: (_, record: IWorker) => (
        <SWorker.ColInfo>
          <SWorker.InfoText>
            {record?.absence_staff
              ? dayjs(record?.absence_staff?.absence_date).format(DATE_FORMAT.R_BASIC)
              : '--'}
          </SWorker.InfoText>
          <SWorker.Absence>
            {record?.absence_staff?.absence_type ? record?.absence_staff?.absence_type : '--'}
            {[
              ABSENCE_TYPE_STAFF.LONG_TERM_MERITORIOUS,
              ABSENCE_TYPE_STAFF.LONG_TERM_INDUSTRIAL,
              ABSENCE_TYPE_STAFF.LONG_TERM_DISEASE,
              ABSENCE_TYPE_STAFF.LONG_TERM_PARENTAL,
              ABSENCE_TYPE_STAFF.SUSPENDED,
            ].includes(record?.absence_staff?.absence_type) && (
              <SWorker.InfoAbsencType>장기</SWorker.InfoAbsencType>
            )}
          </SWorker.Absence>
        </SWorker.ColInfo>
      ),
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '직무[계약]', key: 'job_contract' },
            { title: '노트', key: 'note' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'job_contract',
      key: 'job_contract',
      render: (_, record: IWorker) => {
        return (
          <SWorker.ColInfo>
            <SWorker.InfoText>
              <SWorker.InfoJob>
                <SWorker.SettingPopover
                  content={
                    <SWorker.PopoverContent>
                      <SWorker.Section>
                        <SWorker.SectionTitle>
                          <SWorker.Title>
                            <CrewIcon crew_type={record.job_contract as CREW_TYPE} />
                            <SWorker.WrapWorkerName>
                              {record.name.length > 4
                                ? `${truncateName(record.name, 5)}...`
                                : record.name}
                            </SWorker.WrapWorkerName>

                            {crewInfo?.map((job) => {
                              if (record.job_contract === job.type) {
                                return (
                                  <SWorker.TitleJob $color={job.color} key={job.id}>
                                    [{renderJobContract(record.job_contract)}]
                                  </SWorker.TitleJob>
                                );
                              }
                            })}
                          </SWorker.Title>
                          <SWorker.WrapCloseIcon>
                            <IconClose onClick={() => setShowPopover(null)} />
                          </SWorker.WrapCloseIcon>
                        </SWorker.SectionTitle>

                        <SWorker.Content>
                          <ul>
                            <li>
                              시작:{' '}
                              {record?.absence_staff?.start_date
                                ? dayjs(record?.absence_staff?.start_date).format(
                                    DATE_FORMAT.R_BASIC
                                  )
                                : '--'}
                            </li>
                            <li>
                              복귀:{' '}
                              {dayjs
                                .utc(record?.absence_staff?.end_date)
                                .add(1, 'day')
                                .format(DATE_FORMAT.R_BASIC)}
                            </li>
                            <li>
                              기간:{' '}
                              {dayjs
                                .utc(record?.absence_staff?.end_date)
                                .diff(dayjs.utc(record?.absence_staff?.start_date), 'day') +
                                1 +
                                '일'}
                            </li>
                            <li>사유: {record?.absence_staff?.absence_type}</li>
                            <li>
                              <SWorker.ContentInfoReplacer>
                                대체:{' '}
                                {
                                  <CrewIcon
                                    crew_type={
                                      record?.absence_staff?.replacer_staff?.job_contract as any
                                    }
                                  />
                                }{' '}
                                {record?.absence_staff?.replacer_staff?.name?.length > 4
                                  ? `${truncateName(
                                      record?.absence_staff?.replacer_staff?.name,
                                      5
                                    )}...`
                                  : record?.absence_staff?.replacer_staff?.name}
                                {record?.absence_staff?.replacer_staff &&
                                  ([
                                    ABSENCE_TYPE_STAFF.LONG_TERM_MERITORIOUS,
                                    ABSENCE_TYPE_STAFF.LONG_TERM_INDUSTRIAL,
                                    ABSENCE_TYPE_STAFF.LONG_TERM_DISEASE,
                                    ABSENCE_TYPE_STAFF.LONG_TERM_PARENTAL,
                                    ABSENCE_TYPE_STAFF.SUSPENDED,
                                  ].includes(record?.absence_staff?.absence_type) ? (
                                    <StatusIcon status={'REPLACE_LONG_TERM'} />
                                  ) : (
                                    <StatusIcon status={'REPLACE_SHORT_TERM'} />
                                  ))}
                              </SWorker.ContentInfoReplacer>
                            </li>
                          </ul>
                        </SWorker.Content>
                      </SWorker.Section>
                    </SWorker.PopoverContent>
                  }
                  trigger="click"
                  open={showPopover === record.id}
                  onOpenChange={(newOpen: boolean) => setShowPopover(newOpen ? record.id : null)}
                  getPopupContainer={() => document.body}
                >
                  {record.absence_staff &&
                    ([
                      ABSENCE_TYPE_STAFF.LONG_TERM_MERITORIOUS,
                      ABSENCE_TYPE_STAFF.LONG_TERM_INDUSTRIAL,
                      ABSENCE_TYPE_STAFF.LONG_TERM_DISEASE,
                      ABSENCE_TYPE_STAFF.LONG_TERM_PARENTAL,
                      ABSENCE_TYPE_STAFF.SUSPENDED,
                    ].includes(record?.absence_staff?.absence_type) ? (
                      <div>
                        <StatusIcon status={'ABSENCE_LONG_TERM'} />
                      </div>
                    ) : (
                      <div>
                        <StatusIcon status={'ABSENCE_SHORT_TERM'} />
                      </div>
                    ))}
                </SWorker.SettingPopover>

                {CONTRACTS?.map((job) => {
                  if (record.job_contract === job.type) {
                    return <UserIcon key={job.id} color={job.color} />;
                  }
                })}
                {renderJobContract(record.job_contract)}
              </SWorker.InfoJob>
            </SWorker.InfoText>
            <SWorker.InfoText>
              <SWorker.InfoNote>
                <Tooltip title={record?.note}>
                  <ExclamtionIcon />
                </Tooltip>
                {record?.note?.length > 4
                  ? `${truncateName(record?.note, 5)}...`
                  : record?.note || '--'}
              </SWorker.InfoNote>
            </SWorker.InfoText>
          </SWorker.ColInfo>
        );
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '상태', key: 'status' },
            { title: '대체자', key: 'replacer_staff' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'status',
      key: 'status',
      render: (_: undefined, record: IWorker) => (
        <SWorker.ColInfo>
          <S.StatusWrap status={record.status}>{renderStatus(record.status)}</S.StatusWrap>
          <SWorker.InfoText>
            {' '}
            {record?.absence_staff?.replacer_staff?.name || '--'}
          </SWorker.InfoText>
        </SWorker.ColInfo>
      ),
      onHeaderCell: () => ({
        onClick: () => {
          toggleSortDirectionStatus();
          handleChangeParams({ sortBy: sortDirectionStatus });
        },
      }),
    },
    {
      title: '',
      dataIndex: 'actions',
      render: (_, record: IWorker) => (
        <BaseButton
          onClick={() => handleMenuClick(record)}
          type="link"
          icon={
            <S.BoxIconDropdown>
              {expandedRowKeys.includes(record.key) ? <CloseIcon /> : <OpenIcon />}
            </S.BoxIconDropdown>
          }
        />
      ),
    },
  ];
  const [isOpenFilter, setIsOpenFilter] = useState(false);

  const radios = [
    {
      key: 1,
      name: 'NORMAL',
      label: '정상',
    },
    {
      key: 2,
      name: 'LEAVING',
      label: '열외',
    },
    {
      key: 3,
      name: 'RESIGNED',
      label: '퇴사',
    },
  ];
  const checkboxs = [
    {
      name: 'DRIVING_CREW_REGULAR',
      label: '운전 [정규]',
    },
    {
      name: 'COLLECT_CREW_MONTHLY',
      label: '탑승 [단기]',
    },
    {
      name: 'MECHANIC_REGULAR',
      label: '정비 [정규]',
    },

    {
      name: 'COLLECT_CREW_REGULAR',
      label: '탑승 [정규]',
    },
    {
      name: 'COLLECT_CREW_FIXED_TERM',
      label: '탑승 [계약]',
    },
    {
      name: 'OFFICE_CREW_REGULAR',
      label: '사무 [정규]',
    },
    {
      name: 'SUPPORT_CREW_REGULAR',
      label: '지원 [정규]',
    },

    {
      name: 'SUPPORT_CREW_FIXED_TERM',
      label: '지원 [계약]',
    },
    {
      name: 'MANAGER_REGULAR',
      label: '간부 [정규]',
    },
  ];

  const isFilter = useMemo(() => {
    return selectedStatus !== null;
  }, [selectedStatus]);

  const buttons = [
    {
      name: '필터',
      icon: <FilterIcon />,
      isActive: permissions.readAble,
      isFilter: isFilter,
      isOutline: true,
      onClick: () => setIsOpenFilter(true),
    },
    {
      name: '추가',
      icon: <PlusIcon />,
      isActive: permissions.createAble,
      isPrimary: true,
      onClick: () => setIsOpenCreate(true),
    },
    {
      name: '삭제',
      icon: <MinusIcon style={{ marginBottom: 4 }} />,
      isActive: permissions.deleteAble && selectedRows.length > 0,
      onClick: () => setIsOpenConfirm(true),
    },
  ];

  const expandedRowRender = (record: IWorker) => {
    if (editingKey === record.key) {
      return <EditWorkerForm record={record} onSave={handleUpdateWorker} />;
    }
    return null;
  };

  const onChange: PaginationProps['onChange'] = (page) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const onFirstPage = () => {
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const onLastPage = () => {
    const lastPage = Math.ceil(total / 10);
    setParams((prev) => ({ ...prev, page: lastPage }));
  };
  const handleCheckboxChange = (name: string) => {
    setSelectedCheckboxes((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };
  const handleStatusChange = (value: string) => {
    setSelectedStatus((prevStatus) => (prevStatus === value ? null : value));
  };

  return {
    form,
    params,
    setParams,
    columns,
    currentPage: params.page || 1,
    selectedRows,
    expandedRowKeys,
    data: allWorkers?.data?.data?.map((worker) => ({ ...worker, key: worker.id })),
    total,
    buttons,
    isOpenConfirm,
    isOpenCreate,
    isOpenDeactive,
    radios,
    checkboxs,
    isOpenFilter,
    selectedCheckboxes,
    handleCheckboxChange,
    setIsOpenFilter,
    setIsOpenDeactive,
    handleDeleteWorker,
    handleChangeParams,
    handleCreateWorker,
    handleDeactiveWorker,
    setIsOpenCreate,
    setIsOpenConfirm,
    onChange,
    onLastPage,
    onFirstPage,
    expandedRowRender,
    handleSelectChange,
    setExpandedRowKeys,
    setEditingKey,
    setSelectedCheckboxes,
    selectedStatus,
    handleStatusChange,
    setSelectedStatus,
    isOpenConfirmChangeModal,
    setIsOpenConfirmChangeModal,
  };
}
