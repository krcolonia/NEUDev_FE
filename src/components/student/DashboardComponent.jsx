import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Dropdown, Nav, Card, Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptopCode, faDesktop, faBars } from '@fortawesome/free-solid-svg-icons';
import '/src/style/student/dashboard.css';

import { logout, getProfile } from '../api/API.js'; // Import API functions

export const DashboardComponent = () => {
    const defaultProfileImage = '/src/assets/noy.png';
    const [profileImage, setProfileImage] = useState(defaultProfileImage);

    // Fetch user profile image on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            const data = await getProfile();
            if (!data.error) {
                setProfileImage(data.profileImage || defaultProfileImage);
            } else {
                console.error("Failed to fetch profile image:", data.error);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        const result = await logout();
        if (!result.error) {
            window.location.href = "/home";
        } else {
            alert("Logout failed. Try again.");
        }
    };

    const navigate_sandbox = useNavigate();
    const handleSandboxClick = () => navigate_sandbox('/student/sandbox');

    const navigate_profile = useNavigate();
    const handleProfileClick = () => navigate_profile('/student/profile');

    const navigate_home = useNavigate();
    const handleHomeClick = () => navigate_home('/home');

    const navigate_class = useNavigate();
    const handleClassClick = () => navigate_class('/student/class');

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const [activeItem, setActiveItem] = useState('my-classes');
    const [showJoinClass, setShowJoinClass] = useState(false);

    return (
        <>
            <div className='dashboard'>
                <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                    <Nav className='flex-column sidebar-content'>
                        <Nav.Item className={`nav-item ${activeItem === 'my-classes' ? 'active' : ''}`} onClick={() => setActiveItem('my-classes')}>
                            <Nav.Link href='#' className='nav-link'>
                                <FontAwesomeIcon icon={faDesktop} className='sidebar-icon'/> My Classes
                            </Nav.Link>
                        </Nav.Item>

                        <Nav.Item className='nav-item' onClick={handleSandboxClick}>
                            <Nav.Link href='#' className='nav-link'>
                                <FontAwesomeIcon icon={faLaptopCode} className='sidebar-icon'/> Sandbox
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
                            <span className='student-badge'>Student</span>
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

                    <div className='container'>
                        <h5>Active Classes</h5>

                        <div className='classes-container'>
                            <Card className='class-card'>
                                <Card.Img variant='top' src='/src/assets/univ.png'/>
                                <Card.Body>
                                    <Card.Text>
                                        <a href='#' onClick={handleClassClick}>Class name <br/> Instructor's name</a>
                                    </Card.Text>
                                </Card.Body>
                            </Card>

                            <Button variant='transparent' className='join-class' onClick={() => setShowJoinClass(true)}>
                                + Join a Class
                            </Button>

                            <Modal show={showJoinClass} onHide={() => setShowJoinClass(false)} backdrop='static' keyboard={false} size='lg'>
                                <Modal.Header closeButton>Join Class</Modal.Header>
                                <Modal.Body className='modal-class-body'>
                                    <p>Enter the class code given to you by your teacher.</p>
                                    <input type='text' placeholder='ex. 123456' className='form-control'/>
                                    <Button>Join Class</Button>
                                </Modal.Body>
                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};