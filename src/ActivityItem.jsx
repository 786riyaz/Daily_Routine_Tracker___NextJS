// src/ActivityItem.jsx
import React from "react";

export default function ActivityItem({
  activity,
  toggleCompleted,
  deleteActivity,
}) {
  return (
    <div className="item-row">
      <span
        className={activity.completed ? "done-text" : ""}
        onClick={() => toggleCompleted(activity.id)}
      >
        {activity.name}
      </span>

      <button
        className="icon-btn danger"
        type="button"
        onClick={() => deleteActivity(activity.id)}
      >
        ✖
      </button>
    </div>
  );
}
