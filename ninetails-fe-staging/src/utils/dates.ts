import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/de';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import isBetween from 'dayjs/plugin/isBetween';
import localeData from 'dayjs/plugin/localeData';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(LocalizedFormat);
dayjs.extend(localeData);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

export type AppDate = Dayjs;

export class Dates {
  static setLocale(locale: string): void {
    dayjs.locale(locale);
  }

  static getToday(): AppDate {
    return dayjs();
  }

  static getClearDate(): AppDate {
    return this.getToday().hour(0).minute(0).second(0).millisecond(0);
  }

  static getMonths(): string[] {
    return dayjs.months();
  }

  static getDays(): string[] {
    return dayjs.weekdaysShort();
  }

  static getDate(date: number | string): AppDate {
    return dayjs(date);
  }

  static getGapTime(startTime: number | string): string {
    const currentTime = dayjs();

    const hoursGap = currentTime.diff(startTime, 'hour');
    const minutesGap = currentTime.diff(startTime, 'minute');
    const secondGap = currentTime.diff(startTime, 'second');

    if (secondGap < 60) {
      return `${secondGap > 0 ? secondGap : 1}초 전`;
    }
    if (minutesGap < 60) {
      return `${minutesGap}분 전`;
    }
    if (hoursGap < 24) {
      return `${hoursGap}시간 전`;
    }

    return this.format(startTime, 'DD/MM/YYYY');
  }

  static format(date: AppDate | string | number, query: string): string {
    if (!date) return '';
    if (typeof date === 'string' || typeof date === 'number') {
      return dayjs(date).format(query);
    } else {
      return date?.format(query);
    }
  }
}
