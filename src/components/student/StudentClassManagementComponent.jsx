import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Tabs, Col, Tab, Modal, Button } from 'react-bootstrap';
import StudentCMNavigationBarComponent from './StudentCMNavigationBarComponent';
import "../../style/teacher/cmActivities.css"; 
import { getStudentActivities } from "../api/API"; 

// Mapping of known programming languages to icons
const programmingLanguageMap = {
  "Java":   { name: "Java",   image: "/src/assets/java2.png" },
  "C#":     { name: "C#",     image: "/src/assets/c.png" },
  "Python": { name: "Python", image: "/src/assets/py.png" }
};

// Timer component displays a countdown timer as "HH:MM:SS".
// If time left is <= 10 minutes, the timer text turns red and bold.
const Timer = ({ openDate, closeDate }) => {
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [isTimeLow, setIsTimeLow] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const open = new Date(openDate);
      const close = new Date(closeDate);
      let diff = 0;

      if (now < open) {
        diff = open - now;
      } else if (now >= open && now <= close) {
        diff = close - now;
      } else {
        diff = 0;
      }

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        setIsTimeLow(false);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setTimeLeft(formatted);
        setIsTimeLow(diff <= 10 * 60 * 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [openDate, closeDate]);

  return (
    <span style={{ color: isTimeLow ? "red" : "inherit", fontWeight: isTimeLow ? "bold" : "normal" }}>
      {timeLeft}
    </span>
  );
};

export const StudentClassManagementComponent = () => {
  const navigate = useNavigate();
  const { classID } = useParams();
  // Tab states
  const [contentKey, setContentKey] = useState('ongoing');

  // Activities states
  const [ongoingActivities, setOngoingActivities] = useState([]);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [upcomingActivities, setUpcomingActivities] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    fetchActivities();
    // Re-fetch activities every 10 seconds
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch student activities from API and filter by classID
  const fetchActivities = async () => {
    try {
      const response = await getStudentActivities();
      console.log("🟢 API Response:", response);
      if (!response || response.error) {
        console.error("❌ Failed to fetch activities:", response.error);
        return;
      }
      const now = new Date();
      // Filter activities using openDate and closeDate
      const upcoming = response.ongoing.filter(act => new Date(act.openDate) > now);
      const ongoing  = response.ongoing.filter(
        act => new Date(act.openDate) <= now && new Date(act.closeDate) > now
      );
      const completed = response.completed;

      // Further filter by the current classID.
      const filteredUpcoming = upcoming.filter(act => String(act.classID) === String(classID));
      const filteredOngoing  = ongoing.filter(act => String(act.classID) === String(classID));
      const filteredCompleted = completed.filter(act => String(act.classID) === String(classID));

      setUpcomingActivities(filteredUpcoming);
      setOngoingActivities(filteredOngoing);
      setCompletedActivities(filteredCompleted);
    } catch (error) {
      console.error("❌ Error fetching activities:", error);
    }
  };

  // Handle click on an activity.
  // If the activity's closeDate has passed, show a modal; otherwise, navigate.
  const handleActivityClick = (activity) => {
    const now = new Date();
    const activityClose = new Date(activity.closeDate);
    if (now > activityClose) {
      setModalMessage("This activity is finished and can no longer be accessed.");
      setShowModal(true);
    } else {
      navigate(`/student/class/${classID}/activity/${activity.actID}/items`);
    }
  };

  // Helper to render multiple languages
  const renderLanguages = (languagesArray) => {
    if (!Array.isArray(languagesArray) || languagesArray.length === 0) {
      return "N/A";
    }
    return (
      <div className="lang-container">
        {languagesArray.map((langItem, index) => {
          let langName;
          if (typeof langItem === "object" && langItem !== null) {
            langName = (langItem.progLangName || "").trim();
          } else {
            langName = String(langItem).trim();
          }
          const mapping = programmingLanguageMap[langName] || { name: langName, image: null };
          return (
            <button disabled key={index} className="lang-btn">
              {mapping.image ? (
                <img 
                  src={mapping.image} 
                  alt={`${mapping.name} Icon`} 
                  style={{ width: "20px", marginRight: "5px" }}
                />
              ) : null}
              {mapping.name}
            </button>
          );
        })}
      </div>
    );
  };

  // Helper: Format date/time like "05 November 2024 10:29AM"
  const formatDateString = (dateString) => {
    if (!dateString) return "N/A";
    const dateObj = new Date(dateString);
    const day = String(dateObj.getDate()).padStart(2, '0'); 
    const monthName = dateObj.toLocaleString('default', { month: 'long' });
    const year = dateObj.getFullYear();
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${day} ${monthName} ${year} ${hours}:${minutes}${ampm}`;
  };

  return (
    <>
      <StudentCMNavigationBarComponent />
      <div className='class-management'>
        <div className='container class-content'>
          <Tabs
            defaultActiveKey={contentKey}
            id="tab"
            onSelect={(k) => setContentKey(k)}
            fill
          >
            <Tab eventKey="ongoing" title="Ongoing"></Tab>
            <Tab eventKey="completed" title="Completed"></Tab>
          </Tabs>
          {contentKey === "ongoing" && (
            <div className='ongoing-class-activities'>
              {ongoingActivities.length === 0 ? (
                <p>No ongoing activities found.</p>
              ) : (
                ongoingActivities.map((activity) => {
                  const languages = activity.programmingLanguages || activity.programming_languages || [];
                  return (
                    <div 
                      className='class-activities' 
                      key={`ongoing-${activity.actID}`} 
                      onClick={() => handleActivityClick(activity)}
                      style={{ cursor: "pointer" }}
                    >
                      <Row>
                        <Col className='activity-details-column'>
                          <div className='class-activity-details'>
                            <h3>{activity.actTitle}</h3>
                            <p><strong>Professor:</strong> {activity.teacherName}</p>
                            {renderLanguages(languages)}
                            <h6><strong>Difficulty:</strong> {activity.difficulty || "N/A"}</h6>
                            <p>
                              <i className='bi bi-calendar-check'></i>{" "}
                              Open Date: {formatDateString(activity.openDate)}
                            </p>
                            <p>
                              <i className='bi bi-calendar-x'></i>{" "}
                              Close Date: {formatDateString(activity.closeDate)}
                            </p>
                            <div style={{ marginTop: "5px" }}>
                              <strong>Time Left: </strong>
                              <Timer openDate={activity.openDate} closeDate={activity.closeDate} />
                            </div>
                          </div>
                        </Col>
                        <Col className='activity-stats'>
                          <div className='score-chart'>
                            <h4>{activity.rank ?? "N/A"}</h4>
                            <p>Rank</p>
                          </div>
                          <div className='score-chart'>
                            <h4>
                              {activity.overallScore !== null 
                                ? `${activity.overallScore} / 100` 
                                : "N/A"}
                            </h4>
                            <p>Overall Score</p>
                          </div>
                          <div className='score-chart'>
                            <h4>{activity.duration ?? "N/A"}</h4>
                            <p>Duration Taken</p>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  );
                })
              )}
            </div>
          )}
          {contentKey === "completed" && (
            <div className='completed-class-activities'>
              {completedActivities.length === 0 ? (
                <p>No completed activities found.</p>
              ) : (
                completedActivities.map((activity) => {
                  const languages = activity.programmingLanguages || activity.programming_languages || [];
                  return (
                    <div 
                      className='class-activities' 
                      key={`completed-${activity.actID}`} 
                      onClick={() => handleActivityClick(activity)}
                      style={{ cursor: "pointer" }}
                    >
                      <Row>
                        <Col className='activity-details-column'>
                          <div className='class-activity-details'>
                            <h3>{activity.actTitle}</h3>
                            <p><strong>Professor:</strong> {activity.teacherName}</p>
                            {renderLanguages(languages)}
                            <h6><strong>Difficulty:</strong> {activity.difficulty || "N/A"}</h6>
                            <p>
                              <i className='bi bi-calendar-check'></i>{" "}
                              Open Date: {formatDateString(activity.openDate)}
                            </p>
                            <p>
                              <i className='bi bi-calendar-x'></i>{" "}
                              Close Date: {formatDateString(activity.closeDate)}
                            </p>
                            <div style={{ marginTop: "5px" }}>
                              <strong>Time Left: </strong>
                              <Timer openDate={activity.openDate} closeDate={activity.closeDate} />
                            </div>
                          </div>
                        </Col>
                        <Col className='activity-stats'>
                          <div className='score-chart'>
                            <h4>{activity.rank ?? "N/A"}</h4>
                            <p>Rank</p>
                          </div>
                          <div className='score-chart'>
                            <h4>
                              {activity.overallScore !== null 
                                ? `${activity.overallScore} / 100` 
                                : "N/A"}
                            </h4>
                            <p>Overall Score</p>
                          </div>
                          <div className='score-chart'>
                            <h4>{activity.duration ?? "N/A"}</h4>
                            <p>Duration Taken</p>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
      {/* Modal for finished activity */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Activity Finished</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{modalMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StudentClassManagementComponent;