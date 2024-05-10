import React, { useState } from 'react';
import moment from 'moment';

function AddAppointmentWindow({ selectedDate, selectedTime, existingEvents, onSave }) {
  const [eventName, setEventName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [startTime, setStartTime] = useState(selectedTime);
  const [endTime, setEndTime] = useState(moment(selectedTime).add(1, 'hour'));
  const [reminder, setReminder] = useState(false);

  const handleSave = () => {
    if (!eventName || moment(endTime).diff(startTime, 'minutes') <= 0) {
      alert('Please enter valid appointment details.');
      return;
    }

    const overlappingEvents = existingEvents.filter(event =>
      (moment(startTime).isBetween(event.start, event.end) || moment(endTime).isBetween(event.start, event.end))
      || (moment(event.start).isBetween(startTime, endTime) || moment(event.end).isBetween(startTime, endTime))
    );

    if (overlappingEvents.length > 0) {
      alert('There is an overlapping event. Please choose another time.');
      return;
    }

    const sameEvent = existingEvents.find(event => event.title === eventName && moment(event.end).diff(event.start, 'minutes') === moment(endTime).diff(startTime, 'minutes'));

    if (sameEvent) {
      const joinGroupMeeting = window.confirm('Do you want to join the existing group meeting with the same name and duration?');
      if (joinGroupMeeting) {
        // Add user to existing group meeting participants list
        // Code to add user to group meeting participants list
        // ...
        return;
      }
    }

    onSave({
      title: eventName,
      location: eventLocation,
      start: startTime,
      end: endTime,
      reminder: reminder
    });

    setEventName('');
    setEventLocation('');
    setStartTime(selectedTime);
    setEndTime(moment(selectedTime).add(1, 'hour'));
    setReminder(false);
  };

  return (
    <div>
      <h2>Add Appointment</h2>
      <label>Name:</label>
      <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} />
      <label>Location:</label>
      <input type="text" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} />
      <label>Start Time:</label>
      <input type="time" value={moment(startTime).format('HH:mm')} onChange={(e) => setStartTime(moment(e.target.value, 'HH:mm'))} />
      <label>End Time:</label>
      <input type="time" value={moment(endTime).format('HH:mm')} onChange={(e) => setEndTime(moment(e.target.value, 'HH:mm'))} />
      <label>Reminder:</label>
      <input type="checkbox" checked={reminder} onChange={(e) => setReminder(e.target.checked)} />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}

export default AddAppointmentWindow;
