import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import './login.css';

import HeroBG from '../../assets/login_hero.jpg';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            console.log("Redirecting to Dashboard");
            navigate('/dashboard')
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }));
    }

    return(
        <div className="auth-page">
            <div className="login-card">
                {/* Left Side: Branding */}
                <div className="auth-hero" style={{backgroundImage: `url(${HeroBG})`, backgroundSize: 'cover'}}>
                    <div className="hero-content">
                        <div className="hero-subtitle">Let's Keep It Going</div>
                        <div className="hero-title">WELCOME BACK</div>
                        <div className="hero-underline"></div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="auth-form-container">
                    <div className="form-header">
                        <h2>Login Account</h2>
                        <p>Access your personalized roadmap and track your daily productivity goals.</p>
                    </div>

                    <form className="login-form" onSubmit={handleLogin}>
                        {/* Error Handing */}
                        {error && <div className="auth-error-msg">{error}</div>}
                        
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button className="login-submit-btn" disabled={loading}>
                            { loading ? "Authenticating..." : "Login" }
                        </button>
                    </form>

                    <div className="form-footer">
                        <Link to="/" className="back-home">Back to home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;