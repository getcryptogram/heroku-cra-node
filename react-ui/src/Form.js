import React, { useState } from "react";

const Form = (props) => {
  return (
    <form style={{textAlign: "center"}}>
      <label style={{marginBottom: "15px"}}>
        Drawing Notes (Optional):
        </label>
        <textarea
          style={{marginTop: "15px"}}
          placeholder={"You can include outfits, height differences, or favorite hobbies! Or just ask our artists to use their creativity!"}
          value={props.drawingNotes}
          onChange={(event) => props.setNotes(event.target.value)}
          maxlength={500}
          rows={4}
          cols={40}
        />
    </form>
  );
};

export default Form;
