import React, { useState, useEffect } from "react";
import ImageUploader from "react-images-upload";
import Form from "./Form";
import S3 from "react-aws-s3";

import "./App.css";

const url = process.env.REACT_APP_INTEGROMAT_URL;
console.log("what is url ", url);
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
  const [submittingState, toggleSubmitting] = useState(false);

  React.useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.origin == "https://lulucartoons.com") {
        let orderStr = '';
        if (event.data.orderArr) {
          for (var i = 0; i < event.data.orderArr.length; i++) {
            for (const prop in event.data.orderArr[i]) {
              console.log("event.data.orderArri ", event.data.orderArr[i][prop] )
              orderStr += event.data.orderArr[i][prop] + " "
            }
          }
          orderStr = orderStr.replace(/(\r\n|\n|\r)/gm, "");
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
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data) // body data type must match "Content-Type" header
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
    toggleSubmitting(true);
    let preparedData = await prepareData();
    const finalImageStr = preparedData.join(" , ");
    const finalTitleStr = Object.values(orderInfo).join("");
    preparedData = preparedData.map(imageString => {
      const stripped = imageString.replace(/\s+/g, '');
      return stripped;
    })
    console.log("new preparedData is ", preparedData);
    const finalData = {
      order: orderNumber,
      orderTitle: finalTitleStr,
      imageUrls: finalImageStr,
      drawingNotes: drawingNotes
    }
    console.log("finalData is ", finalData);
    if (preparedData) {
    fetchIntegromat(url, finalData)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        toggleSubmitting(false);
        // eslint-disable-next-line no-restricted-globals
        parent.postMessage("close", "*");
      })
      .catch((e) => {
        // eslint-disable-next-line no-restricted-globals
        parent.postMessage("close", "*");
      });
    }
  };
  const fakeSubmit = async () => {
    const testData = {
      order: "1234",
      orderTitle: "This is a Title",
      imageUrls: "iamage 1 , image 2",
      drawingNotes: "drawingNotes"
    }

    fetchIntegromat(url, testData)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }
      console.log("response.json() ", response.json())
      return response.json();
    })
    .then((json) => {
      console.log("success message ", json)
      // eslint-disable-next-line no-restricted-globals
      parent.postMessage("close", "*");
    })
    .catch((e) => {
      console.log("error ", e);
      // eslint-disable-next-line no-restricted-globals
      parent.postMessage("close", "*");
    });

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
          <button className="submit-button" disabled={!orderInfoSet || submittingState} onClick={() => handleSubmit()}>Click me to submit!</button>
        </div>
      </div>
    </div>
  );
};

export default App;
