import { ResponseNotifications } from '@/api/notifications';
import { DATE_FORMAT, ROUTER_PATH } from '@/constants';
import {
  useGetMutateNotifications,
  useReadAllMutateNotificaion,
  useReadMutateNotificaion,
} from '@/hooks/features/useNotification';
import { useRouterWithAuthorize } from '@/hooks/useRouterWithAuthorize';
import { NotificationItemType } from '@/interfaces';
import { selectCurrentUser } from '@/stores/auth/auth.slice';
import { useAppSelector } from '@/stores/hooks';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';

const PAGE_SIZE = 20;

export enum NOTI_ICON_TYPE {
  SUCCESS = 'success',
  INFO = 'info',
}

const SSE_CONNECT_FLAG = {
  START: 0,
  CONNECTTED: 1,
  RECONNECT: 2,
};

const useNotifications = () => {
  const [openPopover, setOpenPopover] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const [notifications, setNotifications] = useState<Array<NotificationItemType>>([]);
  const [totalUnRead, setTotalUnRead] = useState(0);
  const [totalNotification, setTotalNotification] = useState(0);
  const [totalNotiSSE, setTotalNotiSSE] = useState(0);
  const [sseFlag, setSSEFlag] = useState(SSE_CONNECT_FLAG.START);
  const router = useRouterWithAuthorize();
  const user = useAppSelector(selectCurrentUser);

  const { mutate: getMutateNotifications, isPending } = useGetMutateNotifications();
  const { mutate: readMutate } = useReadMutateNotificaion();
  const { mutate: readAllMutate } = useReadAllMutateNotificaion();

  const handleTogglePopover = () => {
    setOpenPopover(!openPopover);
    notificationRef.current?.scrollTo({
      top: 0,
    });
  };

  const fetchNotifications = (
    page: number | undefined,
    onSuccess: (res: ResponseNotifications) => void
  ) => {
    getMutateNotifications(
      {
        page: page ?? 1,
        pageSize: PAGE_SIZE,
      },
      {
        onSuccess,
      }
    );
  };

  const fetchNotificationPageOne = () => {
    fetchNotifications(undefined, (res) => {
      const { data, pagination, count_unread } = res.data;
      setNotifications(data);
      setTotalUnRead(count_unread);
      setTotalNotification(pagination?.total || 0);
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.target as HTMLDivElement;
    if (Math.ceil(scrollTop) + clientHeight === scrollHeight) {
      if (notifications.length < totalNotification && !isPending) {
        fetchNotifications(Math.floor(notifications.length / PAGE_SIZE) + 1, (res) => {
          const { data } = res.data;
          const notiRemain = data.slice(totalNotiSSE % PAGE_SIZE);
          const newNotifications = [...notifications, ...notiRemain];
          setNotifications(newNotifications);
          setTotalNotiSSE(0);
        });
      }
    }
  };

  const handleClickNotification = (data: NotificationItemType) => {
    const pushDashboard = () => {
      router.pushWithAuthorize(ROUTER_PATH.ADMIN_REALTIME_ACTIVITY, {
        routeName: data.route_name,
        date: dayjs().format(DATE_FORMAT.R_BASIC),
      });
    };
    if (data.read_at) {
      pushDashboard();
      handleTogglePopover();
      return;
    }
    readMutate(data.id, {
      onSuccess() {
        if (totalUnRead > 0) setTotalUnRead((prevCount) => prevCount - 1);
        handleTogglePopover();
        fetchNotificationPageOne();
        pushDashboard();
      },
    });
  };

  const handleReadAll = () => {
    if (totalUnRead > 0) {
      readAllMutate(undefined, {
        onSuccess() {
          setTotalUnRead(0);
          handleTogglePopover();
          fetchNotificationPageOne();
        },
      });
    } else {
      handleTogglePopover();
    }
  };

  useEffect(() => {
    fetchNotificationPageOne();
  }, []);

  // DRAFT
  useEffect(() => {
    if (sseFlag === SSE_CONNECT_FLAG.RECONNECT) {
      fetchNotifications(undefined, (res) => {
        const { data, count_unread, pagination } = res.data;
        if (count_unread > totalUnRead) {
          setNotifications((prev) => [...data.slice(0, count_unread - totalUnRead), ...prev]);
          setTotalUnRead(count_unread);
          setTotalNotification(pagination?.total || 0);
          setTotalNotiSSE(count_unread - totalUnRead);
        }

        setSSEFlag(SSE_CONNECT_FLAG.CONNECTTED);
      });
    }
  }, [sseFlag]);

  useEffect(() => {
    const eventSource = new EventSource(process.env.NEXT_PUBLIC_API_URL + '/notification/sse');

    eventSource.onopen = () => {
      console.log('Connection to server opened.');
      setSSEFlag((prev) => prev + 1);
    };

    eventSource.onmessage = (event: any) => {
      const newNotification = JSON.parse(event.data) as NotificationItemType;

      if (user?.master_id && newNotification.user_ids.includes(+user?.master_id)) {
        const indID = newNotification.user_ids.findIndex((item) => item === user?.master_id);

        if (indID !== -1 && newNotification?.id_ids && newNotification?.id_ids?.length > 0) {
          setNotifications((prevNotifications) => [
            { ...newNotification, id: newNotification?.id_ids?.[indID] as number },
            ...prevNotifications,
          ]);
          setTotalUnRead((prevCount) => prevCount + 1);
          setTotalNotification((prevCount) => prevCount + 1);
          setTotalNotiSSE((prevCount) => prevCount + 1);
        }
      }
    };

    eventSource.onerror = () => {
      console.log('Error occurred while connecting.');
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  return {
    openPopover,
    setOpenPopover,
    notificationRef,
    notifications,
    setNotifications,
    totalUnRead,
    setTotalUnRead,
    totalNotification,
    setTotalNotification,
    totalNotiSSE,
    setTotalNotiSSE,
    isPending: isPending && sseFlag !== SSE_CONNECT_FLAG.RECONNECT,
    handleTogglePopover,
    handleScroll,
    handleClickNotification,
    handleReadAll,
    user,
  };
};

export default useNotifications;
