import { ReactNode, useContext } from 'react';

import { AnalysisContext, useChart } from './index.utils';

interface IProps {
  children: ReactNode;
}

export const useAnalysisContext = () => useContext(AnalysisContext);

const AnalysisProvider = ({ children }: IProps) => {
  const chartValue = useChart();
  return <AnalysisContext.Provider value={chartValue}>{children}</AnalysisContext.Provider>;
};
export default AnalysisProvider;
