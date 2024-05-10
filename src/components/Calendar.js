import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment-timezone';

const localizer = momentLocalizer(moment);

moment.tz.setDefault('UTC');

function CustomCalendar({ userId }) {
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [eventTitle, setEventTitle] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [reminder, setReminder] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAppointmentUsers, setSelectedAppointmentUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/users/${userId}/appointments`);
                if (!response.ok) {
                    throw new Error('Failed to fetch appointments');
                }
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
        };

        fetchData();
    }, [userId]);

    const handleSelectSlot = (slotInfo) => {
        setSelectedDate(slotInfo.start);
        setEditingEvent(null);
        setShowModal(true);
        setIsEditing(false);
    };

    const handleEditEvent = async (event) => {
        setEditingEvent(event);
        setShowModal(true);
        setSelectedDate(event.start);
        setEventTitle(event.title);
        setEventLocation(event.location);
        setReminder(event.reminder);
        setStartTime(moment(event.start));
        setEndTime(moment(event.end));
        setIsEditing(true);

        // Lấy danh sách người dùng từ mỗi cuộc hẹn
        const users = event.users.map(user => user.email);
        setSelectedAppointmentUsers(users);
    };


    const saveEvent = async () => {
        if (eventTitle && selectedDate && startTime && endTime) {
            const startDateTime = moment.utc(selectedDate).set({ hour: startTime.hour(), minute: startTime.minute() }).toDate();
            const endDateTime = moment.utc(selectedDate).set({ hour: endTime.hour(), minute: endTime.minute() }).toDate();

            const newEvent = {
                title: eventTitle,
                start: startDateTime,
                end: endDateTime,
                location: eventLocation
            };

            const isOverlap = events.some(event => (
                moment(event.start).isBefore(newEvent.end) && moment(event.end).isAfter(newEvent.start)
            ));

            if (isOverlap) {
                const doReplace = window.confirm('There is a scheduling conflict with an existing event. Please choose a different time or replace it.');
                if (!doReplace) {
                    return;
                }
            }

            try {
                const response = await fetch(`http://localhost:8080/api/appointments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newEvent),
                });

                if (response.ok) {
                    const existingAppointment = await response.json();
                    console.log(existingAppointment);
                    const doJoin = window.confirm('The appointment already exists. Do you want to join it?');
                    if (doJoin) {
                        await joinExistingAppointment(existingAppointment);
                    } else {
                        const createResponse = await fetch(`http://localhost:8080/api/users/${userId}/appointments`, {
                            method: isEditing ? 'PUT' : 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(newEvent),
                        });

                        if (createResponse.ok) {
                            if (isEditing) {
                                const updatedEvents = events.map(event => {
                                    if (event === editingEvent) {
                                        return newEvent;
                                    }
                                    return event;
                                });
                                setEvents(updatedEvents);
                            } else {
                                const fetchData = async () => {
                                    try {
                                        const response = await fetch(`http://localhost:8080/api/users/${userId}/appointments`);
                                        if (!response.ok) {
                                            throw new Error('Failed to fetch appointments');
                                        }
                                        const data = await response.json();
                                        setEvents(data);
                                    } catch (error) {
                                        console.error('Error fetching appointments:', error);
                                    }
                                };

                                fetchData();
                            }

                        } else {
                            console.error('Failed to save event:', createResponse.statusText);
                        }
                    }
                    const fetchData = async () => {
                        try {
                            const response = await fetch(`http://localhost:8080/api/users/${userId}/appointments`);
                            if (!response.ok) {
                                throw new Error('Failed to fetch appointments');
                            }
                            const data = await response.json();
                            setEvents(data);
                        } catch (error) {
                            console.error('Error fetching appointments:', error);
                        }
                    };

                    fetchData();
                    setShowModal(false);
                    setEventTitle('');
                    setEventLocation('');
                    setReminder(false);
                    setStartTime(null);
                    setEndTime(null);
                    setEditingEvent(null);
                    setIsEditing(false);
                } else {
                    const createResponse = await fetch(`http://localhost:8080/api/users/${userId}/appointments`, {
                        method: isEditing ? 'PUT' : 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newEvent),
                    });

                    if (createResponse.ok) {
                        if (isEditing) {
                            const updatedEvents = events.map(event => {
                                if (event === editingEvent) {
                                    return newEvent;
                                }
                                return event;
                            });
                            setEvents(updatedEvents);
                        } else {
                            const fetchData = async () => {
                                try {
                                    const response = await fetch(`http://localhost:8080/api/users/${userId}/appointments`);
                                    if (!response.ok) {
                                        throw new Error('Failed to fetch appointments');
                                    }
                                    const data = await response.json();
                                    setEvents(data);
                                } catch (error) {
                                    console.error('Error fetching appointments:', error);
                                }
                            };

                            fetchData();
                        }

                    } else {
                        console.error('Failed to save event:', createResponse.statusText);
                    }
                    setShowModal(false);
                    setEventTitle('');
                    setEventLocation('');
                    setReminder(false);
                    setStartTime(null);
                    setEndTime(null);
                    setEditingEvent(null);
                    setIsEditing(false);
                }
            } catch (error) {
                console.error('Error saving event:', error);
            }
        }
    };

    const joinExistingAppointment = async (existingAppointment) => {
        try {
            const response = await fetch(`http://localhost:8080/api/user/${userId}/appointment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(existingAppointment),
            });

            if (response.ok) {
                console.log('Successfully joined appointment');
                // Thực hiện các hành động tiếp theo nếu cần
            } else {
                console.error('Failed to join appointment:', response.statusText);
                // Xử lý lỗi nếu cần
            }
        } catch (error) {
            console.error('Error joining appointment:', error);
            // Xử lý lỗi nếu cần
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEventTitle('');
        setEventLocation('');
        setReminder(false);
        setStartTime(null);
        setEndTime(null);
        setEditingEvent(null);
        setIsEditing(false);
    };

    return (
        <div style={{ height: '500px' }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable={true}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleEditEvent}
            />
            {showModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'fixed', top: 0, bottom: 0, left: 0, right: 0 }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editingEvent ? 'Edit Event' : 'Create Event'}</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                {/* Hiển thị thông tin của cuộc hẹn */}
                                <label>Event title:</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='eventTitle'
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                />
                                <label>Location:</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='eventLocation'
                                    value={eventLocation}
                                    onChange={(e) => setEventLocation(e.target.value)}
                                />
                                <label>Start Time:</label>
                                <input
                                    type='time'
                                    className='form-control'
                                    id='startTime'
                                    value={startTime ? moment(startTime).format('HH:mm') : ''}
                                    onChange={(e) => setStartTime(moment(e.target.value, 'HH:mm'))}
                                />
                                <label>End Time:</label>
                                <input
                                    type='time'
                                    className='form-control'
                                    id='endTime'
                                    value={endTime ? moment(endTime).format('HH:mm') : ''}
                                    onChange={(e) => setEndTime(moment(e.target.value, 'HH:mm'))}
                                />
                                <label>
                                    <input
                                        type='checkbox'
                                        checked={reminder}
                                        onChange={(e) => setReminder(e.target.checked)}
                                    />
                                    &nbsp;Set Reminder
                                </label>
                                <br />
                                <label>Users:</label>
                                <ul>
                                    {selectedAppointmentUsers.map((user, index) => (
                                        <li key={index}>{user}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={saveEvent}>{editingEvent ? 'Save Changes' : 'Create Event'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomCalendar;
