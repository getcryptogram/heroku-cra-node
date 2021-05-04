import React, { useState } from "react";

const Form = (props) => {
  const [drawingNotes, setNotes] = useState("");

  const handleSubmit = (event) => {
    alert("an essay was submitted: ");
    event.preventDefault();
  };
  return (
    <form onSubmit={handleSubmit}>
      <label>
        Drawing Notes:
        <textarea
          value={drawingNotes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>
    </form>
  );
};

export default Form;
