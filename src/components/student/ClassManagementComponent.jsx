import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Dropdown, Row, Tabs, Col, Tab, Modal, Button } from 'react-bootstrap';
import { BulletinComponent } from '../BulletinComponent';
import '/src/style/student/class.css'

export const ClassManagementComponent = () => {

    const navigate_dashboard = useNavigate();
    const handleDashboardClick = () => {
        navigate_dashboard('/dashboard');
    };

    const navigate_profile = useNavigate();
    const handleProfileClick = () =>{
        navigate_profile('/profile')
    }

    const navigate_home = useNavigate();
    const handleHomeClick = () =>{
        navigate_home('/home')
    }

    const navigate_codingAssessment = useNavigate();
    const handleCodingAssessmentClick = () =>{
        navigate_codingAssessment('/assessment')
    }
    
    const [navkey, setNavKey] = useState('activities');

    const [contentKey, setContentKey] = useState('ongoing');

    const [showActivityDetails, setShowActivityDetails] = useState(false);

    return (
        <>
            <Navbar expand='lg' className='class-navbar-top'>
                <i className='bi bi-arrow-left-circle' onClick={handleDashboardClick}></i>
                <p>Dashboard</p>

                <div className='navbar-center'>
                    <Tabs defaultActiveKey={navkey} id="tab" onSelect={(k) => setNavKey(k)} fill>
                        <Tab eventKey="activities" title="Activities"></Tab>
                        <Tab eventKey="bulletin" title="Bulletin"></Tab>
                    </Tabs>
                </div>

                <div className='dashboard-navbar'>
                    <span className='ping'>20 ms</span>
                    <a href='#'><i className='bi bi-moon'></i></a>
                    <span className='student-badge'>Student</span>
                    <Dropdown align='end'>
                        <Dropdown.Toggle variant='transparent' className='profile-dropdown'>
                            <img src='/src/assets/angelica.png' className='profile-image'/>
                        </Dropdown.Toggle>
                        
                        <Dropdown.Menu>
                        <Dropdown.Item href='#' onClick={handleProfileClick}>Boyet Profile Account</Dropdown.Item>
                        <Dropdown.Item href='#' onClick={handleHomeClick}>Log Out</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </Navbar>

            <div className='class-management'>
                <div className='container class-content'>
                    {navkey === "activities" && (
                        <>
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
                                                <a href='#' onClick={() => setShowActivityDetails(true)}><h3>Activity Name</h3></a>
                                                <p>Created by: Professor Name</p>
                                                <button disabled><img src='/src/assets/java2.png'/> Java</button>
                                            </div>

                                            <Modal show={showActivityDetails} onHide={() => setShowActivityDetails(false)} backdrop='static' keyboard={false} size='lg' className='modal-activity-details'>
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
                                                        <Button onClick={handleCodingAssessmentClick}>Start</Button>
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
                                                <a href='#' onClick={() => setShowActivityDetails(true)}><h3>Activity Name</h3></a>
                                                <p>Created by: Professor Name</p>
                                                <button disabled><img src='/src/assets/java2.png'/> Java</button>
                                            </div>

                                            <Modal show={showActivityDetails} onHide={() => setShowActivityDetails(false)} backdrop='static' keyboard={false} size='lg' className='modal-activity-details'>
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
                        </>
                    )}
                </div>  
                
                {navkey === "bulletin" && (
                    <>
                        <BulletinComponent/>
                    </>
                )}
            </div>
        </>
  )
}
