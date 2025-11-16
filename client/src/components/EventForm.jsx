import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
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

function EventForm({ event, profiles, selectedProfile, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        profiles: selectedProfile ? [selectedProfile._id] : [],
        timezone: selectedProfile?.timezone || 'UTC',
        startDateTime: '',
        endDateTime: ''
    })
    const [errors, setErrors] = useState({})
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title,
                description: event.description || '',
                profiles: event.profiles.map(p => p._id),
                timezone: event.timezone,
                startDateTime: dayjs(event.startDateTime).format('YYYY-MM-DDTHH:mm'),
                endDateTime: dayjs(event.endDateTime).format('YYYY-MM-DDTHH:mm')
            })
        }
    }, [event])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false)
            }
        }

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isDropdownOpen])

    const validateForm = () => {
        const newErrors = {}

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required'
        }

        if (formData.profiles.length === 0) {
            newErrors.profiles = 'Select at least one profile'
        }

        if (!formData.startDateTime) {
            newErrors.startDateTime = 'Start date/time is required'
        }

        if (!formData.endDateTime) {
            newErrors.endDateTime = 'End date/time is required'
        }

        if (formData.startDateTime && formData.endDateTime) {
            const start = new Date(formData.startDateTime)
            const end = new Date(formData.endDateTime)

            if (end <= start) {
                newErrors.endDateTime = 'End time must be after start time'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            // Convert datetime-local values to UTC, considering the event timezone
            const startInEventTz = dayjs.tz(formData.startDateTime, formData.timezone)
            const endInEventTz = dayjs.tz(formData.endDateTime, formData.timezone)

            const payload = {
                ...formData,
                startDateTime: startInEventTz.utc().format(),
                endDateTime: endInEventTz.utc().format(),
                updatedBy: selectedProfile?._id || formData.profiles[0]
            }

            if (event) {
                await axios.put(`${API_URL}/api/events/${event._id}`, payload)
            } else {
                payload.createdBy = selectedProfile?._id || formData.profiles[0]
                await axios.post(`${API_URL}/api/events`, payload)
            }

            onSuccess()
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message))
        }
    }

    const handleProfileToggle = (profileId) => {
        setFormData(prev => ({
            ...prev,
            profiles: prev.profiles.includes(profileId)
                ? prev.profiles.filter(id => id !== profileId)
                : [...prev.profiles, profileId]
        }))
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content event-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{event ? 'Edit Event' : 'Create New Event'}</h2>
                    <button className="btn-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="event-form">
                    <div className="form-group">
                        <label>Event Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter event title"
                            className={errors.title ? 'error' : ''}
                        />
                        {errors.title && <span className="error-msg">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter event description (optional)"
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>Assign to Profiles * (Select one or more)</label>
                        <div className="custom-dropdown" ref={dropdownRef}>
                            <div
                                className={`dropdown-trigger ${errors.profiles ? 'error' : ''}`}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span>
                                    {formData.profiles.length === 0
                                        ? 'Select profiles...'
                                        : `${formData.profiles.length} profile${formData.profiles.length > 1 ? 's' : ''} selected`
                                    }
                                </span>
                                <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
                            </div>
                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    {profiles.map(profile => (
                                        <div
                                            key={profile._id}
                                            className="dropdown-item"
                                            onClick={() => handleProfileToggle(profile._id)}
                                        >
                                            <span className="checkbox-icon">
                                                {formData.profiles.includes(profile._id) ? '✓' : ''}
                                            </span>
                                            <span>{profile.name} ({profile.timezone})</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {errors.profiles && <span className="error-msg">{errors.profiles}</span>}
                    </div>

                    <div className="form-group">
                        <label>Event Timezone *</label>
                        <select
                            value={formData.timezone}
                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        >
                            {TIMEZONES.map(tz => (
                                <option key={tz} value={tz}>
                                    {tz} ({dayjs().tz(tz).format('Z')})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Date & Time *</label>
                            <input
                                type="datetime-local"
                                value={formData.startDateTime}
                                onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                                className={errors.startDateTime ? 'error' : ''}
                            />
                            {errors.startDateTime && <span className="error-msg">{errors.startDateTime}</span>}
                        </div>

                        <div className="form-group">
                            <label>End Date & Time *</label>
                            <input
                                type="datetime-local"
                                value={formData.endDateTime}
                                onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                                className={errors.endDateTime ? 'error' : ''}
                            />
                            {errors.endDateTime && <span className="error-msg">{errors.endDateTime}</span>}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {event ? 'Update Event' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EventForm
