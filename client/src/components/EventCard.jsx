import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import duration from 'dayjs/plugin/duration'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)
dayjs.extend(isBetween)

function EventCard({ event, userTimezone, onEdit, onDelete, onViewDetails }) {
    // Convert stored UTC time to event timezone first, then to user timezone
    const startTime = dayjs.utc(event.startDateTime).tz(userTimezone)
    const endTime = dayjs.utc(event.endDateTime).tz(userTimezone)
    const now = dayjs()

    const isUpcoming = startTime.isAfter(now)
    const isOngoing = now.isBetween(startTime, endTime)
    const isPast = endTime.isBefore(now)

    const getStatusClass = () => {
        if (isOngoing) return 'ongoing'
        if (isUpcoming) return 'upcoming'
        return 'past'
    }

    const getStatusText = () => {
        if (isOngoing) return '🟢 Ongoing'
        if (isUpcoming) return '🔵 Upcoming'
        return '⚫ Past'
    }

    return (
        <div className={`event-card ${getStatusClass()}`}>
            <div className="event-header">
                <div>
                    <h3>{event.title}</h3>
                    <span className="event-status">{getStatusText()}</span>
                </div>
                <div className="event-actions">
                    <button className="btn-icon" onClick={() => onEdit(event)} title="Edit">
                        ✏️
                    </button>
                    <button className="btn-icon" onClick={() => onDelete(event._id)} title="Delete">
                        🗑️
                    </button>
                </div>
            </div>

            {event.description && (
                <p className="event-description">{event.description}</p>
            )}

            <div className="event-time">
                <div className="time-row">
                    <span className="time-label">Start:</span>
                    <span className="time-value">
                        {startTime.format('MMM D, YYYY')} at {startTime.format('h:mm A')}
                    </span>
                </div>
                <div className="time-row">
                    <span className="time-label">End:</span>
                    <span className="time-value">
                        {endTime.format('MMM D, YYYY')} at {endTime.format('h:mm A')}
                    </span>
                </div>
                <div className="time-row">
                    <span className="time-label">Duration:</span>
                    <span className="time-value">
                        {Math.round(endTime.diff(startTime, 'minute'))} minutes
                    </span>
                </div>
            </div>

            <div className="event-meta">
                <div className="meta-row">
                    <span className="meta-label">Timezone:</span>
                    <span className="timezone-badge-small">{userTimezone}</span>
                </div>
                <div className="meta-row">
                    <span className="meta-label">Profiles:</span>
                    <div className="profile-tags-small">
                        {event.profiles.slice(0, 3).map(p => (
                            <span key={p._id} className="profile-tag-small">
                                {p.name}
                            </span>
                        ))}
                        {event.profiles.length > 3 && (
                            <span className="profile-tag-small">+{event.profiles.length - 3}</span>
                        )}
                    </div>
                </div>
            </div>

            <button
                className="btn-view-details"
                onClick={() => onViewDetails(event)}
            >
                View Details & History
            </button>
        </div>
    )
}

export default EventCard
