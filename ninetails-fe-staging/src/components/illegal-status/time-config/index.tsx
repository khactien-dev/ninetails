import IconNext from '@/assets/images/svg/icon-open_a1.svg';
import IconTime from '@/assets/images/svg/lastup.svg';
import React, { useState } from 'react';

import * as S from '../index.style';
import { IParams, SelectData } from '../index.utils';

interface TimeConfigProps {
  timeOptions: SelectData[];
  lastUpdated: string;
  params: IParams;
  isLoading: boolean;
  refetch: () => void;
  onChangeParams: (params: IParams) => void;
}

const TimeConfig: React.FC<TimeConfigProps> = ({
  lastUpdated,
  // onChangeParams,
  // params,
  // timeOptions,
  // refetch,
}) => {
  const [visible, setVisible] = useState<boolean>(true);

  // const onTimeChange = (value: any) => {
  //   if (!value) return;
  //   onChangeParams({ updateTime: value });
  // };

  return (
    <S.FlexCenter className={'tabs'}>
      {visible && (
        <S.LastUpdate>
          <IconTime />
          <span>Last Updated</span> {lastUpdated}
        </S.LastUpdate>
      )}

      {/* <S.Form open={visible}>
        <S.Form.Item>
          <S.TimeSelect
            options={timeOptions}
            value={params.updateTime}
            onChange={onTimeChange}
            popupMatchSelectWidth={false}
            placement="bottomRight"
          />
        </S.Form.Item>
      </S.Form>

      <S.Reload className={'item'} $active={false} $open={visible} onClick={() => refetch()}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width="14"
          height="14"
          viewBox="0 0 14 14"
        >
          <image
            id="reload"
            width="14"
            height="14"
            xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAYAAACohjseAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDAyIDc5LjE2NDQ2MCwgMjAyMC8wNS8xMi0xNjowNDoxNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjIgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkE4OTZFODkyQzFCRjExRUE4OEZDODRBQTkxODRDQzUxIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkE4OTZFODkzQzFCRjExRUE4OEZDODRBQTkxODRDQzUxIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QTg5NkU4OTBDMUJGMTFFQTg4RkM4NEFBOTE4NENDNTEiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QTg5NkU4OTFDMUJGMTFFQTg4RkM4NEFBOTE4NENDNTEiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz77fwLwAAAE7klEQVR42tybW2hUVxSGdxIN4qXGEKyiYC+iBl/0QRSjOBGhhfbBB0ML0Sr1iiCGgOiDqEVB4oN4QfBSQapTREtvFKpQ7dRYCfgiKCQRIgheSLzHiYaGkP6L+SMnyz1zzpw5mTlnFnxg1pnZe/1z9nXtbcmxI4dNwDYKLACLwExQDaaCsWAMPzMAnoCH4C64A26AFvAmyGBGBFTOaLAcrAIxisxkJWAimQu+or8X/AUugJ/A21wDK83x+5PBIdAJ4uBzD+Lc3v6X4AfwGBxgHXkXOB4cBffBVja/oE3q2Abugf3gg3w10XpwkM0rnXWDZvarNvazV+A1n48Ek8DHYDaYD5aAijRvdQeb/2bwu0t8A34Fyls6ToE2k8HhIjgH/gb9LuXJIHPbEXAZ+289++Ro9fkp4Ddwkq2mN8gm+im4mUbcS/AdA1jDQaLfR8uQ71wB33LU3cW3rm0DuOa1b3oROAf8C2ZZmsL3FL+HQoOyF2Avyz5heT6PzX96rgJF3D/gQ+WX+WspWA+em+GzZ2ATqGWdTvsIJNxElro0y0uW0StB4QmTP0twvmy29MvLmQa80gwDyh+WNyeT72fgqcm/yaC0DPyi/J+An0F5NgKPW/qciPsa/GcKZ1J3nUVkDedKTwLrLaNlgr5+U3jr5w99Xfkb2VczChzPSVwPKHUFfnO2N7kCPFL+k24C96kOK1PBygL1OTeT9e83yjc9k0CZODeq56fzPFpma1cYo6e16HauEZ0rlO0hEDEQxG5C1n1r1bPDwzyJ58UGBS5XW5433OeZYhG4SvkvBry2LJiN4H4rpvznQhTjhFwFLlBphm7u58JiL3NtoouUrzkkK5bA+uBM5bthishEYLXytRWbwKnKd7fYBOqU36tiEzhG+V4Xm8BisgquXd8hAnvUh8ZFWKCOvUcEJi2b3qiajj0pAh8o54wIC9SxPxCBrco5K8ICdeytIrBdORdGWKCOvV0E6uzUYpM6CImalTF2p10XgXJs7DypkUx2bQQF1pqhWXjR1FLKfyTUh1dGUKCOWTT1Dk70Z9XDOmM/jAzzBF+nfGedK5lf1XwoSaiGCAlsMEMPTJPU9E6gJJl0flFOUSsjIK6SsTrtNDUNWYs2gT712psiILBJdac+Z9xOgXJtQ5+mSq40FmJxMfN+PvcEtVh3EztBl+NvubAjGbaqEIqrYmwlDl8XNaTdLslmt1H55BRV8qTlIRJXzpimKH+j3rDb9oNxoptCPCQrnDLGEvMQd9oNrxz86+STnMedL/CbLGcMK5S/jTF73tHLPCJ3xjotIi8XqE9WsW4trpOxJrNNWXSY1OW6bktzvZXn0TVdnd2MscNvTkYKXWJ5k9K5r4JTw7wYqGQdVy0DSidju5WpAC9JJymgxtInZXhex19vT8Br1wqW2cE6Six9rsZNnFeBg811nm2UYjC7TeqywhmTusviZ7Qt43fPsKzdaX60OGPp8FJoNrcNk9yS/Gns1yllsbuauF2nHMcE0QymGRZys5rpTmgX57l4Nr+an/uiUoHcgpIbGXJpYaTlMxLoFyRX6+Pya6fxkXX3m/iViraAaSZ1lp8chgEmybKnsS5fRwq5ZrYfcy8md9rkJtQl4/GiahrrZRn1LLPBuXD2Y0Hdupe914/Ey38r6OEbkpyspC3bmfxqyfEHes/+F2AAbo4IcqapEegAAAAASUVORK5CYII="
          />
        </svg>
      </S.Reload> */}

      <S.Setting className={'item'} onClick={() => setVisible((prev) => !prev)} open={visible}>
        <IconNext />
      </S.Setting>
    </S.FlexCenter>
  );
};

export default React.memo(TimeConfig);
