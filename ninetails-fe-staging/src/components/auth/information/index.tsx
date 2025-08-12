import { BaseTable } from '@/components/common/base-table';
import { USER_ROLE } from '@/constants/settings';
import LeftContent from '@/layouts/admin-layout/content/left-content';
import { MainFooter } from '@/layouts/admin-layout/footer';
import { selectCurrentUser } from '@/stores/auth/auth.slice';
import { useAppSelector } from '@/stores/hooks';
import { subString } from '@/utils';
import React from 'react';

import * as S from './index.styles';
import useUserInfo from './index.utils';

const UserInfo: React.FC = () => {
  const user = useAppSelector(selectCurrentUser);
  const {
    tableData,
    columns,
    handleSelectChange,
    selectedRows,
    expandedRowRender,
    setExpandedRowKeys,
    setEditingKey,
    expandedRowKeys,
  } = useUserInfo();

  return (
    <S.TablesWrapper>
      <LeftContent width={360}>
        <S.Wrapper>
          <S.Text>
            <b>{subString(user?.full_name)}</b> 님 <br />
            <span>[{user?.role == USER_ROLE.OP ? 'Operator' : user?.role}] </span>로그인 중입니다.
          </S.Text>
        </S.Wrapper>
      </LeftContent>

      <S.RightArea>
        <S.WrapHeader>
          <S.Heading>{'사용자 정보'}</S.Heading>
          <S.WrapContent>
            <S.Table>
              <BaseTable
                columns={columns}
                dataSource={tableData}
                rowKey={'key'}
                pagination={false}
                rowSelection={{ onChange: handleSelectChange, selectedRowKeys: selectedRows }}
                expandable={{
                  expandedRowRender: expandedRowRender,
                  expandedRowKeys: expandedRowKeys,
                  onExpand: (expanded, record: any) => {
                    if (expanded) {
                      setExpandedRowKeys([record.key]);
                      setEditingKey(record.key);
                    } else {
                      setExpandedRowKeys([]);
                      setEditingKey('');
                    }
                  },
                  showExpandColumn: false,
                }}
                scroll={{ x: 'max-content' }}
              />
            </S.Table>
          </S.WrapContent>
        </S.WrapHeader>
        <MainFooter isShow={false}></MainFooter>
      </S.RightArea>
    </S.TablesWrapper>
  );
};

export default UserInfo;
