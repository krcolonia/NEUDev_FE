import React, { useState, useEffect } from "react"; 
import { useParams } from "react-router-dom";
import "../../style/teacher/activitySettings.css";
import TeacherAMNavigationBarComponent from './TeacherAMNavigationBarComponent';
import { getActivitySettingsTeacher, updateActivitySettingsTeacher, getProfile } from "../api/API";

const TeacherActivitySettingsComponent = () => {
  const { actID } = useParams(); // ✅ Get actID from URL
  const [activity, setActivity] = useState(null);
  const [settings, setSettings] = useState(null);
  const [professor, setProfessor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    fetchProfessorInfo();
  }, []);

  // ✅ Fetch activity settings
  const fetchSettings = async () => {
    const response = await getActivitySettingsTeacher(actID);
    if (!response.error) {
      setActivity({
        name: response.activityName,
        maxPoints: response.maxPoints,
        className: response.className,
        startDate: response.startDate,
        endDate: response.endDate
      });
      setSettings(response.settings);
    }
    setLoading(false);
  };

  // ✅ Fetch professor details
  const fetchProfessorInfo = async () => {
    const response = await getProfile();
    if (!response.error) {
      setProfessor({
        name: `${response.firstname} ${response.lastname}`,
        imageUrl: response.profileImage || "/src/assets/noy.png"
      });
    }
  };

  return (
    <div className="activity-settings">
      <TeacherAMNavigationBarComponent />

      {!loading && activity ? (
        <>
          <ActivityHeader name={activity.name} points={activity.maxPoints} />
          <div className="activity-page">
            {/* Left Column */}
            <div className="left-column">
              <div className="info-container">
                {professor && <ProfInfo name={professor.name} imageUrl={professor.imageUrl} />}
              </div>
              <div className="date-container">
                <DateTimeSection startDate={activity.startDate} endDate={activity.endDate} />
              </div>
            </div>

            {/* Right Column */}
            <div className="right-column">
              <div className="right-column-container">
                {settings && <OptionalSettings actID={actID} settings={settings} />}
              </div>
            </div>
          </div>
        </>
      ) : (
        <p>Loading activity settings...</p>
      )}
    </div>
  );
};

// ✅ Activity Header Component
const ActivityHeader = ({ name, points }) => (
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

// ✅ Professor Info Component
const ProfInfo = ({ name, imageUrl }) => (
  <div className="prof-info">
    <img src={imageUrl} alt="Professor" />
    <div>
      <p className="prof-name">{name}</p>
      <p className="prof-details">Instructor</p>
    </div>
  </div>
);

// ✅ DateTime Section Component
const DateTimeSection = ({ startDate, endDate }) => (
  <div className="date-time-section">
    <DateTimeItem
      icon="bi bi-calendar-check"
      label="Open Date and Time"
      defaultDate={startDate}
      color="#4CAF50"
    />
    <DateTimeItem
      icon="bi bi-calendar2-week"
      label="Due Date and Time"
      defaultDate={endDate}
      color="#E53935"
    />
    <p className="time-limit">
      Time limit: <span className="highlight">While the activity is still open</span>
    </p>
    <button className="copy-link-btn">
      <i className="bi bi-link-45deg"></i> Copy link
    </button>
  </div>
);

// ✅ DateTime Input Component
const DateTimeItem = ({ icon, label, defaultDate, color }) => {
  const [date, setDate] = useState(defaultDate);

  return (
    <div className="date-time-item">
      <div className="label-with-icon">
        <i className={icon} style={{ color }}></i>
        <label>{label}</label>
      </div>
      <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
    </div>
  );
};

// ✅ Optional Settings Component
const OptionalSettings = ({ actID, settings }) => {
  const [selectedSettings, setSelectedSettings] = useState(settings);

  const handleToggle = async (key) => {
    const updatedSettings = { ...selectedSettings, [key]: !selectedSettings[key] };
    setSelectedSettings(updatedSettings);

    // ✅ Update the settings in the backend
    const response = await updateActivitySettingsTeacher(actID, updatedSettings);
    if (response.error) {
      console.error("❌ Failed to update settings:", response.error);
    }
  };

  const settingsList = [
    { key: "examMode", icon: "bi bi-file-earmark-text", name: "Exam mode", description: "Tab and window switches will be recorded." },
    { key: "randomizedItems", icon: "bi bi-shuffle", name: "Randomized Items", description: "Items will be shuffled at random per student." },
    { key: "disableReviewing", icon: "bi bi-eye-slash", name: "Disable reviewing", description: "Cannot be reviewed after finishing." },
    { key: "hideLeaderboard", icon: "bi bi-bar-chart-line", name: "Hide leaderboards", description: "Leaderboard will be hidden." },
    { key: "delayGrading", icon: "bi bi-clock-history", name: "Delay grading", description: "You will manually grade your students." }
  ];

  return (
    <div className="optional-settings">
      <h4 className="optional-settings-title">Optional Settings</h4>
      {settingsList.map((setting) => (
        <div
          key={setting.key}
          className={`setting-item ${selectedSettings[setting.key] ? "selected" : ""}`}
          onClick={() => handleToggle(setting.key)}
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

export default TeacherActivitySettingsComponent;