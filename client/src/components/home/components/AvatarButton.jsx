import React from "react";
import { Button, Modal } from "antd";
import { useState } from "react";
import { avatars } from "../../../assets/Avatars/avatars";

const AvatarButton = ({ submit }) => {
  const [open, setOpen] = useState(false);
  const [avatarClicked, setAvatarClicked] = useState("");
  const [okButton, setOkButton] = useState({ disabled: true });

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = (e) => {
    console.log(e);
    setOpen(false);
    submit(avatarClicked);
  };

  const handleCancel = (e) => {
    console.log(e);
    setOpen(false);
    setOkButton({ disabled: true });
    document.getElementById("avatar_" + avatarClicked).style.border = "";
  };

  const handleAvatarClick = (e) => {
    setOkButton({ disabled: false });
    const oldAvatar = document.getElementById("avatar_" + avatarClicked);
    const newAvatar = document.getElementById("avatar_" + e.target.value);

    if (avatarClicked !== "") {
      oldAvatar.style.border = "";
    }
    newAvatar.style.border = "1px solid";
    setAvatarClicked(e.target.value);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Select Avatar
      </Button>
      <Modal open={open} onOk={handleOk} onCancel={handleCancel} okButtonProps={okButton}>
        {avatars.map((avatar, index) => (
          <input
            id={"avatar_" + index}
            type="image"
            className="avatarMonster"
            key={avatar}
            value={index}
            src={avatars[index]}
            width="90"
            height="97.5"
            onClick={(e) => handleAvatarClick(e)}
          />
        ))}
      </Modal>
    </>
  );
};

export default AvatarButton;
