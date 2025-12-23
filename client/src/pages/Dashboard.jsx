import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDoctorList from '../components/AdminDoctorList';
import DoctorAvailability from '../components/DoctorAvailability';
import PatientDoctorList from '../components/PatientDoctorList';
import AppointmentList from '../components/AppointmentList';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return <div>Loading...</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome, {user.role === 'doctor' ? 'Dr. ' : ''}{user.email}</h1>
                <p className="role-badge">Role: {user.role}</p>
                <button className="btn-logout" onClick={() => {
                    localStorage.clear();
                    navigate('/login');
                }}>Logout</button>
            </header>

            {user.role === 'admin' && (
                <div className="admin-panel">
                    <h2>Admin Dashboard</h2>
                    <AdminDoctorList />
                </div>
            )}

            {user.role === 'doctor' && (
                <div className="doctor-panel">
                    <h2>Doctor Dashboard</h2>
                    <div className="panel-section">
                        <AppointmentList />
                    </div>
                    <div className="panel-section">
                        <p>Manage appointments and availability here.</p>
                        <DoctorAvailability />
                    </div>
                </div>
            )}

            {user.role === 'patient' && (
                <div className="patient-panel">
                    <h2>Patient Dashboard</h2>
                    <div className="panel-section">
                        <AppointmentList />
                    </div>
                    <div className="panel-section">
                        <p>Book appointments and view history here.</p>
                        <PatientDoctorList />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
