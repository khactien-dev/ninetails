import TrashIcon from '@/assets/images/chart/trash.svg';
import { useAnalysisContext } from '@/components/analysis/context';
import { CONDITION } from '@/components/analysis/module-data-set/condition';
import * as S from '@/components/analysis/module-data-set/condition/index.style';
import {
  ICondition,
  IMouduleDatasetField,
} from '@/components/analysis/module-data-set/index.utils';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseInput } from '@/components/common/inputs/base-input';
import { checkEmoji, checkNumber } from '@/utils';
import { Form } from 'antd';
import React, { useImperativeHandle, useMemo } from 'react';

interface IProps {
  initialValues: {
    type: string;
    condition_value: string;
  };
  fields: IMouduleDatasetField;
  onRemove: () => void;
  onFormChange: (e: ICondition) => void;
}

const l2Domains = [
  {
    label: 'Distance Ratio',
    value: 'distanceRatios',
    l3_domain_id: 1,
  },
  {
    label: 'Time Ratio',
    value: 'durationRatios',
    l3_domain_id: 1,
  },
  {
    label: 'Manual Collect Distance',
    value: 'manualCollectRatios',
    l3_domain_id: 1,
  },
  {
    label: 'Manual Collect Time',
    value: 'manualCollectTime',
    l3_domain_id: 1,
  },

  {
    label: 'Collect Distance',
    value: 'collectDistance',
    l3_domain_id: 2,
  },
  {
    label: 'Collect Time',
    value: 'collectDuration',
    l3_domain_id: 2,
  },
  {
    label: 'Collect Count',
    value: 'collectCount',
    l3_domain_id: 2,
  },

  {
    label: 'Other Distance',
    value: 'otherDistance',
    l3_domain_id: 3,
  },
  {
    label: 'Other Time',
    value: 'otherDuration',
    l3_domain_id: 3,
  },
];

const columnOptions = [
  {
    value: 'Maximum',
    label: 'Maximum',
  },
  {
    value: 'Average',
    label: 'Average',
  },
  {
    value: 'Minimum',
    label: 'Minimum',
  },
  {
    value: 'Raw value',
    label: 'Raw value',
  },
];

const operatorOptions = [
  {
    value: 'Equals',
    label: 'Equals',
  },
  {
    value: 'Greater than',
    label: 'Greater than',
  },
  {
    value: 'Greater than or equals',
    label: 'Greater than or equals',
  },
  {
    value: 'Less than',
    label: 'Less than',
  },
  {
    value: 'Less than or equals',
    label: 'Less than or equals',
  },
  {
    value: 'Not equals',
    label: 'Not equals',
  },
];

const driveModeOptions = [
  {
    value: 'notSelected',
    label: 'Drive Mode 0',
  },
  {
    value: 'goingToCollectionArea',
    label: 'Drive Mode 1',
  },
  {
    value: 'goingToTheLandfill',
    label: 'Drive Mode 2',
  },
  {
    value: 'returnToGarage',
    label: 'Drive Mode 3',
  },
  {
    value: 'goingToRestaurant',
    label: 'Drive Mode 4',
  },
  {
    value: 'idling',
    label: 'Drive Mode 6',
  },
  {
    value: 'notManaged',
    label: 'Drive Mode 7',
  },
  {
    value: 'outOfControl',
    label: 'Drive Mode 8',
  },
];

const NumericInput = ({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value?: string;
  onChange?: (e: any) => void;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const reg = /^-?\d*(\.\d{0,3})?$/;

    if (reg.test(value) || value === '') {
      e.target.value = value;
      onChange &&
        onChange({
          target: {
            value: value,
          },
        });
    } else {
      e.preventDefault();
    }
  };

  return (
    <BaseInput
      onChange={handleChange}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

// eslint-disable-next-line react/display-name
export const ConditionForm = React.forwardRef<any, IProps>((props, ref) => {
  const [form] = BaseForm.useForm();
  const { initialValues, fields, onRemove, onFormChange } = props;
  const watchl2Domain = Form.useWatch('l2_domain', form);
  const { coreDataSetSections } = useAnalysisContext();

  const l2Options = useMemo(() => {
    const activeL2Options = Object.keys(fields)
      .map((key) => {
        const foundL2Domain = l2Domains.find((l2) => l2.value === key);
        return {
          value: key,
          status: fields[key as keyof IMouduleDatasetField],
          label: foundL2Domain?.label,
          l3_domain_id: foundL2Domain?.l3_domain_id,
        };
      })
      .filter((item) => {
        return item.status;
      });

    return activeL2Options ?? [];
  }, [fields]);

  const getSectionOptions = (sections: string[]) => {
    return (
      sections?.map((item) => ({
        value: item,
        label: item,
      })) ?? []
    );
  };

  const l3Options = useMemo(() => {
    let options: { value: string; label: string }[] = [{ value: 'none', label: 'None' }];
    const foundL3DomainId = l2Domains.find((item) => item.value === watchl2Domain)?.l3_domain_id;
    form.setFieldValue('l3_domain', undefined);

    switch (foundL3DomainId) {
      case 1:
        break;
      case 2:
        // eslint-disable-next-line no-case-declarations
        let sectionOptions: { value: string; label: string }[] = [];
        if (watchl2Domain === 'collectDistance') {
          sectionOptions = getSectionOptions(coreDataSetSections.collectDistance);
        } else if (watchl2Domain === 'collectDuration') {
          sectionOptions = getSectionOptions(coreDataSetSections.collectionDuration);
        } else {
          sectionOptions = getSectionOptions(coreDataSetSections.collectAmount);
        }
        options = [...options, ...sectionOptions];
        break;
      case 3:
        options = [...options, ...driveModeOptions];
        break;
      default:
        break;
    }
    return options;
  }, [watchl2Domain]);

  useImperativeHandle(
    ref,
    function () {
      return {
        onValidate() {
          try {
            return form.validateFields();
          } catch (err) {
            return;
          }
        },
      };
    },
    []
  );

  const checkFloatNumber = () => ({
    validator(_: any, value: string) {
      if (value !== '' && value !== undefined && !isNaN(parseFloat(value))) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error('최대 소수점 3자리까지의 유효한 숫자를 입력해 주세요'));
      }
    },
  });

  return (
    <>
      <S.ConditionForm
        form={form}
        initialValues={{
          type: initialValues.type,
          condition_value: initialValues.condition_value,
        }}
        onFieldsChange={() => {
          onFormChange(form.getFieldsValue());
        }}
      >
        <BaseRow gutter={24}>
          {initialValues.type === CONDITION.CORE_DATASET ? (
            <BaseCol xs={24} md={12} lg={8} xl={6}>
              <BaseForm.Item>
                <BaseInput disabled value={'Core dataset'} />
              </BaseForm.Item>
            </BaseCol>
          ) : (
            <BaseCol xs={24} md={12} lg={8} xl={6}>
              <BaseForm.Item name="condition_value">
                <S.Select
                  options={[
                    {
                      value: 'AND',
                      label: 'AND',
                    },
                    {
                      value: 'OR',
                      label: 'OR',
                    },
                  ]}
                />
              </BaseForm.Item>
            </BaseCol>
          )}

          <BaseCol xs={24} md={12} lg={8} xl={6}>
            <BaseForm.Item
              name="l2_domain"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
              ]}
            >
              <S.Select placeholder="도메인 선택" options={l2Options} />
            </BaseForm.Item>
          </BaseCol>

          <BaseCol xs={24} md={12} lg={8} xl={6}>
            <BaseForm.Item
              name="l3_domain"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
              ]}
            >
              <S.Select options={l3Options} placeholder="하위 도메인 선택" />
            </BaseForm.Item>
          </BaseCol>

          <BaseCol xs={24} md={12} lg={8} xl={6}>
            <BaseForm.Item
              name="columns"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
              ]}
            >
              <S.Select options={columnOptions} placeholder="컬럼 선택" />
            </BaseForm.Item>
          </BaseCol>

          <BaseCol xs={24} md={12} lg={8} xl={6}>
            <BaseForm.Item
              name="operator"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
              ]}
            >
              <S.Select placeholder="연산자 선택" options={operatorOptions} />
            </BaseForm.Item>
          </BaseCol>

          <BaseCol xs={24} md={12} lg={8} xl={6}>
            <BaseForm.Item
              name="value"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
                checkNumber('최대 소수점 3자리까지의 유효한 숫자를 입력해 주세요'),
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                checkFloatNumber(),
              ]}
            >
              <NumericInput placeholder="값 입력" />
            </BaseForm.Item>
          </BaseCol>
        </BaseRow>
        <S.TrashButton onClick={() => onRemove()}>
          <TrashIcon />
        </S.TrashButton>
        <S.Divider />
      </S.ConditionForm>
    </>
  );
});
