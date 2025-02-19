import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Dropdown, DropdownButton, Tab, Tabs, Button, Spinner } from 'react-bootstrap';
import { ProfilePlaygroundNavbarComponent } from '../ProfilePlaygroundNavbarComponent';
import '../../style/student/playground.css'; // Ensure the correct import path

export const PlaygroundComponent = () => {
    const navigate_dashboard = useNavigate();

    // State for language selection
    const [selectedLanguage, setSelectedLanguage] = useState({ name: 'Java', imgSrc: '/src/assets/java2.png' });

    const handleSelect = (language) => {
        const imgSources = {
            'C#': '/src/assets/c.png',
            'Java': '/src/assets/java2.png',
            'Python': '/src/assets/py.png',
        };
        setSelectedLanguage({ name: language, imgSrc: imgSources[language] });
    };

    // Language mapping for API
    const languageMap = {
        'C#': 'cs',
        'Java': 'java',
        'Python': 'py',
    };

    // Tabs
    const [key, setKey] = useState('main');

    // Compiler API integration
    const [code, setCode] = useState('// Write your code here');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);

    // Function to run the code
    const handleRunCode = async () => {
        setLoading(true);
        setOutput(''); // Clear previous output

        // Ensure selected language is supported
        const validLanguages = Object.keys(languageMap);
        if (!validLanguages.includes(selectedLanguage.name)) {
            setOutput('Error: Unsupported language selected.');
            setLoading(false);
            return;
        }

        // Validate if the entered code matches the selected language
        if (!isValidCodeForSelectedLanguage(code, selectedLanguage.name)) {
            setOutput(`Error: Your code does not match the selected language (${selectedLanguage.name}).`);
            setLoading(false);
            return;
        }

        // Check if input is required but not provided
        if (requiresInput(code, selectedLanguage.name) && input.trim() === '') {
            setOutput('Error: Your code requires input, but no input was provided.');
            setLoading(false);
            return;
        }

        try {
            console.log("Running Code:", { language: selectedLanguage.name, code, input });

            // IF USING THE API COMPILER FROM THE INTERNET
            // const response = await fetch('https://api.codex.jaagrav.in', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         code: code,
            //         language: languageMap[selectedLanguage.name],
            //         input: input,
            //     }),
            // });

            // // IF RUNNING THE COMPILER LOCALLY IN A MACHINE
            // const response = await fetch('http://localhost:8080', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         code: code,
            //         language: languageMap[selectedLanguage.name],
            //         input: input,
            //     }),
            // });

            // IF RUNNING THE COMPILER USING RAILWAY
            const response = await fetch('https://neudevcompiler-production.up.railway.app', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code,
                    language: languageMap[selectedLanguage.name],
                    input: input,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setOutput(data.output || 'No output');
            } else {
                setOutput(`Error: ${data.error || 'Something went wrong'}`);
            }
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Function to validate if the entered code matches the selected language
    const isValidCodeForSelectedLanguage = (code, language) => {
        const patterns = {
            'Java': /\b(public\s+class\s+\w+|System\.out\.println|import\s+java\.)\b/,
            'Python': /\b(print\s*\(|def\s+\w+\(|import\s+\w+|class\s+\w+|for\s+\w+\s+in|while\s+|if\s+)/,
            'C#': /\b(using\s+System;|namespace\s+\w+|Console\.WriteLine)\b/
        };

        return patterns[language]?.test(code.trim());
    };

    // Function to check if the code contains an input statement
    const requiresInput = (code, language) => {
        const inputPatterns = {
            'Java': /\bnew\s+Scanner\(System\.in\)/,
            'Python': /\binput\(/,
            'C#': /\bConsole\.ReadLine\(\)/
        };

        return inputPatterns[language]?.test(code);
    };

    return (
        <>
            <ProfilePlaygroundNavbarComponent />

            <div className="playground">
                <div className="playground-container">
                    <div className="playground-header">
                        <Row>
                            <Col sm={10} className="left-corner">
                                <Tabs defaultActiveKey={key} id="tab" onSelect={(k) => setKey(k)} fill>
                                    <Tab eventKey="main" title="main.py"></Tab>
                                    <Tab eventKey="code.java" title="code.java"></Tab>
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
                                            <img src={selectedLanguage.imgSrc} style={{ width: '20px', marginRight: '8px' }} alt="language-icon" />
                                            {selectedLanguage.name}
                                        </>
                                    }
                                    onSelect={(eventKey) => handleSelect(eventKey)}
                                >
                                    <Dropdown.Item eventKey="C#"><img src="/src/assets/c.png" alt="csharp-icon" />C#</Dropdown.Item>
                                    <Dropdown.Item eventKey="Java"><img src="/src/assets/java2.png" alt="java-icon" />Java</Dropdown.Item>
                                    <Dropdown.Item eventKey="Python"><img src="/src/assets/py.png" alt="python-icon" />Python</Dropdown.Item>
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
                        ></textarea>
                        <textarea
                            className="input-editor"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            rows={5}
                            placeholder="Provide input here... (optional)"
                        ></textarea>
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