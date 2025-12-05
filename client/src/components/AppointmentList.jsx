import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AppointmentList = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/appointments/my-appointments', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setAppointments(data);
                }
            } catch (error) {
                console.error('Error fetching appointments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    if (loading) return <p>Loading appointments...</p>;

    return (
        <div className="appointment-list">
            <h3>My Appointments</h3>
            {appointments.length === 0 ? (
                <p>No upcoming appointments.</p>
            ) : (
                <div className="appointments-grid">
                    {appointments.map(apt => (
                        <div key={apt.id} className="appointment-card">
                            <div className="apt-header">
                                <span className={`status ${apt.status}`}>{apt.status}</span>
                                <span className="date">{apt.Availability?.date}</span>
                            </div>
                            <div className="apt-details">
                                <p><strong>Time:</strong> {apt.Availability?.startTime} - {apt.Availability?.endTime}</p>
                                {apt.DoctorProfile && <p><strong>Doctor:</strong> {apt.DoctorProfile.fullName} ({apt.DoctorProfile.specialization})</p>}
                                {apt.PatientProfile && <p><strong>Patient:</strong> {apt.PatientProfile.fullName}</p>}
                            </div>
                            {apt.status === 'confirmed' && (
                                <button className="btn-join" onClick={() => navigate(`/room/${apt.id}`)}>Join Video Call</button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AppointmentList;
