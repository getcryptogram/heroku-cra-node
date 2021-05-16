import React, { useState } from "react";
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
  const [pictureUrls, setPictureUrl] = useState([]);
  const [drawingNotes, setNotes] = useState("");

  const onDrop = (picture) => {
    setPictures([...pictures, picture]);
  };

  //Uploads files to s3 bucket
  const uploadToS3 = async (picture) => {
    return new Promise((resolve, reject) => {
      return ReactS3Client.uploadFile(picture, picture.name)
        .then((data) => {
          console.log("data.location ", data.location);
          // setPictureUrl([...pictureUrls, data.location]);
          // console.log("now pictureUrl is ", pictureUrls);
          resolve(data.location);
        })
        .catch((err) => {
          console.warn("error occurred: ", err);
        });
    });
  };

  const checkPictures = () => {
    console.log("pictures ", pictures);
  };
  const checkPictureURL = () => {
    console.log("pictureURLs", pictureUrls);
  };

  // Process images that are ready for uploading
  const prepareData = async () => {
    const results = await Promise.all(
      pictures[pictures.length - 1].map(async (picture) => {
        const url = uploadToS3(picture);
        console.log("youve been mapped ", url);
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
    const preparedData = await prepareData();
    console.log("what is preparedData ", preparedData);
    const finalData = {
      imageUrls: preparedData,
      drawingNotes: drawingNotes,
    };
    fetchIntegromat(url, finalData)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        console.log("message received ", json);
      })
      .catch((e) => {
        console.log("something went wrong ", e);
      });
  };

  return (
    <div className="widget-container">
      <Form {...props} setNotes={setNotes} />
      <ImageUploader
        {...props}
        withIcon={true}
        onChange={onDrop}
        withPreview={true}
        imgExtension={[".jpg", ".gif", ".png", ".gif", ".jpeg"]}
        maxFileSize={10242880}
      />
      <button onClick={() => handleSubmit()}>Click me to submit!</button>
      <button onClick={checkPictures}>Check Pictures State</button>
      <button onClick={checkPictureURL}>Check Picture URLs</button>
    </div>
  );
};

export default App;
