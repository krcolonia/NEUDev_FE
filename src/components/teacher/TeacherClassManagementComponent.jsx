import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Tabs, Col, Tab, Modal, Button, Form } from 'react-bootstrap';
import TeacherCMNavigationBarComponent from './TeacherCMNavigationBarComponent';
import "../../style/teacher/cmActivities.css"; 
import { 
  getClassActivities, 
  editActivity, 
  deleteActivity, 
  getQuestions, 
  getItemTypes,
  getProgrammingLanguages
} from "../api/API"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

// Mapping of known programming language IDs to names and images
const programmingLanguageMap = {
  1: { name: "Java", image: "/src/assets/java2.png" },
  2: { name: "C#", image: "/src/assets/c.png" },
  3: { name: "Python", image: "/src/assets/py.png" }
};

export const TeacherClassManagementComponent = () => {
  const navigate = useNavigate();

  // -------------------- Activity States --------------------
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
    // Removed single progLangID; we use many-to-many now.
    maxPoints: '',
    questions: ['', '', '']
  });

  // For editing multiple programming languages
  const [allProgrammingLanguages, setAllProgrammingLanguages] = useState([]);
  const [editSelectedProgLangs, setEditSelectedProgLangs] = useState([]); // array of IDs

  // --- States for the Question Selection Modal ---
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
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

  // Fetch question item types and programming languages on mount
  useEffect(() => {
    fetchQItemTypes();
    fetchAllProgrammingLanguages();
  }, []);

  // When the question item type changes, fetch its preset questions
  useEffect(() => {
    if (qSelectedItemType) {
      fetchQPresetQuestions();
    }
  }, [qSelectedItemType]);

  // --------------- Fetching Activities ---------------
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

  // --------------- Fetch All Programming Languages ---------------
  const fetchAllProgrammingLanguages = async () => {
    try {
      const response = await getProgrammingLanguages();
      if (!response.error && Array.isArray(response)) {
        setAllProgrammingLanguages(response);
      } else {
        console.error("❌ Error fetching programming languages:", response.error);
      }
    } catch (error) {
      console.error("❌ Error fetching programming languages:", error);
    }
  };

  // --------------- Item Types + Questions for Question Modal ---------------
  const fetchQItemTypes = async () => {
    const response = await getItemTypes();
    if (!response.error && response.length > 0) {
      setQItemTypes(response);
      setQSelectedItemType(response[0].itemTypeID);
      setQItemTypeName(response[0].itemTypeName);
    } else {
      console.error("❌ Failed to fetch item types:", response.error);
    }
  };

  const fetchQPresetQuestions = async () => {
    const response = await getQuestions(qSelectedItemType);
    if (!response.error) {
      setQPresetQuestions(response);
    } else {
      console.error("❌ Failed to fetch preset questions:", response.error);
    }
  };

  // --------------- Question Modal Handlers ---------------
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
      console.log("Updated Questions Array:", updatedQuestions);
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

  const handleRemoveQuestion = () => {
    if (selectedQuestionIndex !== null) {
      const updatedQuestions = [...(editFormData.questions || [])];
      updatedQuestions[selectedQuestionIndex] = { questionID: null, questionName: "", itemTypeID: null };
      setEditFormData({ ...editFormData, questions: updatedQuestions });
      setSelectedQuestion(null);
      setShowQuestionModal(false);
    }
  };

  // --------------- Entering Edit Mode ---------------
  const handleActivityClick = (activity) => {
    if (editMode) {
      setSelectedActivity(activity);
    } else {
      navigate(`/teacher/class/activity/${activity.actID}/items`);
    }
  };

  const isSelected = (activity) => {
    return editMode && selectedActivity?.actID === activity.actID;
  };

  const handleEdit = () => {
    if (!selectedActivity) {
      alert("Choose an activity to edit or delete.");
      return;
    }
    console.log("Selected Activity Data:", selectedActivity);
    console.log("Selected Activity Questions:", selectedActivity.questions);

    let existingQuestions = [];
    if (Array.isArray(selectedActivity.questions) && selectedActivity.questions.length > 0) {
      existingQuestions = selectedActivity.questions.map(q => ({
        questionID: q?.question?.questionID || null,
        questionName: q?.question?.questionName || "",
        itemTypeID: q?.itemTypeID || null
      }));
    }
    while (existingQuestions.length < 3) {
      existingQuestions.push({ questionID: null, questionName: "", itemTypeID: null });
    }

    setEditFormData({
      actTitle: selectedActivity.actTitle || '',
      actDesc: selectedActivity.actDesc || '',
      difficulty: selectedActivity.difficulty || '',
      startDate: selectedActivity.startDate ? selectedActivity.startDate.slice(0, 16) : '',
      endDate: selectedActivity.endDate ? selectedActivity.endDate.slice(0, 16) : '',
      maxPoints: selectedActivity.maxPoints ? selectedActivity.maxPoints.toString() : '',
      questions: existingQuestions
    });
    // Map existing programming language IDs from pivot table.
    const existingLangIDs = (selectedActivity.programming_languages || []).map(lang => lang.progLangID);
    console.log("Existing Programming Languages for Activity:", existingLangIDs);
    setEditSelectedProgLangs(existingLangIDs);
    setShowEditModal(true);
  };

  // --------------- Deleting Activities ---------------
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

  // --------------- Handling Multi-Language in Edit Form ---------------
  const handleEditProgLangToggle = (langID) => {
    if (editSelectedProgLangs.includes(langID)) {
      setEditSelectedProgLangs(editSelectedProgLangs.filter(id => id !== langID));
    } else {
      setEditSelectedProgLangs([...editSelectedProgLangs, langID]);
    }
  };

  const handleSelectAllLangsEdit = (checked) => {
    if (checked) {
      const allIDs = allProgrammingLanguages.map(lang => lang.progLangID);
      setEditSelectedProgLangs(allIDs);
    } else {
      setEditSelectedProgLangs([]);
    }
  };

  // --------------- Submitting Edit Form ---------------
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updatedActivity = {
      actTitle: editFormData.actTitle,
      actDesc: editFormData.actDesc,
      difficulty: editFormData.difficulty,
      startDate: editFormData.startDate || selectedActivity.startDate,
      endDate: editFormData.endDate,
      maxPoints: parseInt(editFormData.maxPoints),
      progLangIDs: editSelectedProgLangs,
      questions: editFormData.questions
        .filter(q => q.questionName.trim() !== '')
        .map(q => ({
          questionID: q.questionID,
          itemTypeID: q.itemTypeID
        }))
    };
    console.log("Updating Activity with:", updatedActivity);
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

  // --------------- Rendering ---------------
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
                            {/* Display multiple programming languages */}
                            <div className="lang-container">
                              {(activity.programming_languages || []).length > 0 ? (
                                activity.programming_languages.map((lang, index) => {
                                  // Use our mapping if available; otherwise, display the language's name
                                  const mapping = programmingLanguageMap[lang.progLangID] || { name: lang.progLangName, image: null };
                                  return (
                                    <button disabled key={lang.progLangID} className="lang-btn">
                                      {mapping.image && (
                                        <img 
                                          src={mapping.image} 
                                          alt={`${mapping.name} Icon`} 
                                          style={{ width: "20px", marginRight: "5px" }}
                                        />
                                      )}
                                      {mapping.name}
                                      {index < activity.programming_languages.length - 1 ? ", " : ""}
                                    </button>
                                  );
                                })
                              ) : (
                                "N/A"
                              )}
                            </div>
                            <p><i className='bi bi-calendar-check'></i> {activity.startDate}</p>
                            <p><i className='bi bi-calendar-x'></i> {activity.endDate}</p>
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
                            <div className="lang-container">
                              {(activity.programming_languages || []).length > 0 ? (
                                activity.programming_languages.map((lang, index) => {
                                  const mapping = programmingLanguageMap[lang.progLangID] || { name: lang.progLangName, image: null };
                                  return (
                                    <button disabled key={lang.progLangID} className="lang-btn">
                                      {mapping.image && (
                                        <img 
                                          src={mapping.image} 
                                          alt={`${mapping.name} Icon`} 
                                          style={{ width: "20px", marginRight: "5px" }}
                                        />
                                      )}
                                      {mapping.name}
                                      {index < activity.programming_languages.length - 1 ? ", " : ""}
                                    </button>
                                  );
                                })
                              ) : (
                                "N/A"
                              )}
                            </div>
                            <p><i className='bi bi-calendar-check'></i> {activity.startDate}</p>
                            <p><i className='bi bi-calendar-x'></i> {activity.endDate}</p>
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

      {/* -------------------- Edit Activity Modal -------------------- */}
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
            {/* Multi-Language Checkboxes for Editing */}
            <Form.Group className="mt-3">
              <Form.Label>Select Programming Languages (Edit Mode)</Form.Label>
              <div style={{ marginBottom: "0.5rem" }}>
                <Form.Check 
                  type="checkbox"
                  label="Applicable to all"
                  checked={
                    editSelectedProgLangs.length > 0 &&
                    editSelectedProgLangs.length === allProgrammingLanguages.length
                  }
                  onChange={(e) => handleSelectAllLangsEdit(e.target.checked)}
                />
              </div>
              {allProgrammingLanguages.map((lang) => (
                <Form.Check 
                  key={lang.progLangID}
                  type="checkbox"
                  label={lang.progLangName}
                  checked={editSelectedProgLangs.includes(lang.progLangID)}
                  onChange={() => handleEditProgLangToggle(lang.progLangID)}
                />
              ))}
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

      {/* -------------------- Question Selection Modal -------------------- */}
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
            <Button 
              variant="light" 
              onClick={() => setShowItemTypeDropdown(!showItemTypeDropdown)}
            >
              {qItemTypeName} <FontAwesomeIcon icon={faCaretDown} />
            </Button>
            {showItemTypeDropdown && (
              <div className="item-type-dropdown">
                {qItemTypes.map((type) => (
                  <Button 
                    key={type.itemTypeID} 
                    className="dropdown-item" 
                    onClick={() => handleItemTypeSelect(type)}
                  >
                    {type.itemTypeName}
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
            <Button variant="secondary" onClick={handleSaveQuestion}>Save Question</Button>
            <Button variant="danger" onClick={handleRemoveQuestion}>Remove Question</Button>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  );
};

export default TeacherClassManagementComponent;