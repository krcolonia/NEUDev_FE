import React from 'react'
import { useState } from 'react';
import '/src/style/teacher/cmBulletin.css'
import { Button, Row, Col, Card, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBold, faItalic, faUnderline, faSuperscript, faAlignLeft, faAlignCenter, faAlignRight } from '@fortawesome/free-solid-svg-icons';
import CMNavigationBarComponent from './CMNavigationBarComponent';

export const CMBulletinComponent = () => {

  const [posts] = useState([
      { id: 1, title: 'Activity 3 Java Basic', dateCreated: '12 August 2025', timeCreated: '7:30pm', message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
      { id: 2, title: 'Activity 1 Data Structure', dateCreated: '14 February 2025', timeCreated: '7:30am', message: 'YEHEYYYY' },
      { id: 3, title: 'Activity 2 OOP', dateCreated: '19 December 2025', timeCreated: '9:30am', message: 'HAHAHAHHAHAHAHAHHA' }
  ]);

  const [concerns] = useState([
      { id: 1, name: 'Angelica Mae Manliguez', dateCreated: '12 August 2025', timeCreated: '7:30pm', message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
      { id: 2, name: 'Hannah Condada', dateCreated: '14 February 2025', timeCreated: '7:30am', message: 'sir bat ganto' },
      { id: 3, name: 'Erikka Enaje', dateCreated: '19 December 2025', timeCreated: '9:30am', message: 'ma anong ulam' }
  ]);

  const [showResponse, setShowResponse] = useState(false);
  const [showPostAnnouncement, setShowPostAnnouncement] = useState(false);

  return (
    <>
    <CMNavigationBarComponent/>
      <div className='bulletin-content'>
        <div className="create-new-activity-wrapper"></div> 
        <div className="create-new-activity-container">
          <button className="create-new-activity-button"  onClick={() => setShowPostAnnouncement(true)}>
              + Create New Post
          </button>

          <Modal className='modal-post-announcement' show={showPostAnnouncement} onHide={() => setShowPostAnnouncement(false)} backdrop='static' keyboard={false} size='md'>
            <Modal.Header closeButton><h3>Create a Post</h3></Modal.Header>
            <Modal.Body>
              <Form className='create-activity-form'>
                <Form.Control className='create-activity-title' type='text' placeholder='Title...'/>

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
                <Form.Control as='textarea' placeholder='Description...'/>
              </div>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setShowPostAnnouncement(false)}>Post</Button>
            </Modal.Footer>
          </Modal>
        </div>
        
        <Row>
          <Col></Col>
          <Col xs={7}>
            <div className='announcement'>
                <div className='announcement-header'>
                  <h5>Professor's Announcements</h5>
                </div>

                {posts.map((post) =>
                  <Card className='post-card' style={{borderRadius: "20px" }}>
                    <Card.Header>
                      <h2>{post.title}</h2>
                      <p>Created on {post.dateCreated} {post.timeCreated}</p>
                    </Card.Header>
                    <Card.Body>
                      <p>{post.message}</p>
                      <div className='post-likes'>
                        <i className='bi bi-hand-thumbs-up'/>
                        <p>42 students acknowledged this post</p>
                      </div>
                    </Card.Body>
                  </Card>
                )}
            </div>
          </Col>
          <Col xs={3}>
              <div className='concern'>
                <div className='concern-header'>
                  <h5>Student Concerns</h5>
                </div>

                <div className='concern-body'>
                  {concerns.map((concern) =>
                    <div className='concern-details'>
                      <h6>{concern.name}</h6>
                      <p>Created on {concern.dateCreated} {concern.timeCreated}</p>
                      <p className='concern-message'>{concern.message}</p>

                      <div className='concern-actions'>
                        <p>Pending</p>
                        <p>Reply<i className='bi bi-reply-fill' onClick={() => setShowPostConcern(true)}/></p>
                      </div>
                    </div>
                  )}
                  
                  <Modal className='post-concern' show={showResponse} onHide={() => setShowResponse(false)} backdrop='static' keyboar={false} size='md'>
                    <Modal.Header closeButton>
                        <div className='modal-activity-header'>
                            <h3>Send Your Response</h3>
                            <p>To student, Hanna Condada</p>
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                      <textarea className='post-concern-textarea'></textarea>
                    </Modal.Body>
                    <Modal.Footer>
                            <Button onClick={() => setShowResponse(false)}>Send Response</Button>
                    </Modal.Footer>
                  </Modal>
                </div>
              </div>
          </Col>
        </Row>
      </div>
    </>
  )
}
