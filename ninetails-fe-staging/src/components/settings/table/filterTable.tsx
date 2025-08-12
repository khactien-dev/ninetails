// import { LOCATION_ROUTE } from '@/constants/settings';
import { ButtonItem, TabsItem } from '@/interfaces/settings';
import Image from 'next/image';

// import { useRouter } from 'next/router';
import * as S from './index.style';

interface FilterTableProps {
  buttonArr: ButtonItem[] | null;
  tabsArr?: TabsItem[];
  isSuperAdmin: boolean;
}

const FilterTable = ({ buttonArr, isSuperAdmin, tabsArr }: FilterTableProps) => {
  // const route = useRouter();
  const handleRenderIcon = (button: ButtonItem) => {
    if (button?.icon) return button.icon;
    if (button?.pngIcon)
      return (
        <Image
          style={{ display: 'inline-block' }}
          height={11}
          width={11}
          src={button.pngIcon}
          alt={''}
        />
      );
    return null;
  };

  return (
    <>
      <S.ActionsTable>
        <S.FloatRight>
          {buttonArr &&
            buttonArr?.map((button) => (
              <S.ButtonAdm
                disabled={!button.isActive}
                key={button.name}
                $isOutline={button.isOutline}
                $isFilter={button.isFilter}
                $isActive={button.isActive}
                $isPrimary={button.isPrimary}
                onClick={button.onClick}
                $isSuperAdmin={isSuperAdmin}
              >
                {handleRenderIcon(button)}
                <span>{button.name}</span>
              </S.ButtonAdm>
            ))}
        </S.FloatRight>
        {/* {route.pathname === LOCATION_ROUTE ? <S.BtnSave>동선업데이트</S.BtnSave> : null} */}
      </S.ActionsTable>
      {tabsArr && (
        <S.Tabs
          defaultActiveKey="1"
          items={tabsArr}
          onChange={(key: string) => console.log(key)}
        ></S.Tabs>
      )}
    </>
  );
};

export default FilterTable;
