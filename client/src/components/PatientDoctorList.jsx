import { useState, useEffect } from 'react';

const PatientDoctorList = () => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [availability, setAvailability] = useState([]);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch('http://localhost:5000/doctors');
                if (response.ok) {
                    const data = await response.json();
                    setDoctors(data);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchDoctors();
    }, []);

    const handleViewAvailability = async (doctor) => {
        setSelectedDoctor(doctor);
        try {
            const response = await fetch(`http://localhost:5000/doctors/${doctor.id}/availability`);
            if (response.ok) {
                const data = await response.json();
                setAvailability(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleBook = async (slotId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/appointments/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ availabilityId: slotId })
            });

            if (response.ok) {
                alert('Appointment booked successfully!');
                // Refresh availability
                handleViewAvailability(selectedDoctor);
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Booking error:', error);
        }
    };

    return (
        <div className="patient-doctor-list">
            <h3>Find a Specialist</h3>
            <div className="doctors-grid">
                {doctors.map(doc => (
                    <div key={doc.id} className="doctor-card">
                        <h4>{doc.fullName}</h4>
                        <p>{doc.specialization}</p>
                        <button onClick={() => handleViewAvailability(doc)}>View Availability</button>
                    </div>
                ))}
            </div>

            {selectedDoctor && (
                <div className="availability-modal">
                    <h4>Available Slots for Dr. {selectedDoctor.fullName}</h4>
                    <div className="slots-grid">
                        {availability.length === 0 ? <p>No slots available.</p> : availability.map(slot => (
                            <div key={slot.id} className="slot-card">
                                <p>{slot.date}</p>
                                <p>{slot.startTime} - {slot.endTime}</p>
                                <button onClick={() => handleBook(slot.id)}>Book Now</button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setSelectedDoctor(null)}>Close</button>
                </div>
            )}
        </div>
    );
};

export default PatientDoctorList;
