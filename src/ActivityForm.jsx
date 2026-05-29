// src/ActivityForm.jsx
import React, { useState } from "react";

export default function ActivityForm({ addActivity }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    addActivity(value.trim());
    setValue("");
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        className="input"
        type="text"
        placeholder="Enter new activity..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <button className="btn" type="submit">
        Add
      </button>
    </form>
  );
}
