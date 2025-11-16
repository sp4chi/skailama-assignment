import { useState } from 'react'
import { useEvents, useProfiles } from '../hooks/useApi'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)
import EventForm from './EventForm'
import EventCard from './EventCard'

const API_URL = import.meta.env.VITE_API_URL || '';

function EventManager({ selectedProfile }) {
    const { profiles } = useProfiles()
    const { events, loading, error, deleteEvent, refetch } = useEvents()
    const [showForm, setShowForm] = useState(false)
    const [editingEvent, setEditingEvent] = useState(null)
    const [viewingEvent, setViewingEvent] = useState(null)
    const [filterProfile, setFilterProfile] = useState(null)

    const handleCreateEdit = (event = null) => {
        setEditingEvent(event)
        setShowForm(true)
    }

    const handleCloseForm = () => {
        setShowForm(false)
        setEditingEvent(null)
    }

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Are you sure you want to delete this event?')) return

        try {
            await deleteEvent(eventId)
        } catch (err) {
            alert('Error deleting event: ' + (err.response?.data?.message || err.message))
        }
    }

    const convertToUserTimezone = (dateTime, timezone) => {
        return dayjs(dateTime).tz(timezone)
    }

    const filteredEvents = filterProfile
        ? events.filter(event =>
            event.profiles.some(p => p._id === filterProfile._id)
        )
        : events

    const userTimezone = filterProfile?.timezone || selectedProfile?.timezone || 'UTC'

    return (
        <div className="event-manager">
            <div className="section-header">
                <div>
                    <h2>Events</h2>
                    {filterProfile && (
                        <p className="filter-info">
                            Showing events for: <strong>{filterProfile.name}</strong> ({filterProfile.timezone})
                        </p>
                    )}
                </div>
                <button
                    className="btn-primary"
                    onClick={() => handleCreateEdit()}
                >
                    + Create Event
                </button>
            </div>

            <div className="filter-section">
                <label>Filter by Profile:</label>
                <select
                    value={filterProfile?._id || ''}
                    onChange={(e) => {
                        const profile = profiles.find(p => p._id === e.target.value)
                        setFilterProfile(profile || null)
                    }}
                >
                    <option value="">All Events</option>
                    {profiles.map(profile => (
                        <option key={profile._id} value={profile._id}>
                            {profile.name} ({profile.timezone})
                        </option>
                    ))}
                </select>
            </div>

            {showForm && (
                <EventForm
                    event={editingEvent}
                    profiles={profiles}
                    selectedProfile={selectedProfile}
                    onClose={handleCloseForm}
                    onSuccess={() => {
                        refetch()
                        handleCloseForm()
                    }}
                />
            )}

            {error && <div className="error-message">Error: {error}</div>}
            {loading && <div className="loading-message">Loading events...</div>}

            <div className="events-list">
                {filteredEvents.length === 0 ? (
                    <div className="empty-state">
                        <p>No events found. Create your first event!</p>
                    </div>
                ) : (
                    filteredEvents.map(event => (
                        <EventCard
                            key={event._id}
                            event={event}
                            userTimezone={userTimezone}
                            onEdit={() => handleCreateEdit(event)}
                            onDelete={() => handleDeleteEvent(event._id)}
                            onViewDetails={(e) => setViewingEvent(e)}
                        />
                    ))
                )}
            </div>

            {viewingEvent && (
                <EventDetailsModal
                    event={viewingEvent}
                    userTimezone={userTimezone}
                    onClose={() => setViewingEvent(null)}
                />
            )}
        </div>
    )
}

function EventDetailsModal({ event, userTimezone, onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{event.title}</h2>
                    <button className="btn-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {event.description && (
                        <div className="detail-section">
                            <label>Description:</label>
                            <p>{event.description}</p>
                        </div>
                    )}

                    <div className="detail-section">
                        <label>Assigned Profiles:</label>
                        <div className="profile-tags">
                            {event.profiles.map(p => (
                                <span key={p._id} className="profile-tag">
                                    {p.name} ({p.timezone})
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="detail-section">
                        <label>Event Timezone:</label>
                        <p>{event.timezone}</p>
                    </div>

                    <div className="detail-section">
                        <label>Start Time (Your timezone: {userTimezone}):</label>
                        <p>{dayjs(event.startDateTime).tz(userTimezone).format('MMMM D, YYYY [at] h:mm A')}</p>
                    </div>

                    <div className="detail-section">
                        <label>End Time (Your timezone: {userTimezone}):</label>
                        <p>{dayjs(event.endDateTime).tz(userTimezone).format('MMMM D, YYYY [at] h:mm A')}</p>
                    </div>

                    {event.updateLogs && event.updateLogs.length > 0 && (
                        <div className="detail-section">
                            <label>Update History:</label>
                            <div className="update-logs">
                                {event.updateLogs.map((log, idx) => (
                                    <div key={idx} className="log-entry">
                                        <div className="log-header">
                                            <span className="log-field">{log.field}</span>
                                            <span className="log-timestamp">
                                                {dayjs(log.updatedAt).tz(userTimezone).format('MMM D, YYYY h:mm A')}
                                            </span>
                                        </div>
                                        <div className="log-changes">
                                            <div className="old-value">
                                                <small>Before:</small>
                                                <span>{formatLogValue(log.oldValue, log.field)}</span>
                                            </div>
                                            <div className="arrow">→</div>
                                            <div className="new-value">
                                                <small>After:</small>
                                                <span>{formatLogValue(log.newValue, log.field)}</span>
                                            </div>
                                        </div>
                                        {log.updatedBy && (
                                            <div className="log-user">Updated by: {log.updatedBy.name}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function formatLogValue(value, field) {
    if (!value) return 'N/A'

    if (field === 'startDateTime' || field === 'endDateTime') {
        return dayjs(value).format('MMM D, YYYY h:mm A')
    }

    if (field === 'profiles' && Array.isArray(value)) {
        return value.length + ' profile(s)'
    }

    if (typeof value === 'object') {
        return JSON.stringify(value)
    }

    return String(value)
}

export default EventManager
