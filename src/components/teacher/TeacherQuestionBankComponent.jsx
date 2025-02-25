import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
 * Map from your DB's language ID -> the short code for the compiler
 * (Adjust these IDs or codes as needed.)
 */
const compilerCodeMap = {
  1: "java",   // e.g. if 1 = Java
  2: "cs",     // e.g. if 2 = C#
  3: "py",     // e.g. if 3 = Python
};

/**
 * Optional code pattern checks for each language name
 */
const codeValidationPatterns = {
  "Java":   /\b(public\s+class\s+\w+|System\.out\.println|import\s+java\.)\b/i,
  "C#":     /\b(using\s+System;|namespace\s+\w+|Console\.WriteLine)\b/i,
  "Python": /\b(print\s*\(|def\s+\w+\(|import\s+\w+|class\s+\w+|for\s+\w+\s+in|while\s+|if\s+)/i
};

/**
 * Quick helper to see if code looks correct for a certain language name
 */
function isValidCodeForLanguage(code, languageName) {
  const pattern = codeValidationPatterns[languageName];
  if (!pattern) return true; // if no pattern, skip validation
  return pattern.test(code.trim());
}

/**
 * Format date from ISO string to "MM/DD/YYYY, hh:mmAM/PM"
 * (e.g. "02/25/2025, 9:45PM")
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
    hour12: true
  };

  let localStr = dateObj.toLocaleString("en-US", options); 
  // e.g. "02/25/2025, 9:45 PM"
  // remove the space before AM/PM
  localStr = localStr.replace(/\s(AM|PM)$/, "$1");
  return localStr;
}

const TeacherQuestionBankComponent = () => {
  const navigate = useNavigate();

  // -------------------- State: Questions & Item Types --------------------
  const [questions, setQuestions] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------- Modals --------------------
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // **New**: A modal specifically to show the raw code output from the compiler
  const [showOutputModal, setShowOutputModal] = useState(false);

  // -------------------- Question Data --------------------
  const [questionData, setQuestionData] = useState({
    questionID: null,
    questionName: "",
    questionDesc: "",
    difficulty: "Beginner",
    progLangIDs: [], // multiple languages
    testCases: [{ inputData: "", expectedOutput: "" }]
  });

  // -------------------- Compiler / Code Testing --------------------
  const [code, setCode] = useState("// Write your sample solution here");
  const [testResults, setTestResults] = useState([]); // pass/fail details remain in the same modal
  const [compiling, setCompiling] = useState(false);

  // **New**: We store the combined raw console output here
  const [rawOutput, setRawOutput] = useState("");

  // For picking exactly which language we are "testing" among the question’s selected languages
  const [testLangID, setTestLangID] = useState(null);

  // -------------------- All Available Programming Languages --------------------
  const [allProgLanguages, setAllProgLanguages] = useState([]);

  // -------------------- Lifecycle --------------------
  useEffect(() => {
    fetchItemTypes();
    fetchProgLanguages();
  }, []);

  useEffect(() => {
    if (selectedItemType !== null) {
      fetchQuestions(selectedItemType);
    }
  }, [selectedItemType]);

  // If the user opens the create/edit modal, pick a default test language if any
  useEffect(() => {
    if (showCreateModal || showEditModal) {
      if (questionData.progLangIDs && questionData.progLangIDs.length > 0) {
        setTestLangID(questionData.progLangIDs[0]);
      } else {
        setTestLangID(null);
      }
    }
  }, [showCreateModal, showEditModal, questionData.progLangIDs]);

  // -------------------- API Calls --------------------
  const fetchItemTypes = async () => {
    try {
      const response = await getItemTypes();
      if (!response.error && response.length > 0) {
        setItemTypes(response);
        setSelectedItemType(response[0].itemTypeID);
      } else {
        setItemTypes([]);
      }
    } catch (error) {
      console.error("❌ Error fetching item types:", error);
    }
  };

  const fetchProgLanguages = async () => {
    try {
      const response = await getProgrammingLanguages();
      if (!response.error && Array.isArray(response)) {
        setAllProgLanguages(response);
      } else {
        console.error("❌ Error fetching programming languages:", response.error);
      }
    } catch (error) {
      console.error("❌ Error fetching programming languages:", error);
    }
  };

  const fetchQuestions = async (itemTypeID) => {
    setLoading(true);
    try {
      const response = await getQuestions(itemTypeID);
      if (!response || response.error || !Array.isArray(response)) {
        setQuestions([]);
      } else {
        setQuestions(response);
      }
    } catch (error) {
      console.error("❌ Error fetching questions:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Delete Question --------------------
  const handleDelete = async () => {
    if (!questionData.questionID) return;

    const response = await deleteQuestion(questionData.questionID);
    if (!response.error) {
      setQuestions((prev) =>
        (prev || []).filter((q) => q && q.questionID !== questionData.questionID)
      );
      fetchQuestions(selectedItemType);
      setShowDeleteModal(false);
    } else {
      alert(response.error);
    }
  };

  // -------------------- Create or Update Question --------------------
  const handleCreateOrUpdate = async () => {
    const payload = {
      itemTypeID: selectedItemType,
      progLangIDs: questionData.progLangIDs,
      questionName: questionData.questionName.trim(),
      questionDesc: questionData.questionDesc.trim(),
      difficulty: questionData.difficulty,
      testCases: questionData.testCases.filter(tc =>
        tc.inputData.trim() !== "" || tc.expectedOutput.trim() !== ""
      )
    };

    if (
      !payload.progLangIDs ||
      payload.progLangIDs.length === 0 ||
      !payload.questionName ||
      !payload.questionDesc
    ) {
      alert("Please fill in all required fields (languages, name, description).");
      return;
    }

    let response;
    if (showCreateModal) {
      // CREATE
      response = await createQuestion(payload);
    } else if (showEditModal) {
      // UPDATE
      if (!questionData.questionID) {
        alert("No question selected to update.");
        return;
      }
      response = await updateQuestion(questionData.questionID, payload);
    }

    if (!response.error) {
      fetchQuestions(selectedItemType);
      setShowCreateModal(false);
      setShowEditModal(false);
    } else {
      alert(response.error);
    }
  };

  // -------------------- Add / Update / Delete Test Cases --------------------
  const handleAddTestCase = () => {
    setQuestionData({
      ...questionData,
      testCases: [
        ...questionData.testCases,
        { inputData: "", expectedOutput: "" }
      ]
    });
  };

  const handleUpdateTestCase = (index, field, value) => {
    const updated = [...questionData.testCases];
    updated[index][field] = value;
    setQuestionData({ ...questionData, testCases: updated });
  };

  const handleDeleteTestCase = (index) => {
    const updated = questionData.testCases.filter((_, i) => i !== index);
    setQuestionData({ ...questionData, testCases: updated });
  };

  // -------------------- Toggling Programming Languages for the Question --------------------
  const handleQuestionProgLangToggle = (langID) => {
    const current = questionData.progLangIDs || [];
    let updated;
    if (current.includes(langID)) {
      updated = current.filter(id => id !== langID);
    } else {
      updated = [...current, langID];
    }
    setQuestionData({ ...questionData, progLangIDs: updated });

    // If we removed the testLangID from the set, reset testLangID
    if (testLangID === langID) {
      setTestLangID(null);
    }
  };

  // -------------------- Run Test Cases & Show Output in a Separate Modal --------------------
  const handleRunAllTestCases = async () => {
    if (!testLangID) {
      alert("Please select which language to test with.");
      return;
    }

    const foundLang = allProgLanguages.find(l => l.progLangID === testLangID);
    if (!foundLang) {
      alert("Selected language is not recognized.");
      return;
    }

    // If you want to do naive code checking:
    if (!isValidCodeForLanguage(code, foundLang.progLangName)) {
      alert(`You selected ${foundLang.progLangName}, but your code doesn't look like ${foundLang.progLangName}.`);
      return;
    }

    const shortCode = compilerCodeMap[testLangID];
    if (!shortCode) {
      alert(`This language (${foundLang.progLangName}) is not supported by the compiler API.`);
      return;
    }

    if (!code.trim()) {
      alert("Please enter some code before running test cases.");
      return;
    }

    setCompiling(true);
    setTestResults([]);
    setRawOutput("");

    let combinedOutput = ""; // We'll gather all raw console outputs here
    const results = [];

    for (let i = 0; i < questionData.testCases.length; i++) {
      const testCase = questionData.testCases[i];
      // skip blank test cases
      if (!testCase.inputData.trim() && !testCase.expectedOutput.trim()) {
        continue;
      }

      try {
        const response = await fetch("https://neudevcompiler-production.up.railway.app", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            language: shortCode,
            input: testCase.inputData
          })
        });
        const data = await response.json();

        if (!response.ok) {
          results.push({
            index: i + 1,
            inputData: testCase.inputData,
            expectedOutput: testCase.expectedOutput,
            actualOutput: `Error: ${data.error || "Something went wrong"}`,
            pass: false
          });
          combinedOutput += `\n--- Test Case ${i + 1} (Error) ---\n${data.error || "Something went wrong"}\n`;
        } else {
          const actual = (data.output || "").trim();
          const expected = testCase.expectedOutput.trim();
          results.push({
            index: i + 1,
            inputData: testCase.inputData,
            expectedOutput: expected,
            actualOutput: actual,
            pass: actual === expected
          });
          combinedOutput += `\n--- Test Case ${i + 1} Output ---\n${actual}\n`;
        }
      } catch (error) {
        results.push({
          index: i + 1,
          inputData: testCase.inputData,
          expectedOutput: testCase.expectedOutput,
          actualOutput: `Exception: ${error.message}`,
          pass: false
        });
        combinedOutput += `\n--- Test Case ${i + 1} Exception ---\n${error.message}\n`;
      }
    }

    setTestResults(results);
    setCompiling(false);

    // Show the combined raw output in a separate modal
    setRawOutput(combinedOutput.trim());
    setShowOutputModal(true);
  };

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
              setQuestionData({
                questionID: null,
                questionName: "",
                questionDesc: "",
                difficulty: "Beginner",
                progLangIDs: [],
                testCases: [{ inputData: "", expectedOutput: "" }]
              });
              setCode("// Write your sample solution here");
              setTestResults([]);
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

      {/* Questions Table */}
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
            {(questions || []).map((q) => {
              const progLangArray = q.programming_languages || [];
              return (
                <tr key={q.questionID}>
                  <td>{q.questionName}</td>
                  <td>{q.difficulty}</td>
                  <td>
                    {progLangArray.length > 0 ? (
                      progLangArray.map((langObj, idx) => {
                        return (
                          <span key={idx} style={{ marginRight: "8px" }}>
                            {langObj.progLangName}
                            {idx < progLangArray.length - 1 ? "," : ""}
                          </span>
                        );
                      })
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    {q.test_cases && q.test_cases.length > 0
                      ? `${q.test_cases.length} test case(s)`
                      : "No test cases"}
                  </td>
                  <td>{formatDateTime(q.created_at)}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setQuestionData({
                          questionID: q.questionID,
                          questionName: q.questionName,
                          questionDesc: q.questionDesc,
                          difficulty: q.difficulty,
                          progLangIDs: progLangArray.map(lang => lang.progLangID),
                          testCases: (q.test_cases || []).length > 0
                            ? q.test_cases.map(tc => ({
                                inputData: tc.inputData,
                                expectedOutput: tc.expectedOutput
                              }))
                            : [{ inputData: "", expectedOutput: "" }]
                        });
                        setCode("// Write your sample solution here");
                        setTestResults([]);
                        setRawOutput("");

                        if (progLangArray.length > 0) {
                          setTestLangID(progLangArray[0].progLangID);
                        } else {
                          setTestLangID(null);
                        }
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
            })}
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
          <Modal.Title>{showCreateModal ? "Add Question" : "Edit Question"}</Modal.Title>
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

            {/* Programming Languages (checkboxes) */}
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
                      if (allIDs.length > 0) {
                        setTestLangID(allIDs[0]);
                      }
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
                  onChange={() => handleQuestionProgLangToggle(lang.progLangID)}
                />
              ))}
            </Form.Group>

            {/* If multiple languages, let them pick which one to test */}
            {questionData.progLangIDs.length > 1 && (
              <Form.Group className="mb-3">
                <Form.Label>Select Language to Test This Code</Form.Label>
                <Form.Select
                  value={testLangID || ""}
                  onChange={(e) => {
                    const newID = parseInt(e.target.value, 10);
                    setTestLangID(newID);
                  }}
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

            {/* Test Cases */}
            <Form.Group className="mb-3">
              <Form.Label>Test Cases</Form.Label>
              {questionData.testCases.map((tc, index) => (
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
                    placeholder="Input Data (Optional)"
                    value={tc.inputData}
                    onChange={(e) => handleUpdateTestCase(index, "inputData", e.target.value)}
                    style={{ marginBottom: "5px" }}
                  />
                  <Form.Control
                    type="text"
                    placeholder="Expected Output"
                    value={tc.expectedOutput}
                    onChange={(e) => handleUpdateTestCase(index, "expectedOutput", e.target.value)}
                  />
                  {questionData.testCases.length > 1 && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      style={{ marginTop: "5px" }}
                      onClick={() => handleDeleteTestCase(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline-primary" size="sm" onClick={handleAddTestCase}>
                + Add Test Case
              </Button>
            </Form.Group>

            {/* Code Editor + "Run Test Cases" */}
            <Form.Group className="mb-3">
              <Form.Label>Sample Code (for testing these test cases)</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Form.Group>

            <div style={{ marginBottom: "1rem" }}>
              <Button variant="info" onClick={handleRunAllTestCases} disabled={compiling}>
                {compiling ? <Spinner animation="border" size="sm" /> : "Run Test Cases"}
              </Button>
            </div>

            {/* Display Test Results (pass/fail) in the same modal */}
            {testResults.length > 0 && (
              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  border: "1px solid #ccc",
                  padding: "10px"
                }}
              >
                <strong>Test Results:</strong>
                <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                  {testResults.map((res, idx) => (
                    <li key={idx} style={{ marginBottom: "5px" }}>
                      <strong>Test Case {res.index}:</strong>
                      <br />
                      Input: <code>{res.inputData}</code>
                      <br />
                      Expected: <code>{res.expectedOutput}</code>
                      <br />
                      Actual: <code>{res.actualOutput}</code>
                      <br />
                      Status:{" "}
                      {res.pass ? (
                        <span style={{ color: "green" }}>Passed</span>
                      ) : (
                        <span style={{ color: "red" }}>Failed</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
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

      {/* -------------------- Delete Confirmation Modal -------------------- */}
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

      {/* -------------------- Raw Output Modal -------------------- */}
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
};

export default TeacherQuestionBankComponent;