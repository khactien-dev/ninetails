import { Avatar, AvatarProps } from 'antd';
import React from 'react';

export type BaseAvatarProps = AvatarProps;

interface IBaseAvatar extends React.FC<BaseAvatarProps> {
  Group: typeof Avatar.Group;
}

export const BaseAvatar: IBaseAvatar = (props) => {
  return <Avatar {...props} />;
};

BaseAvatar.Group = Avatar.Group;
