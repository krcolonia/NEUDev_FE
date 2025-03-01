import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import "../../style/teacher/cmActivities.css"; 
import TeacherAMNavigationBarComponent from "./TeacherAMNavigationBarComponent";
import { getActivityItemsByTeacher } from "../api/API";

// Mapping of known programming languages to images
const programmingLanguageMap = {
  1: { name: "Java", image: "/src/assets/java2.png" },
  2: { name: "C#", image: "/src/assets/c.png" },
  3: { name: "Python", image: "/src/assets/py.png" }
};

const TeacherActivityItemsComponent = () => {
  const { actID, classID } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state for showing question details
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Fetch activity data on mount
  useEffect(() => {
    fetchActivityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchActivityData = async () => {
    try {
      const response = await getActivityItemsByTeacher(actID);
      if (!response.error) {
        // Set basic activity info and questions
        // The backend now returns: activityName, actDesc, maxPoints, questions
        setActivity({
          name: response.activityName,
          description: response.actDesc, // <-- store the description here
          maxPoints: response.maxPoints,
        });
        setItems(response.questions || []);
      }
    } catch (error) {
      console.error("❌ Error fetching activity data:", error);
    } finally {
      setLoading(false);
    }
  };

  // When a row (question) is clicked, open the modal
  const handleRowClick = (question) => {
    setSelectedQuestion(question);
    setShowDetailsModal(true);
  };

  return (
    <div className="activity-items">
      <TeacherAMNavigationBarComponent />

      {activity && (
        <ActivityHeader 
          name={activity.name} 
          description={activity.description}   // <-- pass description to ActivityHeader
          actQuestionPoints={activity.maxPoints}
        />
      )}

      <TableComponent items={items} loading={loading} onRowClick={handleRowClick} />

      <button
        className="try-answer-button active"
        onClick={() => navigate(`/teacher/class/${classID}/activity/${actID}/assessment`)}
      >
        ✏️ Try Answering the Activity
      </button>

      {/* Modal to show question details */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Question Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuestion ? (
            <div>
              <h5>{selectedQuestion.questionName}</h5>
              <p>
                <strong>Description:</strong> {selectedQuestion.questionDesc}
              </p>
              <p>
                <strong>Difficulty:</strong> {selectedQuestion.questionDifficulty}
              </p>
              <p>
                <strong>Points:</strong> {selectedQuestion.actQuestionPoints}
              </p>
              <p>
                <strong>Programming Languages:</strong>{" "}
                {selectedQuestion.programming_languages && selectedQuestion.programming_languages.length > 0 ? (
                  selectedQuestion.programming_languages.map((lang, index) => {
                    const mapping = programmingLanguageMap[lang.progLangID] || { name: lang.progLangName, image: null };
                    return (
                      <span key={lang.progLangID}>
                        {mapping.image ? (
                          <>
                            <img 
                              src={mapping.image} 
                              alt={`${mapping.name} Icon`} 
                              style={{ width: "20px", marginRight: "5px" }}
                            />
                            {mapping.name}
                          </>
                        ) : (
                          lang.progLangName
                        )}
                        {index < selectedQuestion.programming_languages.length - 1 ? ", " : ""}
                      </span>
                    );
                  })
                ) : (
                  "-"
                )}
              </p>
              <h6>Test Cases:</h6>
              {selectedQuestion.testCases && selectedQuestion.testCases.length > 0 ? (
                <ol>
                  {selectedQuestion.testCases.map((tc, index) => (
                    <li key={index}>
                      <strong>Input:</strong> {tc.inputData || "None"} |{" "}
                      <strong>Expected Output:</strong> {tc.expectedOutput} |{" "}
                      <strong>Points:</strong> {tc.testCasePoints}
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No test cases available.</p>
              )}
            </div>
          ) : (
            <p>No question selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// Activity Header Component
const ActivityHeader = ({ name, description, actQuestionPoints }) => (
  <header className="activity-header">
    <div className="header-content">
      {/* Red vertical line on the left */}
      <div className="left-indicator"></div>

      {/* Title + Description container */}
      <div className="activity-info">
        <h2 className="activity-title">
          {name} <span className="points">({actQuestionPoints} points)</span>
        </h2>
        {description && (
          <p className="activity-description">{description}</p>
        )}
      </div>

      <div className="menu-icon">
        <i className="bi bi-three-dots"></i>
      </div>
    </div>
  </header>
);

// Table Component (Dynamic Data)
const TableComponent = ({ items, loading, onRowClick }) => {
  return (
    <div className="table-wrapper">
      <table className="item-table">
        <thead>
          <tr>
            <th>Question Name</th>
            <th>Difficulty</th>
            <th>Item Type</th>
            <th>Points</th>
            <th>Avg. Student Score</th>
            <th>Avg. Student Time Spent</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="loading-text">Loading...</td>
            </tr>
          ) : items.length > 0 ? (
            items.map((item, index) => (
              <tr key={index} onClick={() => onRowClick(item)}>
                <td>{item.questionName}</td>
                <td>{item.questionDifficulty}</td>
                <td>{item.itemType}</td>
                <td>{item.actQuestionPoints}</td>
                <td>
                  {item.avgStudentScore !== "-"
                    ? `${item.avgStudentScore} / ${item.actQuestionPoints}`
                    : `- / ${item.actQuestionPoints}`}
                </td>
                <td>
                  {item.avgStudentTimeSpent !== "-" ? item.avgStudentTimeSpent : "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="loading-text">No items found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};


export default TeacherActivityItemsComponent;