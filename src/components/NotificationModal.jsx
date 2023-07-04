import React, { useState } from 'react'
import {  Modal    } from "antd";

function NotificationModal({notifModel, notimap, setNotifModel}) {
  
  return (
    <Modal
    title="Notifications"
    centered
    open={notifModel}
    onOk={() => setNotifModel(false)}
    onCancel={() => setNotifModel(false)}
    width={500}
    footer={null}
  >
    <div style={{ display: "flex", justifyContent: "space-evenly" , overflowY:'scroll '}}>
      <div className="profi" >
        {notimap?.notification?.map((e) => {
          return (
            <div>
              {" "}
              <span id="nb">{e.message}</span> {e.text}
            </div>
          );
        })}
      </div>
    </div>
  </Modal>
  )
}

export default NotificationModal