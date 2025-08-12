import { useSubmitMail } from '@/hooks/features/useRequest';
import { useFeedback } from '@/hooks/useFeedback';
import { SubmitMailRequest } from '@/interfaces/request';
import { checkEmoji } from '@/utils';
import { Form } from 'antd';

import { BaseForm } from '../common/forms/base-form';
import s from './index.module.css';
import * as S from './index.styles';
import m from './modal.module.css';

const NewLetter = ({
  toggleOpenNewLetter,
}: {
  isOpenNewLetter?: boolean;
  toggleOpenNewLetter: () => void;
}) => {
  const submitRequest = useSubmitMail({
    email: '',
  });
  const { notification } = useFeedback();

  const handleSubmit = (values: SubmitMailRequest) => {
    if (values?.email?.trim()) {
      submitRequest.mutate(values, {
        onSuccess: () => {
          notification.success({
            message: '이메일이 등록되었습니다. \n 새로운 소식을 가지고 돌아오겠습니다!',
          });
          toggleOpenNewLetter();
        },
        onError: () => {
          toggleOpenNewLetter();
        },
      });
    }
  };

  const [form] = Form.useForm();

  return (
    <div className={`modalWrap newsLetter `}>
      <div className={`${m.modalNormal} ${m.modalSize2}`}>
        <button
          type="button"
          className={`${m.buttonCloseModal} ${s.footerButton}`}
          title="close modal"
          onClick={() => toggleOpenNewLetter()}
        ></button>

        <div className={`${m.modalTitleRow} ${m.center}`}>
          <div className={s.inside}>
            <div className={s.txt1}>
              <span className={s.sp0}></span>소식받기
            </div>
          </div>
        </div>
        <div className={m.modalTitle2}>SuperBucket의 새로운 소식을 메일로 받아보세요.</div>

        <div className="modalForm mtFix modalInside2 scrollFix">
          <BaseForm form={form} onFinish={handleSubmit}>
            <div className={`${m.modalForm} ${s.mtFix} ${m.modalInside2} scrollFix`}>
              {' '}
              <div className={m.dataLabel}>
                <div className={s.txt}>이메일</div>
              </div>
              <S.FormItem
                name="email"
                rules={[
                  { required: true, message: '이 필드는 필수입니다.' },
                  checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                  {
                    type: 'email',
                    message: '유효한 이메일 주소를 입력해 주세요',
                  },
                  {
                    max: 64,
                    message: '이메일 64자 이상이 될 수 없습니다.',
                  },
                ]}
              >
                <S.Input type="text" title="이메일" placeholder="소식 받으실 메일 주소" />
              </S.FormItem>
            </div>
            <div className={`${m.modalButtons} ${s.buttonMidSize}`}>
              <div className={s.inside}>
                <button type="submit" className={m.buttonDone}>
                  <span>등록하기</span>
                </button>
              </div>
            </div>
          </BaseForm>
        </div>
      </div>
      <button
        type="button"
        className={m.dimm}
        title="close modal"
        onClick={() => toggleOpenNewLetter()}
      ></button>
    </div>
  );
};

export default NewLetter;
