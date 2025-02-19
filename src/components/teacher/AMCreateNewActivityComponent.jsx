

import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBold, faItalic, faUnderline, faSuperscript, faAlignLeft, faAlignCenter, faAlignRight } from '@fortawesome/free-solid-svg-icons';
import '/src/style/teacher/amCreateNewActivity.css';
import CMNavigationBarComponent from './CMNavigationBarComponent';

const DateTimeItem = ({ icon, label, date, setDate, color, className }) => (
    <div className={`date-time-item ${className}`}>
        <div className="label-with-icon">
            <i className={icon}></i>
            <label>{label}</label>
        </div>
        <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
        />
    </div>
);


export const CreateActivityComponent = () => {
    const [activityTitle, setActivityTitle] = useState('');
    const [activityDescription, setActivityDescription] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [questions, setQuestions] = useState(['', '', '']);
    const [dateOpened, setDateOpened] = useState('');
    const [dateClosed, setDateClosed] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);

    const handleQuestionClick = (index) => {
        setSelectedQuestionIndex(index);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const handleSelectQuestion = (question) => {
        if (selectedQuestionIndex !== null) {
            const updatedQuestions = [...questions];
            updatedQuestions[selectedQuestionIndex] = question;
            setQuestions(updatedQuestions);
        }
        setShowModal(false);
    };

    return (
        <div className="whole-container">
            <CMNavigationBarComponent />
            <div className='create-activity-content'>
                <div className='create-activity-container'>
                    <h2>Create an Activity</h2>
                    <Form className='create-activity-form'>
                        <Form.Control 
                            className='create-activity-title'
                            type='text' 
                            placeholder='Title...' 
                            value={activityTitle} 
                            onChange={(e) => setActivityTitle(e.target.value)} 
                        />

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
                            />
                        </div>

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
                                />
                            ))}
                        </div>

                        <div className='difficulty-section'>
                            <Form.Control as='select' value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
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
                                color="#84C776" 
                                className="open-date"
                            />
                            <DateTimeItem 
                                icon="bi bi-calendar2-week" 
                                label="Due Date and Time" 
                                date={dateClosed} 
                                setDate={setDateClosed} 
                                color="#E53935" 
                                className="due-date"
                            />
                        </div>
                    </Form>
                    <Button className='custom-create-class-btn'><i className="bi bi-pencil-square"></i> Create Activity</Button>
                </div>

                {/* Modal for selecting a question */}
                <Modal 
                    show={showModal} 
                    onHide={handleClose} 
                    dialogClassName={`custom-modal ${showModal ? 'show' : ''}`} 
                    backdropClassName='custom-modal-backdrop' 
                    centered={false}
                >
                    <div className="custom-modal-content">
                        <Modal.Header closeButton>
                            <Modal.Title>Choose a Question</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {['Sample Question 1', 'Sample Question 2', 'Sample Question 3', 'Array Question'].map((q, idx) => (
                                <Button key={idx} className='question-item' block onClick={() => handleSelectQuestion(q)}>
                                    {q}
                                </Button>
                            ))}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant='secondary' onClick={handleClose}>Save Question</Button>
                        </Modal.Footer>
                    </div>
                </Modal>
            </div>
        </div>
    );
};
