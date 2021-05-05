import React, { useState } from "react";

const Form = (props) => {
  return (
    <form onSubmit={handleSubmit}>
      <label>
        Drawing Notes:
        <textarea
          value={drawingNotes}
          onChange={(event) => props.setNotes(event.target.value)}
        />
      </label>
    </form>
  );
};

export default Form;
