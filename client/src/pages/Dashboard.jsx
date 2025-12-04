import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDoctorList from '../components/AdminDoctorList';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
        } else {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

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
                    <h3>Doctor Dashboard</h3>
                    <p>Manage appointments and availability here.</p>
                    {/* Availability Scheduler will go here */}
                </div>
            )}

            {user.role === 'patient' && (
                <div className="patient-panel">
                    <h3>Patient Dashboard</h3>
                    <p>Book appointments and view history here.</p>
                    {/* Doctor Search will go here */}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
