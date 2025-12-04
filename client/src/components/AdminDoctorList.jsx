import { useEffect, useState } from 'react';

const AdminDoctorList = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/admin/doctors/pending', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setDoctors(data);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleVerify = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/admin/doctors/${id}/verify`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                alert(`Doctor ${status} successfully`);
                fetchDoctors(); // Refresh list
            } else {
                alert('Action failed');
            }
        } catch (error) {
            console.error('Error verifying doctor:', error);
        }
    };

    if (loading) return <p>Loading pending applications...</p>;

    return (
        <div className="admin-doctor-list">
            <h3>Pending Doctor Verifications</h3>
            {doctors.length === 0 ? (
                <p>No pending applications.</p>
            ) : (
                <table className="doctor-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Specialization</th>
                            <th>License #</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.map((doc) => (
                            <tr key={doc.id}>
                                <td>{doc.fullName}</td>
                                <td>{doc.User?.email}</td>
                                <td>{doc.specialization}</td>
                                <td>{doc.licenseNumber}</td>
                                <td>
                                    <button className="btn-approve" onClick={() => handleVerify(doc.id, 'verified')}>Approve</button>
                                    <button className="btn-reject" onClick={() => handleVerify(doc.id, 'rejected')}>Reject</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminDoctorList;
