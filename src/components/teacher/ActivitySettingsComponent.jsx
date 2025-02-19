import React, { useState, useEffect } from "react";
import { Dropdown, Navbar, Tab, Tabs } from "react-bootstrap";
import "../../style/teacher/activitySettings.css";
import AMNavigationBarComponent from './AMNavigationBarComponent';


const ActivitySettingsComponent = () => {
  return (
    <div className="activity-settings">

      <AMNavigationBarComponent />

      <ActivityHeader name="Jonald Jawanagi" points={100} />

      <div className="activity-page">
        {/* Left Column */}
        <div className="left-column">
          <div className="info-container">
            <ProfInfo className="Bossing" imageUrl="src/assets/prof.png" />
          </div>

          <div className="date-container">
            <DateTimeSection />
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="right-column-container">
            <OptionalSettings />
          </div>
        </div>
      </div>
    </div>
  );
};


const ActivityHeader = ({ name, points }) => {
  return (
    <header className="activity-header">
      <div className="header-content">
        <div className="left-indicator"></div>
        <h2 className="activity-title">
          {name} <span className="points">({points} points)</span>
        </h2>
        <div className="menu-icon">
          <i className="bi bi-three-dots"></i> 
        </div>
      </div>
    </header>
  );
};

const ProfInfo = ({ className, imageUrl }) => (
  <div className="prof-info">
    <img src={imageUrl} alt="Class" />
    <div>
      <p className="prof-name">クラス Name</p>
      <p className="prof-details">{className}</p>
    </div>
  </div>
);

const DateTimeSection = () => (
  <div className="date-time-section">
    <DateTimeItem
      icon="bi bi-calendar-check"
      label="Open Date and Time"
      defaultDate="2025-01-10T10:30"
      color="#4CAF50" // Green
    />
    <DateTimeItem
      icon="bi bi-calendar2-week"
      label="Due Date and Time"
      defaultDate="2025-01-15T23:59"
      color="#E53935" // Red
    />
    <p className="time-limit">
      Time limit:{" "}
      <span className="highlight">While the activity is still open</span>
    </p>
    <button className="copy-link-btn">
      <i className="bi bi-link-45deg"></i> Copy link
    </button>
  </div>
);


const DateTimeItem = ({ icon, label, defaultDate, color }) => {
  const [date, setDate] = useState(defaultDate);

  return (
    <div className="date-time-item">
      <div className="label-with-icon">
        <i className={icon} style={{ color }}></i>
        <label>{label}</label>
      </div>
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)} 
      />
    </div>
  );
};

export default ActivitySettingsComponent;
const OptionalSettings = () => {
  const [selectedItems, setSelectedItems] = useState([]); 

  const settings = [
    {
      icon: "bi bi-file-earmark-text",
      name: "Exam mode",
      description: "Tab and window switches will be recorded.",
    },
    {
      icon: "bi bi-shuffle",
      name: "Randomized Items",
      description: "Items will be shuffled at random per student.",
    },
    {
      icon: "bi bi-eye-slash",
      name: "Disable reviewing",
      description: "Cannot be reviewed after finishing.",
    },
    {
      icon: "bi bi-bar-chart-line",
      name: "Hide leaderboards",
      description: "Leaderboard will be hidden.",
    },
    {
      icon: "bi bi-clock-history",
      name: "Delay grading",
      description: "You will manually grade your students.",
    },
  ];

  const handleItemClick = (index) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(index)) {
        // If already selected, remove it (deselect)
        return prevSelected.filter((item) => item !== index);
      } else {
        // Add to selected items
        return [...prevSelected, index];
      }
    });
  };

  return (
    <div className="optional-settings">
      <h4 className="optional-settings-title">Optional Settings</h4>
      {settings.map((setting, index) => (
        <div
          key={index}
          className={`setting-item ${
            selectedItems.includes(index) ? "selected" : ""
          }`}
          onClick={() => handleItemClick(index)}
        >
          <i className={setting.icon}></i>
          <div className="setting-details">
            <strong>{setting.name}</strong>
            <p>{setting.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
