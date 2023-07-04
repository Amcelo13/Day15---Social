import React, { useEffect, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { useDispatch, useSelector } from "react-redux";
import {
  SearchOutlined,
  VideoCameraOutlined,
  SendOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Modal, Form, Input } from "antd";
import "./Chat.css";
import Emo from "../assets/emojisv.svg";
import { db } from "../utils/firebase";
import Pro from "../assets/profile.svg";
import Lomg1 from "../assets/LOG1.svg";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  onSnapshot,
  arrayUnion,
  doc,
  where,
} from "firebase/firestore";
import {
  setReciever,
  setRoom,
  setNewName,
  setLogout,
} from "../app/features/templateSlice";
import { useLocation } from "react-router-dom";
const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};
function Chat() {
  const location = useLocation();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const userID = useSelector((state) => state.users.uid);
  const user = useSelector((state) => state.users.name);
  const userEmail = useSelector((state) => state.users.email);

  //SETTING NEW NAME IN FIRESTORE
  const onFinish = async (values) => {
    const q = query(collection(db, "users"), where("uid", "==", userID));
    const LOGGEDARRAY = await getDocs(q);
    let datanow;
    LOGGEDARRAY.forEach((user) => {
      datanow = user.data();
      updateDoc(user.ref, {
        name: values.name,
      });
    });
    //SETTING NEW NAME IN Redux
    dispatch(setNewName(values.name));

    setOpen(false);
  };

  //Prepopulte  the form from
  useEffect(() => {
    const handleFill = () => {
      form.setFieldsValue({
        name: `${user ? user : location.state}`,
        email: userEmail,
      });
    };
    handleFill();
  }, []);
  const dispatch = useDispatch();
  const user_data_email = useSelector((state) => state.users.email);
  const sender = useSelector((state) => state.users);
  const reciever = useSelector((state) => state.currentReciever);
  const currentRoom = useSelector((state) => state.currentRoom);
  const [msg_database, setMsg_database] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [users_from_database, setusers_from_database] = useState([]); // Move the declaration here

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  const filteredUsers = users_from_database[0] ? users_from_database[0].filter((user) =>user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  const [message, setMessage] = useState([]);
  const [openemoji, setopenemoji] = useState(false);
  const userCollectionRef = collection(db, "users");
  const roomCollectionRef = collection(db, "room");
  const [TypingStatus, setTypingStats] = useState(false);

  let t;
  let updateTyping = false;

  //Typing logic
  const typingHandle = async (e) => {
    clearTimeout(t);

    setMessage(e.target.value);

    if (updateTyping === false) {
      const qm = query(roomCollectionRef, where("room_id", "==", currentRoom));

      const damta = await getDocs(qm);
      damta.forEach((doc) => {
        let obj = {};

        obj[sender.uid] = true;
        updateDoc(doc.ref, obj);
      });
      updateTyping = true;
    }
    //It will always try to run after every 5s of true value and never gets timed out till the true value is reversed 
    t = setTimeout(async () => {
      const qm = query(roomCollectionRef, where("room_id", "==", currentRoom));
      const damta = await getDocs(qm);
      damta.forEach((doc) => {
        let obj = {};

        obj[sender.uid] = false;
        updateDoc(doc.ref, obj);
      });
      updateTyping = false;
    }, 5000);
  };
  const addEmoji = (e) => {
    let sym = e.unified.split("-");
    let codesArray = [];
    sym.forEach((el) => codesArray.push("0x" + el));
    let emoji = String.fromCodePoint(...codesArray);
    setMessage(message + emoji);
  };

  //setting { room onclick messages} and setting typing status
  useEffect(() => {
    const q = query(collection(db, "room"),where("room_id", "==", currentRoom));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
        if (currentRoom !== "-1") {
          setMsg_database(messages.filter((item) => item.room_id === currentRoom));
          setTypingStats(messages[0][reciever.uid]);

          // console.log(messages[0][reciever.uid])
        }
      });
    });
    return () => {
      unsubscribe();
    };
  }, [currentRoom]);

  //getting users in realtime
  useEffect(() => {
    const q1 = query(collection(db, "users"));
    const unsubscribe1 = onSnapshot(q1, (querySnapshot) => {
      let userslist = [];
      querySnapshot.forEach((doc) => {
        userslist.push({ ...doc.data(), id: doc.id });
        setusers_from_database([...users_from_database, userslist]);
      });
    });
    return () => {
      unsubscribe1();
    };
  }, []);

  //Creating new rooms for chat different
  const handleRoom = async(reciever_id) => {
    dispatch(setReciever(reciever_id));
    //room logic
    const room_id = reciever_id.uid > sender.uid ? "" + sender.uid + reciever_id.uid : "" + reciever_id.uid + sender.uid;
    dispatch(setRoom(room_id));
    // console.log(reciever_id.uid, sender.uid, room_id, "Idssss");
  };

  //SENDING THE MESSAGE
  const handleSend = async () => {
    const roomData = await getDocs(roomCollectionRef);

    // Checking the duplicate room
    const duplicateRoom = roomData.docs.filter((room) => room?.data()?.room_id === currentRoom);
    if (duplicateRoom[0]?.id) {

      let objt = {
        text: arrayUnion({
          msg: message,
          time: new Date(),
          sender_id: sender.uid,
        }),
        time: serverTimestamp(),
        room_id: currentRoom,
        sender_id: sender.uid,
      };
      objt[reciever.uid] = false;
      objt[sender.uid] = false;

      await updateDoc(doc(db, "room", duplicateRoom[0]?.id), 
      objt);
    } 
    else {
      await addDoc(roomCollectionRef, {
        text: [{ msg: message, time: new Date(), sender_id: sender.uid }],
        time: serverTimestamp(),
        room_id: currentRoom,
      });
    }
    setMessage("");
    setopenemoji(false);
  };

  //To logout from the current session
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

  return (
    <div className="container211">
      <div className="top11">
        <div style={{ marginLeft: "-2rem", paddingRight: "2rem" }}>
          <img src={Lomg1} alt="" />
        </div>
        <div className="search1111">
          <SearchOutlined
            style={{ paddingTop: "1.27em", paddingRight: "1rem" }}
          />
          <input
            type="text"
            placeholder="Search"
            className="search--inp"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="user_profile222">
          <img
            width="75px"
            src={Pro}
            alt=""
            style={{ width: "3.5rem", paddingRight: "1rem" }}
          />
          <h2 style={{ paddingTop: "0.1rem", color: "white" }}>
            {reciever?.name}
          </h2>

          <div className="online1">
            <span
              style={{ color: "white", paddingLeft: "0rem", fontWeight: "600" }}
            >
              {TypingStatus ? "Typing..." : ""}
            </span>
          </div>
        </div>

        <div className="calls">
          <UserOutlined className="call-each" onClick={() => setOpen(true)} />
          <Modal
            title="Profile Details"
            centered
            open={open}
            onOk={() => setOpen(false)}
            onCancel={() => setOpen(false)}
            width={1000}
            footer={null}
          >
            <div style={{ display: "flex", justifyContent: "space-evenly" }}>
              <div className="profi">
                <Form
                  {...formItemLayout}
                  form={form}
                  name="register"
                  onFinish={onFinish}
                  initialValues={{
                    residence: ["zhejiang", "hangzhou", "xihu"],
                    prefix: "86",
                  }}
                  style={{
                    maxWidth: 600,
                  }}
                  scrollToFirstError
                >
                  <Form.Item
                    name="email"
                    label="E-mail"
                    rules={[
                      {
                        type: "email",
                        message: "The input is not valid E-mail!",
                      },
                      {
                        required: false,
                        message: "Please input your E-mail!",
                      },
                    ]}
                  >
                    <Input disabled />
                  </Form.Item>

                  <Form.Item
                    name="name"
                    label="Name"
                    tooltip="What do you want others to call you?"
                    rules={[
                      {
                        message: "Please input your nickname!",
                        whitespace: true,
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">
                      Update Details
                    </Button>
                  </Form.Item>
                </Form>
              </div>
              <div className="img--con">
                <img
                  src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
                  style={{
                    paddingLeft: "10rem",
                    borderRadius: "60%",
                    paddingTop: "1rem",
                  }}
                  alt="err"
                />
              </div>
            </div>
          </Modal>
          <LogoutOutlined className="call-each1" onClick={handleLogout} />
        </div>
      </div>

      <div className="bottom">
        <div className="leftt">
          <h2
            style={{
              textAlign: "left",
              paddingLeft: "1.6rem",
              position: "sticky",
              top: "0rem",
              backgroundColor: "white",
              paddingRight: "16rem",
              paddingBottom: "1.5rem",
              paddingTop: "1.2rem",
              opacity: "0.8",
              marginTop: "0.5rem",
              zIndex: "3",
            }}
          >
            Chats
          </h2>

          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              if (sender.uid !== user.uid)
                return (
                  <div
                    className={user.uid === reciever.uid ? `user2` : `user122`}
                    key={user.id}
                    onClick={() => handleRoom(user)}
                  >
                    <img
                      width="70px"
                      src={Pro}
                      alt=""
                      className="click--userimg"
                    />
                    <div>
                      <h3
                        className={
                          user.uid === reciever.uid
                            ? `user--name2`
                            : `user--name`
                        }
                      >
                        {user.name}
                      </h3>
                      <p
                        className={
                          user.uid === reciever.uid
                            ? `faint--chat2`
                            : `faint--chat`
                        }
                      >
                        {user?.email}
                      </p>
                    </div>
                    <div className="online">
                      <span
                        className={user.online === true ? `dot` : `dotdisabled`}
                      >
                        dot
                      </span>
                    </div>
                  </div>
                );
            })
          ) : (
            <p>No users found.</p>
          )}
        </div>

        <div className="righttt">
          <div className="main--chat">
            {msg_database[0]?.text.map((item) => {
              if (item.sender_id === sender.uid) {
                const t = item?.time;
                const date = t?.seconds ? new Date(t.seconds * 1000) : null;
                const formattedTime = date ? date.toLocaleTimeString() : null;

                return (
                  <p className="righthand" key={msg_database[0]?.id}>
                    <>
                      <span className="right--span">{item?.msg}</span>
                      <p
                        style={{
                          color: "black",
                          fontSize: "13px",
                          paddingTop: ".8rem",
                          marginRight: "1rem",
                        }}
                      >
                        {formattedTime}
                      </p>
                    </>
                  </p>
                );
              } else {
                const t = item?.time;
                const date = t?.seconds ? new Date(t.seconds * 1000) : null;
                const formattedTime = date ? date.toLocaleTimeString() : null;
                return (
                  <p className="lefthandd" key={item.sender_id}>
                    <>
                      <span className="left--span">{item?.msg}</span>
                      <span
                        style={{
                          color: "black",
                          fontSize: "13px",
                          paddingTop: ".8rem",
                          marginRight: "1rem",
                        }}
                      >
                        {" "}
                        <br /> <br />
                        {formattedTime}
                      </span>
                    </>
                  </p>
                );
              }
            })}
          </div>
          <div className="outerdiv">
            <div className="chatdiv">
              <input
                value={message}
                onChange={(e) => typingHandle(e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}
                type="text"
                required
                className="chatbox"
                placeholder="Type your chat here"
                style={{ fontSize: "1.2rem" }}
              />

              <img
                src={Emo}
                width="40px"
                style={{
                  paddingTop: ".1rem",
                  cursor: "pointer",
                  paddingLeft: "2rem",
                }}
                height="50px"
                alt=""
                onClick={() => setopenemoji(!openemoji)}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "9.5rem",
                  right: "6.5rem",
                }}
              >
                {openemoji ? <EmojiPicker onEmojiClick={addEmoji} /> : ""}
              </div>
            </div>

            <SendOutlined
              className="send--btn"
              type="submit"
              onClick={handleSend}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
