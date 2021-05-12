import React, { useCallback, useEffect, useState } from "react";
import ImageUploader from "react-images-upload";
import Form from "./Form";
import S3FileUpload from "react-s3";
import "./App.css";

const url = process.env.REACT_APP_INTEGROMAT_URL;
const testData = { picture1: "string1", picture2: "string2" };
const config = {
  bucketName: "lulu-postupload",
  dirName: "Orders" /* optional */,
  region: "us-east-2",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
};

const App = (props) => {
  const [pictures, setPictures] = useState([]);
  const [drawingNotes, setNotes] = useState("");

  const onDrop = (picture) => {
    setPictures([...pictures, picture]);
  };
  const uploadToS3 = (picture) => {
    S3FileUpload.uploadFile(picture, config)
      .then((data) => {
        console.log("data.location ", data.location);
      })
      .catch((err) => {
        console.warn("error occurred: ", err);
      });
  };
  const prepareData = () => {
    // Process images that are ready for uploading
    pictures.forEach((picture) => {
      uploadToS3(picture);
    });
    return {
      pictures: pictures,
      drawingNotes: drawingNotes,
    };
  };
  const fetchIntegromat = async (url = "", data) => {
    console.log("What is url ", url);
    console.log("What is data ", JSON.stringify(data));

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
    </div>
  );
};

export default App;
