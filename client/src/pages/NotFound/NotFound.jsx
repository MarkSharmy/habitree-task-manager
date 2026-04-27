import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotFoundIllustration from '../../assets/404.png'; // Make sure this asset exists
import './notFound.css';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-wrapper">
            <div className="not-found-content">
                <header className="not-found-header">
                    <h1 className="oops-text">OOPS!</h1>
                    <p className="page-not-found-text">Page not found</p>
                </header>
                
                <div className="illustration-container">
                    <img 
                        src={NotFoundIllustration} 
                        alt="404 Page Not Found Illustration" 
                        className="not-found-img"
                    />
                </div>
                
                <footer className="not-found-footer">
                    <button 
                        className="btn-back-dashboard" 
                        onClick={() => navigate('/')} // Redirects to Dashboard/Root
                    >
                        Back to Dashboard
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default NotFound;