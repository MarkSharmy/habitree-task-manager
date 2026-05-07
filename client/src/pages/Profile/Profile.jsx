import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarLoader } from 'react-spinners';
import { User, Mail, Shield, Settings, Edit3, Check, AlertTriangle, CheckCircle } from 'lucide-react';
import {
    fetchCurrentUser,
    updateUserProfile,
    updateUserSettings,
    clearUpdateStatus,
} from '../../store/slices/userSlice';
import Avatar from '../../assets/profile.png';
import './profile.css';

const ROLE_LABELS = {
    Master: 'master',
    Admin: 'admin',
    Collaborator: 'collaborator',
};

const Profile = () => {
    const dispatch = useDispatch();
    const { profile, loading, updating, updateSuccess, error } = useSelector((state) => state.user);

    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '' });

    useEffect(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    useEffect(() => {
        if (profile) {
            setFormData({ username: profile.username, email: profile.email });
        }
    }, [profile]);

    useEffect(() => {
        if (updateSuccess) {
            setIsEditingInfo(false);
            const timer = setTimeout(() => dispatch(clearUpdateStatus()), 3000);
            return () => clearTimeout(timer);
        }
    }, [updateSuccess, dispatch]);

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = () => {
        dispatch(updateUserProfile(formData));
    };

    const handleCancelEdit = () => {
        setFormData({ username: profile.username, email: profile.email });
        setIsEditingInfo(false);
        dispatch(clearUpdateStatus());
    };

    const handleToggleSetting = (key, value) => {
        dispatch(updateUserSettings({ [key]: value }));
    };

    const formatJoinDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (loading && !profile) return (
        <div className="details-loader-container">
            <BarLoader color="#3b82f6" />
            <p>Loading Profile...</p>
        </div>
    );

    if (!profile) return null;

    return (
        <div className="profile-container">
            <div className="profile-page-header">
                <h1>Profile &amp; Settings</h1>
                <p>Manage your account information and preferences</p>
            </div>

            {updateSuccess && (
                <div className="profile-success-toast">
                    <CheckCircle size={16} />
                    Profile updated successfully.
                </div>
            )}

            {/* Identity card */}
            <div className="profile-identity-card">
                <div className="profile-avatar-wrapper">
                    <img src={Avatar} alt="Avatar" className="profile-avatar" />
                </div>
                <div className="profile-identity-info">
                    <h2>{profile.username}</h2>
                    <p>{profile.email}</p>
                    <span className={`role-badge ${ROLE_LABELS[profile.role] || 'admin'}`}>
                        <Shield size={11} /> {profile.role}
                    </span>
                    <p className="profile-joined">Member since {formatJoinDate(profile.createdAt)}</p>
                </div>
            </div>

            {/* Personal Information */}
            <div className="profile-section">
                <div className="profile-section-header">
                    <h3><User size={16} /> Personal Information</h3>
                    <button
                        className={`btn-edit-section ${isEditingInfo ? 'active' : ''}`}
                        onClick={() => isEditingInfo ? handleCancelEdit() : setIsEditingInfo(true)}
                    >
                        <Edit3 size={14} />
                        {isEditingInfo ? 'Cancel' : 'Edit'}
                    </button>
                </div>

                <div className="profile-section-body">
                    {error && isEditingInfo && (
                        <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <AlertTriangle size={14} /> {error}
                        </div>
                    )}

                    <div className="profile-field-grid">
                        <div className="profile-field">
                            <label>Username</label>
                            {isEditingInfo ? (
                                <input
                                    className="field-input"
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleFieldChange}
                                />
                            ) : (
                                <span className="field-value">{profile.username}</span>
                            )}
                        </div>

                        <div className="profile-field">
                            <label>Email</label>
                            {isEditingInfo ? (
                                <input
                                    className="field-input"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFieldChange}
                                />
                            ) : (
                                <span className="field-value">{profile.email}</span>
                            )}
                        </div>

                        <div className="profile-field">
                            <label>Role</label>
                            <span className="field-value">{profile.role}</span>
                        </div>

                        <div className="profile-field">
                            <label>Member Since</label>
                            <span className="field-value">{formatJoinDate(profile.createdAt)}</span>
                        </div>
                    </div>

                    {isEditingInfo && (
                        <div className="profile-form-actions">
                            <button className="btn-cancel-edit" onClick={handleCancelEdit}>
                                Cancel
                            </button>
                            <button className="btn-save" onClick={handleSaveProfile} disabled={updating}>
                                <Check size={15} />
                                {updating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Preferences */}
            <div className="profile-section">
                <div className="profile-section-header">
                    <h3><Settings size={16} /> Preferences</h3>
                </div>
                <div className="profile-section-body">
                    <div className="settings-row">
                        <div className="settings-row-info">
                            <span className="settings-row-label">Auto Rollover</span>
                            <span className="settings-row-desc">
                                Unfinished tasks automatically carry over to the next day
                            </span>
                        </div>
                        <label className="settings-toggle">
                            <input
                                type="checkbox"
                                checked={!!profile.settings?.autoRollover}
                                onChange={(e) => handleToggleSetting('autoRollover', e.target.checked)}
                            />
                            <span className="settings-toggle-slider" />
                        </label>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="profile-section">
                <div className="profile-section-header">
                    <h3 style={{ color: '#ef4444' }}><AlertTriangle size={16} /> Danger Zone</h3>
                </div>
                <div className="profile-section-body">
                    <div className="danger-zone-body">
                        <div className="danger-zone-text">
                            <p>Delete Account</p>
                            <small>Permanently remove your account and all associated data. This cannot be undone.</small>
                        </div>
                        <button
                            className="btn-danger"
                            onClick={() => window.confirm('Are you sure? This action cannot be undone.') && console.log('Delete account')}
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;