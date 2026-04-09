import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../store/slices/authSlice';
import './register.css';

import HeroBG from '../../assets/register_hero.jpg';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const{ loading, error, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleRegister = (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return;
        }
        
        const { confirmPassword, ...submitData } = formData;
        dispatch(registerUser(submitData));
    };

    return(
        <div className="auth-page">
            <div className="register-card">
                {/* TOP SIDE: Branding Banner */}
                <div className="auth-banner" style={{backgroundImage: `url(${HeroBG})`, backgroundSize: 'cover'}}>
                    <div className="banner-content">
                        <p className="banner-subtitle">Ready To Get Locked In?</p>
                        <h1 className="banner-title">CREATE ACCOUNT</h1>
                        <div className="banner-underline"></div>
                    </div>
                </div>

                {/* BOTTOM SIDE: Form */}
                <div className="auth-form-container">
                    <form className="register-form" onSubmit={handleRegister}>
                        {error && <div className="auth-error-msg">{error}</div>}

                        <div className="input-group">
                            <input 
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input 
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input 
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input 
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </form>
                    
                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                    </button>
                    
                    <div className="form-footer">
                        <Link to="/" className="back-home-link">Back to home</Link>
                        <p className="auth-switch-prompt">
                            Already have an account? <Link to="/login" className="auth-switch-link">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;