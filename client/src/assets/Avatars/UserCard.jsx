import React from "react";
import { Avatar, Tooltip } from "antd";
import { avatars } from "./avatars";
import "./UserCard.css";

const UserCard = ({ user, size, me, click, playing }) => {
  const cardFormat = () => {
    if (me) {
      return <Avatar size={size} src={avatars[user.avatar]} />;
    }

    if (playing) {
      return (
        <Tooltip title="User is already playing">
          <Avatar size={size} src={avatars[user.avatar]} style={{ filter: "grayscale(100%)" }} />
        </Tooltip>
      );
    } else {
      return (
        <div className="avatar-conteiner">
          <Avatar
            className="avatar-image"
            size={size}
            src={avatars[user.avatar]}
            onClick={(e) => click(e, user)}
          />
          <h2 className="avatar-username" onClick={(e) => click(e, user)}>
            {user.username}
          </h2>
        </div>
      );
    }
  };

  return cardFormat();
};

export default UserCard;
