import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Tabs, Col, Tab, Modal, Button, Form } from 'react-bootstrap';
import TeacherCMNavigationBarComponent from './TeacherCMNavigationBarComponent';
import "../../style/teacher/cmActivities.css"; 
import { getClassActivities, editActivity, deleteActivity, getPresetQuestions, getItemTypes } from "../api/API"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

export const TeacherClassManagementComponent = () => {
  const navigate = useNavigate();

  // Activity states
  const [contentKey, setContentKey] = useState('ongoing');
  const [ongoingActivities, setOngoingActivities] = useState([]);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [upcomingActivities, setUpcomingActivities] = useState([]);

  // Edit mode and selected activity
  const [editMode, setEditMode] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Edit modal state – including all fields to be editable
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    actTitle: '',
    actDesc: '',
    difficulty: '',
    startDate: '',
    endDate: '',
    progLangID: '',
    maxPoints: '',
    questions: ['', '', '']
  });

  // --- States for the Question Selection Modal ---
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  // For questions, we mimic the create activity’s item type and preset question logic:
  const [qSelectedItemType, setQSelectedItemType] = useState(null);
  const [qItemTypeName, setQItemTypeName] = useState('');
  const [qItemTypes, setQItemTypes] = useState([]);
  const [qPresetQuestions, setQPresetQuestions] = useState([]);
  const [showItemTypeDropdown, setShowItemTypeDropdown] = useState(false);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch question item types on component mount
  useEffect(() => {
    fetchQItemTypes();
  }, []);

  // When the question item type changes, fetch its preset questions
  useEffect(() => {
    if (qSelectedItemType) {
      fetchQPresetQuestions();
    }
  }, [qSelectedItemType]);

  // Mapping of programming language IDs to names and images
  const programmingLanguageMap = {
    1: { name: "Java", image: "/src/assets/java2.png" },
    2: { name: "C#", image: "/src/assets/c.png" },
    3: { name: "Python", image: "/src/assets/py.png" }
  };

  // Fetch activities and sort based on time
  const fetchActivities = async () => {
    try {
      const classID = sessionStorage.getItem("selectedClassID");
      if (!classID) {
        console.error("❌ No class ID found in session storage.");
        return;
      }
      const response = await getClassActivities(classID);
      console.log("🟢 API Response:", response);
      if (!response.error) {
        const now = new Date();
        const upcoming = response.ongoing.filter(act => new Date(act.startDate) > now);
        const ongoing = response.ongoing.filter(
          act => new Date(act.startDate) <= now && new Date(act.endDate) > now
        );
        const completed = response.completed;
        setUpcomingActivities(upcoming);
        setOngoingActivities(ongoing);
        setCompletedActivities(completed);
      } else {
        console.error("❌ Failed to fetch activities:", response.error);
      }
    } catch (error) {
      console.error("❌ Error fetching activities:", error);
    }
  };

  // ----- Functions for Question Modal (like in Create Activity) -----
  const fetchQItemTypes = async () => {
    const response = await getItemTypes();
    if (!response.error && response.length > 0) {
      setQItemTypes(response);
      // Set the default item type
      setQSelectedItemType(response[0].itemTypeID);
      setQItemTypeName(response[0].itemTypeName);
    } else {
      console.error("❌ Failed to fetch item types:", response.error);
    }
  };

  const fetchQPresetQuestions = async () => {
    const response = await getPresetQuestions(qSelectedItemType);
    if (!response.error) {
      setQPresetQuestions(response);
    } else {
      console.error("❌ Failed to fetch preset questions:", response.error);
    }
  };

  const handleQuestionClick = (index) => {
    setSelectedQuestionIndex(index);
    setShowQuestionModal(true);
  };

  const handleQuestionModalClose = () => {
    setShowQuestionModal(false);
  };

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
  };

  const handleSaveQuestion = () => {
    if (selectedQuestion !== null && selectedQuestionIndex !== null) {
      const updatedQuestions = [...editFormData.questions];
  
      updatedQuestions[selectedQuestionIndex] = {
        questionID: selectedQuestion.questionID, 
        questionName: selectedQuestion.questionName, 
        itemTypeID: selectedQuestion.itemTypeID
      };
  
      console.log("Updated Questions Array:", updatedQuestions); // Debugging
  
      setEditFormData({ ...editFormData, questions: updatedQuestions });
      setSelectedQuestion(null);
      setShowQuestionModal(false);
    }
  };
  

  const handleItemTypeSelect = (type) => {
    setQSelectedItemType(type.itemTypeID);
    setQItemTypeName(type.itemTypeName);
    setShowItemTypeDropdown(false);
  };
  // ----- End Question Modal Functions -----

  // When Edit is pressed, preload the selected activity’s data into the edit form
  const handleEdit = () => {
    if (!selectedActivity) {
      alert("Choose an activity to edit or delete.");
      return;
    }
  
    console.log("Selected Activity Data:", selectedActivity); // Debugging
    console.log("Selected Activity Questions:", selectedActivity.questions); // Debugging
  
    let existingQuestions = [];
  
    if (Array.isArray(selectedActivity.questions) && selectedActivity.questions.length > 0) {
      existingQuestions = selectedActivity.questions.map(q => ({
        questionID: q?.question?.questionID || null,
        questionName: q?.question?.questionName || "",
        itemTypeID: q?.itemTypeID || null
      }));
    }
  
    console.log("Mapped Questions:", existingQuestions);
  
    while (existingQuestions.length < 3) {
      existingQuestions.push({ questionID: null, questionName: "", itemTypeID: null });
    }
  
    setEditFormData({
      actTitle: selectedActivity.actTitle || '',
      actDesc: selectedActivity.actDesc || '',
      difficulty: selectedActivity.difficulty || '',
      startDate: selectedActivity.startDate ? selectedActivity.startDate.slice(0, 16) : '',
      endDate: selectedActivity.endDate ? selectedActivity.endDate.slice(0, 16) : '',
      progLangID: selectedActivity.progLangID ? selectedActivity.progLangID.toString() : '',
      maxPoints: selectedActivity.maxPoints ? selectedActivity.maxPoints.toString() : '',
      questions: existingQuestions
    });
  
    setShowEditModal(true);
  };
  

  // Delete selected activity
  const handleDelete = async () => {
    if (!selectedActivity) {
      alert("Choose an activity to edit or delete.");
      return;
    }
    const confirmed = window.confirm("Are you sure you want to delete this activity?");
    if (confirmed) {
      try {
        const response = await deleteActivity(selectedActivity.actID);
        if (!response.error) {
          alert("Activity deleted successfully.");
          setSelectedActivity(null);
          fetchActivities();
        } else {
          alert("Error deleting activity: " + response.error);
        }
      } catch (err) {
        console.error("Error deleting activity:", err);
      }
    }
  };

  // Delete all activities
  const handleDeleteAll = async () => {
    const confirmed = window.confirm("Are you sure you want to delete ALL activities?");
    if (confirmed) {
      try {
        const allActivities = [...ongoingActivities, ...completedActivities, ...upcomingActivities];
        for (let act of allActivities) {
          await deleteActivity(act.actID);
        }
        alert("All activities deleted successfully.");
        setSelectedActivity(null);
        fetchActivities();
      } catch (err) {
        console.error("Error deleting all activities:", err);
        alert("Error deleting all activities.");
      }
    }
  };

  // Submit the edit form with all updated fields
  const handleEditSubmit = async (e) => {
    e.preventDefault();
  
    const updatedActivity = {
      actTitle: editFormData.actTitle,
      actDesc: editFormData.actDesc,
      difficulty: editFormData.difficulty,
      startDate: editFormData.startDate || selectedActivity.startDate, // Preserve startDate if not changed
      endDate: editFormData.endDate,
      progLangID: parseInt(editFormData.progLangID),
      maxPoints: parseInt(editFormData.maxPoints),
      questions: editFormData.questions
        .filter(q => q.questionName.trim() !== '') // Remove empty questions
        .map(q => ({
          questionID: q.questionID,  
          questionName: q.questionName,
          itemTypeID: q.itemTypeID
        }))
    };
  
    console.log("Updating Activity with:", updatedActivity); // Debugging
  
    try {
      const response = await editActivity(selectedActivity.actID, updatedActivity);
      console.log("Edit Activity Response:", response);
  
      if (!response.error) {
        alert("Activity edited successfully.");
        setShowEditModal(false);
        setSelectedActivity(null);
        fetchActivities();
      } else {
        console.error("Error editing activity:", response);
        if (response.details && response.details.errors) {
          console.error("Validation Errors:", response.details.errors);
          alert("Validation Errors:\n" + JSON.stringify(response.details.errors, null, 2));
        } else {
          alert("Error editing activity: " + response.error);
        }
      }
    } catch (err) {
      console.error("Error editing activity:", err);
    }
  };
  
  
  // When an activity is clicked, if in edit mode it becomes selected;
  // otherwise, navigate normally.
  const handleActivityClick = (activity) => {
    if (editMode) {
      setSelectedActivity(activity);
    } else {
      navigate(`/teacher/class/activity/${activity.actID}/items`);
    }
  };

  // Helper to determine if an activity is the selected one in edit mode
  const isSelected = (activity) => {
    return editMode && selectedActivity?.actID === activity.actID;
  };

  return (
    <>
      <TeacherCMNavigationBarComponent />
      <div className="create-new-activity-wrapper"></div>
      <div className="create-new-activity-container">
        <button 
          className="create-new-activity-button" 
          onClick={() => {
            const classID = sessionStorage.getItem("selectedClassID");
            if (!classID) {
              alert("⚠️ No class selected!");
              return;
            }
            navigate(`/teacher/class/${classID}/create-activity`);
          }}
        >
          + Create New Activity
        </button>
        <button 
          className="edit-mode-toggle-button" 
          onClick={() => {
            setEditMode(!editMode);
            setSelectedActivity(null);
          }}
        >
          {editMode ? "Exit Edit Mode" : "Enter Edit Mode"}
        </button>
        {editMode && (
          <div className="edit-delete-buttons">
            <button onClick={handleEdit}>Edit</button>
            <button onClick={handleDelete}>Delete</button>
            <button onClick={handleDeleteAll}>Delete All</button>
          </div>
        )}
      </div>

      <div className='class-management'>
        <div className='container class-content'>
          <Tabs defaultActiveKey={contentKey} id="tab" onSelect={(k) => setContentKey(k)} fill>
            <Tab eventKey="ongoing" title="Ongoing"></Tab>
            <Tab eventKey="completed" title="Completed"></Tab>
          </Tabs>

          {/* Ongoing Activities */}
          {contentKey === "ongoing" && (
            <div className='ongoing-class-activities'>
              {ongoingActivities.length === 0 ? (
                <p>No ongoing activities found.</p>
              ) : (
                ongoingActivities.map((activity) => {
                  const language = programmingLanguageMap[activity.progLangID] || { name: "Unknown", image: "/src/assets/default.png" };
                  return (
                    <div 
                      key={`ongoing-${activity.actID}`} 
                      className="class-activities"
                      onClick={() => handleActivityClick(activity)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: isSelected(activity) ? "yellow" : "transparent"
                      }}
                    >
                      <Row>
                        <Col className='activity-details-column'>
                          <div className='class-activity-details'>
                            <h3>{activity.actTitle}</h3>
                            <p className="activity-description">{activity.actDesc}</p>
                            <button disabled className="lang-btn">
                              <img src={language.image} alt={`${language.name} Icon`} /> {language.name}
                            </button>
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
                            <h4>{activity.classAvgScore ?? "N/A"}%</h4>
                            <p>Class Avg. Score</p>
                          </div>
                          <div className='score-chart'>
                            <h4>{activity.highestScore ?? "N/A"} / {activity.maxPoints ?? "N/A"}</h4>
                            <p>Highest Score</p>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Completed Activities */}
          {contentKey === "completed" && (
            <div className='completed-class-activities'>
              {completedActivities.length === 0 ? (
                <p>No completed activities found.</p>
              ) : (
                completedActivities.map((activity) => {
                  const language = programmingLanguageMap[activity.progLangID] || { name: "Unknown", image: "/src/assets/default.png" };
                  return (
                    <div 
                      key={`completed-${activity.actID}`}
                      className="class-activities"
                      onClick={() => handleActivityClick(activity)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: isSelected(activity) ? "yellow" : "transparent"
                      }}
                    >
                      <Row>
                        <Col className='activity-details-column'>
                          <div className='class-activity-details'>
                            <h3>{activity.actTitle}</h3>
                            <p className="activity-description">{activity.actDesc}</p>
                            <button disabled className="lang-btn">
                              <img src={language.image} alt={`${language.name} Icon`} /> {language.name}
                            </button>
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
                            <h4>{activity.classAvgScore ?? "N/A"}%</h4>
                            <p>Class Avg. Score</p>
                          </div>
                          <div className='score-chart'>
                            <h4>{activity.highestScore ?? "N/A"} / {activity.maxPoints ?? "N/A"}</h4>
                            <p>Highest Score</p>
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

      {/* Edit Activity Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Activity</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group controlId="formActivityTitle">
              <Form.Label>Activity Title</Form.Label>
              <Form.Control 
                type="text" 
                value={editFormData.actTitle} 
                onChange={(e) => setEditFormData({ ...editFormData, actTitle: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="formActivityDesc" className="mt-3">
              <Form.Label>Activity Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={editFormData.actDesc} 
                onChange={(e) => setEditFormData({ ...editFormData, actDesc: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="formDifficulty" className="mt-3">
              <Form.Label>Difficulty</Form.Label>
              <Form.Control 
                as="select" 
                value={editFormData.difficulty} 
                onChange={(e) => setEditFormData({ ...editFormData, difficulty: e.target.value })}
                required
              >
                <option value="">Select Difficulty</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formStartDate" className="mt-3">
              <Form.Label>Open Date and Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={editFormData.startDate} 
                onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="formEndDate" className="mt-3">
              <Form.Label>Due Date and Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={editFormData.endDate} 
                onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="formProgLang" className="mt-3">
              <Form.Label>Programming Language</Form.Label>
              <Form.Control 
                as="select" 
                value={editFormData.progLangID} 
                onChange={(e) => setEditFormData({ ...editFormData, progLangID: e.target.value })}
                required
              >
                <option value="">Select a Programming Language</option>
                <option value="1">Java</option>
                <option value="2">C#</option>
                <option value="3">Python</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formMaxPoints" className="mt-3">
              <Form.Label>Total Points</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="Enter total points" 
                value={editFormData.maxPoints} 
                onChange={(e) => setEditFormData({ ...editFormData, maxPoints: e.target.value })}
                required 
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Questions (up to 3)</Form.Label>
              {editFormData.questions.map((q, index) => (
                <Form.Control
                  key={index}
                  type="text"
                  placeholder={`Question ${index + 1}`}
                  value={q.questionName}
                  readOnly
                  onClick={() => handleQuestionClick(index)}
                  className="mt-2"
                />
              ))}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Question Selection Modal */}
      <Modal 
        show={showQuestionModal} 
        onHide={handleQuestionModalClose} 
        dialogClassName="custom-modal" 
        backdropClassName="custom-modal-backdrop" 
        centered={false}
      >
        <div className="custom-modal-content">
          <Modal.Header closeButton>
            <Modal.Title>Choose a Question</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5>Item Type:</h5>
            <Button variant="light" onClick={() => setShowItemTypeDropdown(!showItemTypeDropdown)}>
              {qItemTypeName} <FontAwesomeIcon icon={faCaretDown} />
            </Button>
            {showItemTypeDropdown && (
              <div className="item-type-dropdown">
                {qItemTypes.map(type => (
                  <Button key={type.id} className="dropdown-item" onClick={() => handleItemTypeSelect(type)}>
                    {type.name}
                  </Button>
                ))}
              </div>
            )}
            {qPresetQuestions.map((pq, idx) => (
              <Button 
                key={idx} 
                className={`question-item d-block ${selectedQuestion === pq ? 'highlighted' : ''}`} 
                onClick={() => handleSelectQuestion(pq)}
              >
                {pq.questionName} - {pq.difficulty}
              </Button>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleSaveQuestion}>Save Question</Button>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  );
};