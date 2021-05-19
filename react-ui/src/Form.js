import React, { useState } from "react";

const Form = (props) => {
  return (
    <form style={{textAlign: "center"}}>
      <label style={{marginBottom: "15px"}}>
        Drawing Notes:
        </label>
        <textarea
          style={{marginTop: "15px"}}
          placeholder={"Please provide notes about outfits, height differences, or favorite hobbies! Or just ask our artists to use their creativity!"}
          value={props.drawingNotes}
          onChange={(event) => props.setNotes(event.target.value)}
          maxLength={500}
          rows={4}
          cols={40}
        />
    </form>
  );
};

export default Form;
