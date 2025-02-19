import { faBars, faDesktop, faLaptopCode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import { Button, Card, Dropdown, Form, Modal, Nav, Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '/src/style/teacher/dashboard.css';

import { logout, getProfile } from '../api/API.js'; // Import API functions

export const DashboardComponent = () => {
    
    const [profileImage, setProfileImage] = useState('/src/assets/default-profile.png'); // Default profile image

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getProfile(); // Fetch teacher profile from API
                if (response && response.profileImage) {
                    setProfileImage(response.profileImage); // Set profile image from backend
                }
            } catch (error) {
                console.error("Error fetching profile image:", error);
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = async () => {
        const result = await logout(); // Call logout function
    
        if (!result.error) {
            window.location.href = "/home"; // Redirect to home after successful logout
        } else {
            alert("Logout failed. Try again.");
        }
    };

    const navigate_sandbox = useNavigate();
    const handleSandboxClick = () => {
        navigate_sandbox('/teacher/sandbox');
    };

    const navigate_profile = useNavigate();
    const handleProfileClick = () => {
        navigate_profile('/teacher/profile');
    };

    const navigate_home = useNavigate();
    const handleHomeClick = () =>{
        navigate_home('/home')
    }

    const navigate_class = useNavigate();
    const handleClassClick = () =>{
        navigate_class('/teacher/activities')
    }

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const [activeItem, setActiveItem] = useState('my-classes');

    const [showCreateClass, setShowCreateClass] = useState(false);

    return (
        <div className='dashboard'>
            <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <Nav className='flex-column sidebar-content'>
                    <Nav.Item className={`nav-item ${activeItem === 'my-classes' ? 'active' : ''}`} onClick={() => setActiveItem('my-classes')}>
                        <Nav.Link href='#' className='nav-link'>
                            <FontAwesomeIcon icon={faDesktop} className='sidebar-icon' /> My Classes
                        </Nav.Link>
                    </Nav.Item>

                    <Nav.Item className='nav-item' onClick={handleSandboxClick}>
                        <Nav.Link href='#' className='nav-link'>
                            <FontAwesomeIcon icon={faLaptopCode} className='sidebar-icon' /> Sandbox
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>

            <div className='dashboard-content'>
                <Navbar expand='lg' fixed='top' className='navbar-top'>
                    <Button variant='transparent' className='toggle-btn' onClick={toggleSidebar}>
                        <FontAwesomeIcon icon={faBars} />
                    </Button>

                    <div className='dashboard-navbar'>
                        <span className='ping'>20 ms</span>
                        <a href='#'><i className='bi bi-moon'></i></a>
                        <span className='student-badge'>Teacher</span>
                        <Dropdown align='end'>
                            <Dropdown.Toggle variant='transparent' className='profile-dropdown'>
                                <img src={profileImage} className='profile-image' alt="Profile" />
                            </Dropdown.Toggle>
                            
                            <Dropdown.Menu>
                                <Dropdown.Item href='#' onClick={handleProfileClick}>Profile Account</Dropdown.Item>
                                <Dropdown.Item href="#" onClick={handleLogout}>Log Out</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Navbar>

                <div className='container dashboard-body'>
                    <h5>Active Classes</h5>

                    <div className='classes-container'>
                        <Card className='class-card'>
                            <Card.Img variant='top' src='/src/assets/univ.png' />
                            <Card.Body>
                                <Card.Text onClick={handleClassClick}>Class name <br /> Instructor's name</Card.Text>
                            </Card.Body>
                        </Card>

                        <Button variant='transparent' className='create-class' onClick={() => setShowCreateClass(true)}>
                            + Create a Class
                        </Button>
                    </div>
                </div>

                <Modal className='modal-create-class' show={showCreateClass} onHide={() => setShowCreateClass(false)} backdrop='static' keyboard={false} size='lg'>
                    <Modal.Header closeButton>
                        <Modal.Title>Class Creation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId='formClassName'>
                                <Form.Label>Class Name</Form.Label>
                                <Form.Control type='text' placeholder='Enter class name' />
                            </Form.Group>

                            <Form.Group controlId='formSection'>
                                <Form.Label>Section</Form.Label>
                                <Form.Control as='select'>
                                    <option value=''>Select section</option>
                                    <option value='1BSCS-1'>1BSCS-1</option>
                                    <option value='1BSCS-2'>1BSCS-2</option>
                                    <option value='2BSCS-1'>2BSCS-1</option>
                                    <option value='3BSCS-1'>3BSCS-1</option>
                                    <option value='4BSCS-1'>4BSCS-1</option>
                                </Form.Control>
                            </Form.Group>

                            <Button variant='primary' className='mt-3'>
                                Create Class
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    );
};