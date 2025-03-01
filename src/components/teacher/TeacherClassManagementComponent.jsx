import React, { useEffect, useState } from 'react';
import { useNavigate, useParams} from 'react-router-dom';
import { Row, Tabs, Col, Tab, Modal, Button, Form } from 'react-bootstrap';
import TeacherCMNavigationBarComponent from './TeacherCMNavigationBarComponent';
import "../../style/teacher/cmActivities.css"; 
import { 
  getClassActivities, 
  editActivity, 
  deleteActivity, 
  getQuestions, 
  getItemTypes, 
  getProgrammingLanguages,
  verifyPassword   // <-- Imported here from your API module
} from "../api/API"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faEllipsisV, faEye, faEyeSlash, faClock } from '@fortawesome/free-solid-svg-icons';

// Mapping of known programming language IDs to names and images
const programmingLanguageMap = {
  1: { name: "Java", image: "/src/assets/java2.png" },
  2: { name: "C#", image: "/src/assets/c.png" },
  3: { name: "Python", image: "/src/assets/py.png" }
};

// Timer component calculates time remaining.
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
        const formatted = `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setTimeLeft(formatted);
        setIsTimeLow(diff <= 10 * 60 * 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [openDate, closeDate]);

  return (
    <span style={{ 
      color: isTimeLow ? "red" : "inherit", 
      fontWeight: isTimeLow ? "bold" : "normal" 
    }}>
      {timeLeft}
    </span>
  );
};

export const TeacherClassManagementComponent = () => {
  const navigate = useNavigate();
  const { classID } = useParams();

  // -------------------- Activity States --------------------
  const [contentKey, setContentKey] = useState('ongoing');
  const [ongoingActivities, setOngoingActivities] = useState([]);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // -------------------- Edit Modal State --------------------
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    actTitle: '',
    actDesc: '',
    actDifficulty: '',
    openDate: '',
    closeDate: '',
    // maxPoints will be computed automatically now
    maxPoints: '',
    questions: ['', '', '']
  });
  const [allProgrammingLanguages, setAllProgrammingLanguages] = useState([]);
  const [editSelectedProgLangs, setEditSelectedProgLangs] = useState([]);

  // -------------------- Question Selection Modal --------------------
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [qSelectedItemType, setQSelectedItemType] = useState(null);
  const [qItemTypeName, setQItemTypeName] = useState('');
  const [qItemTypes, setQItemTypes] = useState([]);
  const [qPresetQuestions, setQPresetQuestions] = useState([]);
  const [showItemTypeDropdown, setShowItemTypeDropdown] = useState(false);

  // -------------------- 3-dots Menu State --------------------
  const [openMenu, setOpenMenu] = useState(null);

  // -------------------- Delete Modal State --------------------
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);

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

  useEffect(() => {
    if (qSelectedItemType) {
      fetchQPresetQuestions();
    }
  }, [qSelectedItemType]);

  // -------------------- API Fetching --------------------
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
        const upcoming = response.ongoing.filter(act => new Date(act.openDate) > now);
        const ongoing = response.ongoing.filter(
          act => new Date(act.openDate) <= now && new Date(act.closeDate) > now
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

  // -------------------- 3-dots Menu / Card Click --------------------
  const toggleMenu = (e, activityID) => {
    e.stopPropagation(); 
    setOpenMenu(openMenu === activityID ? null : activityID);
  };

  const handleActivityCardClick = (activity) => {
    navigate(`/teacher/class/${classID}/activity/${activity.actID}/items`);
  };

  // -------------------- 3-dots Menu Actions --------------------
  const handleEditClick = (e, activity) => {
    e.stopPropagation();
    setOpenMenu(null);
    setSelectedActivity(activity);
    openEditModal(activity);
  };

  const handleDeleteClick = (e, activity) => {
    e.stopPropagation();
    setOpenMenu(null);
    setActivityToDelete(activity);
    setShowDeleteModal(true);
  };

  const handleCopyLinkClick = (e, activity) => {
    e.stopPropagation();
    setOpenMenu(null);
    const activityLink = `${window.location.origin}/teacher/class/${classID}/activity/${activity.actID}/items`;
    navigator.clipboard.writeText(activityLink)
      .then(() => {
        alert("Activity link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
      });
  };

  // -------------------- Delete Confirmation Handler --------------------
  const handleConfirmDelete = async () => {
    const teacherEmail = sessionStorage.getItem("user_email");
    if (!teacherEmail) {
      alert("Teacher email not found. Please log in again.");
      return;
    }
    // Use the imported verifyPassword function here
    const verification = await verifyPassword(teacherEmail, deletePassword);
    if (verification.error) {
      alert(verification.error);
      return;
    }
    try {
      const response = await deleteActivity(activityToDelete.actID);
      if (!response.error) {
        alert("Activity deleted successfully.");
        fetchActivities();
      } else {
        alert("Error deleting activity: " + response.error);
      }
    } catch (err) {
      console.error("Error deleting activity:", err);
    }
    setShowDeleteModal(false);
    setDeletePassword("");
    setActivityToDelete(null);
  };

  // -------------------- Question Modal Handlers --------------------
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
    if (selectedQuestion === null || selectedQuestionIndex === null) return;
    // Check if the same question is already picked
    const duplicate = editFormData.questions.some((q, i) =>
      i !== selectedQuestionIndex &&
      q.questionID === selectedQuestion.questionID
    );
    if (duplicate) {
      alert("❌ You already picked that question. Please choose a different one.");
      return;
    }
    const updatedQuestions = [...editFormData.questions];
    updatedQuestions[selectedQuestionIndex] = {
      questionID: selectedQuestion.questionID,
      questionName: selectedQuestion.questionName,
      itemTypeID: selectedQuestion.itemTypeID,
      questionPoints: selectedQuestion.questionPoints // store the points
    };
    setEditFormData({ ...editFormData, questions: updatedQuestions });
    setSelectedQuestion(null);
    setShowQuestionModal(false);
  };

  const handleRemoveQuestion = () => {
    if (selectedQuestionIndex !== null) {
      const updatedQuestions = [...(editFormData.questions || [])];
      updatedQuestions[selectedQuestionIndex] = {
        questionID: null,
        questionName: "",
        itemTypeID: null,
        questionPoints: 0
      };
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

  // -------------------- Programming Languages Checkboxes --------------------
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

  // -------------------- Edit Modal --------------------
  const openEditModal = (activity) => {
    if (!activity) return;
    let existingQuestions = [];
    if (Array.isArray(activity.questions) && activity.questions.length > 0) {
      existingQuestions = activity.questions.map(q => ({
        questionID: q?.question?.questionID || null,
        questionName: q?.question?.questionName || "",
        itemTypeID: q?.itemTypeID || null,
        questionPoints: q?.question?.questionPoints || 0
      }));
    }
    while (existingQuestions.length < 3) {
      existingQuestions.push({ questionID: null, questionName: "", itemTypeID: null, questionPoints: 0 });
    }
    // Convert actDuration (HH:MM:SS) to total minutes
    let totalMinutes = "";
    if (activity.actDuration) {
      // Extract hours and minutes; ignore seconds.
      const parts = activity.actDuration.split(":");
      if (parts.length >= 2) {
        totalMinutes = String(parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10));
      }
    }
    setEditFormData({
      actTitle: activity.actTitle || '',
      actDesc: activity.actDesc || '',
      actDifficulty: activity.actDifficulty || '',
      openDate: activity.openDate ? activity.openDate.slice(0, 16) : '',
      closeDate: activity.closeDate ? activity.closeDate.slice(0, 16) : '',
      maxPoints: activity.maxPoints ? activity.maxPoints.toString() : '',
      actDuration: totalMinutes,  // Store total minutes as a string
      questions: existingQuestions
    });
    const existingLangIDs = (activity.programming_languages || []).map(lang => lang.progLangID);
    setEditSelectedProgLangs(existingLangIDs);
    setShowEditModal(true);
  };  

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedActivity) return;
    // Compute total points from selected questions
    const computedPoints = editFormData.questions
      .filter(q => q && q.questionPoints)
      .reduce((sum, q) => sum + q.questionPoints, 0);
  
    // Convert the numeric minutes to HH:MM:SS format
    const total = parseInt(editFormData.actDuration, 10);
    const hh = String(Math.floor(total / 60)).padStart(2, "0");
    const mm = String(total % 60).padStart(2, "0");
    const ss = "00"; // fixed seconds
    const finalDuration = `${hh}:${mm}:${ss}`;
  
    const updatedActivity = {
      actTitle: editFormData.actTitle,
      actDesc: editFormData.actDesc,
      actDifficulty: editFormData.actDifficulty,
      openDate: editFormData.openDate || selectedActivity.openDate,
      closeDate: editFormData.closeDate,
      actDuration: finalDuration, // Use the converted duration
      maxPoints: computedPoints, // automatically computed
      progLangIDs: editSelectedProgLangs,
      questions: editFormData.questions
        .filter(q => q.questionName.trim() !== '')
        .map(q => ({
          questionID: q.questionID,
          itemTypeID: q.itemTypeID,
          actQuestionPoints: q.questionPoints
        }))
    };
  
    try {
      const response = await editActivity(selectedActivity.actID, updatedActivity);
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
  

  // -------------------- Helper: Format Date String --------------------
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

  // -------------------- Rendering --------------------
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
                  const languages = activity.programming_languages || [];
                  return (
                    <div 
                      key={`ongoing-${activity.actID}`} 
                      className="class-activities" 
                      style={{ position: "relative", cursor: "pointer" }}
                      onClick={() => handleActivityCardClick(activity)}
                    >
                      {/* 3-dots Menu Button */}
                      <div className="activity-menu-container" style={{ position: "absolute", top: "10px", right: "10px" }}>
                        <button 
                          className="menu-btn" 
                          onClick={(e) => toggleMenu(e, activity.actID)}
                          style={{ background: "none", border: "none" }}
                        >
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>
                        {openMenu === activity.actID && (
                          <div className="activity-menu" style={{ position: "absolute", top: "30px", right: "0", background: "white", border: "1px solid #ccc", zIndex: 10 }}>
                            <div onClick={(e) => handleEditClick(e, activity)} style={{ padding: "5px", cursor: "pointer" }}>Edit</div>
                            <div onClick={(e) => handleDeleteClick(e, activity)} style={{ padding: "5px", cursor: "pointer" }}>Delete</div>
                            <div onClick={(e) => handleCopyLinkClick(e, activity)} style={{ padding: "5px", cursor: "pointer" }}>Copy Link</div>
                          </div>
                        )}
                      </div>

                      <Row>
                        <Col className='activity-details-column'>
                          <div className='class-activity-details'>
                            <h3>{activity.actTitle}</h3>
                            <p className="activity-description">{activity.actDesc}</p>
                            <div className="lang-container">
                              {languages.length > 0 ? (
                                languages.map((lang, index) => {
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
                                      {index < languages.length - 1 ? ", " : ""}
                                    </button>
                                  );
                                })
                              ) : (
                                "N/A"
                              )}
                            </div>
                            <p>
                              <i className='bi bi-calendar-check'></i>{" "}
                              Open Date: {formatDateString(activity.openDate)}
                            </p>
                            <p>
                              <i className='bi bi-calendar-x'></i>{" "}
                              Close Date: {formatDateString(activity.closeDate)}
                            </p>
                            <div>
                              <strong>Time Left: </strong>
                              <Timer openDate={activity.openDate} closeDate={activity.closeDate} />
                            </div>
                            {/* NEW: Display Activity Duration with Clock Icon */}
                            <div>
                              <FontAwesomeIcon icon={faClock} style={{ marginRight: "5px" }} />
                              Duration: {activity.actDuration ? activity.actDuration : "N/A"}
                            </div>
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
                  const languages = activity.programming_languages || [];
                  return (
                    <div 
                      key={`completed-${activity.actID}`}
                      className="class-activities"
                      style={{ position: "relative", cursor: "pointer" }}
                      onClick={() => handleActivityCardClick(activity)}
                    >
                      {/* 3-dots Menu Button */}
                      <div className="activity-menu-container" style={{ position: "absolute", top: "10px", right: "10px" }}>
                        <button 
                          className="menu-btn" 
                          onClick={(e) => toggleMenu(e, activity.actID)}
                          style={{ background: "none", border: "none" }}
                        >
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>
                        {openMenu === activity.actID && (
                          <div className="activity-menu" style={{ position: "absolute", top: "30px", right: "0", background: "white", border: "1px solid #ccc", zIndex: 10 }}>
                            <div onClick={(e) => handleEditClick(e, activity)} style={{ padding: "5px", cursor: "pointer" }}>Edit</div>
                            <div onClick={(e) => handleDeleteClick(e, activity)} style={{ padding: "5px", cursor: "pointer" }}>Delete</div>
                            <div onClick={(e) => handleCopyLinkClick(e, activity)} style={{ padding: "5px", cursor: "pointer" }}>Copy Link</div>
                          </div>
                        )}
                      </div>

                      <Row>
                        <Col className='activity-details-column'>
                          <div className='class-activity-details'>
                            <h3>{activity.actTitle}</h3>
                            <p className="activity-description">{activity.actDesc}</p>
                            <div className="lang-container">
                              {languages.length > 0 ? (
                                languages.map((lang, index) => {
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
                                      {index < languages.length - 1 ? ", " : ""}
                                    </button>
                                  );
                                })
                              ) : (
                                "N/A"
                              )}
                            </div>
                            <div>
                              <i className='bi bi-calendar-check'></i>{" "}
                              Open Date: {formatDateString(activity.openDate)}
                            </div>
                            <p>
                              <i className='bi bi-calendar-x'></i>{" "}
                              Close Date: {formatDateString(activity.closeDate)}
                            </p>
                            <p>
                              <strong>Time Left: </strong>
                              <Timer openDate={activity.openDate} closeDate={activity.closeDate} />
                            </p>
                            {/* NEW: Display Activity Duration with Clock Icon */}
                            <div>
                              <FontAwesomeIcon icon={faClock} style={{ marginRight: "5px" }} />
                              Duration: {activity.actDuration ? activity.actDuration : "N/A"}
                            </div>
                          </div>
                        </Col>
                        <Col className='activity-stats'>
                          <div className='score-chart'>
                            <h4>{activity.classAvgScore ?? "N/A"}</h4>
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
                value={editFormData.actDifficulty} 
                onChange={(e) => setEditFormData({ ...editFormData, actDifficulty: e.target.value })}
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
                value={editFormData.openDate} 
                onChange={(e) => setEditFormData({ ...editFormData, openDate: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="formEndDate" className="mt-3">
              <Form.Label>Close Date and Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={editFormData.closeDate} 
                onChange={(e) => setEditFormData({ ...editFormData, closeDate: e.target.value })}
                required
              />
            </Form.Group>
            {/* NEW: Duration Input as Time */}
            <Form.Group controlId="formDuration" className="mt-3">
              <Form.Label>Activity Duration (in minutes)</Form.Label>
              <Form.Control 
                type="number"
                min="0"
                value={editFormData.actDuration || ""}
                onChange={(e) => setEditFormData({ ...editFormData, actDuration: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="formSelectProgLang" className="mt-3">
              <Form.Label>Select Programming Languages</Form.Label>
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
              <Form.Label>Total Points (automatically computed)</Form.Label>
              <Form.Control 
                type="number" 
                value={
                  editFormData.questions
                    .filter(q => q && q.questionPoints)
                    .reduce((sum, q) => sum + q.questionPoints, 0)
                }
                readOnly
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Questions (up to 3)</Form.Label>
              {editFormData.questions.map((q, index) => (
                <Form.Control
                  key={index}
                  type="text"
                  placeholder={`Question ${index + 1}`}
                  value={
                    q.questionName
                      ? `${q.questionName} - ${q.questionPoints || 0} pts`
                      : ""
                  }
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
                onClick={() => setSelectedQuestion(pq)}
              >
                {pq.questionName} - {pq.questionDifficulty} - {pq.questionPoints} pts
              </Button>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleSaveQuestion}>Save Question</Button>
            <Button variant="danger" onClick={handleRemoveQuestion}>Remove Question</Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* -------------------- Delete Confirmation Modal -------------------- */}
      <Modal show={showDeleteModal} onHide={() => { setShowDeleteModal(false); setDeletePassword(""); }}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete Activity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="deletePassword">
            <Form.Label>Enter Password</Form.Label>
            <div className="d-flex">
              <Form.Control
                type={showDeletePassword ? "text" : "password"}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowDeletePassword(!showDeletePassword)}
                style={{ marginLeft: "5px" }}
              >
                <FontAwesomeIcon icon={showDeletePassword ? faEyeSlash : faEye} />
              </Button>
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setDeletePassword(""); }}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Confirm Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TeacherClassManagementComponent;