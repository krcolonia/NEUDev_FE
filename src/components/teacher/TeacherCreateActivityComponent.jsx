import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBold, faItalic, faUnderline, faSuperscript, 
  faAlignLeft, faAlignCenter, faAlignRight, faCaretDown 
} from '@fortawesome/free-solid-svg-icons';
import '/src/style/teacher/amCreateNewActivity.css';
import TeacherCMNavigationBarComponent from './TeacherCMNavigationBarComponent';
import { getQuestions, createActivity, getItemTypes, getProgrammingLanguages } from '../api/API';

// Mapping of known programming language IDs to names and images
const programmingLanguageMap = {
  1: { name: "Java", image: "/src/assets/java2.png" },
  2: { name: "C#", image: "/src/assets/c.png" },
  3: { name: "Python", image: "/src/assets/py.png" }
};

export const TeacherCreateActivityComponent = () => {
  const navigate = useNavigate();

  // -------------------- Activity Form State --------------------
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [actDifficulty, setDifficulty] = useState('');

  // NEW: Store duration as a "HH:MM:SS" string
  const [activityDuration, setActivityDuration] = useState('');

  // For programming languages
  const [selectedProgLangs, setSelectedProgLangs] = useState([]);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [itemTypeName, setItemTypeName] = useState('');
  const [itemTypes, setItemTypes] = useState([]);

  // For question selection, store full question objects (or null)
  const [selectedQuestions, setSelectedQuestions] = useState([null, null, null]);
  const [presetQuestions, setPresetQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);

  // New state for question bank scope (personal vs. global preset questions)
  const [questionBankScope, setQuestionBankScope] = useState("personal");

  // Dates
  const [dateOpened, setDateOpened] = useState('');
  const [dateClosed, setDateClosed] = useState('');

  // Modal for picking questions
  const [showModal, setShowModal] = useState(false);
  const [showItemTypeDropdown, setShowItemTypeDropdown] = useState(false);

  // Programming languages from the server
  const [programmingLanguages, setProgrammingLanguages] = useState([]);

  // For actDuration input
  const [durationInMinutes, setDurationInMinutes] = useState("0");

  // -------------------- New states for sorting the preset questions --------------------
  const [questionSortField, setQuestionSortField] = useState("questionName"); // can be "questionName", "questionDifficulty", or "questionPoints"
  const [questionSortOrder, setQuestionSortOrder] = useState("asc"); // "asc" or "desc"

  // Function to toggle sorting order (or change field)
  const toggleQuestionSortOrder = (field) => {
    if (questionSortField === field) {
      setQuestionSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setQuestionSortField(field);
      setQuestionSortOrder("asc");
    }
  };

  const difficultyOrder = {
    "Beginner": 1,
    "Intermediate": 2,
    "Advanced": 3
  };

  const sortedPresetQuestions = [...presetQuestions].sort((a, b) => {
    let fieldA, fieldB;
    switch (questionSortField) {
      case "questionName":
        fieldA = (a.questionName || "").toLowerCase();
        fieldB = (b.questionName || "").toLowerCase();
        break;
      case "questionDifficulty":
        fieldA = difficultyOrder[a.questionDifficulty] || 0;
        fieldB = difficultyOrder[b.questionDifficulty] || 0;
        break;
      case "questionPoints":
        fieldA = a.questionPoints || 0;
        fieldB = b.questionPoints || 0;
        break;
      default:
        fieldA = (a.questionName || "").toLowerCase();
        fieldB = (b.questionName || "").toLowerCase();
    }
    if (fieldA < fieldB) return questionSortOrder === "asc" ? -1 : 1;
    if (fieldA > fieldB) return questionSortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // -------------------- Lifecycle --------------------
  useEffect(() => {
    fetchItemTypes();
    fetchProgrammingLanguages();
  }, []);

  useEffect(() => {
    if (selectedItemType) {
      fetchPresetQuestions();
    }
  }, [selectedItemType, questionBankScope]);

  // -------------------- API Calls --------------------
  const fetchItemTypes = async () => {
    const response = await getItemTypes();
    if (!response.error && response.length > 0) {
      setItemTypes(response);
      setSelectedItemType(response[0].itemTypeID);
      setItemTypeName(response[0].itemTypeName);
    } else {
      console.error("❌ Failed to fetch item types:", response.error);
    }
  };

  const fetchProgrammingLanguages = async () => {
    const response = await getProgrammingLanguages();
    if (!response.error && Array.isArray(response)) {
      setProgrammingLanguages(response);
    } else {
      console.error("❌ Failed to fetch programming languages:", response.error);
    }
  };

  // Updated fetchPresetQuestions to include the question bank scope and teacherID.
  const fetchPresetQuestions = async () => {
    const teacherID = sessionStorage.getItem("userID");
    const response = await getQuestions(selectedItemType, { scope: questionBankScope, teacherID });
    if (!response.error) {
      setPresetQuestions(response);
    } else {
      console.error("❌ Failed to fetch preset questions:", response.error);
    }
  };

  // -------------------- Question Modal Handlers --------------------
  const handleQuestionClick = (index) => {
    setSelectedQuestionIndex(index);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
  };

  const handleSaveQuestion = () => {
    if (!selectedQuestion || selectedQuestionIndex === null) return;

    // Check if the same question is already picked in another slot
    const alreadyExists = selectedQuestions.some(
      (q, i) => i !== selectedQuestionIndex && q && q.questionID === selectedQuestion.questionID
    );
    if (alreadyExists) {
      alert("❌ You already picked that question. Please choose a different one.");
      return;
    }

    const updated = [...selectedQuestions];
    updated[selectedQuestionIndex] = selectedQuestion;
    setSelectedQuestions(updated);
    setSelectedQuestion(null);
    setShowModal(false);
  };

  const handleItemTypeSelect = (type) => {
    setSelectedItemType(type.itemTypeID);
    setItemTypeName(type.itemTypeName);
    setShowItemTypeDropdown(false);
  };

  // -------------------- Programming Languages Checkboxes --------------------
  const handleProgLangToggle = (langID) => {
    if (selectedProgLangs.includes(langID)) {
      setSelectedProgLangs(selectedProgLangs.filter(id => id !== langID));
    } else {
      setSelectedProgLangs([...selectedProgLangs, langID]);
    }
  };

  const handleSelectAllLangs = (checked) => {
    if (checked) {
      const allIDs = programmingLanguages.map(lang => lang.progLangID);
      setSelectedProgLangs(allIDs);
    } else {
      setSelectedProgLangs([]);
    }
  };

  // -------------------- Create Activity --------------------
  const handleCreateActivity = async (e) => {
    e.preventDefault();

    // Basic validations for activity fields:
    if (
      !activityTitle.trim() ||
      !activityDescription.trim() ||
      !actDifficulty ||
      !durationInMinutes ||
      selectedProgLangs.length === 0 ||
      !dateOpened ||
      !dateClosed ||
      selectedQuestions.every(q => q === null)
    ) {
      alert("⚠️ All fields are required, including at least one programming language, one question, and an activity duration.");
      return;
    }

    const classID = sessionStorage.getItem("selectedClassID");

    // Build final question objects (include questionPoints from the question bank)
    const finalQuestions = selectedQuestions
      .filter(q => q !== null)
      .map(q => ({
        questionID: q.questionID,
        itemTypeID: selectedItemType,
        actQuestionPoints: q.questionPoints
      }));

    if (finalQuestions.length === 0) {
      alert("⚠️ Please select at least one valid question.");
      return;
    }

    // Compute total points from selected questions
    const computedPoints = finalQuestions.reduce((sum, q) => sum + (q.actQuestionPoints || 0), 0);

    // Convert total minutes to HH:MM:SS format
    const total = parseInt(durationInMinutes, 10);
    const hh = String(Math.floor(total / 60)).padStart(2, "0");
    const mm = String(total % 60).padStart(2, "0");
    const ss = "00"; // fixed seconds
    const finalDuration = `${hh}:${mm}:${ss}`;

    // The backend will receive actDuration as a string in HH:MM:SS format
    const newActivity = {
      classID,
      actTitle: activityTitle,
      actDesc: activityDescription,
      actDifficulty,
      actDuration: finalDuration, 
      openDate: dateOpened,
      closeDate: dateClosed,
      progLangIDs: selectedProgLangs,
      maxPoints: computedPoints,
      questions: finalQuestions
    };

    console.log("📤 Sending Activity Data:", JSON.stringify(newActivity, null, 2));

    const response = await createActivity(newActivity);
    if (response.error) {
      alert(`❌ Failed to create activity: ${response.error}`);
    } else {
      alert("✅ Activity created successfully!");
      navigate(`/teacher/class/${classID}/activity`); // redirect
    }
  };

  // -------------------- New states for sorting preset questions --------------------
  // (already defined above)

  return (
    <div className="whole-container">
      <TeacherCMNavigationBarComponent />
      <div className='create-activity-content'>
        <div className='create-activity-container'>
          <h2>Create an Activity</h2>
          <Form className='create-activity-form' onSubmit={handleCreateActivity}>
            {/* Activity Title */}
            <Form.Control 
              className='create-activity-title'
              type='text' 
              placeholder='Title...' 
              value={activityTitle} 
              onChange={(e) => setActivityTitle(e.target.value)} 
              required
            />

            {/* Description */}
            <div className='description-section'>
              <div className='description-toolbar'>
                <FontAwesomeIcon icon={faBold} />
                <FontAwesomeIcon icon={faItalic} />
                <FontAwesomeIcon icon={faUnderline} />
                <FontAwesomeIcon icon={faSuperscript} />
                <FontAwesomeIcon icon={faAlignLeft} />
                <FontAwesomeIcon icon={faAlignCenter} />
                <FontAwesomeIcon icon={faAlignRight} />
              </div>
              <Form.Control 
                as='textarea' 
                placeholder='Description...' 
                value={activityDescription} 
                onChange={(e) => setActivityDescription(e.target.value)} 
                required
              />
            </div>

            {/* 3 Question Slots */}
            <div className='question-section'>
              <h4>Set Questions (Maximum of 3)</h4>
              {selectedQuestions.map((q, index) => (
                <div 
                  key={index} 
                  style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
                  onClick={() => handleQuestionClick(index)}
                >
                  <Form.Control
                    type="text"
                    placeholder={`Question ${index + 1}`}
                    value={q ? `${q.questionName} | ${q.questionDifficulty || "-"} | ${q.questionPoints || 0} pts` : ""}
                    readOnly
                    required={index === 0}
                    style={{ flex: 1 }}
                  />
                  {q && (q.programming_languages || q.programmingLanguages) && (
                    <div style={{ marginLeft: "8px" }}>
                      {(q.programming_languages || q.programmingLanguages || []).map((langObj, i) => {
                        const plID = langObj.progLangID;
                        const mapping = programmingLanguageMap[plID] || { name: langObj.progLangName, image: null };
                        return mapping.image ? (
                          <img
                            key={i}
                            src={mapping.image}
                            alt={mapping.name}
                            style={{ width: "20px", marginRight: "5px" }}
                          />
                        ) : (
                          <span key={i} style={{ marginRight: "5px", fontSize: "12px" }}>
                            {mapping.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Difficulty + Date/Time */}
            <div className='difficulty-section'>
              <Form.Control 
                as='select' 
                value={actDifficulty} 
                onChange={(e) => setDifficulty(e.target.value)} 
                required
              >
                <option value=''>Select Difficulty</option>
                <option value='Beginner'>Beginner</option>
                <option value='Intermediate'>Intermediate</option>
                <option value='Advanced'>Advanced</option>
              </Form.Control>

              <DateTimeItem 
                icon="bi bi-calendar-check" 
                label="Open Date and Time" 
                date={dateOpened} 
                setDate={setDateOpened} 
                className="open-date" 
              />
              <DateTimeItem 
                icon="bi bi-calendar2-week" 
                label="Due Date and Time" 
                date={dateClosed} 
                setDate={setDateClosed} 
                className="due-date" 
              />
            </div>

            {/* NEW: Activity Duration Input (HH:MM:SS) */}
            <Form.Group className="mt-3">
              <Form.Label>Activity Duration (in minutes)</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={durationInMinutes}
                  onChange={(e) => setDurationInMinutes(e.target.value)}
                  placeholder="Enter total minutes"
                  required
                />
                <Form.Text className="text-muted">
                  e.g., 90 → 1 hour 30 minutes
                </Form.Text>
            </Form.Group>

            {/* Programming Languages (Checkboxes) */}
            <Form.Group className="mt-3">
              <Form.Label>Select all languages that can be used to solve this item.</Form.Label>
              <div style={{ marginBottom: "0.5rem" }}>
                <Form.Check 
                  type="checkbox"
                  label="Applicable to all"
                  checked={selectedProgLangs.length > 0 && selectedProgLangs.length === programmingLanguages.length}
                  onChange={(e) => handleSelectAllLangs(e.target.checked)}
                />
              </div>
              {programmingLanguages.map((lang) => (
                <Form.Check 
                  key={lang.progLangID}
                  type="checkbox"
                  label={lang.progLangName}
                  checked={selectedProgLangs.includes(lang.progLangID)}
                  onChange={() => handleProgLangToggle(lang.progLangID)}
                />
              ))}
            </Form.Group>

            {/* Display computed Total Points */}
            <Form.Group className="mt-3">
              <Form.Label>Total Points (automatically computed)</Form.Label>
              <Form.Control 
                type="number" 
                value={
                  selectedQuestions
                    .filter(q => q !== null)
                    .reduce((sum, q) => sum + (q.questionPoints || 0), 0)
                }
                readOnly
              />
            </Form.Group>

            <Button className='custom-create-class-btn mt-3' type="submit">
              <i className="bi bi-pencil-square"></i> Create Activity
            </Button>
          </Form>
        </div>

        {/* Modal for selecting a question */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
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
                {itemTypeName} <FontAwesomeIcon icon={faCaretDown} />
              </Button>
              {showItemTypeDropdown && (
                <div className="item-type-dropdown">
                  {itemTypes.map(type => (
                    <Button key={type.itemTypeID} className="dropdown-item" onClick={() => handleItemTypeSelect(type)}>
                      {type.itemTypeName}
                    </Button>
                  ))}
                </div>
              )}
              {/* NEW: Question Creator Selector */}
              <div className="filter-section" style={{ marginBottom: "10px" }}>
                <label>Question Creator:</label>
                <select
                  value={questionBankScope}
                  onChange={(e) => {
                    setQuestionBankScope(e.target.value);
                    fetchPresetQuestions();
                  }}
                >
                  <option value="personal">Created by Me</option>
                  <option value="global">NEUDev</option>
                </select>
              </div>

              {/* Sorting Controls for preset questions */}
              <div
                style={{
                  margin: "10px 0",
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid red", // Debug style to ensure visibility
                  padding: "5px",
                  borderRadius: "4px",
                  backgroundColor: "#f8f9fa"
                }}
              >
                <span style={{ marginRight: "8px" }}>Sort by:</span>
                <Button variant="link" onClick={() => toggleQuestionSortOrder("questionName")}>
                  Name {questionSortField === "questionName" && (questionSortOrder === "asc" ? "↑" : "↓")}
                </Button>
                <Button variant="link" onClick={() => toggleQuestionSortOrder("questionDifficulty")}>
                  Difficulty {questionSortField === "questionDifficulty" && (questionSortOrder === "asc" ? "↑" : "↓")}
                </Button>
                <Button variant="link" onClick={() => toggleQuestionSortOrder("questionPoints")}>
                  Points {questionSortField === "questionPoints" && (questionSortOrder === "asc" ? "↑" : "↓")}
                </Button>
              </div>

              {sortedPresetQuestions.length === 0 ? (
                <p>
                  There are no questions yet. Please go to the{' '}
                  <a href="/teacher/question">Question Bank</a> to create questions.
                </p>
              ) : (
                sortedPresetQuestions.map((q, idx) => (
                  <Button
                    key={idx}
                    className={`question-item d-block ${selectedQuestion === q ? 'highlighted' : ''}`}
                    onClick={() => handleSelectQuestion(q)}
                    style={{ textAlign: "left", marginBottom: "8px" }}
                  >
                    {/* Basic Question Info */}
                    <div>
                      <strong>{q.questionName}</strong> | {q.questionDifficulty} | {q.questionPoints} pts
                    </div>
                    {/* Programming Language Icons */}
                    <div style={{ marginTop: "5px" }}>
                      {(q.programming_languages || q.programmingLanguages || []).map((langObj, i) => {
                        const plID = langObj.progLangID;
                        const mapping = programmingLanguageMap[plID] || { name: langObj.progLangName, image: null };
                        return mapping.image ? (
                          <img
                            key={i}
                            src={mapping.image}
                            alt={mapping.name}
                            style={{ width: "20px", marginRight: "5px" }}
                          />
                        ) : (
                          <span key={i} style={{ marginRight: "5px", fontSize: "12px" }}>
                            {mapping.name}
                          </span>
                        );
                      })}
                    </div>
                  </Button>
                ))
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveQuestion}>Save Question</Button>
            </Modal.Footer>
          </div>
        </Modal>
      </div>
    </div>
  );
};

const DateTimeItem = ({ icon, label, date, setDate, className }) => (
  <div className={`date-time-item ${className}`}>
    <div className="label-with-icon">
      <i className={icon}></i>
      <label>{label}</label>
    </div>
    <input
      type="datetime-local"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      required
    />
  </div>
);

export default TeacherCreateActivityComponent;