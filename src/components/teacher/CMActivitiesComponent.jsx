import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Dropdown, Row, Tabs, Col, Tab, Modal, Button } from 'react-bootstrap';
import CMNavigationBarComponent from './CMNavigationBarComponent';
import "../../style/teacher/cmActivities.css"; // Updated CSS file

export const CMActivitiesComponent = () => {

    const navigate_leaderboard = useNavigate();
    const handleLeaderboardClick = () =>{
        navigate_leaderboard('/leaderboard')
    }

    const [contentKey, setContentKey] = useState('ongoing');

    const [showOngoingActivityDetails, setShowOngoingActivityDetails] = useState(false);

    return (
        <>
        <CMNavigationBarComponent/>
        <div className="create-new-activity-wrapper"></div> 
        <div className="create-new-activity-container">
        <button 
            className="create-new-activity-button" 
            onClick={() => window.location.href = '/create-new-activity'}
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
                    
                    {contentKey === "ongoing" && (
                        <div className='ongoing-class-activities'>
                            <div className='class-activities'>
                                <Row>
                                    <Col className='activity-details-column'>
                                        <div className='class-activity-details'>
                                            <a href='#' onClick={() => setShowOngoingActivityDetails(true)}><h3>Activity Name</h3></a>
                                            <p>Created by: Professor Name</p>
                                            <button disabled><img src='/src/assets/java2.png'/> Java</button>
                                        </div>

                                        <Modal show={showOngoingActivityDetails} onHide={() => setShowOngoingActivityDetails(false)} backdrop='static' keyboard={false} size='lg' className='modal-activity-details' style={{ borderRadius: '30px' }}>
                                            <Modal.Header closeButton>
                                                <div className='modal-activity-header'>
                                                    <h3>Activity Name</h3>
                                                    <p>Created by: Professor Name</p>
                                                </div>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem........At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem........</p>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <div>
                                                    <p><i className='bi bi-list-ol'></i> Item</p>
                                                    <p><i className='bi bi-calendar-check'></i> 24 January 2025 7:30am</p>
                                                    <p><i className='bi bi-calendar-x'></i>  24 January 2025 11:59pm</p>
                                                </div>

                                                <div>
                                                    <Button onClick={handleLeaderboardClick}>View</Button>
                                                </div>
                                            </Modal.Footer>
                                        </Modal>

                                        <div className='class-activity-date'>
                                            <p><i className='bi bi-calendar-check'></i> 24 January 2025 7:30am</p>
                                            <p><i className='bi bi-calendar-x'></i>  24 January 2025 11:59pm</p>
                                        </div>
                                    </Col>

                                    <Col>
                                        <Row className='g-0'>
                                            <Col className='class-activity-standing'>
                                                <button disabled>42nd</button>
                                                Rank
                                            </Col>
                                            <Col className='class-activity-standing'>
                                                <button disabled>72/100</button>
                                                Overall Score
                                            </Col>
                                            <Col className='class-activity-standing'>
                                                <button disabled>30m</button>
                                                Duration
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    )}

                    {contentKey === "completed" && (
                        <div className='completed-class-activities'>
                            <div className='class-activities'>
                                <Row>
                                    <Col className='activity-details-column'>
                                        <div className='class-activity-details'>
                                            <a href='#' onClick={() => setShowOngoingActivityDetails(true)}><h3>Activity Name</h3></a>
                                            <p>Created by: Professor Name</p>
                                            <button disabled><img src='/src/assets/java2.png'/> Java</button>
                                        </div>

                                        <Modal show={showOngoingActivityDetails} onHide={() => setShowOngoingActivityDetails(false)} backdrop='static' keyboard={false} size='lg' className='modal-activity-details' style={{ borderRadius: '30px' }}>
                                            <Modal.Header closeButton>
                                                <div className='modal-activity-header'>
                                                    <h3>Activity Name</h3>
                                                    <p>Created by: Professor Name</p>
                                                </div>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem........At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem........</p>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <div>
                                                    <p><i className='bi bi-list-ol'></i> Item</p>
                                                    <p><i className='bi bi-calendar-check'></i> 24 January 2025 7:30am</p>
                                                    <p><i className='bi bi-calendar-x'></i>  24 January 2025 11:59pm</p>
                                                </div>
                                            </Modal.Footer>
                                        </Modal>

                                        <div className='class-activity-date'>
                                            <p><i className='bi bi-calendar-check'></i> 24 January 2025 7:30am</p>
                                            <p><i className='bi bi-calendar-x'></i>  24 January 2025 11:59pm</p>
                                        </div>
                                    </Col>

                                    <Col>
                                        <Row className='g-0'>
                                            <Col className='class-activity-standing'>
                                                <button disabled>42nd</button>
                                                Rank
                                            </Col>
                                            <Col className='class-activity-standing'>
                                                <button disabled>72/100</button>
                                                Overall Score
                                            </Col>
                                            <Col className='class-activity-standing'>
                                                <button disabled>30m</button>
                                                Duration
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
        </>
  )
}
