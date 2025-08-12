import { BaseBadgeProps } from '@/components/common/base-badge';
import { NotificationType } from '@/components/common/base-notification';
import { DATE_FORMAT, Priority, ROUTER_PATH } from '@/constants';
import { currencies } from '@/constants';
import { JOBCONTRACT_EN, JOBCONTRACT_KR, PURPOSE_EN, PURPOSE_KR } from '@/constants/settings';
import { notificationController } from '@/controllers/notification';
import { CurrencyTypeEnum, Severity } from '@/interfaces';
import { sidebarNavigation } from '@/layouts/admin-layout/sider-menu/menu.utils';
import { FormInstance, notification } from 'antd';
import { StoreValue } from 'antd/es/form/interface';
import dayjs, { ManipulateType, OpUnitType } from 'dayjs';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export const validateEndDate = (form: FormInstance, value: StoreValue, customMsg?: string) => {
  const startDate = form.getFieldValue('start_date');
  if (value && startDate && value.isBefore(startDate, 'day')) {
    return Promise.reject(customMsg || '유효한 기간을 선택해 주세요.');
  } else {
    form.setFields([{ name: 'start_date', errors: [] }]);
  }
  return Promise.resolve();
};

export const validateStartDate = (form: FormInstance, value: StoreValue, customMsg?: string) => {
  const endDate = form.getFieldValue('end_date');
  if (value && endDate && value.isAfter(endDate, 'day')) {
    return Promise.reject(customMsg || '유효한 기간을 선택해 주세요.');
  } else {
    form.setFields([{ name: 'end_date', errors: [] }]);
  }
  return Promise.resolve();
};

export const camelize = (string: string): string => {
  return string
    .split(' ')
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1)
    )
    .join('');
};

export const getCurrencyPrice = (
  price: number | string,
  currency: CurrencyTypeEnum,
  isIcon = true
): string => {
  const currencySymbol = currencies[currency][isIcon ? 'icon' : 'text'];

  return isIcon ? `${currencySymbol}${price}` : `${price} ${currencySymbol}`;
};

type MarkArea = {
  xAxis: number;
};

export const getMarkAreaData = (data: string[] | number[]): MarkArea[][] =>
  data.map((el, index) => [
    {
      xAxis: 2 * index,
    },
    {
      xAxis: 2 * index + 1,
    },
  ]);

export const capitalize = (word: string): string => `${word[0].toUpperCase()}${word.slice(1)}`;

export const hexToRGB = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  return `${r}, ${g}, ${b}`;
};

export const getDifference = (value: number, prevValue: number): string | null =>
  prevValue !== 0 ? `${((Math.abs(value - prevValue) / prevValue) * 100).toFixed(0)}%` : '100%';

export const normalizeProp = (prop: string | number | [number, number]): string =>
  typeof prop === 'number'
    ? `${prop}px`
    : (Array.isArray(prop) && `${prop[0]}px ${prop[1]}px`) || prop.toString();

export const defineColorByPriority = (priority: Priority): string => {
  switch (priority) {
    case Priority.INFO:
      return 'var(--primary-color)';
    case Priority.LOW:
      return 'var(--success-color)';
    case Priority.MEDIUM:
      return 'var(--warning-color)';
    case Priority.HIGH:
      return 'var(--error-color)';
    default:
      return 'var(--success-color)';
  }
};

export const defineColorBySeverity = (
  severity: NotificationType | undefined,
  rgb = false
): string => {
  const postfix = rgb ? 'rgb-color' : 'color';
  switch (severity) {
    case 'error':
    case 'warning':
    case 'success':
      return `var(--${severity}-${postfix})`;
    case 'info':
    default:
      return `var(--primary-${postfix})`;
  }
};

export const mergeBy = (a: any[], b: any[], key: string): any[] =>
  a.filter((elem) => !b.find((subElem) => subElem[key] === elem[key])).concat(b);

export const getSmoothRandom = (factor: number, start: number): number => {
  const halfEnvelope = 1 / factor / 2;
  const max = Math.min(1, start + halfEnvelope);
  const min = Math.max(0, start - halfEnvelope);

  return Math.random() * (max - min) + min;
};

export const shadeColor = (color: string, percent: number): string => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = parseInt(((R * (100 + percent)) / 100).toString());
  G = parseInt(((G * (100 + percent)) / 100).toString());
  B = parseInt(((B * (100 + percent)) / 100).toString());

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  const RR = R.toString(16).length == 1 ? '0' + R.toString(16) : R.toString(16);
  const GG = G.toString(16).length == 1 ? '0' + G.toString(16) : G.toString(16);
  const BB = B.toString(16).length == 1 ? '0' + B.toString(16) : B.toString(16);

  return '#' + RR + GG + BB;
};

export const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (result) {
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
    (r /= 255), (g /= 255), (b /= 255);
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;
    if (max == min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          h = 0;
      }
      h /= 6;
    }
    return {
      h,
      s,
      l,
    };
  } else {
    throw new Error('Non valid HEX color');
  }
};

export const formatNumberWithCommas = (value: number): string => {
  return !isNaN(value) ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
};

export const msToH = (ms: number): number => Math.floor(ms / 3600000);

export const hToMS = (h: number): number => h * 3600000;

export const mapBadgeStatus = (status: BaseBadgeProps['status']): Severity => {
  if (!status || status === 'default' || status === 'processing') {
    return 'info';
  }
  return status;
};
export const scrollTo = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    window.scrollTo({
      top: element.offsetTop,
      behavior: 'smooth',
    });
  }
};

export const validateEmoji = (value: string) => {
  const regex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E0}-\u{1F1FF}]/gu;
  return regex.test(value);
};

export const deleteEmojiChar = (value: string) => {
  const regex = /[\p{Emoji_Presentation}]/u;
  if (!value.match(regex)) return value;
  const withoutKoreanChar = value.split('');
  value.match(regex)?.forEach((koreanChar) => {
    withoutKoreanChar.filter((char) => char !== koreanChar);
  });
  return withoutKoreanChar.join('');
  // return value.split("").filter((char: string) => !validateEmoji(char)).join("");
};

export const validateKoreanChar = (value: string) => {
  const regex = /[\u3131-\uD79D]/giu;
  return value.match(regex) === null;
};

export const deleteKoreanChar = (value: string) => {
  const regex = /[\u3131-\uD79D]/giu;
  if (!value.match(regex)) return value;
  const withoutKoreanChar = value
    .split('')
    .filter((char) => !value.match(regex)?.includes(char))
    .join('');
  return withoutKoreanChar;
};

export const deleteSpaceChar = (value: string) => {
  return value
    .split('')
    .filter((char: string) => char !== ' ')
    .join('');
};

export const deleteViolateChar = (value: string) => {
  return deleteKoreanChar(deleteEmojiChar(deleteSpaceChar(value)));
};

export const formatPhoneNumber = (value: string) => {
  const phoneRegex = /^(0|\+)[0-9]{7,}$/;
  return phoneRegex.test(value);
};

export const preventSpaceAndLetters = (event: any) => {
  const charCode = event.which ? event.which : event.keyCode;
  if ((charCode < 48 || charCode > 57) && charCode !== 43) {
    event.preventDefault();
  }
};

export const preventSpecialCharacters = (event: any) => {
  const regex = new RegExp('^[a-zA-Z0-9]+$');
  const str = String.fromCharCode(!event.charCode ? event.which : event.charCode);

  if (regex.test(str) || event.charCode === 45 || event.charCode === 95) {
    return true;
  }

  event.preventDefault();
  return false;
};

export const validateFirstLetter = (value: string) => {
  const regex = new RegExp(/^[A-Za-z]+$/);
  const firstLetter = Array.from(value)[0];
  return regex.test(firstLetter);
};

export const getLabel = () => {
  const pathName = document.location.pathname;

  return sidebarNavigation.find((item) => pathName.includes(item.url))?.title || '';
};

export const checkPattern = (value: string): boolean => {
  const regex =
    /^\d{2,3}(가|나|다|라|마|거|너|더|러|머|버|서|어|저|고|노|도|로|모|보|소|오|조|구|누|두|루|무|부|수|우|주)\d{4}$/;
  return regex.test(value);
};

export const subString = (str: any, maxLength: number = 15): string => {
  let newStr = '';
  if (str?.length <= maxLength) {
    newStr = str;
  } else {
    newStr = str?.substring(0, maxLength) + '...';
  }

  return newStr;
};

export const formatPassword = (value: string) =>
  value.replace(/[^\u0020-\u007E]+/g, '').replace(/\s+/g, '');

export const formatPhone = (value: string): string => {
  const cleanedValue = value.replace(/[^0-9+]/g, '');
  if (cleanedValue.startsWith('+')) {
    return '+' + cleanedValue.slice(1).replace(/[^0-9]/g, '');
  } else {
    return cleanedValue.replace(/[^0-9]/g, '');
  }
};

export const validateEmojiRegex = (value: string) => {
  const emojiRegex = /([\uD800-\uDBFF][\uDC00-\uDFFF])|[\u2600-\u26FF]/;
  if (emojiRegex.test(value)) {
    return Promise.reject('유효하지 않은 문자입니다. 다시 시도해 주세요!');
  } else {
    return Promise.resolve();
  }
};

export const validateMacAddress = (value: string) => {
  const macRegex1 = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/;

  return macRegex1.test(value) && value.length == 17;
};

export const getFileName = (value: string) => {
  const urlElements = value?.split('/');
  if (urlElements?.length) {
    const fileId = urlElements[urlElements?.length - 1];
    const fileName = fileId.split('.pdf')[0];
    return fileName ?? '';
  }
  return '';
};

export const preventLettersMacAddress = (event: any) => {
  const regex = /^[0-9a-fA-F:]$/;
  const str = String.fromCharCode(!event.charCode ? event.which : event.charCode);

  if (regex.test(str)) {
    return;
  }
  event.preventDefault();
};

export const customDateFormatKorea = (value: any): string => {
  return value ? dayjs(value).format(DATE_FORMAT.DATE_KOREA) : '';
};

export const detectDate = (type: OpUnitType) => {
  if (!type)
    return {
      startDate: dayjs().format(DATE_FORMAT.R_BASIC),
      endDate: dayjs().format(DATE_FORMAT.R_BASIC),
      startDatePrev: dayjs().subtract(1, 'day').format(DATE_FORMAT.R_BASIC),
      endDatePrev: dayjs().subtract(1, 'day').format(DATE_FORMAT.R_BASIC),
    };
  return {
    startDate: dayjs().startOf(type).format(DATE_FORMAT.R_BASIC),
    endDate: dayjs().format(DATE_FORMAT.R_BASIC),
    startDatePrev: dayjs()
      .subtract(1, type as ManipulateType)
      .startOf(type)
      .format(DATE_FORMAT.R_BASIC),
    endDatePrev: dayjs()
      .subtract(1, type as ManipulateType)
      .endOf(type)
      .format(DATE_FORMAT.R_BASIC),
  };
};

export const truncateName = (name: string | undefined, maxLength: number): string => {
  if (!name) return '';
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

export const renderJobContract = (job_contract: string) => {
  switch (job_contract) {
    case JOBCONTRACT_EN.DRIVING_CREW_REGULAR:
      return JOBCONTRACT_KR.DRIVING_CREW_REGULAR;
    case JOBCONTRACT_EN.COLLECT_CREW_REGULAR:
      return JOBCONTRACT_KR.COLLECT_CREW_REGULAR;
    case JOBCONTRACT_EN.SUPPORT_CREW_REGULAR:
      return JOBCONTRACT_KR.SUPPORT_CREW_REGULAR;
    case JOBCONTRACT_EN.COLLECT_CREW_MONTHLY:
      return JOBCONTRACT_KR.COLLECT_CREW_MONTHLY;
    case JOBCONTRACT_EN.COLLECT_CREW_FIXED_TERM:
      return JOBCONTRACT_KR.COLLECT_CREW_FIXED_TERM;
    case JOBCONTRACT_EN.SUPPORT_CREW_FIXED_TERM:
      return JOBCONTRACT_KR.SUPPORT_CREW_FIXED_TERM;
    case JOBCONTRACT_EN.MECHANIC_REGULAR:
      return JOBCONTRACT_KR.MECHANIC_REGULAR;
    case JOBCONTRACT_EN.OFFICE_CREW_REGULAR:
      return JOBCONTRACT_KR.OFFICE_CREW_REGULAR;
    case JOBCONTRACT_EN.MANAGER_REGULAR:
      return JOBCONTRACT_KR.MANAGER_REGULAR;
    default:
      break;
  }
};

export const renderPurpose = (purpose: string) => {
  switch (purpose) {
    case PURPOSE_EN.COMPOSITE_REGULAR:
      return PURPOSE_KR.COMPOSITE_REGULAR;
    case PURPOSE_EN.COMPOSITE_SUPPORT:
      return PURPOSE_KR.COMPOSITE_SUPPORT;
    case PURPOSE_EN.FOOD_REGULAR:
      return PURPOSE_KR.FOOD_REGULAR;
    case PURPOSE_EN.FOOD_SUPPORT:
      return PURPOSE_KR.FOOD_SUPPORT;
    case PURPOSE_EN.REUSABLE_REGULAR:
      return PURPOSE_KR.REUSABLE_REGULAR;
    case PURPOSE_EN.REUSABLE_SUPPORT:
      return PURPOSE_KR.REUSABLE_SUPPORT;
    case PURPOSE_EN.TATICAL_MOBILITY_REGULAR:
      return PURPOSE_KR.TATICAL_MOBILITY_REGULAR;
    case PURPOSE_EN.TATICAL_MOBILITY_SUPPORT:
      return PURPOSE_KR.TATICAL_MOBILITY_SUPPORT;
    default:
      break;
  }
};

export const getOrdinalSuffix = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const formatNumber = (value: number | string) => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat().format(value);
  }
  return value;
};

export const copyImageToClipboard = async (elementRef: HTMLDivElement | null): Promise<void> => {
  try {
    if (!elementRef) return;
    const dataUrl = await toPng(elementRef, { quality: 1.0 });
    const img = new Image();

    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          navigator.clipboard.write([item]);
          notificationController(notification).success({
            message: 'Screenshot copied to clipboard',
          });
        }
      });
    };
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error);
  }
};

export const exportToPDF = async (
  contentRef: HTMLDivElement | null,
  fileName: string = 'export.pdf'
) => {
  if (contentRef) {
    const dataUrl = await toPng(contentRef, { quality: 1.0 });
    const img = new Image();
    img.src = dataUrl;

    img.onload = () => {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;

      const imgRatio = img.width / img.height;
      const imgWidth = contentWidth;
      const imgHeight = imgWidth / imgRatio;

      let remainingHeight = imgHeight;
      let sourceY = 0;

      while (remainingHeight > 0) {
        const displayHeight = Math.min(remainingHeight, contentHeight);

        const canvas = document.createElement('canvas');
        const scale = img.width / imgWidth;
        canvas.width = img.width;
        canvas.height = displayHeight * scale;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(
          img,
          0,
          sourceY * scale,
          img.width,
          canvas.height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const newImageUrl = canvas.toDataURL('image/png');

        pdf.addImage(newImageUrl, 'PNG', margin, margin, imgWidth, displayHeight);

        remainingHeight -= displayHeight;
        sourceY += displayHeight;

        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }

      pdf.save(fileName);
    };
  }
};

export const exportToPDF2 = async (
  firstPageRef: HTMLDivElement | null,
  remainingTableRefs: HTMLDivElement[],
  fileName: string = 'export.pdf'
) => {
  if (!firstPageRef) return;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: false,
  });

  const firstPageDataUrl = await toPng(firstPageRef, {
    quality: 1.0,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
    style: {
      transform: 'scale(1)',
      transformOrigin: 'top left',
    },
  });

  const firstPageImg = new Image();
  firstPageImg.src = firstPageDataUrl;
  await new Promise((resolve) => {
    firstPageImg.onload = () => {
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 0;
      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;
      const imgRatio = firstPageImg.width / firstPageImg.height;
      const imgWidth = contentWidth;
      let imgHeight = imgWidth / imgRatio;

      if (imgHeight > contentHeight) {
        imgHeight = contentHeight;
        pdf.addImage(firstPageDataUrl, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      } else {
        pdf.addImage(
          firstPageDataUrl,
          'PNG',
          margin,
          margin,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
      }
      resolve(null);
    };
  });

  // Xử lý từng remaining page
  for (const tableRef of remainingTableRefs) {
    pdf.addPage();

    const tableDataUrl = await toPng(tableRef, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
      },
    });

    const tableImg = new Image();
    tableImg.src = tableDataUrl;

    await new Promise((resolve) => {
      tableImg.onload = () => {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 0;

        const contentWidth = pageWidth - 2 * margin;
        const imgRatio = tableImg.width / tableImg.height;
        const imgWidth = contentWidth;
        let imgHeight = imgWidth / imgRatio;

        pdf.addImage(tableDataUrl, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
        resolve(null);
      };
    });
  }

  pdf.save(fileName);
};

export const downloadFile = (data: Blob, fileName: string, onSuccess?: () => void) => {
  const href = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = href;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
  onSuccess && onSuccess();
};
export const isExcludedKey = (key: string) => {
  const excludedKeys = ['name', 'createdAt', 'updatedAt', 'key', 'deletedAt', 'type'];
  return excludedKeys.includes(key);
};
export const convertDataRoles = (roles: any) => {
  if (!roles || undefined) {
    return;
  }
  const conversionMap: Record<string, string> = {
    read: 'readAble',
    create: 'createAble',
    update: 'updateAble',
    delete: 'deleteAble',
    export: 'exportAble',
  };

  try {
    return Object.entries(roles).reduce((acc: any, [key, value]) => {
      if (typeof value === 'string') {
        const permissions = value.split(',');

        acc[key] = permissions
          .map((permission) => conversionMap[permission] || permission)
          .join(',');
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    console.error('Error converting roles:', error);
    return {};
  }
};

export const rolesRender = (rolesFinal: any) => {
  const permissionsRender = {
    [ROUTER_PATH.ADMIN_DASHBOARD]: rolesFinal?.dashboard,
    [ROUTER_PATH.ADMIN_WORKING_SCHEDULE]: rolesFinal?.work_shift,
    [ROUTER_PATH.ADMIN_REALTIME_ACTIVITY]: rolesFinal?.realtime_activity,
    [ROUTER_PATH.ADMIN_OPERATION_ANALYSIS]: rolesFinal?.operation_analysis,
    [ROUTER_PATH.ADMIN_ILLEGAL_DISPOSAL]: rolesFinal?.illegal_disposal,
    [ROUTER_PATH.ADMIN_DRIVING_DIARY]: rolesFinal?.driving_diary,
    [ROUTER_PATH.ADMIN_NOTIFICATION]: rolesFinal?.notification,
    [ROUTER_PATH.ADMIN_SETTINGS_USERS]: rolesFinal?.user_management,
    [ROUTER_PATH.ADMIN_SETTINGS_COMPANY_INFO]: rolesFinal?.company_management,
    [ROUTER_PATH.ADMIN_SETTINGS_STAFF]: rolesFinal?.staff_management,
    [ROUTER_PATH.ADMIN_SETTINGS_VEHICLES]: rolesFinal?.vehicle_management,
    [ROUTER_PATH.ADMIN_SETTINGS_EDGE_SERVERS]: rolesFinal?.updater_application_management,
    [ROUTER_PATH.ADMIN_SETTINGS_DISPATCH_AREAS]: rolesFinal?.route_management,
    [ROUTER_PATH.ADMIN_SETTINGS_ABSENCE]: rolesFinal?.absence_management,
  };
  return permissionsRender;
};

export const processRolesData = (data: any) => {
  return {
    ['/admin/dashboard']: { readAble: data?.dashboard.includes('read') },
    ['/admin/schedule']: { readAble: data?.work_shift.includes('read') },
    ['/admin/control-status']: { readAble: data?.realtime_activity.includes('read') },
    ['/admin/operation-analysis']: {
      readAble: data?.operation_analysis.includes('read'),
    },
    ['/admin/illegal-disposal']: { readAble: data?.illegal_disposal.includes('read') },
    ['/admin/driving-diary']: { readAble: data?.driving_diary.includes('read') },
    ['/admin/notification']: { readAble: data?.notification.includes('read') },
    ['/admin/settings']: { readAble: data?.user_management.includes('read') },
    ['/admin/settings/agency']: {
      readAble: data?.company_management.includes('read'),
    },
    ['/admin/settings/workers']: { readAble: data?.staff_management.includes('read') },
    ['/admin/settings/vehicle']: { readAble: data?.vehicle_management.includes('read') },
    ['/admin/settings/edge-server']: {
      readAble: data?.updater_application_management.includes('read'),
    },
    ['/admin/settings/locations']: {
      readAble: data?.route_management.includes('read'),
    },
    ['/admin/settings/absence']: { readAble: data?.absence_management.includes('read') },
  };
};

export const nameRoutePath = {
  dashboard: '/admin/dashboard',
  work_shift: '/admin/schedule',
  realtime_activity: '/admin/control-status',
  operation_analysis: '/admin/operation-analysis', // updated
  illegal_disposal: '/admin/illegal-disposal', // updated
  driving_diary: '/admin/driving-diary', // updated
  notification: '/admin/notification', // updated
  user_management: '/admin/settings', // updated
  company_management: '/admin/settings/agency', // updated
  staff_management: '/admin/settings/workers', // updated
  vehicle_management: '/admin/settings/vehicle', // updated
  updater_application_management: '/admin/settings/edge-server', // updated
  route_management: '/admin/settings/locations', // updated
  absence_management: '/admin/settings/absence',
};
