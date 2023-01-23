import React from "react";
import { Button, Modal, Pagination } from "antd";
import { useState } from "react";
import { avatars } from "../../../assets/Avatars/avatars";
import "./AvatarButton.css";

const AvatarButton = ({ submit }) => {
  const [open, setOpen] = useState(false);
  const [avatarClicked, setAvatarClicked] = useState("");
  const [okButton, setOkButton] = useState({ disabled: true });
  const [paginationAvatars, setPaginationAvatars] = useState(avatars.slice(0, 5));
  const [actualPage, setActualPage] = useState(1);

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = (e) => {
    setOpen(false);
    const avatarIndex = (actualPage - 1) * 5 + Number(avatarClicked);
    submit(avatarIndex);
  };

  const handleCancel = (e) => {
    setOpen(false);
    setOkButton({ disabled: true });
    if (avatarClicked) {
      document.getElementById("avatar_" + avatarClicked).style.border = "";
    }
  };

  const handleAvatarClick = (e, avatar) => {
    setOkButton({ disabled: false });
    const oldAvatar = document.getElementById("avatar_" + avatarClicked);
    const newAvatar = document.getElementById("avatar_" + e.target.value);

    console.log("old", avatarClicked);
    console.log("old2", oldAvatar);
    console.log("new", e.target.value);

    if (avatarClicked !== "" && oldAvatar) {
      oldAvatar.style.filter = "grayscale(100%)";
    }

    newAvatar.style.filter = "grayscale(0%)";
    setAvatarClicked(e.target.value);
  };

  const paginationChange = (currentPage) => {
    setOkButton({ disabled: true });
    const start = (currentPage - 1) * 5;
    const newAvatars = avatars.slice(start, start + 5);

    setPaginationAvatars(newAvatars);
    setActualPage(currentPage);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Select Avatar
      </Button>
      <Modal
        width={"70vw"}
        className="avatars-modal-home"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={okButton}
      >
        <div className="avatars-div-home">
          {paginationAvatars.map((avatar, index) => {
            return (
              <input
                style={{ filter: "grayscale(100%)" }}
                id={"avatar_" + index}
                type="image"
                className="avatarMonster"
                key={avatar}
                value={index}
                src={avatar}
                width="180"
                height="195"
                onClick={(e) => handleAvatarClick(e, avatar)}
              />
            );
          })}
        </div>
        <Pagination
          className="home-pagination"
          current={actualPage}
          pageSize={5}
          total={avatars.length}
          onChange={(currentPage, itemsPerPage) => paginationChange(currentPage, itemsPerPage)}
          hideOnSinglePage={true}
        />
      </Modal>
    </>
  );
};

export default AvatarButton;
