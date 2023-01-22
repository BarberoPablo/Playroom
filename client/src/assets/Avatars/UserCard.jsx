import React from "react";
import { Avatar } from "antd";
import { avatars } from "./avatars";

const UserCard = ({ user, size, me, click }) => (
  <>
    <Avatar size={size} src={avatars[user.avatar]} />
    {!me && <button onClick={(e) => click(e, user)}>{user.username}</button>}
  </>
);
export default UserCard;
