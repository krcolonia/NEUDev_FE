import React, { useState, useEffect } from "react";
import { Dropdown, Navbar, Tab, Tabs } from "react-bootstrap";
import "../../style/teacher/activityItems.css"; // Updated CSS file
import AMNavigationBarComponent from './AMNavigationBarComponent';

const ActivityItemsComponent = () => {
  // ✅ Initialize State for Tabs
  const [navKey, setNavKey] = useState("activities");

  // ✅ Handlers
  const handleDashboardClick = () => console.log("Dashboard Clicked");
  const handleProfileClick = () => console.log("Profile Clicked");
  const handleHomeClick = () => console.log("Logged Out");

  return (
    <div className="activity-items">
      <AMNavigationBarComponent
        navKey={navKey}
        setNavKey={setNavKey}
        handleDashboardClick={handleDashboardClick}
        handleProfileClick={handleProfileClick}
        handleHomeClick={handleHomeClick}
      />
      <ActivityHeader name="Jonald Jawanagi" points={100} />
      <TableComponent />
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

const TableComponent = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = "https://your-api-endpoint.com/activity-items"; 

  // ✅ Sample data for simulation
  const mockData = [
    {
      name: "Programmer ng Pinas",
      topic: "Pagiging Solid",
      difficulty: "Easy",
      type: "Console App",
      avgScore: null,
      avgTimeSpent: null,
    },
    {
      name: "React Basics",
      topic: "Frontend Development",
      difficulty: "Medium",
      type: "Web App",
      avgScore: 85,
      avgTimeSpent: "30 mins",
    },
    {
      name: "Node.js API",
      topic: "Backend Development",
      difficulty: "Hard",
      type: "REST API",
      avgScore: 90,
      avgTimeSpent: "45 mins",
    },
  ];

  // Fetch data from the API
  const fetchTableData = async () => {
    try {
      // Simulate API response time
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Simulate API response (Replace with actual fetch request)
      const response = { ok: true, json: () => Promise.resolve(mockData) };

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect to call fetch function on mount
  useEffect(() => {
    fetchTableData();
  }, []);

  return (
    <div className="table-wrapper">
      <table className="item-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Topic</th>
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
          ) : (
            tableData.length > 0 ? (
              tableData.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.topic}</td>
                  <td>{item.difficulty}</td>
                  <td>{item.type}</td>
                  <td>{item.avgScore !== null ? `${item.avgScore} / 100` : "- / 100"}</td>
                  <td>{item.avgTimeSpent !== null ? item.avgTimeSpent : "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="loading-text">No data available</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};


export default ActivityItemsComponent;
