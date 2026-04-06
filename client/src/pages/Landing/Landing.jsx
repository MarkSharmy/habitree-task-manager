import Logo from '../../assets/logo.png';
import Hero from '../../assets/flow_chart.png';
import Dashboard from '../../assets/dashboard.jpg';
import Feature1 from '../../assets/features_image_01.png';
import Feature2 from '../../assets/features_image_02.png';
import Feature3 from '../../assets/features_image_03.png';
import MongoDB from '../../assets/mongo.png';
import Express from '../../assets/express.png';
import React from '../../assets/react.png';
import Redux from '../../assets/redux.png';
import Node from '../../assets/node.png';

import './landing.css';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div id="home" className="landing-container">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="logo">
                    <img src={Logo} alt="Logo" style={{ height: '2.5rem'}}/>
                    <h2>Habitree</h2>
                </div>
                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#preview">Preview</a>
                    <a href="#tech">Technology</a>
                    <a href="#download">Download</a>
                </div>
                <div className="auth-buttons">
                    <Link to="/login"className="btn-auth btn-login">Log In</Link>
                    <button className="btn-auth btn-register">Get Started</button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section">
                <h1>Habitree: Your Unified Productivity Manager</h1>
                <p>Master skills, track learning, and visualize your<br/>progress with MERN-stack power.</p>
                <div className="hero-visual">
                    <div className="roadmap-preview-img"><img src={Hero} alt="Hero" className="hero-img"/></div>
                </div>
                <div className="hero-actions">
                    <button className="action-btn btn-green">Start Your First Roadmap</button>
                    <button className="action-btn btn-blue">Explore Your Projects</button>
                </div>
            </header>

            {/* Features Section */}
            <section className="section features" id="features">
                <h2 className="section-title">Features</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <img src={Feature1} alt="Feature 1" className="feature-icon" />
                        <h3>1. Session-Driven Flows</h3>
                        <p>Track productive time as sessions. Automatic status updates</p>
                    </div>
                    <div className="feature-card">
                        <img src={Feature2} alt="Feature 2" className="feature-icon" />
                        <h3>2. Kanban Board Bridge</h3>
                        <p>Integrated Kanban with automated trigger points for task status.</p>
                    </div>
                    <div className="feature-card">
                        <img src={Feature3} alt="Feature 3" className="feature-icon" />
                        <h3>3. Global Synchronization</h3>
                        <p>Real-time Synchronization across web and mobile. Single source of truth.</p>
                    </div>
                </div>
            </section>

            {/* Preview Section */}
            <section id="preview" className="section preview">
                <h2 className="section-title">Dashboard Preview</h2>
                <div className="preview-container">
                    <div className="dashboard-preview">
                        <img src={Dashboard} alt="Dashboard" />
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section id="tech" className="section tech-stack">
                <h2 className="section-title">Technology Stack</h2>
                <div className="tech-grid">
                    <div className="tech-item"><img src={MongoDB} alt="MongoDB" className="tech-item-img" /></div>
                    <div className="tech-item"><img src={Express} alt="Express" className="tech-item-img" /></div>
                    <div className="tech-item"><img src={React} alt="React" className="tech-item-img" /></div>
                    <div className="tech-item"><img src={Node} alt="Node" className="tech-item-img" /></div>
                    <div className="tech-item"><img src={Redux} alt="Redux" className="tech-item-img" /></div>
                </div>
                <p className="tech-credit">Build on a modern stack for performance and scale</p>
            </section>

            {/* Dwonload Section */}
            <section id="download" className="section download">
                <h2 className="section-title">Download</h2>
                <div className="download-section-container">
                    <div className="download-left">

                    </div>
                    <div className="download-right">
                        <h3>Download the Android APK</h3>
                        <p>Unlock the power of Productivity tracking<br/>on your phone<br/></p>
                        <button className="btn-download btn-green">Download APK</button>
                    </div>
                </div>
            </section>

            <footer>
                <small className="copyright">© Copyright Habitree Task Manager.</small>
                <div className="author">Developed By Mark Sharmy</div>
            </footer>
        </div>
    );
}

export default Landing;