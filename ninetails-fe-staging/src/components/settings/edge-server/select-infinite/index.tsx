import { BaseSelect } from '@/components/common/selects/base-select';
import { useGetVehicleMutation } from '@/hooks/features/useEdgeServer';
import { PaginationParams } from '@/interfaces';
import { Select } from 'antd';
import { Select as AntSelect } from 'antd';
import React, { ComponentProps, useEffect, useState } from 'react';

const { Option } = Select;

const initialParams = {
  page: 1,
  pageSize: 10,
};

export interface BaseSelectProps extends ComponentProps<typeof AntSelect> {
  className?: string;
  initialOption?: { value: Number; label: string } | null;
}

export const SelectInfiniteVehicle: React.FC<BaseSelectProps> = ({
  className,
  initialOption,
  ...props
}) => {
  const [params, setParams] = useState<PaginationParams>(initialParams);
  const [data, setData] = useState<{ value: Number; label: string }[]>(
    initialOption ? [initialOption] : []
  );
  const [hasMore, setHasMore] = useState<boolean>(true);
  const { mutate, isPending } = useGetVehicleMutation();

  useEffect(() => {
    mutate(params, {
      onSuccess(response) {
        const parseOptions = response?.data?.data?.map((item) => ({
          value: item.id,
          label: item.vehicle_number,
        }));
        const filter = initialOption?.value
          ? parseOptions.filter((item) => item.value !== initialOption?.value)
          : parseOptions;
        setData((prev) => [...prev, ...filter]);
        response?.data?.data?.length < initialParams.pageSize && setHasMore(false);
      },
    });
  }, [params]);

  const onScroll = async (event: any) => {
    const target = event.target;
    if (!isPending && target.scrollTop + target.offsetHeight === target.scrollHeight) {
      target.scrollTo(0, target.scrollHeight);
      hasMore &&
        setParams((prev) => ({
          ...prev,
          page: (prev?.page ?? 1) + 1,
        }));
    }
  };

  return (
    <BaseSelect
      loading={isPending}
      onPopupScroll={onScroll}
      getPopupContainer={(triggerNode) => triggerNode}
      className={className}
      {...props}
    >
      {data.map((el, index) => (
        <Option key={index} value={el.value}>
          {el.label}
        </Option>
      ))}
      {isPending && <Option>Loading...</Option>}
    </BaseSelect>
  );
};
