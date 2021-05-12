import React, { useCallback, useEffect, useState } from "react";
import ImageUploader from "react-images-upload";
import Form from "./Form";
import "./App.css";

const url = process.env.REACT_APP_INTEGROMAT_URL;
const testData = { picture1: "string1", picture2: "string2" };
const App = (props) => {
  const [pictures, setPictures] = useState([]);
  const [drawingNotes, setNotes] = useState("");

  const onDrop = (picture) => {
    setPictures([...pictures, picture]);
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
      <button onClick={() => handleSubmit(url, testData)}>
        Click me to submit!
      </button>
    </div>
  );
};

export default App;
