import IconDropdown from '@/assets/images/svg/icon-dropdown-2.svg';
import IconQuestion from '@/assets/images/svg/icon-question.svg';
import IconSearch from '@/assets/images/svg/icon-search.svg';
import useLeftMenuAnalysis from '@/components/analysis/left-menu/index.utils';
import { BaseTooltip } from '@/components/common/base-tooltip';
import LeftContent from '@/layouts/admin-layout/content/left-content';
import dayjs from 'dayjs';

import Collapse from '../collapse/index';
import { AmountData } from '../collect-amount-data';
import { useAnalysisContext } from '../context';
import { DATA_CLOSING_TIME } from '../context/index.utils';
import { DrivingRoute } from '../driving-route';
import * as S1 from './index.styles';

const LeftContentChart = () => {
  const {
    setActiveKey,
    itemsData,
    handleChangeKey,
    onChangeRadio,
    onSearch,
    date,
    routeName,
    setRouteName,
    setDate,
  } = useLeftMenuAnalysis();

  const { routeList } = useAnalysisContext();

  return (
    <LeftContent width={360}>
      <S1.Wrapper>
        <S1.LeftMenu>
          <S1.Select
            suffixIcon={<IconDropdown />}
            placeholder={'000-전체구역'}
            options={routeList}
            value={routeName}
            onChange={(v) => setRouteName(v as string)}
          ></S1.Select>

          <S1.RankDate
            onChange={(v) => setDate(v ? v : [null, null])}
            suffixIcon={<IconDropdown />}
            // format={customDateFormatKorea}
            value={date}
            disabledDate={(current) => {
              const today = dayjs();

              if (current.isAfter(today, 'day')) return true;

              if (
                current.isSame(today, 'day') &&
                current.isBefore(
                  dayjs()
                    .set('hour', DATA_CLOSING_TIME.hour)
                    .set('minute', DATA_CLOSING_TIME.minute)
                    .set('second', DATA_CLOSING_TIME.second)
                    .set('millisecond', DATA_CLOSING_TIME.milisecond)
                )
              )
                return true;

              if (current.isBefore(today.subtract(90, 'day'), 'day')) return true;

              return false;
            }}
          ></S1.RankDate>

          <S1.Filter>
            <S1.Radio onChange={onChangeRadio} defaultValue="1일">
              <S1.RadioButton value="day">1일</S1.RadioButton>
              <S1.RadioButton value="week">1주일</S1.RadioButton>
              <S1.RadioButton value="month">1개월</S1.RadioButton>
            </S1.Radio>
            <S1.SearchBtn onClick={onSearch} type={'primary'}>
              <IconSearch />
              {'검색'}
            </S1.SearchBtn>
          </S1.Filter>

          <S1.Inline>
            <S1.Checkbox>동일 기간 비교</S1.Checkbox>
            <BaseTooltip
              title={
                '당일 운행은 오후 4시부터 반영됩니다. 1일은 최근 1일, 1주는 최근 7일, 1달은 최근 30일 중 미운행일을 제외한 기간입니다.'
              }
            >
              <IconQuestion />
            </BaseTooltip>
          </S1.Inline>

          <DrivingRoute />

          <S1.Div>
            <Collapse typeTitle={'전체'} title={'수거량 통계'}>
              <S1.Tabs activeKey={setActiveKey} onChange={handleChangeKey} items={itemsData} />
              {setActiveKey === '1' ? <AmountData tab={'total'} /> : <AmountData tab={'average'} />}
            </Collapse>
          </S1.Div>
        </S1.LeftMenu>
      </S1.Wrapper>
    </LeftContent>
  );
};

export default LeftContentChart;
