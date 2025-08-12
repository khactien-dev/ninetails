import EditIcon from '@/assets/images/svg/icon-edit2.svg';
import { usePermissions, useSettingMenusPermissions } from '@/hooks/usePermissions';
import LeftContent from '@/layouts/admin-layout/content/left-content';

import LeftMenu from '../left-menu';
import AgencyForm from './company-form';
import ContractForm from './contract-form';
import * as S from './index.style';
import useCompany from './index.utils';

const Agency = () => {
  const {
    editing,
    setEditing,
    onResetForm,
    onSubmitForm,
    form,
    updateDataPening,
    fetchDataPending,
  } = useCompany();
  const permissions = usePermissions();
  const menus = useSettingMenusPermissions();

  return (
    <S.SettingWrapper>
      <LeftContent hasCollapseBtn={false} width={364}>
        <LeftMenu menus={menus} />
      </LeftContent>

      <S.AdmContentWrap>
        <S.Box>
          <S.BoxTitleRow>
            <S.BoxTitle>
              <>기관(법인) 정보</>
              {!editing && permissions.updateAble && (
                <S.EditBtn type="default" onClick={() => setEditing((prev) => !prev)}>
                  <EditIcon />
                  기관정보 편집
                </S.EditBtn>
              )}
            </S.BoxTitle>
            <S.Table>
              <AgencyForm
                editing={editing}
                onResetForm={onResetForm}
                onSave={onSubmitForm}
                formInstance={form}
                updateDataPening={updateDataPening}
                fetchDataPending={fetchDataPending}
              />
            </S.Table>
          </S.BoxTitleRow>
        </S.Box>

        <S.Box>
          <S.BoxTitleRow>
            <S.BoxTitle>
              <>계약 정보</>
            </S.BoxTitle>
            <S.Table>
              <ContractForm formInstance={form} />
            </S.Table>
          </S.BoxTitleRow>
        </S.Box>
      </S.AdmContentWrap>
    </S.SettingWrapper>
  );
};

export default Agency;
