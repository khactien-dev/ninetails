import PlusIcon from '@/assets/images/chart/plus-small.svg';
import TriangleIcon from '@/assets/images/chart/triangle.svg';
import { IModuleDataSetCondition } from '@/interfaces';
import React from 'react';

import { ICondition, IMouduleDatasetField } from '../index.utils';
import { ConditionForm } from './condition-form';
import * as S from './index.style';

interface IProps {
  fields: IMouduleDatasetField;
  onRun: (conditions: IModuleDataSetCondition[]) => void;
  getModuleDataSetPending: boolean;
  conditions: ICondition[];
  setConditions: React.Dispatch<React.SetStateAction<ICondition[]>>;
}

export enum CONDITION {
  CORE_DATASET = 'CORE_DATASET',
  NORMAL = 'NORMAL',
}

export const ModuleDataSetCondition: React.FC<IProps> = (props) => {
  const { fields, onRun, getModuleDataSetPending, conditions, setConditions } = props;
  const conditionFormRefs = React.useRef<{ onValidate: () => Promise<any> }[]>([]);

  const handleAddCondition = () => {
    setConditions((prev) => [
      ...prev,
      {
        type: conditions?.length ? CONDITION.NORMAL : CONDITION.CORE_DATASET,
        condition_value: conditions?.length ? 'AND' : 'Core dataset',
        key: Math.random().toString(36).slice(-36),
      },
    ]);
  };

  const handleRun = async () => {
    try {
      const newConditions: IModuleDataSetCondition[] = [];
      let isValidated = true;
      await Promise.all(
        conditions?.map(async (_: ICondition, index: number) => {
          await conditionFormRefs.current[index]
            ?.onValidate()
            .then((v) => {
              newConditions.push({
                logicalOperator: v.condition_value,
                L2Extension: v.l2_domain,
                L3Extension: {
                  ...(v.l3_domain !== 'none'
                    ? { L3Extension: v.l3_domain }
                    : { L3Extension: v.l2_domain }),
                  column: v.columns,
                  condition: v.operator,
                  value: parseInt(v.value),
                },
              });
            })
            .catch(() => {
              isValidated = false;
            });
        })
      );
      if (isValidated) {
        onRun(newConditions);
      }
    } catch (err) {
      return;
    }
  };

  const handleRemoveCondition = (key: string) => {
    const removedItem = conditions.find((item: ICondition) => item.key === key);
    if (removedItem) {
      const removedConditions = conditions.filter((item: ICondition) => item.key !== key);
      if (removedItem.type === CONDITION.CORE_DATASET && removedConditions?.length) {
        removedConditions[0].type = CONDITION.CORE_DATASET;
        removedConditions[0].condition_value = 'Core Dataset';
      }
      return setConditions(removedConditions);
    }
  };

  const handleFormChange = (form: any, key: string) => {
    setConditions((prev: ICondition[]) => {
      return prev.map((item: ICondition) => {
        if (item.key === key) {
          return {
            ...item,
            ...form,
          };
        }
        return item;
      });
    });
  };

  return (
    <S.WrapCondition>
      <S.Content>
        {conditions.map((item: ICondition, index: number) => (
          <ConditionForm
            initialValues={item}
            fields={fields}
            key={item.key}
            ref={(element) => (conditionFormRefs.current[index] = element)}
            onRemove={() => handleRemoveCondition(item.key)}
            onFormChange={(formValues) => handleFormChange(formValues, item.key)}
          />
        ))}

        <S.WrapRunButton>
          <S.WrapAddButton onClick={handleAddCondition}>
            <S.AddButton>
              <PlusIcon />
            </S.AddButton>
            <S.Addingtext>조건 추가</S.Addingtext>
          </S.WrapAddButton>
          <S.WrapRunButtonContent>
            <S.Addingtext></S.Addingtext>
            {conditions.length > 0 && (
              <S.RunButton type="primary" onClick={handleRun} loading={getModuleDataSetPending}>
                RUN
                <S.WrapTriangle>
                  <TriangleIcon />
                </S.WrapTriangle>
              </S.RunButton>
            )}
          </S.WrapRunButtonContent>
        </S.WrapRunButton>
      </S.Content>
    </S.WrapCondition>
  );
};
