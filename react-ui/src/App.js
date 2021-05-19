import React, { useState, useEffect } from "react";
import ImageUploader from "react-images-upload";
import Form from "./Form";
import S3 from "react-aws-s3";

import "./App.css";

const url = process.env.REACT_APP_INTEGROMAT_URL;
const config = {
  bucketName: "lulu-postupload",
  dirName: "Orders" /* optional */,
  region: "us-east-2",
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
};
const ReactS3Client = new S3(config);

const App = (props) => {
  const [pictures, setPictures] = useState([]);
  const [drawingNotes, setNotes] = useState("");
  const [orderInfo, setOrderInfo] = useState({});
  const [orderNumber, setOrderNumber] = useState("");
  const [orderInfoSet, toggleOrderInfo] = useState(false);

  React.useEffect(() => {
    window.addEventListener("message", (event) => {
      console.log("message received from ", event.origin)
      if (event.origin == "https://www.lulucartoons.com") {
        console.log("message received on app")
      let orderStr = '';
      if (event.data.orderArr) {
        for (var i = 0; i < event.data.orderArr.length - 1; i++) {
          for (const prop in event.data.orderArr[i]) {
            orderStr += event.data.orderArr[i].prop     
          }
        }
        console.log("orderStr is ", orderStr);
      }
      if (event.data.orderNumber) {
        setOrderNumber(event.data.orderNumber);
      }
      
      setOrderInfo(orderStr);
      toggleOrderInfo(true);
    }
  });
  }, []);

  const onDrop = (picture) => {
    setPictures([...pictures, picture]);
  };

  //Uploads files to s3 bucket
  const uploadToS3 = async (picture) => {
    return new Promise((resolve, reject) => {
      return ReactS3Client.uploadFile(picture, picture.name)
        .then((data) => {
          resolve(data.location);
        })
        .catch((err) => {
          console.warn("error occurred: ", err);
        });
    });
  };

  // Process images that are ready for uploading
  const prepareData = async () => {
    const results = await Promise.all(
      pictures[pictures.length - 1].map(async (picture) => {
        const url = uploadToS3(picture);
        return url;
      })
    );

    return results;
  };
  const fetchIntegromat = async (url = "", data) => {
    const fetchBody = {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "no-cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    };

    const response = await fetch(url, fetchBody);
    return response.json();
  };

  const handleSubmit = async () => {
    if (drawingNotes.length < 10) {
      alert("Please include more detailed drawing notes!");
      return;
    }
    if (pictures.length < 1) {
      alert("Please upload at least 1 picture!");
      return;
    }
    const preparedData = await prepareData();
    const finalData = {
      orderTitle: orderInfo,
      imageUrls: preparedData,
      drawingNotes: drawingNotes,
    };
    const finalImageStr = preparedData.join(" ");
    const finalTitleStr = Object.values(orderInfo).join(" ");

    const sendStr = `Order Number: ${orderNumber} Order Title: ${finalTitleStr}  Images: ${finalImageStr} Drawing Notes: ${drawingNotes}
    `;

    fetchIntegromat(url, sendStr)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        // eslint-disable-next-line no-restricted-globals
        const iframe = parent.document.getElementById('lulu-post-checkout');
        // eslint-disable-next-line no-restricted-globals
        window.parent.postMessage("close");
        iframe.style.display = "none";
      })
      .catch((e) => {
        // eslint-disable-next-line no-restricted-globals
        const iframe = parent.document.getElementById('lulu-post-checkout');
        // eslint-disable-next-line no-restricted-globals
        window.parent.postMessage("close");
        iframe.style.display = "none";
      });
  };
  const handleClose = () => {
    window.parent.postMessage("close");
  }

  return (
    <div id="lulu-checkout-container">
      <div className="lulu-overlay-container"></div>
      <div className="widget-container">
        <h1 style={{textAlign: "center"}}> One Final Step... </h1>
        <h2 style={{textAlign: "center"}}> Complete Your Order Below! </h2>
        <Form {...props} setNotes={setNotes} />
        <ImageUploader
          {...props}
          withIcon={true}
          onChange={onDrop}
          withPreview={true}
          label={"Max file size: 10 mb, accepted: jpg, png"}
          imgExtension={[".jpg", ".png", ".gif", ".jpeg"]}
          maxFileSize={10242880}
        />
        <div style={{width: "100%"}}>
          <button className="submit-button" onClick={() => handleSubmit()}>Click me to submit!</button>
        </div>
        <button handleClose={() => handleClose()}>Click me to close!</button>
      </div>
    </div>
  );
};

export default App;
