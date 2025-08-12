import { ReactNode, useContext } from 'react';

import { ScheduleContext, useSchedule } from './index.utils';

interface IProps {
  children: ReactNode;
}

export const useScheduleContext = () => useContext(ScheduleContext);

const ScheduleProvider = ({ children }: IProps) => {
  const scheduleValue = useSchedule();
  return <ScheduleContext.Provider value={scheduleValue}>{children}</ScheduleContext.Provider>;
};
export default ScheduleProvider;
