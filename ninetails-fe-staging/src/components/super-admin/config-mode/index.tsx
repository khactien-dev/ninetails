import QuestionareIcon from '@/assets/images/svg/icon-questionare.svg';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseInput } from '@/components/common/inputs/base-input';

import * as S from './index.styles';

const initialValues = {
  controlled: '3 회',
  end_of_operation: '10 회',
};
export const ConfigMode = () => {
  return (
    <S.ConfigForm>
      <S.BoxTitle>
        <>기관(법인) 정보</>
        <S.EditBtnWrap>
          <S.EditBtn />
          편집
        </S.EditBtnWrap>
      </S.BoxTitle>
      <BaseForm initialValues={initialValues} layout="vertical">
        <BaseRow gutter={16}>
          <BaseCol span={8}>
            <S.BtnRedirect>
              <QuestionareIcon />
            </S.BtnRedirect>
            <S.FormCustom label="미관제" name="controlled">
              <BaseInput disabled={true} />
            </S.FormCustom>
          </BaseCol>
        </BaseRow>

        <BaseRow gutter={16}>
          <BaseCol span={8}>
            <S.FormItemCustom>
              <S.BtnRedirect>
                <QuestionareIcon />
              </S.BtnRedirect>
              <S.FormCustom label="운행종료 (휴식)" name="end_of_operation">
                <BaseInput disabled={true} />
              </S.FormCustom>
            </S.FormItemCustom>
          </BaseCol>
        </BaseRow>
      </BaseForm>
    </S.ConfigForm>
  );
};
