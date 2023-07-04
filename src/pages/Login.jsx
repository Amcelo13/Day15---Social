import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AutoComplete, Button, Col, Form, Input, Select } from "antd";
import GOG from "../assets/google.svg";
import "./Home.css";
import { LoadingOutlined } from "@ant-design/icons";
//redux
import { useDispatch, useSelector } from "react-redux";
import {
  setUser,
  setLogin,
  selectUser,
  setUserId,
  setOnline,
} from "../app/features/templateSlice";

import { auth, googleProvider } from "../utils/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { db } from "../utils/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  where,
  query,
} from "firebase/firestore";
import { duplicateCheck } from "../utils/duplicateCheck";
import LOG from "../assets/LOG.svg";

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
function Login() {
  const navigate = useNavigate();
  const [isloading, setloading] = useState(false);
  const [err, setErr] = useState("");
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const userCollectionRef = collection(db, "users");
  const [users_from_database, setusers_from_database] = useState([]);
  const  state = useLocation()

  //GETTING THE USERS
  useEffect(() => {
    const getUsers = async () => {
      try {
        const q = await getDocs(userCollectionRef);
        const res = q.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setusers_from_database([...users_from_database, res]); //appending into the users array
        console.log(users_from_database);
      } catch (err) {
        console.log(err);
      }
    };
    getUsers();
  }, []);

  //adding a user IN FIRESTORE
  const createUserUsingGoogle = async (input, id) => {
    await addDoc(userCollectionRef, {
      name: input.displayName,
      email: input.email,
      uid: id,
      online: true,
      notification:[]
    });
  };

  const onFinish = (values) => {
    setloading(true);
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then(async (usercreds) => {
        // console.log("Sent user creds from Login without gOath", usercreds.user);
        setErr(false);
        setloading(false);

        const q = query(
          userCollectionRef,
          where("email", "==", usercreds.user.email)
        );
        const LoggedUserArray = await getDocs(q);
        let datanow;
        LoggedUserArray.forEach((user) => {
          datanow = user.data();
          updateDoc(user.ref, {
            online: true,
          });
        });
        const namefromNavigate = state.state
        dispatch(setUserId(usercreds.user.uid));
        dispatch(
          setLogin({
            email: usercreds.user.email,
            name: namefromNavigate,
            uid: usercreds.user.uid,
          })
          );
        navigate("/home",{state: namefromNavigate});
      })
      .catch((err) => {
        console.log(err.code);
        console.log(err.message);
        setErr(err.message);
        setloading(false);
      });
  };

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const data = res._tokenResponse.email;

      const q = query(userCollectionRef, where("email", "==", data));
      const docs = await getDocs(q);
      dispatch(setUserId(res.user.uid));
      dispatch(
        setLogin({
          email: res._tokenResponse.email,
          name: res._tokenResponse.displayName,
          uid: res.user.uid,
        })
      );
      // const filterData = duplicateCheck(res._tokenResponse.email, users_from_database);

      //if no duplication
      if (docs.docs.length === 0) {
        createUserUsingGoogle(res._tokenResponse, res.user.uid);
      }
      //if duplication exists update the user to be just online
      else {
        const q = query(
          userCollectionRef,
          where("email", "==", res._tokenResponse.email)
        );
        const LoggedUserArray = await getDocs(q);
        let datanow;
        LoggedUserArray.forEach((user) => {
          datanow = user.data();
          updateDoc(user.ref, {
            online: true,
          });
        });
      }

      navigate("/home");
    } catch (err) {
      console.error(err);
    }
  };

  //going to signup page
  const gotosignup = () => {
    navigate("/");
  };
  return (
    <div className="container">
      <div className="left">
        <img src={LOG} alt="" id="LOMG" />
        <h1 id="h1style">Tribe</h1>
      </div>
      <div
        className="right"
        style={{
          height: "auto", // paddingTop: "1rem",
        }}
      >
        <h1
          style={{
            paddingTop: "15rem",
            paddingLeft: "-10rem",
            paddingBottom: "1.5rem",
          }}
        >
          Log In
        </h1>
        <button
          style={{
            padding: "1.3rem",
            border: "none",
            background: "#fff",
            boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
            cursor: "pointer",
            borderRadius: "1rem",
            marginBottom: "3rem",
          }}
          onClick={signInWithGoogle}
        >
          {" "}
          <img
            src={GOG}
            width="20px"
            style={{ marginTop: "-1rem", marginBottom: "-.35rem" }}
            alt=""
          />{" "}
          Continue with google{" "}
        </button>

        <div className="yolu" style={{ paddingLeft: "12rem" }}>
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
                  required: true,
                  message: "Please input your E-mail!",
                },
              ]}
            >
              <Input
                placeholder="Enter your email"
                style={{ padding: ".6rem" }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
              hasFeedback
            >
              <Input.Password
                placeholder="Enter your password"
                style={{ padding: ".6rem" }}
              />
            </Form.Item>
            <p style={{ color: "red", paddingLeft: "4rem" }}>{err}</p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "10rem",
                paddingLeft: "11rem",
              }}
            >
              <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">
                  Login
                </Button>
              </Form.Item>

              {isloading ? (
                <p style={{ marginTop: "0.2rem" }}>
                  {" "}
                  <LoadingOutlined />
                </p>
              ) : (
                ""
              )}
            </div>
          </Form>
          <p style={{ marginTop: "-3rem", paddingLeft: "6rem" }}>
            New here{" "}
            <span
              style={{
                color: "powderBlue",
                fontWeight: "500",
                cursor: "pointer",
              }}
              onClick={gotosignup}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
