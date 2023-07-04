import React, { useState, useEffect } from "react";
import "./Posts.css";
import { Modal, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { storage } from "../utils/firebase";
import { listAll, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import {
  addDoc,
  collection,
  orberBy,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useSelector } from "react-redux";
import PostItem from "./PostItem";
import tempel from "../assets/tempel.png";

function Posts({name}) {
  const userID = useSelector((state) => state.users.uid);
  const username = useSelector((state) => state.users.name);
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [posts, setPosts] = useState([]);
  const postsRef = collection(db, "posts");
  
  // Getting the posts url from firestore using snapshots
  useEffect(() => {
    const q = query(postsRef, orderBy('time', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setPosts(messages);
    });
    return () => {
      unsubscribe();
    };
  }, [])

  // Uploading to Storage on form button click
  const uploadfunc = async () => {
    if (media == null) return;
    setLoading(true);

    const mediaRef = ref(storage, `${media.name + v4()}`);
    await uploadBytes(mediaRef, media);

    //Saved URL in storage
    const downloadURL = await getDownloadURL(mediaRef);
    //Pushing the post in firestore
    await addDoc(postsRef, {
      time: new Date(),
      caption: caption,
      username: username,
      like:0,
      comments:[],
      commentNumber:0,
      user_id: userID,
      MEDIA_URL: downloadURL,
      id:v4()
    });

    setLoading(false);
    message.success("Uploaded successfully");
    setOpen(false);
    setCaption("");
    setMedia(null);
    setMediaPreview();
  };

  //Preview setting of the media to be uploaded
  const handleMediaPreview = (e) => {
    const selectedMedia = e.target.files[0];
    setIsVideo(selectedMedia.type.startsWith("video/")); // Returns true if the selected media is a video
    setMedia(selectedMedia);
    setMediaPreview(URL.createObjectURL(selectedMedia));
  };

  return (
    <div className="post--container">
      <img
        src={tempel}
        width="960px"
        alt=""
        style={{
          borderRadius: "2rem",
          marginTop: "6rem",
          width:'62rem',
          marginBottom: "3rem",
        }}
      />
      <div className="posts" style={{ width: "100vw" }}>
        <PostItem singlepost={posts} />
      </div>

      <div className="addpost--modal">
        <button id="add--post" onClick={() => setOpen(true)}>
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="css-i6dzq1"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>{" "}
          Add a Post
        </button>
        <Modal
          title="Add a New Post"
          centered
          open={open}
          onOk={uploadfunc}
          onCancel={() => setOpen(false)}
          width={800}
          footer={[
            <button
              key="upload"
              onClick={uploadfunc}
              className="ant-btn ant-btn-primary"
              disabled={loading}
            >
              {loading ? <LoadingOutlined /> : "Add"}
            </button>,
            <button
              key="cancel"
              onClick={() => setOpen(false)}
              className="ant-btn"
            >
              Cancel
            </button>,
          ]}
        >
          <div className="profi">
            <form>
              <span id="captiontext">Caption</span>{" "}
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                id="caption"
                rows="3"
                cols="55"
              ></textarea>
              <input type="file" name="" id="" onChange={handleMediaPreview} />
              {/* Display the media preview */}
              {mediaPreview && isVideo && (
                <video
                  src={mediaPreview}
                  alt=""
                  style={{ width: "80%", height: "400px", marginTop: "10px" }}
                  controls
                />
              )}
              {mediaPreview && !isVideo && (
                <img
                  src={mediaPreview}
                  alt=""
                  style={{ width: "80%", height: "400px", marginTop: "10px" }}
                />
              )}
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default Posts;
