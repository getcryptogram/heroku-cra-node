import React, { useCallback, useEffect, useState } from "react";
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
    console.log("called again");
  };

  //Uploads files to s3 bucket
  const uploadToS3 = (picture) => {
    ReactS3Client.uploadFile(picture, picture.name)
      .then((data) => {
        console.log("data.location ", data.location);
        setPictureUrl([...pictureUrls, data.location]);
        return data.location;
      })
      .catch((err) => {
        console.warn("error occurred: ", err);
      });
  };
  const checkPictures = () => {
    console.log("pictures ", pictures);
  };
  const checkPictureURL = () => {
    console.log("pictureURls", pictureUrls);
  };
  // Process images that are ready for uploading
  async function prepareData() {
    console.log("assuming last one is correct ", pictures[pictures.length -1]);
    await const pictureUrls = pictures[pictures.length - 1].map((picture) => {
      const url = uploadToS3(picture);
      return url;
    });
    console.log("what is actually pictureUrls ", pictureUrls);
    setPictureUrl(pictureUrls);
    return {
      pictures: pictureUrls,
      drawingNotes: drawingNotes,
    };
  }
  const fetchIntegromat = async (url = "", data) => {
    prepareData();
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

  const handleSubmit = (url, data) => {
    console.log("calling with ", url, data);
    fetchIntegromat(url, data)
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
      <button onClick={() => handleSubmit(url, prepareData())}>
        Click me to submit!
      </button>
      <button onClick={checkPictures}>Check Pictures State</button>
      <button onClick={checkPictureURL}>Check Picture URLs</button>
    </div>
  );
};

export default App;
