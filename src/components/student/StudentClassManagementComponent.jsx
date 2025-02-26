import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Tabs, Col, Tab } from 'react-bootstrap';
import StudentCMNavigationBarComponent from './StudentCMNavigationBarComponent';
import "../../style/teacher/cmActivities.css"; 
import { getStudentActivities } from "../api/API"; 

// Mapping of known programming languages to icons
const programmingLanguageMap = {
  "Java":   { name: "Java",   image: "/src/assets/java2.png" },
  "C#":     { name: "C#",     image: "/src/assets/c.png" },
  "Python": { name: "Python", image: "/src/assets/py.png" }
};

export const StudentClassManagementComponent = () => {
  const navigate = useNavigate();

  // Tab states
  const [contentKey, setContentKey] = useState('ongoing');

  // Activities states
  const [ongoingActivities, setOngoingActivities] = useState([]);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [upcomingActivities, setUpcomingActivities] = useState([]);

  useEffect(() => {
    fetchActivities();
    // Re-fetch activities every 10 seconds
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch student activities from API
  const fetchActivities = async () => {
    try {
      const response = await getStudentActivities();
      console.log("🟢 API Response:", response);
      if (!response || response.error) {
        console.error("❌ Failed to fetch activities:", response.error);
        return;
      }
      const now = new Date();
      const upcoming = response.ongoing.filter(act => new Date(act.startDate) > now);
      const ongoing  = response.ongoing.filter(
        act => new Date(act.startDate) <= now && new Date(act.endDate) > now
      );
      const completed = response.completed;
      setUpcomingActivities(upcoming);
      setOngoingActivities(ongoing);
      setCompletedActivities(completed);
    } catch (error) {
      console.error("❌ Error fetching activities:", error);
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
          // Handle if langItem is an object or a string
          let langName;
          if (typeof langItem === "object" && langItem !== null) {
            langName = (langItem.progLangName || "").trim();
          } else {
            langName = String(langItem).trim();
          }
          // Look up in the mapping by name
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
                  // Use the programmingLanguages array returned by the server.
                  const languages = activity.programmingLanguages || activity.programming_languages || [];
                  return (
                    <div 
                      className='class-activities' 
                      key={`ongoing-${activity.actID}`} 
                      onClick={() => navigate(`/student/class/activity/${activity.actID}/items`)}
                      style={{ cursor: "pointer" }}
                    >
                      <Row>
                        <Col className='activity-details-column'>
                          <div className='class-activity-details'>
                            <h3>{activity.actTitle}</h3>
                            <p><strong>Professor:</strong> {activity.teacherName}</p>
                            {renderLanguages(languages)}
                            <p>
                              <i className='bi bi-calendar-check'></i> {activity.startDate}
                            </p>
                            <p>
                              <i className='bi bi-calendar-x'></i> {activity.endDate}
                            </p>
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
                      onClick={() => navigate(`/student/class/activity/${activity.actID}/items`)}
                      style={{ cursor: "pointer" }}
                    >
                      <Row>
                        <Col className='activity-details-column'>
                          <div className='class-activity-details'>
                            <h3>{activity.actTitle}</h3>
                            <p><strong>Professor:</strong> {activity.teacherName}</p>
                            {renderLanguages(languages)}
                            <p>
                              <i className='bi bi-calendar-check'></i> {activity.startDate}
                            </p>
                            <p>
                              <i className='bi bi-calendar-x'></i> {activity.endDate}
                            </p>
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
    </>
  );
};

export default StudentClassManagementComponent;