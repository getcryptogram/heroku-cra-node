import React, { useState } from "react";

const Form = (props) => {
  return (
    <form>
      <label>
        Drawing Notes:
        <textarea
          value={props.drawingNotes}
          onChange={(event) => props.setNotes(event.target.value)}
        />
      </label>
    </form>
  );
};

export default Form;
