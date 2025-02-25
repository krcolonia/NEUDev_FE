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

export const TeacherCreateActivityComponent = () => {
  const navigate = useNavigate();

  // -------------------- Activity Form State --------------------
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selectedProgLangs, setSelectedProgLangs] = useState([]); // multiple languages
  const [maxPoints, setMaxPoints] = useState('');
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [itemTypeName, setItemTypeName] = useState('');
  const [itemTypes, setItemTypes] = useState([]);

  // For question selection (3 slots)
  const [questions, setQuestions] = useState(['', '', '']);
  const [presetQuestions, setPresetQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);

  // Dates
  const [dateOpened, setDateOpened] = useState('');
  const [dateClosed, setDateClosed] = useState('');

  // Modal for picking questions
  const [showModal, setShowModal] = useState(false);
  const [showItemTypeDropdown, setShowItemTypeDropdown] = useState(false);

  // Programming languages from the server
  const [programmingLanguages, setProgrammingLanguages] = useState([]);

  // -------------------- Lifecycle --------------------
  useEffect(() => {
    fetchItemTypes();
    fetchProgrammingLanguages();
  }, []);

  useEffect(() => {
    if (selectedItemType) {
      fetchPresetQuestions();
    }
  }, [selectedItemType]);

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

  const fetchPresetQuestions = async () => {
    const response = await getQuestions(selectedItemType);
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

  /**
   * The key logic: if the question is already chosen in *any* slot,
   * block it to avoid duplicates.
   */
  const handleSaveQuestion = () => {
    if (!selectedQuestion || selectedQuestionIndex === null) return;

    // If the question name is already in another slot, show an error
    const alreadyExists = questions.some(
      (qName, i) =>
        i !== selectedQuestionIndex && // exclude the same slot
        qName === selectedQuestion.questionName
    );
    if (alreadyExists) {
      alert("❌ You already picked that question. Please choose a different one.");
      return;
    }

    // Otherwise, set it in the chosen slot
    const updatedQuestions = [...questions];
    updatedQuestions[selectedQuestionIndex] = selectedQuestion.questionName;
    setQuestions(updatedQuestions);

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

    if (
      !activityTitle.trim() ||
      !activityDescription.trim() ||
      !difficulty ||
      selectedProgLangs.length === 0 ||
      !maxPoints || isNaN(maxPoints) || maxPoints <= 0 ||
      !dateOpened ||
      !dateClosed ||
      questions.every(q => q === '')
    ) {
      alert("⚠️ All fields are required, including at least one programming language.");
      return;
    }

    const classID = sessionStorage.getItem("selectedClassID");

    // Build final question objects
    const selectedQuestions = questions
      .filter(q => q.trim() !== '')
      .map(q => {
        const matched = presetQuestions.find(pq => pq.questionName.trim() === q.trim());
        if (!matched) {
          console.error(`❌ No match found for question: "${q}"`);
          return null;
        }
        return {
          questionID: matched.questionID,
          itemTypeID: selectedItemType
        };
      })
      .filter(q => q !== null);

    if (selectedQuestions.length === 0) {
      alert("⚠️ Please select at least one valid question.");
      return;
    }

    const newActivity = {
      classID,
      actTitle: activityTitle,
      actDesc: activityDescription,
      difficulty,
      startDate: dateOpened,
      endDate: dateClosed,
      progLangIDs: selectedProgLangs,
      maxPoints: parseInt(maxPoints),
      questions: selectedQuestions
    };

    console.log("📤 Sending Activity Data:", JSON.stringify(newActivity, null, 2));

    const response = await createActivity(newActivity);
    if (response.error) {
      alert(`❌ Failed to create activity: ${response.error}`);
    } else {
      console.log("Selected languages:", selectedProgLangs);
      alert("✅ Activity created successfully!");
      navigate(`/teacher/class/${classID}/activity`); // redirect
    }
  };

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
              {questions.map((q, index) => (
                <Form.Control
                  key={index}
                  type='text'
                  placeholder={`Question ${index + 1}`}
                  value={q}
                  readOnly
                  onClick={() => handleQuestionClick(index)}
                  required={index === 0} 
                />
              ))}
            </div>

            {/* Difficulty + Date/Time */}
            <div className='difficulty-section'>
              <Form.Control 
                as='select' 
                value={difficulty} 
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

            {/* Programming Languages (Checkboxes) */}
            <Form.Group className="mt-3">
              <Form.Label>Select all languages that can be used to solve this item.</Form.Label>
              <div style={{ marginBottom: "0.5rem" }}>
                <Form.Check 
                  type="checkbox"
                  label="Applicable to all"
                  checked={
                    selectedProgLangs.length > 0 &&
                    selectedProgLangs.length === programmingLanguages.length
                  }
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

            {/* Total Points */}
            <Form.Group className="mt-3">
              <Form.Label>Total Points</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="Enter total points" 
                value={maxPoints} 
                onChange={(e) => setMaxPoints(e.target.value)} 
                required 
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
          backdropClassName='custom-modal-backdrop' 
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
                {itemTypeName} <FontAwesomeIcon icon={faCaretDown} />
              </Button>
              {showItemTypeDropdown && (
                <div className="item-type-dropdown">
                  {itemTypes.map(type => (
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

              {presetQuestions.map((q, idx) => (
                <Button 
                  key={idx} 
                  className={`question-item d-block ${selectedQuestion === q ? 'highlighted' : ''}`} 
                  onClick={() => handleSelectQuestion(q)}
                >
                  {q.questionName} - {q.difficulty}
                </Button>
              ))}
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

export default TeacherCreateActivityComponent;