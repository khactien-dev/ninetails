import { Dropdown, DropdownProps } from 'antd';
import React from 'react';

export const BaseDropdown: React.FC<DropdownProps> = ({ children, ...props }) => {
  return (
    <Dropdown getPopupContainer={(triggerNode) => triggerNode} {...props}>
      {children}
    </Dropdown>
  );
};
