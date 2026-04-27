import React from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorIllustration from '../../assets/error.png';
import './serverError.css';

const ServerError = () => {
    const navigate = useNavigate();

    return (
        <div className="error-page-wrapper">
            <div className="error-content-container">
                <div className="error-text-section">
                    <h1 className="error-title">Internal Server Error</h1>
                    <p className="error-description">
                        Something went wrong on our end. We're working to fix the issue 
                        and should be back up shortly.
                    </p>
                    <button 
                        className="back-home-btn" 
                        onClick={() => navigate('/')}
                    >
                        Back to Home
                    </button>
                </div>
                
                <div className="error-image-section">
                    <img 
                        src={ErrorIllustration} 
                        alt="500 Internal Server Error" 
                        className="error-main-img" 
                    />
                </div>
            </div>
        </div>
    );
};

export default ServerError;