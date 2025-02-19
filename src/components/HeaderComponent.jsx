import React from 'react'
import { useNavigate } from 'react-router-dom';
import '../style/header.css'

export const HeaderComponent = () => {
    
    const navigate_signin = useNavigate();
    const handleSignInClick = () => {
        navigate_signin('/signin');
    };
    return (
        <>
            <div className='row g-2'>
                <div className='col-md-6'>
                    <div className="header-section-text">
                        <p className='header-section-title'>Welcome to HANORI<br></br>—where code meets clarity</p>
                        <p>HANORI streamlines evaluations with automated, consistent code analysis. From pinpointing improvements to offering smart optimizations and detailed feedback, it’s coding clarity at its finest.</p>
                        <p>Say goodbye to Sir Marc, and hello to streamlined, insightful assessments. Welcome to the future of coding evaluation – welcome to HANORI!</p>
                        <div>
                            <a href="#sign-in" class="button-link" onClick={handleSignInClick}>Sign In</a>
                        </div>
                    </div>
                </div>

                <div className='col-md-5'>
                    <div className='header-image'>
                        <img src='/src/assets/computer.png'/>
                    </div>
                </div>

            </div>
        </>
    )
}
