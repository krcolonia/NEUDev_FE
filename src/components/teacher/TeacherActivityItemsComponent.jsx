import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../style/teacher/activityItems.css"; 
import TeacherAMNavigationBarComponent from "./TeacherAMNavigationBarComponent";
import { getActivityItemsByTeacher } from "../api/API"; // ✅ Import API function

const TeacherActivityItemsComponent = () => {
  const { actID } = useParams(); // ✅ Get actID from URL
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null); // ✅ Store activity details
  const [items, setItems] = useState([]); // ✅ Store activity items
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null); // ✅ Track selected question

  // ✅ Fetch activity data on mount
  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      const response = await getActivityItemsByTeacher(actID);
      if (!response.error) {
        setActivity({
          name: response.activityName,
          maxPoints: response.maxPoints,
        });
        setItems(response.questions);
      }
    } catch (error) {
      console.error("❌ Error fetching activity data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle selecting a question
  const handleQuestionClick = (index) => {
    setSelectedQuestion(index === selectedQuestion ? null : index);
  };

  return (
    <div className="activity-items">
      <TeacherAMNavigationBarComponent />

      {/* ✅ Display activity details from API */}
      {activity && (
        <ActivityHeader name={activity.name} points={activity.maxPoints} />
      )}

      <TableComponent 
        items={items} 
        loading={loading} 
        selectedQuestion={selectedQuestion}
        onQuestionClick={handleQuestionClick}
      />

      {/* ✅ "Try Answering" Button */}
      <button
        className={`try-answer-button ${selectedQuestion !== null ? "active" : "disabled"}`}
        onClick={() => selectedQuestion !== null && navigate(`/teacher/class/activity/${actID}/assessment`)}
        disabled={selectedQuestion === null}
      >
        ✏️ Try Answering the Item
      </button>
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

// ✅ Table Component (Dynamic Data)
const TableComponent = ({ items, loading, selectedQuestion, onQuestionClick }) => {
  return (
    <div className="table-wrapper">
      <table className="item-table">
        <thead>
          <tr>
            <th>Question Name</th>
            <th>Difficulty</th>
            <th>Item Type</th>
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
              <tr 
                key={index} 
                className={selectedQuestion === index ? "selected" : ""}
                onClick={() => onQuestionClick(index)}
              >
                <td>{item.questionName}</td>
                <td>{item.difficulty}</td>
                <td>{item.itemType}</td>
                <td>{item.avgStudentScore !== "-" ? `${item.avgStudentScore} / 100` : "- / 100"}</td>
                <td>{item.avgStudentTimeSpent !== "-" ? item.avgStudentTimeSpent : "-"}</td>
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