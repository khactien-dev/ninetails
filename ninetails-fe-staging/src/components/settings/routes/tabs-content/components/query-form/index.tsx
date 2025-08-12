import IconTrash from '@/assets/images/chart/trash.svg';
import IconPlay from '@/assets/images/settings/icon-play.svg';
import IconPlus from '@/assets/images/svg/icon-plus-2.svg';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseInput } from '@/components/common/inputs/base-input';
import { BaseSelect } from '@/components/common/selects/base-select';
import { ColumnOption } from '@/interfaces';
import { Form, FormInstance } from 'antd';
import React from 'react';

import * as S from '../../index.styles';

interface QueryFormProps {
  handleQuery: (values: any) => void;
  formQuery: FormInstance;
  initialQueryValues: Record<string, any>;
  columnOptions: ColumnOption[];
  operator: { value: string; label: string }[];
  tableName: string;
  loading: boolean;
}

export const QueryForm: React.FC<QueryFormProps> = ({
  handleQuery,
  formQuery,
  initialQueryValues,
  columnOptions,
  operator,
  tableName,
  loading,
}) => {
  return (
    <BaseForm onFinish={(values) => handleQuery(values.condition)} form={formQuery}>
      <S.WrapCondition>
        <S.Content>
          <BaseRow gutter={24}>
            <S.List>
              <Form.List name="condition" initialValue={[{ ...initialQueryValues }]}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <S.Space gutter={24} key={key}>
                        <BaseCol xs={24} sm={12} md={8} lg={6}>
                          {index === 0 ? (
                            <BaseForm.Item>
                              <BaseInput disabled value={tableName} />
                            </BaseForm.Item>
                          ) : (
                            <BaseForm.Item {...restField} name={[name, 'logical']}>
                              <BaseSelect
                                options={[
                                  {
                                    label: 'AND',
                                    value: 'AND',
                                  },
                                  {
                                    label: 'OR',
                                    value: 'OR',
                                  },
                                ]}
                              />
                            </BaseForm.Item>
                          )}
                        </BaseCol>
                        <BaseCol xs={24} md={12} lg={8} xl={6}>
                          <BaseForm.Item
                            {...restField}
                            name={[name, 'column']}
                            rules={[
                              {
                                required: true,
                                message: '이 필드는 필수입니다.',
                              },
                            ]}
                          >
                            <S.Select placeholder={'컬럼 선택'} options={columnOptions} />
                          </BaseForm.Item>
                        </BaseCol>
                        <BaseCol xs={24} md={12} lg={8} xl={6}>
                          <BaseForm.Item
                            {...restField}
                            name={[name, 'operator']}
                            rules={[
                              {
                                required: true,
                                message: '이 필드는 필수입니다.',
                              },
                            ]}
                          >
                            <S.Select placeholder={'연산자 선택'} options={operator} />
                          </BaseForm.Item>
                        </BaseCol>
                        <BaseCol xs={24} md={12} lg={8} xl={6}>
                          <BaseForm.Item
                            {...restField}
                            name={[name, 'value']}
                            rules={[
                              {
                                required: true,
                                whitespace: true,
                                message: '이 필드는 필수입니다.',
                              },
                            ]}
                          >
                            <BaseInput placeholder="값 입력" />
                          </BaseForm.Item>
                        </BaseCol>

                        <S.DeleteBtn onClick={() => remove(name)}>
                          <IconTrash />
                        </S.DeleteBtn>
                      </S.Space>
                    ))}

                    {fields.length > 0 && <S.Divider />}

                    <S.WrapRunButton>
                      <S.Add
                        type={'text'}
                        onClick={() => add({ ...initialQueryValues, logical: 'AND' })}
                      >
                        <IconPlus />
                        {'조건 추가'}
                      </S.Add>

                      {fields.length > 0 && (
                        <S.BtnSubmit htmlType="submit" type={'primary'} disabled={loading}>
                          RUN
                          <IconPlay />
                        </S.BtnSubmit>
                      )}
                    </S.WrapRunButton>
                  </>
                )}
              </Form.List>
            </S.List>
          </BaseRow>
        </S.Content>
      </S.WrapCondition>
    </BaseForm>
  );
};
