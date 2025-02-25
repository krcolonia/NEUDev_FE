import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../style/teacher/activityItems.css"; 
import StudentAMNavigationBarComponent from "../student/StudentAMNavigationBarComponent";
import { getActivityItemsByStudent } from "../api/API"; // ✅ Import API function

const StudentActivityItemsComponent = () => {
  const { actID } = useParams(); // ✅ Get actID from URL
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null); // ✅ Store activity details
  const [items, setItems] = useState([]); // ✅ Store activity items
  const [loading, setLoading] = useState(true);

  // ✅ Fetch activity data on mount
  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      const response = await getActivityItemsByStudent(actID);
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

  return (
    <div className="activity-items">
      <StudentAMNavigationBarComponent />

      {/* ✅ Display activity details */}
      {activity && (
        <ActivityHeader name={activity.name} points={activity.maxPoints} />
      )}

      <TableComponent items={items} loading={loading} />

      {/* ✅ "Answer The Activity" Button - Always Enabled */}
      <div 
        className="answer-item-btn active"
        onClick={() => navigate(`/student/class/activity/${actID}/assessment`)}
      >
        <i className="bi bi-pencil-square"></i> Answer The Activity
      </div>
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
const TableComponent = ({ items, loading }) => {
  return (
    <div className="table-wrapper">
      <table className="item-table">
        <thead>
          <tr>
            <th>Question Name</th>
            <th>Difficulty</th>
            <th>Item Type</th>
            <th>Student Score</th>
            <th>Time Spent</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="loading-text">Loading...</td>
            </tr>
          ) : items.length > 0 ? (
            items.map((item, index) => (
              <tr key={index}>
                <td>{item.questionName}</td>
                <td>{item.difficulty}</td>
                <td>{item.itemType}</td>
                <td>{item.studentScore ?? "- / 100"}</td>
                <td>{item.studentTimeSpent ?? "-"}</td>
                <td>{item.submissionStatus}</td>
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

export default StudentActivityItemsComponent;