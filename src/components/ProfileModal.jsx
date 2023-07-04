import React, { useEffect } from "react";
import { Button, Modal, Form, Input, Select } from "antd";
import {
    collection,
    getDocs,
    updateDoc,
    where,
    query,
  } from "firebase/firestore";
  import { db } from "../utils/firebase";
import {  setNewName } from "../app/features/templateSlice";
import { useDispatch } from "react-redux";
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

function ProfileModal({ userEmail, user, props1,userID, setOpen, open}) {
    const dispatch = useDispatch();
  //Prepopulte  the form from
  useEffect(() => {
    const handleFill = () => {
      form.setFieldsValue({
        name: `${user ? user : props1}`,
        email: userEmail,
      });
    };
    handleFill();
  }, []);

  //SETTING NEW NAME IN FIRESTORE of Profile
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

  const [form] = Form.useForm();
  return (
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
  );
}

export default ProfileModal;
