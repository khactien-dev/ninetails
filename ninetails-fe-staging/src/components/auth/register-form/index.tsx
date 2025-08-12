import IK1 from '@/assets/images/common/icon-k1.png';
import IK1s from '@/assets/images/common/icon-k1s.png';
import { BaseImage } from '@/components/common/base-image';
import { Button, Card, Col, Row, Title, Wrapper } from '@/components/request/index.styles';
import { useRegistTenantMutate } from '@/hooks/features/useTenant';
import { useFeedback } from '@/hooks/useFeedback';
import { useResponsive } from '@/hooks/useResponsive';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import * as S from './index.styles';
import { PolicyAndTerms } from './policy-and-terms';
import { UserInfoForm } from './user-info-form';

enum REGISTER_STEP {
  STEP_1 = 'ENTER_USER_INFO',
  STEP_2 = 'READ_POLICY_AND_TERMS',
}

export const RegisterForm: React.FC = () => {
  const [registerStep, setRegisterStep] = useState<REGISTER_STEP>(REGISTER_STEP.STEP_1);
  const { isTablet } = useResponsive();
  const [formValue, setFormValue] = useState<any>({
    organization: '',
    department: '',
    operator: '',
    position: '',
    email: '',
    phone: '',
    conFirmMailCode: null,
    fileUpload1: {
      fileName: '',
      url: '',
    },
    fileUpload2: {
      fileName: '',
      url: '',
    },
  });
  const router = useRouter();
  const { notification } = useFeedback();

  const registTenant = useRegistTenantMutate();

  const onToPolicyAndTerm = (values: any) => {
    setRegisterStep(REGISTER_STEP.STEP_2);
    setFormValue(values);
  };

  const onComplete = () => {
    const payload = {
      organization: formValue.organization,
      department: formValue.department,
      operator: formValue.operator,
      position: formValue.position,
      email: formValue.email,
      phone: formValue.phone,
      otp: formValue.conFirmMailCode,
      proof1: formValue.fileUpload1.url,
      proof2: formValue.fileUpload2.url,
      filename_proof1: formValue.fileUpload1.fileName,
      filename_proof2: formValue.fileUpload2.fileName,
    };
    registTenant.mutate(payload, {
      onSuccess() {
        router.push('/');
        notification.success({
          message: '등록이 완료되었습니다! 안내 이메일을 확인해 주세요.',
        });
      },
    });
  };

  const renderStep = () => {
    switch (registerStep) {
      case REGISTER_STEP.STEP_1:
        return (
          <>
            <UserInfoForm onSubmit={onToPolicyAndTerm} initialValues={formValue}>
              <S.WrapActionButton>
                <Button type="primary" htmlType="submit">
                  {'다음 단계'}
                </Button>
              </S.WrapActionButton>
            </UserInfoForm>
            <S.More>
              <ul>
                <li>운영자 이메일은 로그인 아이디로 사용됩니다.</li>
                <li>등록하신 이메일로 임시 로그인 비밀번호가 발급됩니다.</li>
                <li>기관 증빙 자료를 PDF 파일로 첨부해 주세요.</li>
              </ul>
            </S.More>
          </>
        );
      case REGISTER_STEP.STEP_2:
        return (
          <>
            <PolicyAndTerms
              isPending={registTenant.isPending}
              onComplete={onComplete}
              onBack={() => setRegisterStep(REGISTER_STEP.STEP_1)}
            />
            <S.More>
              <ul>
                <li>신청을 완료하시면, 확인 이메일이 발송됩니다.</li>
                <li>관리자 검토/승인 후, 로그인용 이메일이 발송됩니다.</li>
              </ul>
            </S.More>
          </>
        );
    }
  };

  return (
    <Wrapper>
      <Card padding={0}>
        <Row gutter={60}>
          <Col span={24} md={12}>
            <Title>
              <S.WrapTitleHeader>
                {!isTablet && <BaseImage src={IK1s.src} preview={false} width={30} height={30} />}
                가입 신청하기
              </S.WrapTitleHeader>
              <ul>
                <li>SuperBucket의 혁신적인 도구들을 경험해 보세요.</li>
                <li>엣지 장비 연동을 위해, 포털 이용을 신청하는 단계입니다.</li>
                <li>가입 신청 전, 먼제 데모 서비스를 이용해 보세요.</li>
              </ul>
              {isTablet && <BaseImage src={IK1.src} preview={false} />}
            </Title>
          </Col>
          <Col span={24} md={12}>
            {renderStep()}
          </Col>
        </Row>
      </Card>
    </Wrapper>
  );
};
