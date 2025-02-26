import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Dropdown, DropdownButton, Tab, Tabs, Button, Spinner } from 'react-bootstrap';
import { ProfilePlaygroundNavbarComponent } from '../ProfilePlaygroundNavbarComponent';
import '../../style/student/playground.css'; // Ensure the correct import path

export const TeacherPlaygroundComponent = () => {
    const navigate_dashboard = useNavigate();

    const handleDashboardClick = () => {
        navigate_dashboard('/teacher/dashboard');
    };

    // Language selection state
    const [selectedLanguage, setSelectedLanguage] = useState({
        name: 'Java',
        imgSrc: '/src/assets/java2.png',
    });

    // Function to update language selection from dropdown
    const handleSelect = (language) => {
        const imgSources = {
            'C#': '/src/assets/c.png',
            'Java': '/src/assets/java2.png',
            'Python': '/src/assets/py.png',
        };
        setSelectedLanguage({ name: language, imgSrc: imgSources[language] });
    };

    // Mapping from language name -> short code for the compiler
    const languageMap = {
        'C#': 'cs',
        'Java': 'java',
        'Python': 'py',
    };

    // Basic code pattern checks for each language
    const codeValidationPatterns = {
        'Java': /\b(public\s+class\s+\w+|System\.out\.println|import\s+java\.)\b/,
        'Python': /\b(print\s*\(|def\s+\w+\(|import\s+\w+|class\s+\w+|for\s+\w+\s+in|while\s+|if\s+)/,
        'C#': /\b(using\s+System;|namespace\s+\w+|Console\.WriteLine)\b/
    };

    // Helper to verify if the code looks correct for the chosen language
    const isValidCodeForSelectedLanguage = (code, language) => {
        const pattern = codeValidationPatterns[language];
        // If no pattern is defined, we skip validation
        return pattern ? pattern.test(code.trim()) : true;
    };

    // Basic check for input requirement
    const requiresInput = (code, language) => {
        const inputPatterns = {
            'Java': /\bnew\s+Scanner\(System\.in\)/,
            'Python': /\binput\(/,
            'C#': /\bConsole\.ReadLine\(\)/
        };
        return inputPatterns[language]?.test(code);
    };

    // Tabs
    const [key, setKey] = useState('main');

    // Compiler states
    const [code, setCode] = useState('// Write your code here');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);

    // Run the code
    const handleRunCode = async () => {
        setLoading(true);
        setOutput(''); // Clear previous output

        // Ensure selected language is recognized
        if (!Object.keys(languageMap).includes(selectedLanguage.name)) {
            setOutput(`Error: Unsupported language selected (${selectedLanguage.name}).`);
            setLoading(false);
            return;
        }

        // Check if code looks valid for the chosen language
        if (!isValidCodeForSelectedLanguage(code, selectedLanguage.name)) {
            setOutput(`Error: Your code does not match the selected language (${selectedLanguage.name}).`);
            setLoading(false);
            return;
        }

        // If the code requires input but none is provided
        if (requiresInput(code, selectedLanguage.name) && input.trim() === '') {
            setOutput('Error: Your code requires input, but no input was provided.');
            setLoading(false);
            return;
        }

        try {
            console.log("Running Code:", {
                language: selectedLanguage.name,
                code,
                input
            });

            // Use the same Railway-based compiler
            const response = await fetch('https://neudevcompiler-production.up.railway.app', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language: languageMap[selectedLanguage.name],
                    input,
                }),
            });

            const data = await response.json();
            console.log("[Compiler Response]", response.status, data);

            // If the HTTP status is not OK or an error is present
            if (!response.ok || data.error) {
                const errorMsg = data.error || data.stderr || 'Something went wrong';
                setOutput(`Error: ${errorMsg}`);
            } else {
                // Code ran successfully
                const actualOutput = data.output?.trim() ?? '';
                setOutput(actualOutput.length > 0 ? actualOutput : 'No output');
            }
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ProfilePlaygroundNavbarComponent />

            <div className="playground">
                <div className="playground-container">
                    <div className="playground-header">
                        <Row>
                            <Col sm={10} className="left-corner">
                                <Tabs
                                    defaultActiveKey={key}
                                    id="tab"
                                    onSelect={(k) => setKey(k)}
                                    fill
                                >
                                    <Tab eventKey="main" title="main.py" />
                                    <Tab eventKey="code.java" title="code.java" />
                                </Tabs>
                                <a href="#"><span className="bi bi-plus-square-fill"></span></a>
                            </Col>

                            <Col sm={1} className="right-corner">
                                <DropdownButton
                                    className="playground-dropdown"
                                    id="language-dropdown"
                                    size="sm"
                                    title={
                                        <>
                                            <img
                                                src={selectedLanguage.imgSrc}
                                                style={{ width: '20px', marginRight: '8px' }}
                                                alt="language-icon"
                                            />
                                            {selectedLanguage.name}
                                        </>
                                    }
                                    onSelect={(eventKey) => handleSelect(eventKey)}
                                >
                                    <Dropdown.Item eventKey="C#">
                                        <img src="/src/assets/c.png" alt="csharp-icon" />
                                        C#
                                    </Dropdown.Item>
                                    <Dropdown.Item eventKey="Java">
                                        <img src="/src/assets/java2.png" alt="java-icon" />
                                        Java
                                    </Dropdown.Item>
                                    <Dropdown.Item eventKey="Python">
                                        <img src="/src/assets/py.png" alt="python-icon" />
                                        Python
                                    </Dropdown.Item>
                                </DropdownButton>
                            </Col>
                        </Row>

                        <div className="header-border"></div>
                    </div>

                    <div className="playground-editor">
                        <textarea
                            className="code-editor"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            rows={15}
                            placeholder="Write your code here..."
                        />
                        <textarea
                            className="input-editor"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            rows={5}
                            placeholder="Provide input here... (optional)"
                        />
                    </div>

                    <div className="playground-bottom">
                        <div className="right-corner">
                            <Button onClick={handleRunCode} disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : 'Run Code'}
                            </Button>
                        </div>
                    </div>

                    <div className="playground-output">
                        <h5>Output:</h5>
                        <pre>{output}</pre>
                    </div>
                </div>
            </div>
        </>
    );
};