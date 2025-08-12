import Hours from '@/assets/images/svg/icon-24-hours.svg';
import Date from '@/assets/images/svg/icon-date.svg';
import Node from '@/assets/images/svg/icon-node.svg';
import Setting from '@/assets/images/svg/icon-setting.svg';
import Star from '@/assets/images/svg/icon-star.svg';
import Statistic from '@/assets/images/svg/icon-statistic.svg';
import Trash from '@/assets/images/svg/icon-trash.svg';
import React from 'react';

export interface SidebarNavigationItem {
  title: string;
  key: string;
  url: string;
  children?: SidebarNavigationItem[];
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const sidebarNavigation: SidebarNavigationItem[] = [
  {
    title: '대시보드',
    key: 'dashboard',
    url: '/admin/dashboard',
    icon: <Star />,
    disabled: false,
  },
  {
    title: '근무 일정',
    key: 'schedule',
    url: '/admin/schedule',
    icon: <Statistic />,
    disabled: false,
  },
  {
    title: '관제현황',
    key: 'control-status',
    url: '/admin/control-status',
    icon: <Hours />,
    disabled: false,
  },
  {
    title: '수거량 분석',
    key: 'node',
    url: '/admin/operation-analysis',
    icon: <Node />,
    disabled: false,
  },
  {
    title: '불법배출',
    key: 'trash',
    url: '/admin/illegal',
    icon: <Trash />,
    disabled: false,
  },
  {
    title: '차량운행일지',
    key: 'date',
    url: '/admin/driving-diary',
    icon: <Date />,
    disabled: false,
  },
  {
    title: '설정',
    key: 'settings',
    url: '/admin/settings',
    icon: <Setting />,
    disabled: false,
  },
];
