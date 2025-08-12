import authBackground from '@/assets/images/auth/auth-bg.png';
import { BaseButton } from '@/components/common/base-button';
import { BaseCheckbox } from '@/components/common/base-checkbox';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseInput as CommonInput } from '@/components/common/inputs/base-input';
import { InputPassword as CommonInputPassword } from '@/components/common/inputs/password-input';
import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import { LeftOutlined } from '@ant-design/icons';
import styled from 'styled-components';

export const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
`;

export const BackgroundWrapper = styled.div`
  width: 100%;
  height: 100%;
  background: url(${authBackground.src});
  background-size: cover;
  position: relative;
`;

export const LoginWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
`;

export const FormWrapper = styled.div`
  padding: 1rem;
  width: 100%;
  max-width: 31.75rem;
  overflow: auto;
  background-color: rgba(var(--background-rgb-color), 0.93);
  border-radius: 20px;
  background: #ffffff;
  .ant-picker-input input::placeholder {
    font-size: ${FONT_SIZE.md};
    color: #bec0c6;
  }

  @media only screen and ${media.xs} {
    padding: 2.5rem 1.25rem;
    width: 20.75rem;
    max-height: calc(100vh - 3rem);
  }

  @media only screen and ${media.md} {
    padding: 2.5rem;
    width: 31.75rem;
    max-height: calc(100vh - 3rem);
  }
`;

// export const FormTitle = styled.div`
//   color: var(--primary-color);
//   text-align: center;
//   @media only screen and ${media.xs} {
//     margin-bottom: 0.625rem;
//     font-size: ${FONT_SIZE.lg};
//     font-weight: ${FONT_WEIGHT.bold};
//     line-height: 1.5625rem;
//   }
//
//   @media only screen and ${media.md} {
//     margin-bottom: 0.875rem;
//     font-size: ${FONT_SIZE.xxl};
//     font-weight: ${FONT_WEIGHT.bold};
//     line-height: 1.9375rem;
//   }
//
//   @media only screen and ${media.xl} {
//     margin-bottom: 0.9375rem;
//     font-size: ${FONT_SIZE.xxxl};
//     font-weight: ${FONT_WEIGHT.extraBold};
//     line-height: 2.125rem;
//   }
// `;

export const FormCheckbox = styled(BaseCheckbox)`
  display: flex;
  padding-left: 0.125rem;

  & .ant-checkbox-inner {
    border-radius: 3px;
    transform: scale(1.375);
  }

  & .ant-checkbox-input {
    transform: scale(1.375);
  }
`;

export const FormItem = styled(BaseForm.Item)`
  margin-bottom: 0.75rem;
  & .ant-form-item-control-input {
    min-height: 3.125rem;
  }

  & .ant-form-item-explain-error {
    font-size: ${FONT_SIZE.xs};
  }

  & .ant-form-item-label label {
    font-size: ${FONT_SIZE.xs};
    line-height: 1.25rem;
  }

  &.ant-form-item-has-feedback .ant-input-affix-wrapper .ant-input-suffix {
    padding-right: 1.5rem;
  }

  .ant-input {
    &::placeholder {
      font-size: ${FONT_SIZE.md};
      color: #bec0c6;
    }
  }
`;

export const FormInput = styled(CommonInput)`
  color: var(--text-main-color);
  background: transparent;
  & input.ant-input {
    background: transparent;
  }
`;

export const FormInputPassword = styled(CommonInputPassword)`
  color: var(--text-main-color);
  background: transparent;
  & input.ant-input {
    background: transparent;
  }
`;

export const ActionsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

export const Text = styled.span`
  color: var(--text-main-color);
  font-size: ${FONT_SIZE.xs};
  font-weight: ${FONT_WEIGHT.regular};
`;

export const LinkText = styled(Text)`
  text-decoration: underline;
  color: var(--primary-color);
`;

export const SubmitButton = styled(BaseButton)`
  font-size: ${FONT_SIZE.md};
  font-weight: ${FONT_WEIGHT.semibold};
  width: 100%;
`;

export const SocialButton = styled(BaseButton)`
  font-size: ${FONT_SIZE.md};
  font-weight: ${FONT_WEIGHT.semibold};
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  width: 100%;
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
`;

export const FooterWrapper = styled.div`
  margin-top: 1.25rem;
  text-align: center;
`;

export const BackIcon = styled(LeftOutlined)`
  font-size: 0.75rem;
  margin-right: 0.75rem;
`;

export const FormTitle = styled.div`
  font-size: 19px;
  font-weight: 700;
  line-height: 29px;
  text-align: left;
`;

export const FormDescription = styled.div`
  font-size: 13px;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
  font-weight: 400;
  line-height: 19px;
  text-align: left;
`;
export const SocialIconWrapper = styled.div`
  display: flex;
  margin-right: 0.8125rem;
  @media only screen and ${media.xs} {
    margin-right: 0.625rem;
  }

  @media only screen and ${media.md} {
    margin-right: 0.8125rem;
  }
`;
