import React from 'react';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return <section className="main">{children}</section>;
};

export default RootLayout;
