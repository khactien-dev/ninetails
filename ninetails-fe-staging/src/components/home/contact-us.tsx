import React from 'react';

import s from './index.module.css';
import m from './modal.module.css';

interface IProps {
  toggleOpenContactUs: () => void;
}
const ContactUs: React.FC<IProps> = ({ toggleOpenContactUs }) => {
  return (
    <div className={`csModal ${s.active}`}>
      <div className={`${m.modalNormal} ${m.modalSize3} intro-modal1 ${s.active}`}>
        <button
          type="button"
          onClick={() => toggleOpenContactUs()}
          className={`${m.buttonCloseModal} ${s.footerButton}`}
          title="close modal"
        ></button>
        <div className={`${m.modalTitleRow} center`}>
          <div className={s.inside}>
            <div className={s.txt1}>
              <span className={s.sp0}></span>에 문의하기
            </div>
          </div>
        </div>
        <div className={m.modalTitle2}>현대화된 청소행정 업무 도구들을 경험해 보세요.</div>
        <div className={`${m.modalForm} ${s.mtFix} ${m.modalInside2} ${s.scrollFix}`}>
          <div className={s.boxTxtGroup}>
            <div className={s.dotRow}>support@superbucket.kr</div>
            <div className={s.dotRow}>02-560-4888</div>
          </div>

          <div className={s.txtG1}>아래 내용을 입력해 주세요.</div>

          <div className={m.dataLabel}>
            <div className={s.txt}>이름 (소속)</div>
          </div>
          <div className={m.dataWrap}>
            <input
              type="text"
              className={s.inputNormal}
              title="이름 (소속)"
              placeholder="이름과 소속 입력"
            />
          </div>

          <div className={m.dataLabel}>
            <div className={s.txt}>연락처</div>
          </div>
          <div className={m.dataWrap}>
            <input type="text" className={s.inputNormal} title="이름" placeholder="숫자만 입력" />
          </div>

          <div className={m.dataLabel}>
            <div className={s.txt}>이메일</div>
          </div>
          <div className={m.dataWrap}>
            <input
              type="text"
              className={s.inputNormal}
              title="이메일"
              placeholder="답변 받으실 메일 주소"
            />
          </div>

          <div className={m.dataLabel}>
            <div className={s.txt}>신청 내용</div>
          </div>
          <div className={m.dataWrap}>
            <textarea
              className={s.txtaNormal}
              title="신청 내용"
              placeholder="내용을 입력해 주세요"
            ></textarea>
          </div>

          <div className={`${m.dataWrap} ${s.mtFix1}`}>
            <label className={s.bInput}>
              <input type="checkbox" />
              <div className={s.txt}>이메일로 새 소식을 받아볼게요.</div>
            </label>
          </div>
        </div>

        <div className={`${m.modalButtons} ${s.buttonMidSize}`}>
          <div className={s.inside}>
            <button type="button" className={`${m.buttonDone} ${s.footerButton}`}>
              <span>제출하기</span>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => toggleOpenContactUs()}
        type="button"
        className={`${m.dimm} ${s.footerButton}`}
        title="close modal"
      ></button>
    </div>
  );
};

export default ContactUs;
