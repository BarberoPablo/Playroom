import React from "react";
import { Avatar, Tooltip } from "antd";
import { avatars } from "./avatars";
import "./UserCard.css";

const UserCard = ({ user, size, me, click, playing }) => {
  const cardFormat = () => {
    console.log("user ", user);
    if (me) {
      return (
        <Avatar
          size={size}
          src={avatars[user.avatar]}
          style={{
            border: "2px solid rgba(26, 34, 59)",
            backgroundColor: "rgba(37, 49, 84)",
          }}
        />
      );
    }

    if (playing) {
      return (
        <Tooltip title="User is already playing">
          <Avatar
            className="avatar-image"
            size={size}
            src={avatars[user.avatar]}
            style={{ filter: "grayscale(100%)" }}
          />
        </Tooltip>
      );
    } else {
      return (
        <div className="avatar-conteiner">
          <Tooltip title="Challenge this user!">
            <Avatar
              className="avatar-image"
              size={size}
              src={avatars[user.avatar]}
              onClick={(e) => click(e, user)}
            />
          </Tooltip>
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
