import Calendar from '@/assets/images/common/Calendar.svg';
import ActionDown from '@/assets/images/driving-diary/action-down.svg';
import ActionUp from '@/assets/images/driving-diary/action-up.svg';
import BinIcon from '@/assets/images/driving-diary/bin.svg';
import InfoIcon from '@/assets/images/driving-diary/info.svg';
import NextDay from '@/assets/images/driving-diary/next-day.svg';
import NextMonth from '@/assets/images/driving-diary/next-month.svg';
import PrevDay from '@/assets/images/driving-diary/prev-day.svg';
import PrevMonth from '@/assets/images/driving-diary/prev-month.svg';
import { DATE_FORMAT } from '@/constants';
import { USER_ROLE } from '@/constants/settings';
import { usePermissions } from '@/hooks/usePermissions';
import { LandfillRecord, LeftDrivingDiaryProps } from '@/interfaces/driving-diary';
import { formatNumberWithCommas } from '@/utils';
import { Tooltip } from 'antd';
import { RcFile } from 'antd/es/upload';
import dayjs from 'dayjs';
import Image from 'next/image';

import ExpandedInfo from './ExpandedInfo';
import ExpandedLandfill from './ExpandedLandfill';
import * as S from './index.styles';

const LeftDrivingDiary = ({
  options,
  userRole,
  signatureData,
  onSaveDrivingRecord,
  onDeleteSignature,
  selectedDate,
  isModalVisible,
  isExpanded,
  signatureFile,
  error,
  distanceYesterday,
  setDistanceYesterday,
  currentSignature,
  distanceToday,
  setDistanceToday,
  fuelYesterday,
  setFuelYesterday,
  fuelToday,
  setFuelToday,
  expandedRowKeysLandfill,
  fuelVolume,
  setFuelVolume,
  isShowAddNewRecord,
  setIsShowAddNewRecord,
  isNewUploadSignature,
  handleRouteChange,
  onExpandRowLandfill,
  onDateChangeByType,
  onDateChange,
  onToday,
  onChangeSignature,
  handleFileUpload,
  selectedRoute,
  toggleExpand,
  onCancelSignature,
  onCreateSignature,
  openExpandInfo,
  setOpenExpandInfo,
  drivingRecord,
  landfillColumns,
  sortedLandfillData,
  onLandfill,
  vehicleId,
}: LeftDrivingDiaryProps) => {
  const permissions = usePermissions();
  const renderSignatureStatus = (signedUrl: string | null, altText: string, signLeft: boolean) => {
    const userUrl = signatureData?.user?.url;

    if (userRole === USER_ROLE.OP) {
      if (signedUrl) {
        return <S.ImageWrap src={signedUrl} alt={altText} width={107.5} height={81} />;
      }

      if (!signLeft) {
        return <S.SignatureText>서명 전</S.SignatureText>;
      }

      if ((!signedUrl && userUrl) || currentSignature?.url) {
        return <S.SignatureText>서명 전</S.SignatureText>;
      }

      return <S.SignatureText>서명 파일을등록해주세요</S.SignatureText>;
    } else {
      if (signedUrl) {
        return <S.ImageWrap src={signedUrl} alt={altText} width={107.5} height={81} />;
      }

      if (signLeft) {
        return <S.SignatureText>서명 전</S.SignatureText>;
      }

      if ((!signedUrl && userUrl) || currentSignature?.url) {
        return <S.SignatureText>서명 전</S.SignatureText>;
      }

      return <S.SignatureText>서명 파일을등록해주세요</S.SignatureText>;
    }
  };

  const renderExpandedRowLandfill = (record: LandfillRecord) => {
    if (!expandedRowKeysLandfill.includes(record.id)) {
      return null;
    }

    return (
      <ExpandedLandfill
        record={record}
        expandedRowKeys={expandedRowKeysLandfill}
        setIsShowAddNewRecord={setIsShowAddNewRecord}
        isShowAddNewRecord={isShowAddNewRecord}
        onSave={onLandfill}
      />
    );
  };

  const renderOperatorSignatureStatus = () => {
    return renderSignatureStatus(
      signatureData?.signed?.op_master_url ?? null,
      'Operator Signature',
      true
    );
  };

  const renderDispatchSignatureStatus = () => {
    return renderSignatureStatus(
      signatureData?.signed?.dispatch_master_url ?? null,
      'Manager Signature',
      false
    );
  };

  const emptyLandFill = () => (
    <S.AddRecord>
      <S.AddRecordWrap
        onClick={() => setIsShowAddNewRecord(!isShowAddNewRecord && permissions.createAble)}
      >
        <S.PlusIconWrap />
        <S.AddRecordText className="add-record">기록 추가</S.AddRecordText>
      </S.AddRecordWrap>
    </S.AddRecord>
  );

  return (
    <S.Wrapper>
      <S.SelectOption
        value={selectedRoute}
        onChange={(value) => handleRouteChange(value as string)}
        options={options}
      />
      <S.DatePicker
        value={selectedDate}
        format={DATE_FORMAT.DATE_KOREA_DAY_OF_WEEK}
        onChange={(value) => value && onDateChange(value)}
        suffixIcon={<Calendar />}
        allowClear={false}
        disabledDate={(current) => current && current > dayjs().endOf('day')}
      />
      <S.Navigation>
        <S.NavButton onClick={() => onDateChangeByType('prev', 'month')}>
          <PrevMonth />
        </S.NavButton>
        <S.NavButton onClick={() => onDateChangeByType('prev', 'day')}>
          <PrevDay />
        </S.NavButton>
        <S.NavButtonToday type="primary" onClick={onToday}>
          당일
        </S.NavButtonToday>
        <S.NavButton onClick={() => onDateChangeByType('next', 'day')}>
          <NextDay />
        </S.NavButton>
        <S.NavButton onClick={() => onDateChangeByType('next', 'month')}>
          <NextMonth />
        </S.NavButton>
      </S.Navigation>
      <S.Section>
        <S.TitleSection>결재</S.TitleSection>
        <S.RightApproval>
          <Tooltip title="[툴팁] 결재를 위해, 도장 또는 서명 (이미지)파일을 등록해 주세요. 한 번 결재한 서명은 당일에 한해 수정이 가능합니다.">
            <InfoIcon style={{ marginRight: 10 }} />
          </Tooltip>
          <S.UploadSignature
            disabled={!permissions.updateAble || !selectedDate.isSame(dayjs(), 'day')}
            onClick={() => {
              permissions.updateAble && onChangeSignature({ type: 'upload' });
            }}
          />
        </S.RightApproval>
      </S.Section>
      <S.SectionContent id="driving-diary-signature">
        <S.SignatureWrap>
          <S.HeaderSignature>담당자</S.HeaderSignature>
          <S.Signature className="signature-item">{renderOperatorSignatureStatus()}</S.Signature>
          {isExpanded && signatureData?.user.url && (
            <>
              {userRole === USER_ROLE.OP ? (
                <S.ButtonSubmit
                  onClick={() => onChangeSignature({ type: 'update' })}
                  style={{ width: '100%' }}
                  disabled={!signatureData?.user?.url || !permissions.updateAble}
                  type="primary"
                >
                  {signatureData?.signed?.op_master_url ? '수정' : '서명'}
                </S.ButtonSubmit>
              ) : (
                <S.ButtonCancel
                  type="default"
                  style={{
                    color: '#767676',
                    border: '1px solid #767676',
                    background: '#E5E5E5',
                    width: '100%',
                  }}
                >
                  {signatureData?.signed?.op_master_url ? '수정' : '서명'}
                </S.ButtonCancel>
              )}
            </>
          )}
        </S.SignatureWrap>
        <S.SignatureWrap>
          <S.HeaderSignature>책임자</S.HeaderSignature>
          <S.Signature className="signature-item">{renderDispatchSignatureStatus()}</S.Signature>
          {isExpanded && signatureData?.user.url && (
            <div>
              {userRole !== USER_ROLE.OP ? (
                <S.ButtonSubmit
                  onClick={() => onChangeSignature({ type: 'update' })}
                  style={{ width: '100%' }}
                  disabled={!signatureData?.user?.url || !permissions.updateAble}
                >
                  {signatureData?.signed?.dispatch_master_url ? '수정' : '서명'}
                </S.ButtonSubmit>
              ) : (
                <S.ButtonCancel
                  style={{
                    color: '#767676',
                    border: '1px solid #767676',
                    background: '#E5E5E5',
                    width: '100%',
                  }}
                >
                  {signatureData?.signed?.dispatch_master_url ? '수정' : '서명'}
                </S.ButtonCancel>
              )}
            </div>
          )}
        </S.SignatureWrap>
        <S.ActionApproval
          className="driving-diary-signature-expanded"
          disabled={!selectedDate.isSame(dayjs(), 'day')}
          onClick={() => {
            if (selectedDate.isSame(dayjs(), 'day')) {
              toggleExpand();
            }
          }}
          hasUrl={!!signatureData?.user?.url}
        >
          {isExpanded ? <ActionUp /> : <ActionDown />}
        </S.ActionApproval>
      </S.SectionContent>

      <div id="driving-diary-record">
        <S.Section>
          <S.TitleSection>운행 기록</S.TitleSection>
        </S.Section>
        <S.SectionContent style={{ flexDirection: 'column' }}>
          <S.Info className="driving-diary-info">
            <S.ContentInfo>
              <S.HeaderInfo></S.HeaderInfo>
              <S.InfoItemContent>km</S.InfoItemContent>
              <S.InfoItemContent>L</S.InfoItemContent>
            </S.ContentInfo>
            <S.ContentInfo isHeader={true} $minWidth={'90px'}>
              <S.HeaderInfo>전일누계</S.HeaderInfo>
              <S.InfoItemContent isCenter={true}>
                {drivingRecord?.distance_yesterday || drivingRecord?.distance_yesterday == 0
                  ? formatNumberWithCommas(drivingRecord.distance_yesterday)
                  : '--'}
              </S.InfoItemContent>
              <S.InfoItemContent isCenter={true}>
                {drivingRecord?.fuel_yesterday || drivingRecord?.fuel_yesterday == 0
                  ? formatNumberWithCommas(drivingRecord.fuel_yesterday)
                  : '--'}
              </S.InfoItemContent>
            </S.ContentInfo>
            <S.ContentInfo isHeader={true}>
              <S.HeaderInfo>금일누계</S.HeaderInfo>
              <S.InfoItemContent isCenter={true}>
                {drivingRecord?.distance_today || drivingRecord?.distance_today == 0
                  ? formatNumberWithCommas(drivingRecord.distance_today)
                  : '--'}
              </S.InfoItemContent>
              <S.InfoItemContent isCenter={true}>
                {drivingRecord?.fuel_today || drivingRecord?.fuel_today == 0
                  ? formatNumberWithCommas(drivingRecord.fuel_today)
                  : '--'}
              </S.InfoItemContent>
            </S.ContentInfo>
            <S.ContentInfo isHeader={true}>
              <S.HeaderInfo>편차</S.HeaderInfo>
              <S.InfoItemContent isCenter={true}>
                {drivingRecord?.distance_today && drivingRecord?.distance_yesterday
                  ? formatNumberWithCommas(
                      +drivingRecord?.distance_today - +drivingRecord?.distance_yesterday
                    )
                  : '--'}
              </S.InfoItemContent>
              <S.InfoItemContent isCenter={true}>
                {drivingRecord?.fuel_yesterday &&
                drivingRecord.fuel_volumn &&
                drivingRecord?.fuel_today
                  ? formatNumberWithCommas(
                      drivingRecord?.fuel_yesterday +
                        drivingRecord.fuel_volumn -
                        drivingRecord?.fuel_today
                    )
                  : '--'}
              </S.InfoItemContent>
            </S.ContentInfo>
            <S.ContentInfo
              style={{
                display: 'flex',
                flexDirection: 'column-reverse',
              }}
              className="driving-diary-expand"
            >
              <S.ExpandedInfoBox
                disabled={!vehicleId || !selectedDate.isSame(dayjs(), 'day')}
                onClick={() => {
                  if (vehicleId && selectedDate.isSame(dayjs(), 'day')) {
                    setOpenExpandInfo(!openExpandInfo);
                  }
                }}
              >
                {openExpandInfo ? <ActionUp /> : <ActionDown />}
              </S.ExpandedInfoBox>
            </S.ContentInfo>
          </S.Info>
          {openExpandInfo && (
            <ExpandedInfo
              {...{
                distanceYesterday,
                setDistanceYesterday,
                distanceToday,
                setDistanceToday,
                fuelYesterday,
                setFuelYesterday,
                fuelToday,
                setFuelToday,
                fuelVolume,
                setFuelVolume,
                onSaveDrivingRecord,
                drivingRecord,
              }}
            />
          )}
        </S.SectionContent>
      </div>

      <div id="landfill-diary-record">
        <S.Section>
          <S.TitleSection>매립 기록</S.TitleSection>
        </S.Section>
        <S.SectionContent style={{ flexDirection: 'column' }}>
          <S.TableInfo>
            <S.Table<LandfillRecord | any>
              columns={landfillColumns}
              dataSource={sortedLandfillData}
              pagination={false}
              expandedRowRender={renderExpandedRowLandfill}
              expandedRowKeys={[undefined]}
              onExpand={(_: any, record: LandfillRecord) => onExpandRowLandfill(record.id)}
              showExpandColumn={false}
              locale={{ emptyText: emptyLandFill() }}
            />
          </S.TableInfo>
        </S.SectionContent>
      </div>

      <S.ModalWrap
        size="small"
        open={isShowAddNewRecord}
        centered
        onCancel={() => setIsShowAddNewRecord(false)}
        footer={null}
        destroyOnClose
      >
        <S.TitleAddNewRecord>매립 기록</S.TitleAddNewRecord>
        <ExpandedLandfill
          expandedRowKeys={[]}
          isShowAddNewRecord={isShowAddNewRecord}
          setIsShowAddNewRecord={setIsShowAddNewRecord}
          onSave={onLandfill}
        />
      </S.ModalWrap>

      <S.ModalWrap
        size="small"
        open={isModalVisible}
        centered
        onCancel={onCancelSignature}
        footer={null}
        width={360}
        closeIcon={null}
      >
        <S.ModalTitle>
          {(isNewUploadSignature && signatureFile) ||
          (isNewUploadSignature && signatureData?.user?.url) ? (
            '아래의 서명을 차량운행일지 결재에 사용합니다:'
          ) : isNewUploadSignature && !signatureFile ? (
            <S.SignedTitlePopup>
              PC에 저장된 서명 파일을 선택하세요: <br />
              (지원 이미지: jpg, png, pdf)
            </S.SignedTitlePopup>
          ) : (
            <S.SignedTitlePopup>
              <S.SelectedDate>{selectedDate.format(DATE_FORMAT.DATE_KOREA)}</S.SelectedDate>
              차량운행일지의 내용을 확인했으며, 이에 서명합니다:
            </S.SignedTitlePopup>
          )}
        </S.ModalTitle>
        <S.UploadWrap
          name="signature"
          showUploadList={false}
          customRequest={({ file }) => handleFileUpload(file as RcFile)}
          accept=".jpg,.jpeg,.png"
          disabled={!isNewUploadSignature}
        >
          <S.UploadField error={error} isNewUploadSignature={isNewUploadSignature}>
            {signatureFile ? (
              <Image
                src={URL.createObjectURL(signatureFile)}
                alt="signature"
                width={107.5}
                height={81}
              />
            ) : signatureData?.user?.url ? (
              <Image
                src={signatureData?.user?.url}
                alt="Manager Signature"
                width={107.5}
                height={81}
              />
            ) : (
              <S.TextUploadSignature>(drag-in / upload file)</S.TextUploadSignature>
            )}
          </S.UploadField>
        </S.UploadWrap>
        {error && <S.ErrorText>{error}</S.ErrorText>}
        {!isNewUploadSignature && (
          <S.BinWrap
            disabled={!vehicleId}
            onClick={() => {
              if (vehicleId) {
                onDeleteSignature();
              }
            }}
          >
            <BinIcon />
          </S.BinWrap>
        )}
        <S.GroupButton>
          <S.ButtonSubmit type="primary" onClick={onCreateSignature}>
            확인
          </S.ButtonSubmit>
          <S.ButtonCancel type="default" onClick={onCancelSignature}>
            취소
          </S.ButtonCancel>
        </S.GroupButton>
      </S.ModalWrap>
    </S.Wrapper>
  );
};

export default LeftDrivingDiary;
