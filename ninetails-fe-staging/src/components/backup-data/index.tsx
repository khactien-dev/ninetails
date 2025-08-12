import { BaseButton } from '@/components/common/base-button';
import { DATE_FORMAT } from '@/constants';
import { useBackUpDataMutation } from '@/hooks/features/useTenant';
import { useFeedback } from '@/hooks/useFeedback';
import { IContract } from '@/interfaces';
import { isShowBackupData, toggleBackupData } from '@/stores/app/app.slice';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { queryClient } from '@/utils/react-query';
import { sessionSetBackupData } from '@/utils/sessionStorage';
import dayjs from 'dayjs';

import * as S from './index.styles';

interface IProps {
  contract: {
    data: IContract;
    email: string;
    organization: string;
  };
}

const BackupDataModal = ({ contract }: IProps) => {
  const open = useAppSelector(isShowBackupData);
  const dispatch = useAppDispatch();
  const { notification } = useFeedback();
  const { mutate: backupData, isPending } = useBackUpDataMutation();

  const handleToggleBackupData = () => {
    sessionSetBackupData('true');
    dispatch(toggleBackupData());
  };

  const handleBackupData = () => {
    backupData(undefined, {
      onSuccess: () => {
        dispatch(toggleBackupData());
        queryClient.invalidateQueries({ queryKey: ['tenant_detail_for_op'] });
        notification.success({
          message: '백업이 확인되었습니다! 백업이 완료되면 7일 이내에 알림 이메일을 받게 됩니다!',
        });
      },
    });
  };

  return (
    <S.Modal open={open} closable={false} footer={null}>
      <S.Wrapper>
        <S.Title>계약이 곧 만료됩니다</S.Title>
        <S.Content>
          <b>{contract.organization}</b> 와 SuperBucket 간의 계약은{' '}
          <b>
            <br />
            {dayjs(contract.data.end_date).format(DATE_FORMAT.DATE_KOREA)}
          </b>
          에 만료됩니다.
        </S.Content>
        <S.Content>
          계약이 갱신되면 작년 <br />(
          <b>{dayjs(contract.data.start_date).format(DATE_FORMAT.DATE_KOREA)}부터</b>
          <b>{dayjs(contract.data.end_date).format(DATE_FORMAT.DATE_KOREA)}까지</b>)
          <br />의 모든 데이터가 자동으로 백업됩니다.
        </S.Content>

        <S.NoteWrapper>
          <span>참고:</span>
          <S.Notes>
            <S.Note>
              데이터베이스의 모든 데이터와 테이블을 수동으로 다운로드하여 본인의 백업을 만들 수
              있습니다.
            </S.Note>
            <S.Note>
              자동 백업을 확인하면 DB 스키마, DB 테이블 데이터, OpenSearch 데이터 등 모든 데이터를
              내보내 Amazon의 S3 서비스에 모두 보관합니다.
            </S.Note>
          </S.Notes>
          <S.Description>
            백업 프로세스가 완료되면 이메일(<b>{contract.email}</b>)로 다운로드 링크를 제공해
            드립니다.
          </S.Description>
        </S.NoteWrapper>

        <S.Question>데이터를 자동으로 백업하시겠습니까?</S.Question>

        <S.ButtonGroup>
          <BaseButton
            style={{ width: '100%' }}
            type="primary"
            onClick={handleBackupData}
            loading={isPending}
          >
            백업 확인
          </BaseButton>
          <BaseButton type="text" onClick={handleToggleBackupData}>
            나중에 알림
          </BaseButton>
        </S.ButtonGroup>
      </S.Wrapper>
    </S.Modal>
  );
};

export default BackupDataModal;
