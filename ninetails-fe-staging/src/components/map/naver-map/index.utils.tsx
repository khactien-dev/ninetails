import { DATE_FORMAT } from '@/constants/common';
import { COLLECT_STATUS, MARKER_TYPE } from '@/constants/map';
import { GeolocationPosition } from '@/interfaces';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavermaps } from 'react-naver-maps';

export interface IDefaultConfig {
  center: any;
  zoom: number;
}

interface UseMapProps {
  map: any;
  config?: IDefaultConfig;
}

interface Utils {
  navermaps: any;
  defaultConfig: IDefaultConfig;
  getCurrentLocation: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  getMarkderIcon: (type: string, color: string) => string | undefined;
  getDetailContent: (id: string, type: string, data: any) => string;
}

export default function useMap(props: UseMapProps): Utils {
  const navermaps = useNavermaps();
  const map = props?.map;
  const [defaultConfig] = useState<IDefaultConfig>(
    props?.config
      ? {
          center: new navermaps.LatLng(props?.config?.center.lat, props?.config?.center.lng),
          zoom: props?.config?.zoom,
        }
      : {
          center: new navermaps.LatLng(35.16352285, 126.7518477),
          zoom: 12,
        }
  );

  const onSuccessGeolocation = (position: GeolocationPosition) => {
    if (!map) return;
    const location = new navermaps.LatLng(position.coords.latitude, position.coords.longitude);
    map?.setCenter(location);
    map?.setZoom(20);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(onSuccessGeolocation, (error) => console.log(error));
    }
  };

  const onZoomIn = () => {
    if (!map) return;
    map?.setZoom(map.zoom + 1, true);
  };

  const onZoomOut = () => {
    if (!map) return;
    map?.setZoom(map.zoom - 1, true);
  };

  const getDriveState = (drive_mode: number) => {
    switch (drive_mode) {
      case 1:
        return {
          name: '수거지로 이동',
          icon: '/images/map/state/state-1.svg',
          color: 'orange',
        };
      case 2:
        return {
          name: '매립지로 이동',
          icon: '/images/map/state/state-1.svg',
          color: 'yellow',
        };
      case 3:
        return {
          name: '차고지로 복귀',
          icon: '/images/map/state/state-2.svg',
          color: 'green',
        };
      case 4:
        return {
          name: '식당으로 이동',
          icon: '/images/map/state/state-3.svg',
          color: 'blue',
        };
      case 5:
        return {
          name: '수거운행',
          icon: '/images/map/state/state-4.svg',
          color: 'pink',
        };
      case 6:
        return {
          name: '대기 (공회전)',
          icon: '/images/map/state/state-5.svg',
          color: 'purple',
        };
      case 7:
        return {
          name: '미관제',
          icon: '/images/map/state/state-6.svg',
          color: 'gray',
        };
      case 8:
        return {
          name: '운행종료 (휴식)',
          icon: '/images/map/state/state-7.svg',
          color: 'black',
        };
      default:
        return {
          name: '기타운행 (미선택)',
          icon: '/images/map/state/state-8.svg',
          color: 'red',
        };
    }
  };

  const getMarkderIcon = (type: string, color: string) => {
    if (type == MARKER_TYPE.CAR)
      return `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="57" viewBox="0 0 44 57" fill="none">
  <circle cx="22" cy="22" r="19" fill="white" stroke="${color}" stroke-width="6"/>
  <path d="M19 28.2727C19 27.9034 18.8681 27.5838 18.6042 27.3139C18.3403 27.044 18.0278 26.9091 17.6667 26.9091C17.3056 26.9091 16.9931 27.044 16.7292 27.3139C16.4653 27.5838 16.3333 27.9034 16.3333 28.2727C16.3333 28.642 16.4653 28.9616 16.7292 29.2315C16.9931 29.5014 17.3056 29.6364 17.6667 29.6364C18.0278 29.6364 18.3403 29.5014 18.6042 29.2315C18.8681 28.9616 19 28.642 19 28.2727ZM15 22.8182H19V20.0909H17.3542C17.2639 20.0909 17.1875 20.1229 17.125 20.1868L15.0938 22.2642C15.0312 22.3281 15 22.4063 15 22.4986V22.8182ZM28.3333 28.2727C28.3333 27.9034 28.2014 27.5838 27.9375 27.3139C27.6736 27.044 27.3611 26.9091 27 26.9091C26.6389 26.9091 26.3264 27.044 26.0625 27.3139C25.7986 27.5838 25.6667 27.9034 25.6667 28.2727C25.6667 28.642 25.7986 28.9616 26.0625 29.2315C26.3264 29.5014 26.6389 29.6364 27 29.6364C27.3611 29.6364 27.6736 29.5014 27.9375 29.2315C28.2014 28.9616 28.3333 28.642 28.3333 28.2727ZM31 16.6818V27.5909C31 27.6974 30.9861 27.7915 30.9583 27.8732C30.9306 27.9549 30.8837 28.0206 30.8177 28.0703C30.7517 28.12 30.6944 28.1609 30.6458 28.1928C30.5972 28.2248 30.5156 28.2461 30.401 28.2567C30.2865 28.2674 30.2083 28.2745 30.1667 28.2781C30.125 28.2816 30.0365 28.2816 29.901 28.2781C29.7656 28.2745 29.6875 28.2727 29.6667 28.2727C29.6667 29.0256 29.4062 29.6683 28.8854 30.201C28.3646 30.7337 27.7361 31 27 31C26.2639 31 25.6354 30.7337 25.1146 30.201C24.5938 29.6683 24.3333 29.0256 24.3333 28.2727H20.3333C20.3333 29.0256 20.0729 29.6683 19.5521 30.201C19.0312 30.7337 18.4028 31 17.6667 31C16.9306 31 16.3021 30.7337 15.7812 30.201C15.2604 29.6683 15 29.0256 15 28.2727H14.3333C14.3125 28.2727 14.2344 28.2745 14.099 28.2781C13.9635 28.2816 13.875 28.2816 13.8333 28.2781C13.7917 28.2745 13.7135 28.2674 13.599 28.2567C13.4844 28.2461 13.4028 28.2248 13.3542 28.1928C13.3056 28.1609 13.2483 28.12 13.1823 28.0703C13.1163 28.0206 13.0694 27.9549 13.0417 27.8732C13.0139 27.7915 13 27.6974 13 27.5909C13 27.4063 13.066 27.2464 13.1979 27.1115C13.3299 26.9766 13.4861 26.9091 13.6667 26.9091V23.5C13.6667 23.4432 13.6649 23.3189 13.6615 23.1271C13.658 22.9354 13.658 22.8004 13.6615 22.7223C13.6649 22.6442 13.6736 22.5217 13.6875 22.3548C13.7014 22.1879 13.724 22.0565 13.7552 21.9606C13.7865 21.8647 13.8351 21.7564 13.901 21.6357C13.967 21.5149 14.0451 21.4084 14.1354 21.3161L16.1979 19.2067C16.3299 19.0717 16.5052 18.9581 16.724 18.8658C16.9427 18.7734 17.1458 18.7273 17.3333 18.7273H19V16.6818C19 16.4972 19.066 16.3374 19.1979 16.2024C19.3299 16.0675 19.4861 16 19.6667 16H30.3333C30.5139 16 30.6701 16.0675 30.8021 16.2024C30.934 16.3374 31 16.4972 31 16.6818Z" fill="${color}"/>
  <path d="M22 57L28.9282 42.75H15.0718L22 57Z" fill="${color}"/>
  </svg>`;

    if (type == MARKER_TYPE.LANDFILL)
      return `<svg
          xmlns="http://www.w3.org/2000/svg"
          width="42"
          height="42"
          viewBox="0 0 42 42"
          fill="none"
        >
          <rect x="2" y="2" width="38" height="38" rx="19" fill="white" />
          <rect x="2" y="2" width="38" height="38" rx="19" stroke="#83C257" stroke-width="4" />
          <path
            d="M19.254 21.264C19.0586 21.264 18.8877 21.435 18.8877 21.6303C18.8877 21.8256 19.0586 21.9966 19.254 21.9966C19.4493 21.9966 19.6202 21.8256 19.6202 21.6303C19.6202 21.435 19.4493 21.264 19.254 21.264Z"
            fill="#83C257"
          />
          <path
            d="M29.7774 28.8578C29.9727 28.8578 30.1437 28.6868 30.1437 28.4915C30.1437 28.2962 29.9727 28.1252 29.7774 28.1252C29.5821 28.1252 29.4111 28.2962 29.4111 28.4915C29.4111 28.6868 29.5576 28.8578 29.7774 28.8578Z"
            fill="#83C257"
          />
          <path
            d="M17.0323 28.1497C16.8369 28.1497 16.666 28.3206 16.666 28.5159C16.666 28.7113 16.8369 28.8822 17.0323 28.8822C17.2276 28.8822 17.3985 28.7113 17.3985 28.5159C17.3985 28.3206 17.2276 28.1497 17.0323 28.1497Z"
            fill="#83C257"
          />
          <path
            d="M19.7178 25.3173C19.5225 25.3173 19.3516 25.4882 19.3516 25.6835C19.3516 25.8789 19.5225 26.0498 19.7178 26.0498C19.9132 26.0498 20.0841 25.8789 20.0841 25.6835C20.0841 25.4882 19.9132 25.3173 19.7178 25.3173Z"
            fill="#83C257"
          />
          <path
            d="M31.6337 22.0942C31.8291 22.0942 32 21.9233 32 21.7279V17.6502C32 17.6258 32 17.6014 32 17.5526L31.3652 14.9888C31.121 13.9632 30.4861 13.3528 29.6559 13.3528H24.5527C24.3574 13.3528 24.1865 13.5237 24.1865 13.7191V19.4815H22.3796L21.5006 17.577L22.9168 16.9666C23.0144 16.9177 23.0877 16.8445 23.1121 16.7712C23.1365 16.6736 23.1365 16.5759 23.1121 16.5026L21.1587 11.9854C21.061 11.7413 20.8413 11.5459 20.5971 11.4483C20.3529 11.3506 20.0599 11.3506 19.8158 11.4483L13.5161 14.1342C13.0033 14.3539 12.7592 14.9643 12.9789 15.4771L13.0522 15.6724C12.7103 15.648 12.3685 15.7457 12.0755 15.9655C11.6604 16.2585 11.4406 16.6736 11.3918 17.1619C11.1476 17.1375 10.9034 17.1863 10.6837 17.3084C10.2686 17.5282 10.0244 17.9921 10.0244 18.456C10.0244 18.7979 10.1709 19.1153 10.3663 19.3595C10.1465 19.6525 10.0244 19.9943 10.0244 20.3606C10.0244 21.264 10.7569 21.9721 11.636 21.9721C12.515 21.9721 13.2475 21.2396 13.2475 20.3606C13.2475 20.2629 13.2475 20.1408 13.2231 20.0431C13.5405 20.0187 13.8579 19.8966 14.1509 19.7013C14.3219 19.5792 14.4684 19.4327 14.5905 19.2618L14.8835 19.9455V21.7279C14.8835 21.9233 15.0544 22.0942 15.2497 22.0942H17.1787C17.2519 22.436 17.4229 22.7535 17.6426 22.9976H16.9589C15.7869 22.9976 14.737 22.9976 14.1265 24.2673C13.6382 24.072 13.0522 24.0964 12.5394 24.365C11.929 24.658 11.5627 25.244 11.4895 25.9033C11.1232 25.9521 10.8058 26.0986 10.5616 26.3428C10.1953 26.7091 10 27.2951 10 28.052V30.4205C10 30.6158 10.1709 30.7868 10.3663 30.7868H31.6093C31.8047 30.7868 31.9756 30.6158 31.9756 30.4205V23.3883C31.9756 23.193 31.8047 23.0221 31.6093 23.0221H29.6804C29.9001 22.7535 30.071 22.4605 30.1443 22.1186H31.6337V22.0942ZM30.657 15.1841L31.1698 17.284H27.5072V14.1097H29.6559C30.2908 14.1097 30.5594 14.769 30.657 15.1841ZM24.919 14.1097H26.7747V17.6502C26.7747 17.8456 26.9456 18.0165 27.141 18.0165H31.2675V19.0909H30.5838C30.3885 19.0909 30.2175 19.2618 30.2175 19.4571C30.2175 19.6525 30.3885 19.8234 30.5838 19.8234H31.2675V21.3617H30.1931C30.071 20.3117 29.1676 19.506 28.0932 19.506C27.0189 19.506 26.1154 20.3117 25.9933 21.3617H24.919V14.1097ZM21.3296 22.0942H26.0422C26.1154 22.436 26.2863 22.7535 26.5061 22.9976H20.8657C21.0855 22.7535 21.232 22.436 21.3296 22.0942ZM24.1865 21.3617H21.3541C21.3052 20.9222 21.1099 20.5315 20.8413 20.2385H24.1865V21.3617ZM21.5738 19.506H17.0322L20.8413 17.87L21.5738 19.506ZM13.8091 14.8178L20.1088 12.1075C20.1576 12.0831 20.182 12.0831 20.2309 12.0831C20.2797 12.0831 20.3041 12.0831 20.3529 12.1075C20.4262 12.1319 20.475 12.1808 20.5239 12.254L22.2819 16.4294L15.4451 19.3839L13.6382 15.2085C13.5893 15.062 13.6382 14.8667 13.8091 14.8178ZM13.7358 19.0909C13.4428 19.2862 13.101 19.3595 12.7592 19.2618C12.6127 19.213 12.4417 19.2862 12.3685 19.4083C12.2708 19.5304 12.2952 19.7013 12.3685 19.8234C12.4661 19.9699 12.5394 20.1408 12.5394 20.3362C12.5394 20.8245 12.1487 21.2152 11.6604 21.2152C11.172 21.2152 10.7569 20.8489 10.7569 20.3606C10.7569 20.0676 10.879 19.799 11.1232 19.6525C11.2209 19.5792 11.2941 19.4571 11.2697 19.335C11.2453 19.213 11.172 19.0909 11.0744 19.042C10.9034 18.9444 10.7569 18.6758 10.7569 18.456C10.7569 18.2363 10.8546 18.0653 11.0499 17.9677C11.2209 17.87 11.4406 17.87 11.636 17.9921C11.758 18.0898 11.929 18.0653 12.0511 17.9921C12.1731 17.8944 12.222 17.7479 12.1731 17.6014C12.0266 17.1375 12.2708 16.7712 12.515 16.6003C12.7836 16.405 13.1254 16.405 13.4428 16.6003L14.2242 18.3828C14.1509 18.6514 13.98 18.9199 13.7358 19.0909ZM15.6404 20.2385H17.667C17.3984 20.5559 17.2031 20.9466 17.1543 21.3617H15.6404V20.2385ZM17.8624 21.6303C17.8624 20.8733 18.4972 20.2385 19.2542 20.2385C20.0111 20.2385 20.6459 20.8733 20.6459 21.6303C20.6459 22.3872 20.0355 23.0221 19.2542 23.0221C18.4972 23.0221 17.8624 22.3872 17.8624 21.6303ZM11.8557 26.6358C11.9778 26.6358 12.0511 26.587 12.1243 26.5137C12.1976 26.4405 12.222 26.3428 12.222 26.2451C12.1731 25.4882 12.6127 25.1708 12.8568 25.0243C13.2719 24.8289 13.7847 24.8534 14.0777 25.0975C14.1754 25.1708 14.2974 25.1952 14.4195 25.1708C14.5416 25.1464 14.6393 25.0487 14.6637 24.9266C15.03 23.8767 15.5671 23.7546 16.5927 23.7546C16.4706 27.0509 14.5172 27.7102 11.2453 27.7102H10.7814C10.8302 27.3439 10.9279 27.0753 11.0988 26.88C11.2697 26.7091 11.5139 26.6114 11.8557 26.6358ZM31.2675 30.0787H10.7569V28.4427H11.2453C14.3219 28.4427 17.1787 27.8567 17.3252 23.7546H31.2675V30.0787ZM26.7014 21.6303C26.7014 20.8733 27.3363 20.2385 28.0932 20.2385C28.8502 20.2385 29.485 20.8733 29.485 21.6303C29.485 22.3872 28.8502 23.0221 28.0932 23.0221C27.3363 23.0221 26.7014 22.3872 26.7014 21.6303Z"
            fill="#83C257"
          />
          <path
            d="M15.7623 15.9654C15.8111 15.9654 15.86 15.9654 15.9088 15.941L19.4493 14.4027C19.6446 14.3295 19.7179 14.1097 19.6446 13.9144C19.5714 13.719 19.3516 13.6458 19.1563 13.719L15.6158 15.2573C15.4204 15.3306 15.3472 15.5503 15.4204 15.7457C15.4937 15.8677 15.6158 15.9654 15.7623 15.9654Z"
            fill="#83C257"
          />
          <path
            d="M16.178 17.4549C16.2268 17.6014 16.3733 17.6746 16.5198 17.6746C16.5686 17.6746 16.6175 17.6746 16.6663 17.6502L20.2068 16.1119C20.4022 16.0387 20.4754 15.8189 20.4022 15.6236C20.3289 15.4283 20.1092 15.355 19.9138 15.4283L16.3733 16.9665C16.178 17.0398 16.0803 17.2596 16.178 17.4549Z"
            fill="#83C257"
          />
          <path
            d="M27.4581 25.5859C27.2627 25.5859 27.0918 25.7569 27.0918 25.9522C27.0918 26.1475 27.2627 26.3185 27.4581 26.3185C27.6534 26.3185 27.8243 26.1475 27.8243 25.9522C27.8243 25.7569 27.6534 25.5859 27.4581 25.5859Z"
            fill="#83C257"
          />
          <path
            d="M22.3311 27.3439C22.1358 27.3439 21.9648 27.5148 21.9648 27.7101C21.9648 27.9055 22.1358 28.0764 22.3311 28.0764C22.5264 28.0764 22.6974 27.9055 22.6974 27.7101C22.6974 27.5148 22.5264 27.3439 22.3311 27.3439Z"
            fill="#83C257"
          />
          <path
            d="M26.4571 27.7102C26.2617 27.7102 26.0908 27.8811 26.0908 28.0765C26.0908 28.2718 26.2617 28.4427 26.4571 28.4427C26.6524 28.4427 26.8233 28.2718 26.8233 28.0765C26.8233 27.8811 26.6524 27.7102 26.4571 27.7102Z"
            fill="#83C257"
          />
          <path
            d="M28.0938 21.264C27.8985 21.264 27.7275 21.435 27.7275 21.6303C27.7275 21.8256 27.8985 21.9966 28.0938 21.9966C28.2891 21.9966 28.4601 21.8256 28.4601 21.6303C28.4601 21.435 28.2891 21.264 28.0938 21.264Z"
            fill="#83C257"
          />
        </svg>`;

    if (type == MARKER_TYPE.GARAGE)
      return `<svg
          xmlns="http://www.w3.org/2000/svg"
          width="42"
          height="42"
          viewBox="0 0 42 42"
          fill="none"
        >
          <rect x="2" y="2" width="38" height="38" rx="19" fill="white" />
          <rect x="2" y="2" width="38" height="38" rx="19" stroke="#83C257" stroke-width="4" />
          <g clip-path="url(#clip0_7125_21036)">
            <path
              d="M31.7475 16.0962L21.2447 10.2619C21.0933 10.1761 20.9066 10.1761 20.7552 10.2619L10.2575 16.0962C10.096 16.187 10.0001 16.3536 10.0001 16.5352V31.3077C9.99504 31.5803 10.2121 31.8023 10.4846 31.8023C10.4896 31.8023 10.4947 31.8023 10.4947 31.8023H31.5052C31.7778 31.8074 31.9998 31.5904 31.9998 31.3178C31.9998 31.3128 31.9998 31.3077 31.9998 31.3077V16.5403C32.0049 16.3536 31.909 16.187 31.7475 16.0962ZM28.0682 30.798H13.9367V28.7287H28.0682V30.798ZM28.0682 27.7193H13.9367V25.8015H28.0682V27.7193ZM28.0682 24.7921H13.9367V22.8742H28.0682V24.7921ZM28.0682 21.8648H13.9367V19.947H28.0682V21.8648ZM30.9955 30.798H29.0776V19.4574C29.0776 19.1799 28.8707 18.9376 28.5881 18.9376H13.4169C13.1393 18.9376 12.9273 19.1799 12.9273 19.4574V30.798H11.0095V16.833L21.0025 11.2763L30.9955 16.833V30.798Z"
              fill="#83C257"
            />
          </g>
          <defs>
            <clipPath id="clip0_7125_21036">
              <rect width="22" height="22" fill="white" transform="translate(10 10)" />
            </clipPath>
          </defs>
        </svg>`;

    if (type == MARKER_TYPE.ILL)
      return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <g id="그룹_22163" data-name="그룹 22163" transform="translate(-1214 -449)">
                  <g id="타원_214" data-name="타원 214" transform="translate(1214 449)" fill="#fff" stroke="${color}" stroke-width="5">
                    <circle cx="20" cy="20" r="20" stroke="none"/>
                    <circle cx="20" cy="20" r="17.5" fill="none"/>
                  </g>
                  <g id="그룹_22162" data-name="그룹 22162" transform="translate(0 -1)">
                    <rect id="사각형_8995" data-name="사각형 8995" width="4" height="12" transform="translate(1232 461)" fill="${color}"/>
                    <rect id="사각형_8996" data-name="사각형 8996" width="4" height="4" transform="translate(1232 475)" fill="${color}"/>
                  </g>
                </g>
              </svg>`;
    if (type == MARKER_TYPE.ILL_C)
      return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40" viewBox="0 0 40 40">
                <g id="그룹_22163" data-name="그룹 22163" transform="translate(-1214 -449)">
                  <g id="타원_214" data-name="타원 214" transform="translate(1214 449)" fill="#fff" stroke="${color}" stroke-width="5">
                    <circle cx="20" cy="20" r="20" stroke="none"/>
                    <circle cx="20" cy="20" r="17.5" fill="none"/>
                  </g>
                  <g id="그룹_22161" data-name="그룹 22161" transform="translate(-152 -15)">
                    <circle id="타원_216" data-name="타원 216" cx="8" cy="8" r="8" transform="translate(1390 464)" fill="#555"/>
                    <image id="check-fff" width="8" height="6.235" transform="translate(1394 469)" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAAA1CAYAAAD4bU3WAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAydpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMS1jMDAxIDc5LjE0NjI4OTk3NzcsIDIwMjMvMDYvMjUtMjM6NTc6MTQgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyNS4xIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5RjhFQkVDQzgxMDAxMUVFOEFBRUIxNkE1MzQxRjlBNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5RjhFQkVDRDgxMDAxMUVFOEFBRUIxNkE1MzQxRjlBNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjlGOEVCRUNBODEwMDExRUU4QUFFQjE2QTUzNDFGOUE3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjlGOEVCRUNCODEwMDExRUU4QUFFQjE2QTUzNDFGOUE3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Dk8c2gAAAZRJREFUeNrs2q9Pw0AUB/C7hCAQYIZDIkEPRzLB/4KYn5+g/w4EhZglTIDAESQOwwyKpHwb2nRb2K/re+29d++bfFOxrNd9crk1vTqnPHmen6Iv6LlLPSXGR/6Xz6RRljDypFFWYKSJsgGjyhfaN4zFzFSj4Med7YChG6VYE8q1ISS6UBpi6EIhwlhA8ZIxcJigPcLTPtvMqPOOnhiGYRjGurwFY+CLF8owXtHj0AvKypNcG0aNUWXYIka/vD+IFqPKyDBaRJGIwYYiGYMcRQMGGYomjMYoGjGCUTRj7IzChPEUjIHsodTPRG5wQc57n23CwOEBPSQce4peYexZ0wWNepasnSn47JJpZhxR/v9zoIz/GWeAfkeNwYySicTgRhGJwYzyIxKDGUUmRuQo3WBEitItRmQoj1FgzKGMO8SYoAcxbgWMDKNblLgxWkaRgdESiiwMZhSZGEwosjGIUXRgEKHowmiIohMjEOVeNcYcynALjDt036WS4l0Sw9gOJU2MFShpYyyh3ErA8MUum6XOrwADAKOZGaZoT4l/AAAAAElFTkSuQmCC"/>
                  </g>
                  <g id="그룹_22162" data-name="그룹 22162" transform="translate(0 -1)">
                    <rect id="사각형_8995" data-name="사각형 8995" width="4" height="12" transform="translate(1232 461)" fill="${color}"/>
                    <rect id="사각형_8996" data-name="사각형 8996" width="4" height="4" transform="translate(1232 475)" fill="${color}"/>
                  </g>
                </g>
              </svg>`;
  };

  const getDetailContent = (id: string, type: string, data: any) => {
    try {
      if (type == MARKER_TYPE.CAR)
        return `<div class="overlay-detail ${id}"></div><div class="carModal pcExample" style="top: 0; left: -10px">
            <button tabindex="0" type="button" class="buttonCloseMapModal active ${id}" title="영역 닫기"></button>
    
            <div class="carModalContent">
              <div class="carBox1">
                <div class="carBox1-title">
                    <div class="label"><strong>${
                      data?.vehicleInfo?.[0]?.vehicle_number || '--'
                    }</strong></div>
                    <div class="value"><strong>${
                      getDriveState(data?.routeData?.drive_mode)?.name || '--'
                    }</strong></div>
                </div>
                <div class="carBox1-content">
                  <div class="item">
                    <div class="label">최종업데이트</div>
                    <div class="value"><strong>${
                      dayjs(data?.routeData?.[0]?.updated_at).fromNow() || '--'
                    }</strong></div>
                  </div>
                  <div class="item">
                    <div class="label">오늘 배차</div>
                    <div class="value"><strong>${data?.routeData?.route_name || '--'}</strong></div>
                  </div>
                  <div class="item">
                    <div class="label">현재 위치</div>
                    <div class="value"><strong>${data?.currentLocation || '--'}</strong></div>
                  </div>
                </div>
              </div>
    
              <div class="wrapper">
                <div class="carBox2">
  
                  ${data?.detailDriveMetric
                    ?.map(
                      (item: any) => `<div class="item">
                            <div class="row top">
                              <div class="col1"><strong>${dayjs(item?.start_time).format(
                                'HH:mm'
                              )}</strong> ${dayjs(item?.start_time).format('A')}</div>
                              <div class="col2"><figure style="background-image: url(${
                                getDriveState(item?.drive_mode)?.icon
                              })"></figure></div>
                              <div class="col3"><strong>${
                                getDriveState(item?.drive_mode)?.name
                              }</strong></div>
                              <div class="col4"></div>
                            </div>
                            
                            <div class="row bottom">
                              <div class="col1"></div>
                              <div class="col2"><figure>
                              <svg width="25" height="67" viewBox="0 0 25 67" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M18.0003 0H6.00033V46H0L12.1244 67L24.2487 46H18.0003V0Z" fill="${
                                  getDriveState(item?.drive_mode)?.color
                                }"/>
                              </svg>

                              </figure></div>
                              <div class="col3">
                                <div class="status"><strong>이동 거리: ${
                                  item?.total_distance
                                }km</strong></div>
                                <div class="time">기간 min: ${item?.total_time}</div>
                              </div>
                              <div class="col4"></div>
                            </div>
                          </div>`
                    )
                    ?.join('')}
         
                </div>

                <div class="point">
                    <div class="point-title">
                        <p class="point-title-text">총 이동 거리</p>
                        <p class="point-title-value">${data?.totals?.trip_distance || '--'} km</p>
                    </div>
                    <a href="${
                      window.location.protocol +
                      '/admin/operation-analysis' +
                      window.location.search +
                      (window.location.search ? '&' : '?') +
                      'routeName=' +
                      data?.routeData?.route_name +
                      '&date=' +
                      data?.routeData?.date
                    }" class="point-icon"">
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13 9.5C15.4853 9.5 17.5 7.48528 17.5 5C17.5 2.51472 15.4853 0.5 13 0.5C10.5147 0.5 8.5 2.51472 8.5 5C8.5 7.48528 10.5147 9.5 13 9.5ZM13 9.5V14.5M12.8123 14.1096L17.8123 18.1096M8.18765 18.1096L13.1877 14.1096M25.5 21C25.5 23.4853 23.4853 25.5 21 25.5C18.5147 25.5 16.5 23.4853 16.5 21C16.5 18.5147 18.5147 16.5 21 16.5C23.4853 16.5 25.5 18.5147 25.5 21ZM9.5 21C9.5 23.4853 7.48528 25.5 5 25.5C2.51472 25.5 0.5 23.4853 0.5 21C0.5 18.5147 2.51472 16.5 5 16.5C7.48528 16.5 9.5 18.5147 9.5 21Z" stroke="#FF2E91"/>
</svg>

                    </a>

                </div>
              </div>

              <div class="carBox3">
                <figure></figure>
                <div class="info">
                  <div class="title">
                    <div class="km">총 이동 거리: ${data?.totals?.trip_distance || '--'} km</div>
                  </div>
                  <div class="desc">총 시간: ${data?.totals?.trip_time || '--'}</div>
                </div>
              </div>
            </div>
          </div>`;

      if (type == MARKER_TYPE.ILL || type == MARKER_TYPE.ILL_C)
        return `<div class="overlay-detail ${id}"></div> <div class="mapModal" >
          <button tabindex="0" type="button" class="buttonCloseMapModal active ${id}" title="영역 닫기"></button>
          <div class="mmBox1 status4"><!-- status5 : 녹색, status4 노랑색, status2 빨강색 -->
            <div class="row row1">
              <div class="carNum">
                <span>${data?.address}</span>
                <div class="carNum-tooltip">${data?.address}</div>
              </div>
                
              <!-- carStatus5 : 녹색, carStatus4 노랑색, carStatus2 빨강색 -->
              <div class="carStatus carStatus4 noIcon">
                <span>
                    <span class="boxNum">${data?.classification || '--'}</span>
                    <span class="no-wrap"> 
                    ${COLLECT_STATUS[data?.classification as keyof typeof COLLECT_STATUS] || '--'}
                    </span>
                  </span>
              </div>
            </div>
            <div class="row row1">
              <div class="t1">생성</div>
              <div class="t2">${
                data?.produce ? dayjs(data?.produce).format(DATE_FORMAT.DATE_YT) : '--'
              }</div>
            </div>
            <div class="row row1">
              <div class="t1">수거</div>
              <div class="t2">${
                data?.collection ? dayjs(data?.collection).format(DATE_FORMAT.DATE_YT) : '--'
              }</div>
            </div>
          </div>
        
          <div class="mmBox2">
            <div class="mmBox2Inside type2">
              <div class="row space-between">
                <div class="t1">생성-수거 시간</div>
                <div class="t2">${data?.hour ? data?.hour + '시간' : '--'} </div>
              </div>
            </div>
          </div>
        </div>`;

      return '';
    } catch (error) {
      console.log(error);
      return '';
    }
  };

  return {
    navermaps,
    defaultConfig,
    getCurrentLocation,
    onZoomIn,
    onZoomOut,
    getMarkderIcon,
    getDetailContent,
  };
}
