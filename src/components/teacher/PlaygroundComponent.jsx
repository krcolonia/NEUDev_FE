import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Dropdown, DropdownButton, Tab, Tabs, Button, Spinner } from 'react-bootstrap';
import { ProfilePlaygroundNavbarComponent } from '../ProfilePlaygroundNavbarComponent';
import '../../style/student/playground.css'; // Ensure the correct import path

export const PlaygroundComponent = () => {
    const navigate_dashboard = useNavigate();

    const handleDashboardClick = () => {
        navigate_dashboard('/student/dashboard');
    };

    // Dropdown for language selection
    const [selectedLanguage, setSelectedLanguage] = useState({ name: 'Java', imgSrc: '/src/assets/java2.png' });

    const handleSelect = (language) => {
        const imgSources = {
            'C#': '/src/assets/c.png',
            'Java': '/src/assets/java2.png',
            'Python': '/src/assets/py.png',
        };
        setSelectedLanguage({ name: language, imgSrc: imgSources[language] });
    };

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

    const handleRunCode = async () => {
        setLoading(true);
        setOutput('');

        if (!['Java', 'Python', 'C#'].includes(selectedLanguage.name)) {
            setOutput('Error: Unsupported language selected.');
            setLoading(false);
            return;
        }

        try {
            console.log("Running Code:", { language: selectedLanguage.name, code, input });

            const response = await fetch('https://api.codex.jaagrav.in', {
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