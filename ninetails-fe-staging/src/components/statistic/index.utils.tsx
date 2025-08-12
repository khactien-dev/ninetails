import Car0 from '@/assets/images/svg/icon-car0.svg';
import Car1 from '@/assets/images/svg/icon-car1.svg';
import Car2 from '@/assets/images/svg/icon-car2.svg';
import Car3 from '@/assets/images/svg/icon-car3.svg';
import Man1 from '@/assets/images/svg/icon-man1.svg';
import Man2 from '@/assets/images/svg/icon-man2.svg';
import Man3 from '@/assets/images/svg/icon-man3.svg';
import Man4 from '@/assets/images/svg/icon-man4.svg';
import CaretDownOutlined from '@/assets/images/svg/icon-open_a1.svg';
import { IStatistic } from '@/interfaces/statistic';
import type { TabsProps } from 'antd';
import { ColumnsType } from 'antd/es/table';

interface Utils {
  // loading: boolean;
  columns: ColumnsType<IStatistic>;
  tableData: [] | any;
  vehicleList: [] | any;
  driverList: [] | any;
  tabs: [] | any;
}

export default function useStatistic(): Utils {
  const tableData = [
    {
      race_number: '001',
      region: '도산, 송정',
      vehicle: [
        {
          time: '233수2910',
          icon: <Car1 />,
        },
      ],
      driver: [
        {
          name: '홍길동',
          icon: <Man1 />,
        },
        {
          name: '홍길동',
          icon: <Man1 />,
        },
      ],
      crew_1: [
        {
          name: '홍길동',
          icon: <Man2 />,
        },
      ],
      crew_2: [
        {
          name: '홍길동',
          icon: <Man1 />,
        },
      ],
    },
    {
      race_number: '001',
      region: '도산, 송정',
      vehicle: [
        {
          time: '233수2910',
          icon: <Car1 />,
        },
      ],
      driver: [
        {
          name: '홍길동',
          icon: <Man1 />,
        },
      ],
      crew_1: [
        {
          name: '홍길동',
          icon: <Man2 />,
        },
      ],
      crew_2: [
        {
          name: '홍길동',
          icon: <Man3 />,
        },
      ],
    },
    {
      race_number: '001',
      region: '도산, 송정',
      vehicle: [
        {
          time: '233수2910',
          icon: <Car2 />,
        },
      ],
      driver: [
        {
          name: '홍길동',
          icon: <Man1 />,
        },
      ],
      crew_1: [
        {
          name: '홍길동',
          icon: <Man1 />,
        },
      ],
      crew_2: [
        {
          name: '홍길동',
          icon: <Man3 />,
        },
      ],
    },
    {
      race_number: '001',
      region: '도산, 송정',
      vehicle: [
        {
          time: '233수2910',
          icon: <Car2 />,
        },
      ],
      driver: [
        {
          name: '홍길동',
          icon: <Man1 />,
        },
        {
          name: '홍길동',
          icon: <Man1 />,
        },
      ],
      crew_1: [
        {
          name: '홍길동',
          icon: <Man1 />,
        },
      ],
      crew_2: [
        {
          name: '홍길동',
          icon: <Man3 />,
        },
      ],
    },
    {
      race_number: '001',
      region: '도산, 송정',
      vehicle: [
        {
          time: '233수2910',
          icon: <Car3 />,
        },
      ],
      driver: [
        {
          name: '홍길동',
          icon: <Man1 />,
        },
      ],
      crew_1: [
        {
          name: '홍길동',
          icon: <Man1 />,
        },
      ],
      crew_2: [
        {
          name: '홍길동',
          icon: <Man4 />,
        },
      ],
    },
    {
      race_number: '001',
      region: '도산, 송정',
      vehicle: [
        {
          time: '233수2910',
          icon: <Car3 />,
        },
      ],
      driver: [
        {
          name: '홍길동',
          icon: <Man1 />,
        },
      ],
      crew_1: [
        {
          name: '홍길동',
          icon: <Man1 />,
        },
      ],
      crew_2: [
        {
          name: '홍길동',
          icon: <Man1 />,
        },
      ],
    },
  ];
  const columns: ColumnsType<IStatistic> = [
    {
      title: '배번',
      dataIndex: 'race_number',
      key: 'race_number',
      width: '10%',
    },
    {
      title: '지역',
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: '차량',
      dataIndex: 'vehicle',
      key: 'vehicle',
      render: (value) => {
        return (
          <>
            {value.map((item: any, index: number) => (
              <div key={index}>
                {item?.icon}
                <span style={{ marginLeft: '8px' }}>{item?.time}</span>
              </div>
            ))}
          </>
        );
      },
    },
    {
      title: '운전원',
      dataIndex: 'driver',
      key: 'driver',
      render: (value) => {
        return (
          <>
            {value.map((item: any, index: number) => (
              <div key={index}>
                {item?.icon}
                <span style={{ marginLeft: '8px' }}>{item?.name}</span>
              </div>
            ))}
          </>
        );
      },
    },
    {
      title: '탑승원1',
      dataIndex: 'crew_1',
      key: 'crew_1',
      render: (value) => {
        return (
          <>
            {value.map((item: any, index: number) => (
              <div key={index}>
                {item?.icon}
                <span style={{ marginLeft: '8px' }}>{item?.name}</span>
              </div>
            ))}
          </>
        );
      },
    },
    {
      title: '탑승원2',
      dataIndex: 'crew_2',
      key: 'crew_2',
      render: (value) => {
        return (
          <>
            {value.map((item: any, index: number) => (
              <div key={index}>
                {item?.icon}
                <span style={{ marginLeft: '8px' }}>{item?.name}</span>
              </div>
            ))}
          </>
        );
      },
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: () => {
        return (
          <>
            <span>
              <CaretDownOutlined />
            </span>
          </>
        );
      },
    },
  ];
  const tabs: TabsProps['items'] = [
    {
      key: '1',
      label: '생활',
    },
    {
      key: '2',
      label: '음식',
    },
    {
      key: '3',
      label: '재활',
    },
  ];
  const vehicleList = [
    {
      key: 1,
      status: {
        name: '전체',
        icon: <Car0 />,
      },
      total: 114,
      average: 19,
      importance: 100,
    },
    {
      key: 2,
      status: {
        name: '정규',
        icon: <Car1 />,
      },
      total: 114,
      average: 19,
      importance: 100,
    },
    {
      key: 3,
      status: {
        name: '기동',
        icon: <Car2 />,
      },
      total: 114,
      average: 19,
      importance: 100,
    },
    {
      key: 4,
      status: {
        name: '대체',
        icon: <Car3 />,
      },
      total: 114,
      average: 19,
      importance: 100,
    },
  ];
  const driverList = [
    {
      key: 1,
      status: {
        name: '전체',
        icon: <Man1 />,
      },
      total: 114,
      average: 19,
      importance: 100,
    },
    {
      key: 2,
      status: {
        name: '정규',
        icon: <Man2 />,
      },
      total: 114,
      average: 19,
      importance: 100,
    },
    {
      key: 3,
      status: {
        name: '기동',
        icon: <Man3 />,
      },
      total: 114,
      average: 19,
      importance: 100,
    },
    {
      key: 4,
      status: {
        name: '대체',
        icon: <Man4 />,
      },
      total: 114,
      average: 19,
      importance: 100,
    },
  ];

  return {
    columns,
    tableData,
    vehicleList,
    driverList,
    tabs,
  };
}
