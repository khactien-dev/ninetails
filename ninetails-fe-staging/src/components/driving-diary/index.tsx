import InfoIcon from '@/assets/images/driving-diary/info.svg';
import SaveIcon from '@/assets/images/driving-diary/save.svg';
import { DATE_FORMAT } from '@/constants';
import { usePermissions } from '@/hooks/usePermissions';
import LeftContent from '@/layouts/admin-layout/content/left-content';
import { Tooltip } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

import { ExportFile } from '../analysis/export-file';
import { BaseTable } from '../common/base-table';
import { BaseSelect } from '../common/selects/base-select';
import PaginationTable from '../settings/pagination';
import TableSetting from '../settings/table/Table';
import * as S from './index.styles';
import useDrivingDiary from './index.utils';
import LeftDrivingDiary from './left-driving-diary';

const DrivingDiary: React.FC = () => {
  const {
    handleChangeParams,
    handleSelectChange,
    selectedRows,
    onFirstPage,
    currentPage,
    onChange,
    onLastPage,
    routeData,
    userRole,
    signatureData,
    currentSignature,
    handleSaveDrivingRecord,
    handleDeleteSignature,
    selectedDate,
    isModalVisible,
    isExpanded,
    signatureFile,
    error,
    distanceYesterday,
    setDistanceYesterday,
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
    handleExpandRowLandfill,
    handleFileUpload,
    selectedRoute,
    toggleExpand,
    handleCancelSignature,
    handleCreateSignature,
    handleChangeSignature,
    handleDateChangeByType,
    handleDateChange,
    handleToday,
    setOpenExpandInfo,
    openExpandInfo,
    drivingRecord,
    drivingRecordColumns,
    drivingRecordExport,
    landfillColumns,
    landfillColumnsExport,
    sortedLandfillData,
    handleLandfill,
    dataTable,
    TableColumnData,
    total,
    vehicleList,
    handleSelectVehicle,
    vehicleId,
    handleOpenExportModal,
    customSummaryRow,
    isExportModalVisible,
    setIsExportModalVisible,
    vehicleNumber,
    isManager,
    workingScheduleVehicle,
    renderIconJobsContract,
    getIconPurposeVehicle,
    handleExportDrivingDiary,
    countTableExport,
    allDataTableExport,
    openPDFcontent,
    isDownloadExport,
  } = useDrivingDiary();
  const permissions = usePermissions();

  return (
    <S.Container>
      <LeftContent hasCollapseBtn={false} width={364}>
        <LeftDrivingDiary
          options={routeData}
          userRole={userRole || ''}
          signatureData={signatureData}
          currentSignature={currentSignature}
          onSaveDrivingRecord={handleSaveDrivingRecord}
          onDeleteSignature={handleDeleteSignature}
          selectedDate={selectedDate}
          isModalVisible={isModalVisible}
          isExpanded={isExpanded}
          signatureFile={signatureFile}
          error={error}
          distanceYesterday={distanceYesterday}
          setDistanceYesterday={setDistanceYesterday}
          distanceToday={distanceToday}
          setDistanceToday={setDistanceToday}
          fuelYesterday={fuelYesterday}
          setFuelYesterday={setFuelYesterday}
          fuelToday={fuelToday}
          setFuelToday={setFuelToday}
          expandedRowKeysLandfill={expandedRowKeysLandfill}
          fuelVolume={fuelVolume}
          setFuelVolume={setFuelVolume}
          isShowAddNewRecord={isShowAddNewRecord}
          setIsShowAddNewRecord={setIsShowAddNewRecord}
          isNewUploadSignature={isNewUploadSignature}
          handleRouteChange={handleRouteChange}
          onExpandRowLandfill={handleExpandRowLandfill}
          handleFileUpload={handleFileUpload}
          selectedRoute={selectedRoute}
          toggleExpand={toggleExpand}
          onCancelSignature={handleCancelSignature}
          onCreateSignature={handleCreateSignature}
          onChangeSignature={handleChangeSignature}
          onDateChangeByType={handleDateChangeByType}
          onDateChange={handleDateChange}
          onToday={handleToday}
          setOpenExpandInfo={setOpenExpandInfo}
          openExpandInfo={openExpandInfo}
          drivingRecord={drivingRecord}
          landfillColumns={landfillColumns}
          sortedLandfillData={sortedLandfillData || []}
          onLandfill={handleLandfill}
          vehicleId={vehicleId}
          isManager={isManager ?? false}
        />
      </LeftContent>
      <S.AdmContentWrap>
        <S.MainContent>
          <S.HeaderTable>
            <S.LeftHeader>
              <S.TooltipBox>
                <Tooltip title="툴팁: 차량운행일지 내용은 자동 작성되며, 수정이 허용되지 않습니다">
                  <InfoIcon />
                </Tooltip>
              </S.TooltipBox>
              <S.SelectOption
                value={vehicleNumber}
                onChange={(value) => handleSelectVehicle(value as string)}
                options={vehicleList}
                disabled={vehicleList.length === 0}
              />
            </S.LeftHeader>
            <S.SaveBox
              disabled={!vehicleNumber || !permissions.exportAble}
              onClick={handleOpenExportModal}
            >
              <SaveIcon />
              저장
            </S.SaveBox>
          </S.HeaderTable>
          <S.WorkingSchedule>
            <S.AboveWorkingSchedule>
              <S.TitleWorkingSchedule>차번</S.TitleWorkingSchedule>
              <S.TitleWorkingSchedule>운전원</S.TitleWorkingSchedule>
              <S.TitleWorkingSchedule>탑승원1</S.TitleWorkingSchedule>
              <S.TitleWorkingSchedule>탑승원2</S.TitleWorkingSchedule>
            </S.AboveWorkingSchedule>
            <S.UnderWorkingSchedule>
              <S.UserBox>
                {getIconPurposeVehicle(workingScheduleVehicle?.vehicle?.purpose)}
                <S.TextUserBox>{vehicleNumber}</S.TextUserBox>
              </S.UserBox>
              <S.UserBox>
                {renderIconJobsContract(workingScheduleVehicle?.wsDriver?.job_contract)}
                <S.TextUserBox>{workingScheduleVehicle?.wsDriver?.name}</S.TextUserBox>
              </S.UserBox>
              <S.UserBox>
                {renderIconJobsContract(workingScheduleVehicle?.wsFieldAgent1?.job_contract)}
                <S.TextUserBox>{workingScheduleVehicle?.wsFieldAgent1?.name}</S.TextUserBox>
              </S.UserBox>
              <S.UserBox>
                {renderIconJobsContract(workingScheduleVehicle?.wsFieldAgent2?.job_contract)}
                <S.TextUserBox>{workingScheduleVehicle?.wsFieldAgent2?.name}</S.TextUserBox>
              </S.UserBox>
            </S.UnderWorkingSchedule>
          </S.WorkingSchedule>
          <S.Table>
            <TableSetting
              handleSortColumn={handleChangeParams}
              handleSelectChange={handleSelectChange}
              columns={TableColumnData}
              data={dataTable}
              selectedRows={selectedRows}
              showCheckbox={false}
              customSummaryRow={customSummaryRow}
            />
            {total > 0 && (
              <PaginationTable
                onFirstPage={onFirstPage}
                current={currentPage}
                onChange={onChange}
                total={total}
                onLastPage={onLastPage}
              />
            )}
          </S.Table>
        </S.MainContent>

        {openPDFcontent && (
          <S.PDFHidden>
            <S.PDFWrap id="pdf-driving-diary">
              <S.PDFDrivingFirstPage id="driving-diary-first-page">
                <S.PDFDrivingHeader id="driving-diary-header">
                  <S.PDFHeader>
                    <S.PDFInfo>
                      <S.PDFTitle>차량운행일지</S.PDFTitle>
                      <div>
                        <S.PDFDate>
                          {dayjs(selectedDate).format(DATE_FORMAT.DATE_KOREA_DAY_OF_WEEK)}
                        </S.PDFDate>
                        <BaseSelect
                          width={150}
                          size="small"
                          options={vehicleList}
                          value={vehicleNumber}
                        />
                      </div>
                    </S.PDFInfo>
                    <S.PDFSignature id="driving-diary-signature-pdf">
                      <S.PDFSignatureTitle>결재</S.PDFSignatureTitle>
                    </S.PDFSignature>
                  </S.PDFHeader>

                  <S.WorkingSchedule>
                    <S.AboveWorkingSchedule>
                      <S.TitleWorkingSchedule>차번</S.TitleWorkingSchedule>
                      <S.TitleWorkingSchedule>운전원</S.TitleWorkingSchedule>
                      <S.TitleWorkingSchedule>탑승원1</S.TitleWorkingSchedule>
                      <S.TitleWorkingSchedule>탑승원2</S.TitleWorkingSchedule>
                    </S.AboveWorkingSchedule>
                    <S.UnderWorkingSchedule>
                      <S.UserBox>
                        {getIconPurposeVehicle(workingScheduleVehicle?.vehicle?.purpose)}
                        <S.TextUserBox>{vehicleNumber}</S.TextUserBox>
                      </S.UserBox>
                      <S.UserBox>
                        {renderIconJobsContract(workingScheduleVehicle?.wsDriver?.job_contract)}
                        <S.TextUserBox>{workingScheduleVehicle?.wsDriver?.name}</S.TextUserBox>
                      </S.UserBox>
                      <S.UserBox>
                        {renderIconJobsContract(
                          workingScheduleVehicle?.wsFieldAgent1?.job_contract
                        )}
                        <S.TextUserBox>{workingScheduleVehicle?.wsFieldAgent1?.name}</S.TextUserBox>
                      </S.UserBox>
                      <S.UserBox>
                        {renderIconJobsContract(
                          workingScheduleVehicle?.wsFieldAgent2?.job_contract
                        )}
                        <S.TextUserBox>{workingScheduleVehicle?.wsFieldAgent2?.name}</S.TextUserBox>
                      </S.UserBox>
                    </S.UnderWorkingSchedule>
                  </S.WorkingSchedule>

                  <S.PDFRecordTableWrap>
                    <S.PDFRecordTable>
                      <span>운행 기록</span>
                      <BaseTable
                        columns={drivingRecordColumns}
                        dataSource={drivingRecordExport}
                        pagination={false}
                      />
                    </S.PDFRecordTable>

                    <S.PDFRecordTable>
                      <span>매립 기록</span>
                      <BaseTable
                        columns={landfillColumnsExport}
                        dataSource={sortedLandfillData}
                        pagination={false}
                      />
                    </S.PDFRecordTable>
                  </S.PDFRecordTableWrap>
                </S.PDFDrivingHeader>

                <S.PDFTable>
                  <TableSetting
                    handleSortColumn={handleChangeParams}
                    handleSelectChange={handleSelectChange}
                    columns={TableColumnData}
                    data={allDataTableExport.slice(0, countTableExport)}
                    selectedRows={selectedRows}
                    showCheckbox={false}
                    customSummaryRow={customSummaryRow}
                    sortDirections={[]}
                  />
                </S.PDFTable>
              </S.PDFDrivingFirstPage>

              {Array.from(
                { length: Math.ceil((allDataTableExport.length - countTableExport) / 20) },
                (_, pageIndex) => {
                  const startIndex = countTableExport + pageIndex * 20;
                  const endIndex = Math.min(startIndex + 20, allDataTableExport.length);

                  return (
                    <S.PDFTableItem key={pageIndex} className="driving-diary-remaining-table">
                      <S.PDFTable>
                        <TableSetting
                          handleSortColumn={handleChangeParams}
                          handleSelectChange={handleSelectChange}
                          columns={TableColumnData}
                          data={allDataTableExport.slice(startIndex, endIndex)}
                          selectedRows={selectedRows}
                          showCheckbox={false}
                          customSummaryRow={customSummaryRow}
                          sortDirections={[]}
                        />
                      </S.PDFTable>
                    </S.PDFTableItem>
                  );
                }
              )}
            </S.PDFWrap>
          </S.PDFHidden>
        )}

        <S.FooterDes>
          <S.FooterDesText>Copyright 2024. SuperBucket © all rights reserved.</S.FooterDesText>
        </S.FooterDes>
      </S.AdmContentWrap>
      <S.ModalWrap
        open={isExportModalVisible}
        onCancel={() => setIsExportModalVisible(false)}
        size="small"
        closable={false}
        footer={null}
        destroyOnClose
        width={400}
        rounded="md"
        styles={{
          content: {
            padding: '1rem',
          },
        }}
      >
        <ExportFile
          fileName={`차량운행일지_${vehicleNumber}_${dayjs(selectedDate).format('YYYYMMDD')}`}
          fileType="pdf"
          loading={isDownloadExport}
          onExport={handleExportDrivingDiary}
          onCancel={() => setIsExportModalVisible(false)}
          isShowTimeFileName={false}
        />
      </S.ModalWrap>
    </S.Container>
  );
};

export default DrivingDiary;
