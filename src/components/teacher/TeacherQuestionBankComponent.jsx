import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import "../../style/teacher/activityItems.css";
import { ProfilePlaygroundNavbarComponent } from "../ProfilePlaygroundNavbarComponent.jsx";

// ----- Import your API functions -----
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getItemTypes,
  getProgrammingLanguages
} from "../api/API.js";

/**
 * Optional language -> icon mapping
 */
const programmingLanguageMap = {
  Java:   { name: "Java",   image: "/src/assets/java2.png" },
  "C#":   { name: "C#",     image: "/src/assets/c.png"     },
  Python: { name: "Python", image: "/src/assets/py.png"    },
};

/**
 * Format date from ISO string to "MM/DD/YYYY, hh:mmAM/PM"
 */
function formatDateTime(isoString) {
  if (!isoString) return "N/A";
  const dateObj = new Date(isoString);
  const options = {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  let localStr = dateObj.toLocaleString("en-US", options);
  // remove space before AM/PM => "9:45PM"
  localStr = localStr.replace(/\s(AM|PM)$/, "$1");
  return localStr;
}

/**
 * language ID -> short code for the compiler
 */
const compilerCodeMap = {
  1: "java",
  2: "cs",
  3: "py",
};

/**
 * Basic code validation patterns
 */
const codeValidationPatterns = {
  Java:   /\b(public\s+class\s+\w+|System\.out\.println|import\s+java\.)\b/i,
  "C#":   /\b(using\s+System;|namespace\s+\w+|Console\.WriteLine)\b/i,
  Python: /\b(print\s*\(|def\s+\w+\(|import\s+\w+|class\s+\w+|if\s+|while\s+|for\s+\w+\s+in)\b/i,
};

function isValidCodeForLanguage(code, languageName) {
  const pattern = codeValidationPatterns[languageName];
  if (!pattern) return true; // if no pattern is set, skip
  return pattern.test(code.trim());
}

export default function TeacherQuestionBankComponent() {
  // -------------------- State: Questions & Item Types --------------------
  const [questions, setQuestions] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [allProgLanguages, setAllProgLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------- Modals --------------------
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOutputModal, setShowOutputModal] = useState(false);

  // -------------------- Question Data (for create/edit) --------------------
  const [questionData, setQuestionData] = useState({
    questionID: null,
    questionName: "",
    questionDesc: "",
    difficulty: "Beginner",
    progLangIDs: [],
    testCases: [],
  });

  // -------------------- Code Testing --------------------
  const [code, setCode] = useState("// Write your sample solution here");
  const [testLangID, setTestLangID] = useState(null); // which language to compile
  const [compiling, setCompiling] = useState(false);
  const [rawOutput, setRawOutput] = useState(""); // single-run output or error
  const [runtimeInput, setRuntimeInput] = useState(""); // user-provided input each run

  // -------------------- Lifecycle: Fetch Data --------------------
  useEffect(() => {
    fetchItemTypes();
    fetchProgLanguages();
  }, []);

  useEffect(() => {
    if (selectedItemType !== null) {
      fetchQuestions(selectedItemType);
    }
  }, [selectedItemType]);

  // If the create/edit modal is open, pick a default test language if any are selected
  useEffect(() => {
    if (showCreateModal || showEditModal) {
      if (questionData.progLangIDs.length > 0) {
        setTestLangID(questionData.progLangIDs[0]);
      } else {
        setTestLangID(null);
      }
      setRuntimeInput(""); // reset input field
    }
  }, [showCreateModal, showEditModal, questionData.progLangIDs]);

  // -------------------- API Calls --------------------
  async function fetchItemTypes() {
    try {
      const response = await getItemTypes();
      if (!response.error && Array.isArray(response) && response.length > 0) {
        setItemTypes(response);
        setSelectedItemType(response[0].itemTypeID);
      } else {
        setItemTypes([]);
      }
    } catch (error) {
      console.error("Error fetching item types:", error);
    }
  }

  async function fetchProgLanguages() {
    try {
      const response = await getProgrammingLanguages();
      if (!response.error && Array.isArray(response)) {
        setAllProgLanguages(response);
      } else {
        console.error("Error fetching programming languages:", response.error);
      }
    } catch (error) {
      console.error("Error fetching programming languages:", error);
    }
  }

  async function fetchQuestions(itemTypeID) {
    setLoading(true);
    try {
      const response = await getQuestions(itemTypeID);
      if (!response || response.error || !Array.isArray(response)) {
        setQuestions([]);
      } else {
        setQuestions(response);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  // -------------------- CRUD: Delete Question --------------------
  async function handleDelete() {
    if (!questionData.questionID) return;
    const resp = await deleteQuestion(questionData.questionID);
    if (!resp.error) {
      setQuestions((prev) => (prev || []).filter(q => q.questionID !== questionData.questionID));
      fetchQuestions(selectedItemType);
      setShowDeleteModal(false);
    } else {
      alert(resp.error);
    }
  }

  // -------------------- CRUD: Create or Update Question --------------------
  async function handleCreateOrUpdate() {
    // Validate the question data
    if (!questionData.questionName.trim() ||
        !questionData.questionDesc.trim() ||
        questionData.progLangIDs.length === 0) {
      alert("Please fill in all required fields (name, description, at least one language).");
      return;
    }

    const payload = {
      itemTypeID: selectedItemType,
      progLangIDs: questionData.progLangIDs,
      questionName: questionData.questionName.trim(),
      questionDesc: questionData.questionDesc.trim(),
      difficulty: questionData.difficulty,
      // Keep test cases that have either input or output
      testCases: questionData.testCases.filter(tc =>
        tc.inputData.trim() !== "" || tc.expectedOutput.trim() !== ""
      ),
    };

    let resp;
    if (showCreateModal) {
      // Create
      resp = await createQuestion(payload);
    } else if (showEditModal) {
      // Update
      if (!questionData.questionID) {
        alert("No question selected to update.");
        return;
      }
      resp = await updateQuestion(questionData.questionID, payload);
    }

    if (!resp.error) {
      fetchQuestions(selectedItemType);
      setShowCreateModal(false);
      setShowEditModal(false);
    } else {
      alert(resp.error);
    }
  }

  // -------------------- Remove a Test Case --------------------
  function handleRemoveTestCase(index) {
    const updated = questionData.testCases.filter((_, i) => i !== index);
    setQuestionData({ ...questionData, testCases: updated });
  }

  // -------------------- Run Code Once -> Create a Single Test Case ONLY if success --------------------
  async function handleRunCode() {
    if (!testLangID) {
      alert("Please select which language to test with.");
      return;
    }
    const foundLang = allProgLanguages.find(l => l.progLangID === testLangID);
    if (!foundLang) {
      alert("Selected language is not recognized.");
      return;
    }

    // Optional code-lint check
    if (!isValidCodeForLanguage(code, foundLang.progLangName)) {
      alert(`Your code does not look like valid ${foundLang.progLangName} code.`);
      return;
    }

    const shortCode = compilerCodeMap[testLangID];
    if (!shortCode) {
      alert(`The compiler does not support ${foundLang.progLangName} yet.`);
      return;
    }

    if (!code.trim()) {
      alert("Please enter some code before running.");
      return;
    }

    setCompiling(true);
    setRawOutput("");

    try {
      const response = await fetch("https://neudevcompiler-production.up.railway.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: shortCode,
          input: runtimeInput
        })
      });

      const data = await response.json();
      console.log("[Compiler Response]", response.status, data);

      // 1) Check HTTP status
      // 2) Also check if `data.error` is present
      if (!response.ok || data.error) {
        // If the code fails to compile or run, show the error in rawOutput
        let errorMsg = data.error || data.stderr || "Something went wrong";
        setRawOutput(`Error: ${errorMsg}`);
        // ❌ DO NOT add a new test case
      } else {
        // The code ran successfully
        const actualOutput = (data.output || "").trim();
        // If it's empty, let's label it as "(No output returned...)"
        const finalOutput = actualOutput.length > 0
          ? actualOutput
          : "(No output returned by the compiler)";

        setRawOutput(finalOutput);

        // ✅ Only add the test case if there's no error
        const newTC = {
          inputData: runtimeInput,
          expectedOutput: finalOutput,
        };
        setQuestionData({
          ...questionData,
          testCases: [...questionData.testCases, newTC],
        });
      }
    } catch (error) {
      setRawOutput(`Exception: ${error.message}`);
    } finally {
      setCompiling(false);
      setShowOutputModal(true); // Show the single-run output (or error)
    }
  }

  // -------------------- Render --------------------
  return (
    <div className="activity-items">
      <ProfilePlaygroundNavbarComponent />

      {/* Header */}
      <header className="activity-header">
        <div className="header-content">
          <div className="left-indicator"></div>
          <h2 className="activity-title">Question Bank</h2>
          <button
            className="create-btn"
            onClick={() => {
              // Reset everything for creating a new question
              setQuestionData({
                questionID: null,
                questionName: "",
                questionDesc: "",
                difficulty: "Beginner",
                progLangIDs: [],
                testCases: [],
              });
              setCode("// Write your sample solution here");
              setRuntimeInput("");
              setRawOutput("");
              setTestLangID(null);
              setShowCreateModal(true);
            }}
          >
            + Add Question
          </button>
        </div>
      </header>

      {/* Item Type Selector */}
      <div className="filter-section">
        <label>Item Type:</label>
        <select
          onChange={(e) => setSelectedItemType(parseInt(e.target.value))}
          value={selectedItemType ?? ""}
        >
          {itemTypes.length > 0 ? (
            itemTypes.map((type) => (
              <option key={type.itemTypeID} value={type.itemTypeID}>
                {type.itemTypeName}
              </option>
            ))
          ) : (
            <option value="">No Item Types Available</option>
          )}
        </select>
      </div>

      {/* Table of Questions */}
      <div className="table-wrapper">
        <table className="item-table">
          <thead>
            <tr>
              <th>QUESTION NAME</th>
              <th>DIFFICULTY</th>
              <th>LANGUAGES</th>
              <th>TEST CASES</th>
              <th>DATE &amp; TIME CREATED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>Loading...</td>
              </tr>
            ) : questions.length > 0 ? (
              questions.map((q) => {
                const progLangArray = q.programming_languages || [];
                return (
                  <tr key={q.questionID}>
                    <td>{q.questionName}</td>
                    <td>{q.difficulty}</td>
                    <td>
                      {progLangArray.length > 0
                        ? progLangArray.map((langObj, idx) => {
                            const langName = langObj.progLangName;
                            const known = programmingLanguageMap[langName] || { name: langName, image: null };
                            return (
                              <span key={idx} style={{ marginRight: "8px" }}>
                                {known.image ? (
                                  <>
                                    <img 
                                      src={known.image}
                                      alt={`${known.name} icon`}
                                      style={{ width: "20px", marginRight: "4px" }}
                                    />
                                    {known.name}
                                  </>
                                ) : (
                                  known.name
                                )}
                                {idx < progLangArray.length - 1 ? "," : ""}
                              </span>
                            );
                          })
                        : "N/A"}
                    </td>
                    <td>
                      {q.test_cases && q.test_cases.length > 0
                        ? `${q.test_cases.length} test case(s)`
                        : "No test cases"}
                    </td>
                    <td>{q.created_at ? formatDateTime(q.created_at) : "N/A"}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => {
                          const plIDs = (q.programming_languages || []).map(l => l.progLangID);
                          setQuestionData({
                            questionID: q.questionID,
                            questionName: q.questionName,
                            questionDesc: q.questionDesc,
                            difficulty: q.difficulty,
                            progLangIDs: plIDs,
                            testCases: (q.test_cases || []).map(tc => ({
                              inputData: tc.inputData,
                              expectedOutput: tc.expectedOutput
                            })),
                          });
                          setCode("// Write your sample solution here");
                          setRuntimeInput("");
                          setRawOutput("");
                          setTestLangID(plIDs.length > 0 ? plIDs[0] : null);
                          setShowEditModal(true);
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          setQuestionData(q);
                          setShowDeleteModal(true);
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No questions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* -------------------- Create/Edit Modal -------------------- */}
      <Modal
        show={showCreateModal || showEditModal}
        onHide={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {showCreateModal ? "Add Question" : "Edit Question"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Question Name */}
            <Form.Group className="mb-3">
              <Form.Label>Question Name</Form.Label>
              <Form.Control
                type="text"
                value={questionData.questionName}
                onChange={(e) =>
                  setQuestionData({ ...questionData, questionName: e.target.value })
                }
              />
            </Form.Group>

            {/* Question Description */}
            <Form.Group className="mb-3">
              <Form.Label>Question Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={questionData.questionDesc}
                onChange={(e) =>
                  setQuestionData({ ...questionData, questionDesc: e.target.value })
                }
              />
            </Form.Group>

            {/* Difficulty */}
            <Form.Group className="mb-3">
              <Form.Label>Difficulty</Form.Label>
              <Form.Select
                value={questionData.difficulty}
                onChange={(e) =>
                  setQuestionData({ ...questionData, difficulty: e.target.value })
                }
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </Form.Select>
            </Form.Group>

            {/* Programming Languages */}
            <Form.Group className="mb-3">
              <Form.Label>Programming Languages</Form.Label>
              <div style={{ marginBottom: "0.5rem" }}>
                <Form.Check
                  type="checkbox"
                  label="Applicable to all"
                  checked={
                    questionData.progLangIDs.length > 0 &&
                    questionData.progLangIDs.length === allProgLanguages.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      const allIDs = allProgLanguages.map(lang => lang.progLangID);
                      setQuestionData({ ...questionData, progLangIDs: allIDs });
                      if (allIDs.length > 0) setTestLangID(allIDs[0]);
                    } else {
                      setQuestionData({ ...questionData, progLangIDs: [] });
                      setTestLangID(null);
                    }
                  }}
                />
              </div>
              {allProgLanguages.map((lang) => (
                <Form.Check
                  key={lang.progLangID}
                  type="checkbox"
                  label={lang.progLangName}
                  checked={questionData.progLangIDs.includes(lang.progLangID)}
                  onChange={() => {
                    const current = questionData.progLangIDs || [];
                    let updated;
                    if (current.includes(lang.progLangID)) {
                      updated = current.filter(id => id !== lang.progLangID);
                    } else {
                      updated = [...current, lang.progLangID];
                    }
                    setQuestionData({ ...questionData, progLangIDs: updated });
                    // If removing the testLangID from the set, reset it
                    if (testLangID === lang.progLangID) setTestLangID(null);
                  }}
                />
              ))}
            </Form.Group>

            {/* Show existing test cases (with a remove button) */}
            <Form.Group className="mb-3">
              <Form.Label>Test Cases (added after each successful run)</Form.Label>
              {(questionData.testCases || []).map((tc, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    marginBottom: "10px"
                  }}
                >
                  <Form.Control
                    type="text"
                    placeholder="Input Data"
                    value={tc.inputData}
                    readOnly
                    style={{ marginBottom: "5px" }}
                  />
                  <Form.Control
                    type="text"
                    placeholder="Expected Output"
                    value={tc.expectedOutput}
                    readOnly
                  />
                  <Button
                    variant="outline-danger"
                    size="sm"
                    style={{ marginTop: "5px" }}
                    onClick={() => handleRemoveTestCase(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </Form.Group>

            {/* Code Editor */}
            <Form.Group className="mb-3">
              <Form.Label>Sample Code (for testing)</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Form.Group>

            {/* If multiple languages, let them pick which one to test */}
            {questionData.progLangIDs.length > 1 && (
              <Form.Group className="mb-3">
                <Form.Label>Select Language to Test This Code</Form.Label>
                <Form.Select
                  value={testLangID || ""}
                  onChange={(e) => setTestLangID(parseInt(e.target.value, 10))}
                >
                  <option value="">-- Pick a language --</option>
                  {questionData.progLangIDs.map((langID) => {
                    const found = allProgLanguages.find(l => l.progLangID === langID);
                    return (
                      <option key={langID} value={langID}>
                        {found ? found.progLangName : `LanguageID ${langID}`}
                      </option>
                    );
                  })}
                </Form.Select>
              </Form.Group>
            )}

            {/* A single field for the teacher to specify input each time they run the code */}
            <Form.Group className="mb-3">
              <Form.Label>Runtime Input (for this run)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter input for the code (if you have an input)"
                value={runtimeInput}
                onChange={(e) => setRuntimeInput(e.target.value)}
              />
            </Form.Group>

            <div style={{ marginBottom: "1rem" }}>
              <Button variant="info" onClick={handleRunCode} disabled={compiling}>
                {compiling ? <Spinner animation="border" size="sm" /> : "Run Code"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateOrUpdate}>
            {showCreateModal ? "Add" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the question “{questionData.questionName}”?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Raw Output Modal */}
      <Modal
        show={showOutputModal}
        onHide={() => setShowOutputModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Code Output</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {rawOutput ? (
            <pre style={{ whiteSpace: "pre-wrap" }}>{rawOutput}</pre>
          ) : (
            <p>No raw output available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOutputModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}