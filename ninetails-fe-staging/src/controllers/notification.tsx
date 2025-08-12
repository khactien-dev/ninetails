import ErrorIcon from '@/assets/images/svg/notification/error.svg';
import InfoIcon from '@/assets/images/svg/notification/info.svg';
import SuccessIcon from '@/assets/images/svg/notification/success.svg';
import WarningIcon from '@/assets/images/svg/notification/warning.svg';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import { defineColorBySeverity } from '@/utils';
import type { ArgsProps, IconType, NotificationInstance } from 'antd/es/notification/interface';
import styled, { css } from 'styled-components';

interface IconWrapperProps {
  $isOnlyTitle: boolean;
}

interface MessageProps extends IconWrapperProps {
  $type: IconType;
}

const IconWrapper = styled.div<IconWrapperProps>`
  font-size: ${(props) => (props.$isOnlyTitle ? '2rem' : '3rem')};
  line-height: 2rem;
  display: flex;
  align-items: center;
  height: 100%;
  margin-top: 4px;
`;

const Message = styled.div<MessageProps>`
  display: flex;
  align-items: center;
  margin-bottom: -0.5rem;
  ${(props) =>
    props.$isOnlyTitle
      ? css`
          font-size: ${FONT_SIZE.md};
          min-height: 3rem;
          font-weight: ${FONT_WEIGHT.semibold};
          margin-inline-start: 24px;
        `
      : css`
          font-size: ${FONT_SIZE.xxl};
          height: 3rem;
          font-weight: ${FONT_WEIGHT.bold};
          margin-inline-start: 21px;
        `}
  .ant-notification-notice.ant-notification-notice-${(props) => props.$type} & {
    color: ${(props) => defineColorBySeverity(props.$type)};
  }
`;

const Description = styled.div`
  color: #404040;
  font-size: ${FONT_SIZE.md};
  font-weight: ${FONT_WEIGHT.semibold};
  line-height: 1.375rem;
  margin-inline-start: 22px;
`;

const EmptyDescription = styled.div`
  margin-top: -0.75rem;
`;

type NotificationType = Pick<NotificationInstance, IconType>;

type NotificationOpener = (props: Omit<ArgsProps, 'type'>) => void;

const Icons = {
  success: SuccessIcon,
  warning: WarningIcon,
  info: InfoIcon,
  error: ErrorIcon,
} as const;

const open = (type: IconType, notification: NotificationType): NotificationOpener => {
  const Icon = Icons[type];

  const colorType = type === 'info' ? 'primary' : type;

  return ({ message, description, ...props }) =>
    notification[type]({
      icon: (
        <IconWrapper $isOnlyTitle={!description}>
          <Icon className={`ant-notification-notice-icon-${type}`} />
        </IconWrapper>
      ),
      message: (
        <Message $isOnlyTitle={!description} $type={type}>
          {message}
        </Message>
      ),
      description: description ? <Description>{description}</Description> : <EmptyDescription />,
      style: {
        minHeight: '90px',
        padding: '1.25rem 2rem',
        border: `1px solid ${defineColorBySeverity(type)}`,
        background: `var(--notification-${colorType}-color)`,
      },
      ...props,
      type,
    });
};

export const notificationController = (
  notification: NotificationType
): Record<IconType, NotificationOpener> => ({
  success: open('success', notification),
  info: open('info', notification),
  warning: open('warning', notification),
  error: open('error', notification),
});
