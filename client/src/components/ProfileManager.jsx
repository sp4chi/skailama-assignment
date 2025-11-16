import { useState } from 'react'
import { useProfiles } from '../hooks/useApi'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const API_URL = import.meta.env.VITE_API_URL || '';

// Common timezones from major regions
const TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'America/Vancouver',
    'America/Mexico_City',
    'America/Sao_Paulo',
    'America/Argentina/Buenos_Aires',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Europe/Madrid',
    'Europe/Amsterdam',
    'Europe/Brussels',
    'Europe/Zurich',
    'Europe/Moscow',
    'Africa/Cairo',
    'Africa/Johannesburg',
    'Africa/Lagos',
    'Africa/Nairobi',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Bangkok',
    'Asia/Singapore',
    'Asia/Hong_Kong',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Asia/Taipei',
    'Asia/Jakarta',
    'Asia/Manila',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Australia/Brisbane',
    'Australia/Perth',
    'Pacific/Auckland',
    'Pacific/Fiji',
    'Pacific/Honolulu',
];

function ProfileManager({ onProfileSelect, selectedProfile }) {
    const { profiles, loading, error, createProfile, updateProfile, refetch } = useProfiles()
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ name: '', timezone: 'UTC' })
    const [editingId, setEditingId] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingId) {
                await updateProfile(editingId, formData)
            } else {
                await createProfile(formData)
            }
            setFormData({ name: '', timezone: 'UTC' })
            setShowForm(false)
            setEditingId(null)
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message))
        }
    }

    const handleEdit = (profile) => {
        setFormData({ name: profile.name, timezone: profile.timezone })
        setEditingId(profile._id)
        setShowForm(true)
    }

    return (
        <div className="profile-manager">
            <div className="section-header">
                <h2>User Profiles</h2>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setShowForm(!showForm)
                        setEditingId(null)
                        setFormData({ name: '', timezone: 'UTC' })
                    }}
                >
                    {showForm ? '✕ Cancel' : '+ Add Profile'}
                </button>
            </div>

            {error && <div className="error-message">Error: {error}</div>}
            {loading && <div className="loading-message">Loading profiles...</div>}

            {showForm && (
                <div className="card form-card">
                    <h3>{editingId ? 'Edit Profile' : 'Create New Profile'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                minLength="2"
                                placeholder="Enter profile name"
                            />
                        </div>

                        <div className="form-group">
                            <label>Timezone *</label>
                            <select
                                value={formData.timezone}
                                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                required
                            >
                                {TIMEZONES.map(tz => (
                                    <option key={tz} value={tz}>
                                        {tz} ({dayjs().tz(tz).format('Z')})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" className="btn-primary">
                            {editingId ? 'Update Profile' : 'Create Profile'}
                        </button>
                    </form>
                </div>
            )}

            <div className="profiles-grid">
                {profiles.length === 0 ? (
                    <p className="empty-state">No profiles yet. Create one to get started!</p>
                ) : (
                    profiles.map(profile => (
                        <div
                            key={profile._id}
                            className={`profile-card ${selectedProfile?._id === profile._id ? 'selected' : ''}`}
                            onClick={() => onProfileSelect(profile)}
                        >
                            <div className="profile-header">
                                <h3>{profile.name}</h3>
                                <button
                                    className="btn-icon"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleEdit(profile)
                                    }}
                                >
                                    ✏️
                                </button>
                            </div>
                            <div className="profile-info">
                                <span className="timezone-badge">
                                    🌍 {profile.timezone}
                                </span>
                                <span className="time-info">
                                    {dayjs().tz(profile.timezone).format('HH:mm')}
                                </span>
                            </div>
                            <div className="profile-meta">
                                Created: {dayjs(profile.createdAt).format('MMM D, YYYY')}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default ProfileManager
