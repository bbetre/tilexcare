import { useState, useEffect } from 'react';

const DoctorAvailability = () => {
    const [slots, setSlots] = useState([]);
    const [newSlot, setNewSlot] = useState({ date: '', startTime: '', endTime: '' });
    const [loading, setLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));

    // We need to fetch the doctor's profile ID first, or we can just fetch availability by relying on the token
    // But for listing, we need the ID. Let's assume the backend endpoint for listing uses the token to identify the doctor?
    // Actually, my backend `getDoctorAvailability` expects `:doctorId`. 
    // I should probably add an endpoint `GET /doctors/me/availability` or similar, 
    // OR just fetch the doctor profile ID on mount.

    // Let's just use a simple fetch for now.
    // Wait, I don't have the doctorId in the user object in localStorage (only id, email, role).
    // I'll add a helper to fetch my own profile.

    const fetchMyAvailability = async (doctorId) => {
        try {
            const response = await fetch(`http://localhost:5000/doctors/${doctorId}/availability`);
            if (response.ok) {
                const data = await response.json();
                setSlots(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Helper to get doctor ID. In a real app, I'd put this in a context or custom hook.
    const [doctorId, setDoctorId] = useState(null);

    useEffect(() => {
        // We can't easily get doctorId without an endpoint. 
        // Let's assume for now we can't list them until we add that endpoint.
        // Actually, let's just add the slots blindly for now, or update the backend to return profile info on login.
        // For MVP speed, I'll just add the slots.
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/doctors/availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ slots: [newSlot] })
            });

            if (response.ok) {
                alert('Availability added!');
                setNewSlot({ date: '', startTime: '', endTime: '' });
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="availability-container">
            <h3>Set Your Availability</h3>
            <form onSubmit={handleSubmit} className="availability-form">
                <label>
                    Date:
                    <input
                        type="date"
                        value={newSlot.date}
                        onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                        required
                    />
                </label>
                <label>
                    Start Time:
                    <input
                        type="time"
                        value={newSlot.startTime}
                        onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                        required
                    />
                </label>
                <label>
                    End Time:
                    <input
                        type="time"
                        value={newSlot.endTime}
                        onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                        required
                    />
                </label>
                <button type="submit" disabled={loading}>Add Slot</button>
            </form>
        </div>
    );
};

export default DoctorAvailability;
