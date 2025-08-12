import { ROUTER_PATH } from '@/constants';
import { useRouterWithAuthorize } from '@/hooks/useRouterWithAuthorize';

const SettingsPage = () => {
  const router = useRouterWithAuthorize();
  router.pushWithAuthorize(ROUTER_PATH.ADMIN_SETTINGS_USERS);
};

export default SettingsPage;
