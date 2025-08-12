/* eslint-disable no-misleading-character-class */
import IconDropdown from '@/assets/images/svg/icon-dropdown.svg';
import EditIcon from '@/assets/images/svg/icon-edit.svg';
import PlusIcon from '@/assets/images/svg/icon-plus.svg';
import DeleteIcon from '@/assets/images/svg/icon-trash-2.svg';
import ModalConfirm from '@/components/common/modal-confirm';
import { BaseSelectProps } from '@/components/common/selects/base-select';
import {
  useCreateComboBox,
  useDeleteComboBox,
  useGetComboBox,
  useUpdateComboBox,
} from '@/hooks/features/useComboBox';
import { useFeedback } from '@/hooks/useFeedback';
import { ISearchParams, SelectComboBoxItem } from '@/interfaces';
import { validateEmoji } from '@/utils';
import { Dropdown, MenuProps, Tooltip } from 'antd';
import type { FormInstance, InputRef } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

import * as S from './index.styles';

interface SelectOption {
  id: any;
  label: React.ReactNode;
  value: string | number | null;
}

interface SelectComboBoxProps extends BaseSelectProps {
  form: FormInstance<any>;
  fieldName: string;
  options?: SelectOption[];
  handleAddOption?: () => void;
  handleUpdateOption?: () => void;
  placeholder?: string;
  isNumber?: boolean;
  headers?: ISearchParams | {};
}

export const SelectCombobox = (props: SelectComboBoxProps) => {
  const {
    options,
    form,
    fieldName,
    placeholder = 'Select',
    isNumber = false,
    headers = {},
    ...rest
  } = props;
  const [optionState, setOptionState] = useState<SelectOption[]>(
    options?.map((option) => ({ ...option, key: option.id, value: option.id })) || []
  );

  const [open] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [newOption, setNewOption] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [currentId, setCurrentId] = useState<number>();
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [isError, setIsError] = useState<boolean>(false);
  const [isErrorEdit, setIsErrorEdit] = useState<boolean>(false);

  const inputRef = useRef<InputRef>(null);
  const selectedInputRef = useRef<InputRef | null>(null);
  const { notification } = useFeedback();

  const { refetch, isLoading } = useGetComboBox(fieldName, headers);
  const createComboBox = useCreateComboBox(headers);
  const updateComboBox = useUpdateComboBox(headers);
  const deleteComboBox = useDeleteComboBox(headers);

  const validateIntNumber = (value: string) => {
    const numberRegex = /\d/g;
    return value.match(numberRegex)?.join('') || '';
  };

  const validateInput = (value: string, type?: string) => {
    const isEmoji = validateEmoji(value);
    const isOnlyWhitespace = value.trim().length === 0;
    const isOverLength = value.length > 100;

    if (isEmoji || isOnlyWhitespace || isOverLength) {
      type == 'edit' ? setIsErrorEdit(true) : setIsError(true);
    } else {
      type == 'edit' ? setIsErrorEdit(false) : setIsError(false);
    }
  };

  const onNewOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    let targetValue = event.target.value;

    if (isNumber) {
      targetValue = validateIntNumber(targetValue);
    }

    if (targetValue.length > 100) {
      targetValue = targetValue.slice(0, 100);
    }

    validateInput(targetValue);
    setNewOption(targetValue);
  };

  useEffect(() => {
    (async () => {
      const data = await refetch();
      const dataComboBox = data?.data?.data ?? [];

      const options = dataComboBox
        ?.filter((item: SelectComboBoxItem) => item?.id)
        .map((item: SelectComboBoxItem) => {
          return {
            id: item?.id,
            label: item?.data,
            value: item?.id,
            key: item?.id,
          };
        });
      setOptionState(options);
    })();
  }, []);

  const addItem = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.stopPropagation();
    const addValue = newOption.trim();
    if (!createComboBox || !addValue) return;
    const findValue = optionState.find((item) => item.value === addValue);
    if (findValue) return;
    const payload = {
      field: fieldName,
      data: addValue,
    };
    createComboBox.mutate(payload, {
      onSuccess(response) {
        const newOptionObject = {
          value: response?.data?.id,
          label: response?.data?.data,
          id: response?.data?.id,
          key: response?.data?.id,
        };
        setOptionState((prev) => [newOptionObject, ...prev]);
        setNewOption('');
        setIsEditing(false);
        setIsError(false);
        setIsErrorEdit(false);
        form.setFieldValue(fieldName, newOptionObject.value);
      },
      onError() {
        setIsError(true);
      },
    });
  };

  const handleUpdateOption = (id: number, value: string) => {
    const data = value.trim();
    if (!updateComboBox || !data) return;

    const payload = {
      data,
      id,
    };

    updateComboBox.mutate(payload, {
      onSuccess() {
        setOptionState((prev) =>
          prev.map((option) => {
            if (option.id === id) {
              return { ...option, value: id, label: data };
            }
            return option;
          })
        );
        form.setFieldValue(fieldName, id);
        setIsEditing(false);
        setIsError(false);
        setIsErrorEdit(false);
        selectedInputRef.current?.blur();
      },
      onError() {
        setIsErrorEdit(true);
      },
    });
  };

  const onConfirmOption = (e: Event, key: number) => {
    e.stopPropagation();
    const updateValue = selectedInputRef?.current?.input?.value.trim();
    if (!updateValue) return;
    const findValue = optionState.find((item) => item.value === updateValue);
    if (findValue) return;
    handleUpdateOption(key, updateValue);
  };

  const onShowAction = (e: Event, key: number) => {
    setSelectedOption(key);
    setIsEditing(false);
  };

  const handleDeleteOption = () => {
    if (!deleteComboBox) return;
    if (currentId) {
      setIsOpenDelete(false);
      deleteComboBox.mutate(
        { id: currentId },
        {
          onSuccess() {
            setOptionState((prev) => prev?.filter((option) => option.id !== selectedOption));
            form.setFieldValue(fieldName, '');
            notification.success({ message: '이 옵션이 성공적으로 삭제되었습니다!' });
          },
        }
      );
    }
  };

  const handleOpenDelete = (id: number) => {
    setIsOpenDelete(true);
    setCurrentId(id);
  };

  const items = (id: number): MenuProps['items'] => [
    {
      label: (
        <S.ActionContainer>
          <EditIcon /> 편집
        </S.ActionContainer>
      ),
      key: 'edit',
      onClick: (e) => {
        // edit action
        e.domEvent.stopPropagation();
        setIsEditing(true);
      },
    },
    {
      label: (
        <S.ActionContainer>
          <DeleteIcon /> 삭제
        </S.ActionContainer>
      ),
      key: 'delete',
      onClick: (e) => {
        e.domEvent.stopPropagation();
        handleOpenDelete(id);
      },
    },
  ];

  const handleOnSelect = () => {
    form.setFields([{ name: fieldName, errors: [] }]);
  };

  const handleOnChange = (value: any) => {
    form.setFieldValue(fieldName, value);
  };

  useEffect(() => {
    setNewOption('');
    setIsEditing(false);
    setIsError(false);
    setIsErrorEdit(false);
  }, [open]);

  return (
    <>
      <S.DropdownMenu>
        <S.CustomerSelect
          {...rest}
          suffixIcon={<IconDropdown />}
          onSelect={handleOnSelect}
          getPopupContainer={() => document.body}
          onDropdownVisibleChange={(open) => {
            if (open === false) {
              setIsEditing(false);
              setIsError(false);
              setIsErrorEdit(false);
              setNewOption('');
            }
          }}
          onChange={handleOnChange}
          loading={isLoading}
          value={form.getFieldValue(fieldName) || null}
          placeholder={placeholder}
          dropdownRender={(menu) => (
            <S.OptionsWrapper
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              {menu}
              <S.AddNewWrapper onClick={(e) => e.stopPropagation()}>
                <S.CustomInput
                  placeholder={'항목을 입력하세요'}
                  onChange={onNewOptionChange}
                  value={newOption}
                  ref={inputRef}
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={() => inputRef.current?.focus()}
                  hasError={isError}
                />

                <S.AddButton
                  type="button"
                  onClick={addItem}
                  disabled={!newOption.trim() || !!(isError && !isEditing)}
                >
                  <PlusIcon />
                  추가
                </S.AddButton>
              </S.AddNewWrapper>
            </S.OptionsWrapper>
          )}
          optionRender={({ value, label, key }) => {
            const isEditOption = Number(key) === selectedOption && isEditing;

            if (isEditOption) {
              return (
                <S.InputWrapper onClick={(e) => e.stopPropagation()}>
                  <S.NewField
                    style={{ padding: 0, marginTop: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (Number(key) !== selectedOption) setIsEditing(false);
                    }}
                  >
                    <S.CustomInput
                      defaultValue={typeof label === 'string' ? label : ''}
                      ref={selectedInputRef}
                      onChange={(e) => {
                        e.stopPropagation();
                        const inputValue = e.target.value.trim();
                        setCurrentInputValue(inputValue);
                        validateInput(inputValue, 'edit');
                      }}
                      max={10}
                      onClick={() =>
                        setTimeout((selectedInputRef?.current as any).input.focus(), 0)
                      }
                      style={{ padding: '0 0.5rem' }}
                      hasError={isErrorEdit}
                    />

                    <S.InputConfirmIcon
                      hasError={isError}
                      onClick={(e: Event) => {
                        e.stopPropagation();

                        if (currentInputValue || !isError) {
                          onConfirmOption(e, Number(key));
                        }
                      }}
                      style={{
                        // cursor: !currentInputValue || isError ? 'not-allowed' : 'pointer',
                        opacity: !currentInputValue || isError ? 0.5 : 1,
                      }}
                    />
                  </S.NewField>
                </S.InputWrapper>
              );
            }

            return (
              <S.SelectOption key={value}>
                <Tooltip title={label}>
                  <S.LabelOption>{label}</S.LabelOption>
                </Tooltip>

                <Dropdown menu={{ items: items(Number(key)) }} trigger={['click']}>
                  <S.ActionIcon
                    onClick={(e: Event) => {
                      e.stopPropagation();
                      onShowAction(e, Number(key));
                    }}
                  />
                </Dropdown>
              </S.SelectOption>
            );
          }}
          options={optionState}
        />
      </S.DropdownMenu>
      <ModalConfirm
        text="이 옵션을 삭제하시겠습니까?"
        open={isOpenDelete}
        onCancel={() => setIsOpenDelete(false)}
        onConfirm={handleDeleteOption}
        confirmText="확인"
        cancelText="취소"
      />
    </>
  );
};
