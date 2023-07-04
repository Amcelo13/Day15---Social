import React, { useEffect, useState } from "react";
import "./PostItem.css";
import {
  CommentOutlined,
  HeartOutlined,
  LoadingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useSelector } from "react-redux";
import { Modal, Form, Button, Input } from "antd";
import { getTime } from "../utils/getTime";
import { updateNotification } from "../utils/updateNotification";
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

function PostItem({ singlepost }) {
  const [isLoading, setIsLoading] = useState(true);
  const userID = useSelector((state) => state.users.uid);
  const userName = useSelector((state) => state.users.name);
  const [comments, setComments] = useState("");
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [singleModelProps, setSingleModelProps] = useState();
  const [likeActive, setLikeActive] = useState(localStorage.getItem("likeActive") === "true" ? true : false);

  //Persisting like red color of like even on referesh
  useEffect(() => {
    if (likeActive) {
      localStorage.setItem("likeActive", "true");
    } else {
      localStorage.removeItem("likeActive");
    }
  }, [likeActive]); 

  const handleView = (post) => {
    setSingleModelProps(post);
    setOpen(true);
  };

  //Loading animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

 
  const onFinish = async () => {};

  //Likes on Post Logic
    const handleLike = async (post) => {

      //Like Notifications
    if (post.user_id !== userID) {
      updateNotification(post.user_id, {
        message: `${userName}`,
        text: "liked your post",
      });

    }

    const q = query(collection(db, "posts"),where("MEDIA_URL", "==", post.MEDIA_URL));
    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
      const postRef = doc.ref;
      const currentLikes = doc.data().like || 0;

      if (currentLikes > 0) {
        if (doc.data().likedBy && doc.data().likedBy.includes(userID)) {
          const newLikes = currentLikes - 1;
          const updatedLikes = doc.data().likedBy.filter((id) => id !== userID);

          updateDoc(postRef, {
            like: newLikes,
            likedBy: updatedLikes,
          });

          setLikeActive(false); // Unlike, so set likeActive to false
        } else {
          const newLikes = currentLikes + 1;
          const updatedLikes = doc.data().likedBy
            ? [...doc.data().likedBy, userID]
            : [userID];

          updateDoc(postRef, {
            like: newLikes,
            likedBy: updatedLikes,
          });

          setLikeActive(true); // Like, so set likeActive to true
        }
      } else {
        const newLikes = 1;
        const updatedLikes = [userID];

        updateDoc(postRef, {
          like: newLikes,
          likedBy: updatedLikes,
        });

        setLikeActive(true); // Like for the first time, so set likeActive to true
      }
    });
  };

  //Comments on Post
  const handleComment = async (post) => {

    //Comment Notification
    if (post.user_id !== userID) {
      updateNotification(post.user_id, {
        message: ` ${userName} commented`,
        text: comments,
      });
    }
    const q = query(
      collection(db, "posts"),
      where("MEDIA_URL", "==", post.MEDIA_URL)
    );
    const snapshot = await getDocs(q);

    snapshot.forEach((user) => {
      const postref = user.ref;
      const existingComments = user.data().comments || [];

      let cmtObj = {
        cmt_text: comments,
        cmt_time: new Date(),
        commenter: userName,
      };

      // Appending the comment obj in the comment array and sorting them by the latest comments
      const updatedComments = [...existingComments, cmtObj].sort(
        (a, b) => b.cmt_time - a.cmt_time
      );

      // Updating the comment count and the comments array
      updateDoc(postref, {
        commentNumber: updatedComments.length,
        comments: updatedComments,
      });
    });

    setComments("");
    setOpen(false);
  };

  return (
    <>
      <div>
        {isLoading ? (
          <div
            style={{
              fontSize: "5rem",
              color: "#5e95ed",
              position: "fixed",
              marginLeft: "58rem",
            }}
          >
            <LoadingOutlined />
          </div>
        ) : (
          singlepost.map((post) => {
            const isVideo =
              post.MEDIA_URL.includes(".mp4") ||
              post.MEDIA_URL.includes(".mov");

            return (
              <div key={post.id} className="postmap">
                <div id="ozil">
                  <UserOutlined id="avtr" />
                  <p id="username">{post.username}</p> <br />
                </div>
                <div id="ozil1">
                  <span id="timess">{getTime(post.time)}</span>
                </div>
                <p id="caption1">{post.caption}</p>
                {isVideo ? (
                  <video
                    src={post.MEDIA_URL}
                    alt=""
                    style={{
                      width: "85%",
                      borderRadius: "2rem",
                      height: "400px",
                      marginTop: "10px",
                    }}
                    controls
                    loop
                    muted
                    autoPlay
                  />
                ) : (
                  <img
                    src={post.MEDIA_URL}
                    height="500rem"
                    alt=""
                    style={{
                      width: "90%",
                      height: "auto",
                      borderRadius: "1rem",
                      marginTop: "10px",
                      marginLeft: "10px",
                      marginRight: "10px",
                    }}
                  />
                )}
                <div className="reactions">
                  <HeartOutlined
                    className={`reactions1 ${likeActive ? "active" : ""}`}
                    onClick={() => handleLike(post)}
                  />
                  <CommentOutlined
                    className="reactions2"
                    onClick={() => handleView(post)}
                  />
                </div>

                <div className="reactions--count">
                  <p style={{ color: "black", fontWeight: "500" }}>
                    {post.like}{" "}
                    {post.like === 1 || post.like === 0 ? "Like" : "Likes"}{" "}
                  </p>
                  <p style={{ color: "black", fontWeight: "500" }}>
                    {post.commentNumber}{" "}
                    {post.commentNumber === 1 || 0 ? "Comment" : "Comments"}{" "}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <Modal
          title="Comments"
          centered
          open={open}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          width={800}
          footer={null}
        >
          <div style={{ display: "flex", justifyContent: "space-evenly" }}>
            <div className="profily">
              <Form
                {...formItemLayout}
                form={form}
                name="register"
                onFinish={onFinish}
                style={{
                  maxWidth: 600,
                }}
                scrollToFirstError
              >
                <Form.Item
                  name="name"
                  label="Comment here"
                  // tooltip="What do you want others to call you?"
                  rules={[
                    {
                      required: true,
                      message: "Please input your comment!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input
                    onChange={(e) => setComments(e.target.value)}
                    style={{ width: "25rem" }}
                  />
                </Form.Item>

                <Form.Item {...tailFormItemLayout}>
                  <Button
                    type="primary"
                    onClick={() => handleComment(singleModelProps)}
                  >
                    Add the Comment
                  </Button>
                </Form.Item>
              </Form>

              {/*MAPPING THE COMMENTS in modal */}
              {singleModelProps?.comments.map((e) => {
                return (
                  <>
                    <div className="ozil12">
                      <div>
                        <UserOutlined id="avtr1" />
                      </div>
                      <span id="username1">{e.commenter}</span>
                    </div>
                    <span className="comment-text">{e.cmt_text}</span>
                    <p className="timestamp">{getTime(e.cmt_time)}</p>
                  </>
                );
              })}
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}

export default PostItem;
