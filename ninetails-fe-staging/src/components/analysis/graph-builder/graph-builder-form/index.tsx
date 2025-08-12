import IconPlus from '@/assets/images/svg/icon-plus-2.svg';
import IconRun from '@/assets/images/svg/icon-run.svg';
import IconTrash from '@/assets/images/svg/icon-trash-3.svg';
import { useAnalysisContext } from '@/components/analysis/context';
import { BuilderChartContext } from '@/components/analysis/graph-builder/graph-builder-form/context';
import { BaseCheckbox } from '@/components/common/base-checkbox';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseDatePicker } from '@/components/common/date-picker';
import { BaseInput } from '@/components/common/inputs/base-input';
import { BaseSelect } from '@/components/common/selects/base-select';
import { BaseForm } from '@/components/settings/agency/index.style';
import {
  DOMAINS,
  chartTypeOptions,
  conditionOptions,
  opratorOptions,
  purposeOptions,
  xOptions,
  yOptions,
} from '@/constants/charts';
import { getDomain } from '@/utils';
import { LoadingOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { FullScreen } from 'react-full-screen';

import { DATA_CLOSING_TIME } from '../../context/index.utils';
import ActionsBuilder from './actions';
import Y1Y2Chart from './chart/Y1Y2Chart';
import * as S from './index.styles';
import useGraphBuilderForm from './index.utils';
import BuilderLegends from './legends';
import TooltipChartBuilder from './tooltip';

interface IProps {
  idChart: string;
}

const GraphBuildForm = ({ idChart }: IProps) => {
  const { params } = useAnalysisContext();
  const {
    datas,
    dataTemps,
    domains,
    dataTooltip,
    legendKeys,
    positionTooltip,
    viewPort,
    payload,
    loadingChart,
    setLoadingChart,
    setPayload,
    setLegendKeys,
    setDataTooltip,
    setDatas,
    setDataTemps,
    setPositionTooltip,
    setViewPort,
    fullScreenChart,
    actionKeys,
    setActionKeys,
    form,
    onFinish,
    onChangeYAxis,
    y1Axis,
    typeChartY1,
    y2Axis,
    typeChartY2,
    y1AxisConversionUnit,
    y2AxisConversionUnit,
    onChangeChartType,
    generateChart,
    handleRangeChange,
  } = useGraphBuilderForm();

  const position = useMemo(() => {
    if (!positionTooltip) return;
    const [x, y] = positionTooltip;

    const chart = document.querySelectorAll(
      `.chart-${idChart} .canvasjs-chart-canvas`
    )[1] as HTMLElement;
    const wChart = chart?.offsetWidth;

    if (!wChart || !viewPort || !payload) return;

    const vMax = viewPort.max ?? dayjs(payload.endDate).diff(dayjs(payload.startDate), 'day') + 1;
    const vMin = viewPort.min ?? 0;

    const xPercent = ((x - vMin) / (vMax - vMin)) * 100; // Tính phần trăm vị trí x

    const halfWidthTooltip = 135;

    return {
      top: `${((y / 500) * 100).toFixed(3)}%`,
      left: `${xPercent - (halfWidthTooltip * 100) / wChart}%`,
    };
  }, [positionTooltip, viewPort, idChart, payload]);

  return (
    <BuilderChartContext.Provider
      value={{
        datas,
        dataTemps,
        y1Axis: domains.y1,
        y2Axis: domains.y2,
        dataTooltip,
        idChart,
        legendKeys,
        positionTooltip,
        viewPort,
        payload,
        loadingChart,
        setLoadingChart,
        setPayload,
        setLegendKeys,
        setDataTooltip,
        setDatas,
        setDataTemps,
        setPositionTooltip,
        setViewPort,
        fullScreenChart,
        actionKeys,
        setActionKeys,
        generateChart,
      }}
    >
      <S.Wrapper>
        <BaseForm
          layout="horizontal"
          labelCol={{ span: 8 }}
          labelAlign="left"
          form={form}
          onFinish={onFinish}
          initialValues={{
            purpose: 'trend',
            x: 'timestamp',
            cumulative_y1: false,
            cumulative_y2: false,
            conditions1: [],
            conditions2: [],
            type1: 'bar',
            period: [dayjs(params.startDate), dayjs(params.endDate)],
          }}
        >
          <BaseRow gutter={12} style={{ marginLeft: '40px' }}>
            <BaseCol xs={23} sm={24} md={12} lg={9}>
              <BaseForm.Item label="소스" name="core_dataset" required>
                <BaseSelect placeholder="코어 데이터셋" disabled />
              </BaseForm.Item>
            </BaseCol>

            <BaseCol
              xs={24}
              sm={{
                span: 24,
                offset: 0,
              }}
              md={12}
              lg={{
                span: 9,
                offset: 6,
              }}
            >
              <BaseForm.Item
                label="목적"
                name="purpose"
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              >
                <BaseSelect placeholder="Select Purpose" options={purposeOptions} />
              </BaseForm.Item>
            </BaseCol>
          </BaseRow>

          <BaseRow gutter={12} style={{ marginLeft: '40px' }}>
            <BaseCol xs={23} sm={24} md={12} lg={9}>
              <BaseForm.Item
                label="X축"
                name="x"
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              >
                <BaseSelect placeholder="Select X Axis" options={xOptions} />
              </BaseForm.Item>
            </BaseCol>

            <BaseCol
              xs={24}
              sm={{
                span: 24,
                offset: 0,
              }}
              md={12}
              lg={{
                span: 9,
                offset: 6,
              }}
            >
              <BaseForm.Item
                label="기간"
                name="period"
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              >
                <BaseDatePicker.RangePicker
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
                          .utc(true)
                      )
                    )
                      return true;
                    if (current.isBefore(today.subtract(90, 'day'), 'day')) return true;
                    return false;
                  }}
                  onChange={handleRangeChange}
                />
              </BaseForm.Item>
            </BaseCol>
          </BaseRow>

          <BaseRow gutter={12} style={{ marginLeft: '40px' }}>
            <BaseCol xs={23} sm={24} md={12} lg={9}>
              <BaseForm.Item
                label="Y축1"
                name="yAxises1"
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              >
                <BaseSelect
                  placeholder="Select Y1 axis"
                  options={yOptions}
                  onChange={(value) =>
                    onChangeYAxis(value as string, 'cumulative_y1', 'conditions1')
                  }
                />
              </BaseForm.Item>
            </BaseCol>

            <BaseCol
              xs={24}
              sm={24}
              md={11}
              lg={{
                span: 5,
                offset: 1,
              }}
            >
              <BaseForm.Item name="cumulative_y1" valuePropName="checked">
                <BaseCheckbox disabled={y1Axis === DOMAINS.STANDARD_CORE || typeChartY1 === 'bar'}>
                  누적
                </BaseCheckbox>
              </BaseForm.Item>
            </BaseCol>

            <BaseCol xs={24} sm={24} md={12} lg={9}>
              <BaseForm.Item
                label="플로트"
                name="type1"
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              >
                <BaseSelect
                  placeholder="Chart Type"
                  options={chartTypeOptions(y1Axis === DOMAINS.STANDARD_CORE)}
                  onChange={(value) => onChangeChartType(value as string, 'cumulative_y1')}
                />
              </BaseForm.Item>
            </BaseCol>
          </BaseRow>

          <BaseRow gutter={12} style={{ margin: '0 0 40px 40px' }}>
            <Form.List name="conditions1">
              {(fields, { add, remove }) => {
                return (
                  <S.List>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <S.Space gutter={12} key={key}>
                        <BaseCol xs={23} sm={8} md={4} lg={3}>
                          {index ? (
                            <BaseForm.Item
                              {...restField}
                              name={[name, 'logicalOperator']}
                              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                            >
                              <BaseSelect options={opratorOptions} />
                            </BaseForm.Item>
                          ) : (
                            <S.LabelCustom>노드</S.LabelCustom>
                          )}
                        </BaseCol>

                        <BaseCol
                          xs={23}
                          sm={16}
                          md={{
                            span: 12,
                          }}
                          lg={6}
                        >
                          <BaseForm.Item
                            {...restField}
                            name={[name, 'domain']}
                            rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                          >
                            <BaseSelect
                              placeholder="Select Domain"
                              options={getDomain(y1Axis)}
                              allowClear
                            />
                          </BaseForm.Item>
                        </BaseCol>

                        <BaseCol
                          xs={23}
                          sm={{
                            span: 16,
                            offset: 8,
                          }}
                          md={{
                            span: 12,
                            offset: 4,
                          }}
                          lg={{
                            span: 5,
                            offset: 1,
                          }}
                        >
                          <BaseForm.Item
                            {...restField}
                            name={[name, 'condition']}
                            rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                          >
                            <BaseSelect
                              placeholder="연산자 선택"
                              options={conditionOptions}
                              allowClear
                            />
                          </BaseForm.Item>
                        </BaseCol>

                        <BaseCol
                          xs={23}
                          sm={{
                            span: 16,
                            offset: 8,
                          }}
                          md={{
                            span: 12,
                            offset: 4,
                          }}
                          lg={{
                            span: 6,
                            offset: 3,
                          }}
                        >
                          <BaseForm.Item
                            {...restField}
                            name={[name, 'value']}
                            rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                          >
                            <BaseInput type="number" placeholder="값 입력" />
                          </BaseForm.Item>
                        </BaseCol>
                        <S.DeleteBtn onClick={() => remove(name)}>
                          <IconTrash />
                        </S.DeleteBtn>
                      </S.Space>
                    ))}

                    <S.Add
                      type={'text'}
                      onClick={() => (fields.length > 0 ? add({ logicalOperator: 'AND' }) : add())}
                    >
                      <IconPlus />
                      {'조건 추가'}
                    </S.Add>
                  </S.List>
                );
              }}
            </Form.List>
          </BaseRow>

          <BaseRow gutter={12} style={{ marginLeft: '40px' }}>
            <BaseCol xs={23} sm={24} md={12} lg={9}>
              <BaseForm.Item
                label="Y축2"
                name="yAxises2"
                rules={[{ required: !!typeChartY2, message: '이 필드는 필수입니다.' }]}
              >
                <BaseSelect
                  placeholder="Select Y2 axis"
                  options={yOptions}
                  onChange={(value) =>
                    onChangeYAxis(value as string, 'cumulative_y2', 'conditions2')
                  }
                  allowClear
                />
              </BaseForm.Item>
            </BaseCol>

            <BaseCol
              xs={24}
              sm={24}
              md={11}
              lg={{
                span: 5,
                offset: 1,
              }}
            >
              <BaseForm.Item name="cumulative_y2" valuePropName="checked">
                <BaseCheckbox disabled={y2Axis === DOMAINS.STANDARD_CORE || typeChartY2 === 'bar'}>
                  누적
                </BaseCheckbox>
              </BaseForm.Item>
            </BaseCol>

            <BaseCol xs={24} sm={24} md={12} lg={9}>
              <BaseForm.Item
                label="플로트"
                name="type2"
                rules={[{ required: !!y2Axis, message: '이 필드는 필수입니다.' }]}
              >
                <BaseSelect
                  placeholder={'Chart Type'}
                  options={chartTypeOptions(y2Axis === DOMAINS.STANDARD_CORE)}
                  allowClear
                  onChange={(value) => onChangeChartType(value as string, 'cumulative_y2')}
                />
              </BaseForm.Item>
            </BaseCol>
          </BaseRow>

          <BaseRow gutter={12} style={{ margin: '0 0 40px 40px' }}>
            <Form.List name="conditions2">
              {(fields, { add, remove }) => (
                <S.List>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <S.Space gutter={12} key={key}>
                      <BaseCol xs={23} sm={8} md={4} lg={3}>
                        {index ? (
                          <BaseForm.Item {...restField} name={[name, 'logicalOperator']}>
                            <BaseSelect options={opratorOptions} defaultValue="AND" />
                          </BaseForm.Item>
                        ) : (
                          <S.LabelCustom>노드</S.LabelCustom>
                        )}
                      </BaseCol>

                      <BaseCol
                        xs={23}
                        sm={16}
                        md={{
                          span: 12,
                        }}
                        lg={6}
                      >
                        <BaseForm.Item
                          {...restField}
                          name={[name, 'domain']}
                          rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                        >
                          <BaseSelect
                            placeholder="Select Domain"
                            options={getDomain(y2Axis)}
                            allowClear
                          />
                        </BaseForm.Item>
                      </BaseCol>

                      <BaseCol
                        xs={23}
                        sm={{
                          span: 16,
                          offset: 8,
                        }}
                        md={{
                          span: 12,
                          offset: 4,
                        }}
                        lg={{
                          span: 5,
                          offset: 1,
                        }}
                      >
                        <BaseForm.Item
                          {...restField}
                          name={[name, 'condition']}
                          rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                        >
                          <BaseSelect
                            placeholder="연산자 선택"
                            options={conditionOptions}
                            allowClear
                          />
                        </BaseForm.Item>
                      </BaseCol>

                      <BaseCol
                        xs={23}
                        sm={{
                          span: 16,
                          offset: 8,
                        }}
                        md={{
                          span: 12,
                          offset: 4,
                        }}
                        lg={{
                          span: 6,
                          offset: 3,
                        }}
                      >
                        <BaseForm.Item
                          {...restField}
                          name={[name, 'value']}
                          rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                        >
                          <BaseInput type="number" placeholder="값 입력" />
                        </BaseForm.Item>
                      </BaseCol>
                      <S.DeleteBtn onClick={() => remove(name)}>
                        <IconTrash />
                      </S.DeleteBtn>
                    </S.Space>
                  ))}

                  <S.Add
                    type={'text'}
                    onClick={() => (fields.length > 0 ? add({ logicalOperator: 'AND' }) : add())}
                  >
                    <IconPlus />
                    {'조건 추가'}
                  </S.Add>
                </S.List>
              )}
            </Form.List>
          </BaseRow>

          <S.SubmitWrapper>
            <S.BtnSubmit type={'primary'} htmlType="submit">
              RUN <IconRun />
            </S.BtnSubmit>
          </S.SubmitWrapper>
        </BaseForm>

        {datas.length > 0 && (
          <FullScreen handle={fullScreenChart}>
            <S.ChartWrapper>
              {loadingChart && (
                <S.Loading>
                  <LoadingOutlined style={{ fontSize: '60px' }} />
                </S.Loading>
              )}
              <ActionsBuilder />

              <S.BuilderChartWrapper>
                <S.GlobalStyles />
                <S.Chart>
                  <Y1Y2Chart
                    y1AxisConversionUnit={y1AxisConversionUnit}
                    y2AxisConversionUnit={y2AxisConversionUnit}
                  />
                  {dataTooltip && position && (
                    <S.Tooltip
                      open={!!dataTooltip}
                      placement="right"
                      arrow={false}
                      color="#fff"
                      overlayClassName="tooltip-chart-builder"
                      title={<TooltipChartBuilder />}
                      top={position.top}
                      left={position.left}
                      getPopupContainer={(triggerNode) => triggerNode}
                    />
                  )}
                </S.Chart>
                <S.Legends>
                  <BuilderLegends />
                </S.Legends>
              </S.BuilderChartWrapper>
            </S.ChartWrapper>
          </FullScreen>
        )}
      </S.Wrapper>
    </BuilderChartContext.Provider>
  );
};

export default GraphBuildForm;
