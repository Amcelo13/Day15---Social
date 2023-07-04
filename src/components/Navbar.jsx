import React, { useEffect } from "react";
import "./Navbar.css";
import {
  NotificationOutlined,
  UserOutlined,
  MessageOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import LOGO from "../assets/LOGO.svg";
import PRO from "../assets/ProfileLogo.svg";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  collection,
  getDocs,
  updateDoc,
  where,
  query,
} from "firebase/firestore";
import { Badge, Space, Switch } from "antd";
import { db } from "../utils/firebase";
import { setLogout } from "../app/features/templateSlice";
import { useNavigate } from "react-router-dom";
import NotificationModal from "./NotificationModal";
import ProfileModal from "./ProfileModal";

function Navbar(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.users.name);
  const user_data_email = useSelector((state) => state.users.email);
  const userEmail = useSelector((state) => state.users.email);
  const userID = useSelector((state) => state.users.uid);
  const [open, setOpen] = useState(false);
  const [notifModel, setNotifModel] = useState(false);
  const userCollectionRef = collection(db, "users");
  const navigate = useNavigate();
  const [notimap, setNotiMap] = useState([]);
  const [show, setShow] = useState(true); //badge
  const [notilength, senotificationLength] = useState();

  useEffect(() => {
    const lengthfinder = () => {
      senotificationLength(notimap?.notification?.length)
      console.log(notilength)
    };
    lengthfinder(); 
  }, [notimap]);
  //Logout Function
  const handleLogout = async () => {
    dispatch(setLogout());
    const q = query(userCollectionRef, where("email", "==", user_data_email));
    const LOGGED_USER = await getDocs(q);
    let datanow;
    LOGGED_USER.forEach((user) => {
      updateDoc(user.ref, {
        online: false,
      });
    });
  };

  //Go to Chat Page
  const gotoChat = () => {
    navigate("/chat", { state: props.name });
  };

  //Setting notifications in a map
  const modelNotifications = async () => {
    setNotifModel(true);

    //Query for notifications of a user in a database
    const q = query(collection(db, "users"), where("uid", "==", userID));
    const docs = await getDocs(q);
    docs.docs.forEach((doc) => {
      setNotiMap(doc.data());
    });
  };

  return (
    <div className="NAVCONATINER">
      <div className="left--nav">
        <img
          src={LOGO}
          alt=""
          id="logo"
          style={{ paddingLeft: "3rem", paddingBottom: ".6rem" }}
        />
        <span id="intro">
          {" "}
          Welcome{" "}
          <span style={{ color: "black" }}>
            &nbsp;{user ? user : props.name}
          </span>{" "}
        </span>
      </div>

      <div className="right--nav">
        <div>
          {" "}
          <img src={PRO} alt="" />{" "}
        </div>
        <div>
          {" "}
          <MessageOutlined
            className="right--nav--items"
            onClick={gotoChat}
          />{" "}
        </div>
        <div>
          {" "}
          <NotificationOutlined
            className="right--nav--items"
            onClick={modelNotifications}
          />{" "}

        </div>
        <div>
          {" "}
          <UserOutlined
            className="right--nav--items"
            onClick={() => setOpen(true)}
          />
        </div>
        <div>
          {" "}
          <LogoutOutlined
            className="right--nav--items"
            onClick={handleLogout}
          />
        </div>

        {/* Profile Details Modal*/}
        <ProfileModal
          user={user}
          userEmail={userEmail}
          props1={props.name}
          userID={userID}
          setOpen={setOpen}
          open={open}
        />

        {/*Notification Model Component Calling*/}
        <div>
          <NotificationModal
            notimap={notimap}
            notifModel={notifModel}
            setNotifModel={setNotifModel}
          />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
