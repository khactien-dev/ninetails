import React from 'react';

import { PersonalData } from './personal-data';
import { VehicleData } from './vehicle-data';

export const Statistic = () => {
  return (
    <>
      <VehicleData />
      <PersonalData />
    </>
  );
};
