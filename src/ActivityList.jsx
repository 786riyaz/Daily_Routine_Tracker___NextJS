// src/ActivityList.jsx
import React from "react";
import ActivityItem from "./ActivityItem";

export default function ActivityList({
  activities,
  toggleCompleted,
  deleteActivity,
}) {
  if (!activities || activities.length === 0) {
    return <p className="muted">No activities yet.</p>;
  }

  return (
    <div className="list">
      {activities.map((a) => (
        <ActivityItem
          key={a.id}
          activity={a}
          toggleCompleted={toggleCompleted}
          deleteActivity={deleteActivity}
        />
      ))}
    </div>
  );
}
