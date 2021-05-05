import React, { useCallback, useEffect, useState } from "react";
import ImageUploader from "react-images-upload";
import Form from "./Form";
import "./App.css";

const App = (props) => {
  const [pictures, setPictures] = useState([]);
  const [drawingNotes, setNotes] = useState("");

  const onDrop = (picture) => {
    setPictures([...pictures, picture]);
    console.log("what is pictures now ", pictures);
  };

  const handleSubmit = (event) => {
    alert("an essay was submitted: ", drawingNotes);
    alert("a nft picture was submitted: ", pictures);
    event.preventDefault();
  };

  return (
    <div className="widget-container">
      <Form {...props} setNotes={setNotes} />
      <ImageUploader
        {...props}
        withIcon={true}
        onChange={onDrop}
        withPreview={true}
        imgExtension={[".jpg", ".gif", ".png", ".gif"]}
        maxFileSize={5242880}
      />
      <form onSubmit={handleSubmit}>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default App;
