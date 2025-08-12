import { IDirection } from '@/interfaces';
import axios from 'axios';

export const getDirection = ({ start, end }: IDirection) =>
  axios.get(
    `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${start.longitude},${start.latitude}&goal=${end.longitude},${end.latitude}&option=trafast`,
    {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': process.env.NEXT_PUBLIC_NAVER_API_KEY || '',
        'X-NCP-APIGW-API-KEY': process.env.NEXT_PUBLIC_NAVER_SECRET_KEY || '',
      },
    }
  );
