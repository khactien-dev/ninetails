import { UserInfoForm } from '@/components/auth/register-form/user-info-form';
import StaticTab from '@/components/home/static-tab';
import { IRegisterResponse } from '@/interfaces';
import Link from 'next/link';
import React from 'react';

import * as S from './index.styles';
import { useConfirmForm } from './index.utils';

interface IProps {
  tenantData?: IRegisterResponse;
}

const Confirm: React.FC<IProps> = ({ tenantData }) => {
  const {
    activeKey,
    disabled,
    setDisabled,
    onResetForm,
    toggleOpenPolicy,
    onSubmit,
    onToggleIsFormChanged,
    isFormChanged,
    loadingComplete,
    form,
    initValues,
  } = useConfirmForm(tenantData);

  const renderActionButton = () => {
    if (disabled) {
      return (
        <>
          <Link href={'/'}>
            <S.ActionButton actionType="complete" type="primary">
              {'확인'}
            </S.ActionButton>
          </Link>
          <S.ActionButton actionType="back" type="default" onClick={() => setDisabled(false)}>
            {'취소'}
          </S.ActionButton>
        </>
      );
    }

    return (
      <>
        <S.ActionButton
          actionType="complete"
          type="primary"
          htmlType="submit"
          disabled={!isFormChanged}
          loading={loadingComplete}
        >
          {'수정완료'}
        </S.ActionButton>
        <S.ActionButton
          actionType="back"
          type="default"
          onClick={() => {
            onResetForm();
            onToggleIsFormChanged(false);
            setDisabled(true);
          }}
        >
          {'취소'}
        </S.ActionButton>
      </>
    );
  };

  return (
    <S.Wrapper>
      <S.Card id="basic-table" padding="0">
        <S.Title>{'가입 신청 정보 확인'}</S.Title>
        <UserInfoForm
          onSubmit={onSubmit}
          disabled={disabled}
          onToggleIsFormChanged={onToggleIsFormChanged}
          formInstance={form}
          initialValues={initValues}
          disabledEmail={true}
        >
          <>
            <S.Col span={24}>
              <S.Flex>
                <S.Note onClick={() => toggleOpenPolicy('2')}>서비스 이용약관</S.Note>
                <S.CustomFormItem name="terms" valuePropName="checked">
                  <S.Checkbox disabled={true}>동의</S.Checkbox>
                </S.CustomFormItem>
              </S.Flex>
              <S.Flex>
                <S.Note onClick={() => toggleOpenPolicy('3')}>개인정보 처리방침</S.Note>
                <S.CustomFormItem name="policy" valuePropName="checked">
                  <S.Checkbox disabled={true}>동의</S.Checkbox>
                </S.CustomFormItem>
              </S.Flex>
            </S.Col>

            <S.GroupBtn>{renderActionButton()}</S.GroupBtn>
          </>
        </UserInfoForm>
      </S.Card>
      {activeKey && <StaticTab toggleOpenPolicy={toggleOpenPolicy} activeKey={activeKey} />}
    </S.Wrapper>
  );
};

export default Confirm;
