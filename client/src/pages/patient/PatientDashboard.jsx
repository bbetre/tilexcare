import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  ChevronRight,
  Star,
  Zap,
  FileText,
  Activity,
  Loader2
} from 'lucide-react';
import { PatientLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge } from '../../components/ui';
import { dashboardAPI, doctorsAPI } from '../../services/api';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Fetch dashboard data
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboard, doctorsList] = await Promise.all([
          dashboardAPI.getPatientDashboard(),
          doctorsAPI.getAll()
        ]);
        setDashboardData(dashboard);
        setDoctors(doctorsList.slice(0, 4)); // Show first 4 doctors
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const userName = dashboardData?.patient?.fullName || user.email?.split('@')[0] || 'there';
  const nextAppointment = dashboardData?.nextAppointment;
  const recentConsultations = dashboardData?.recentConsultations || [];

  // Format time for display
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}, {userName}! 👋
            </h1>
            <p className="text-gray-500 mt-1">How are you feeling today?</p>
          </div>
          <Button icon={Calendar} onClick={() => navigate('/patient/book')}>
            Book Appointment
          </Button>
        </div>

        {/* Quick Stats / Next Appointment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Next Appointment Card */}
          {nextAppointment ? (
            <Card className="lg:col-span-2 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-primary-100 text-sm">Next Appointment</p>
                    <h3 className="text-xl font-semibold mt-1">{nextAppointment.doctorName}</h3>
                    <p className="text-primary-100">{nextAppointment.specialty}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {nextAppointment.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(nextAppointment.startTime)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="bg-white text-primary-600 hover:bg-primary-50"
                  icon={Video}
                  onClick={() => navigate(`/room/${nextAppointment.id}`)}
                >
                  Join Call
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="lg:col-span-2 bg-gray-50 border-gray-200">
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                <h3 className="font-semibold text-gray-900">No Upcoming Appointments</h3>
                <p className="text-gray-500 text-sm mt-1">Book an appointment to get started</p>
                <Button className="mt-4" onClick={() => navigate('/patient/book')}>
                  Book Now
                </Button>
              </div>
            </Card>
          )}

          {/* On-Demand Widget */}
          <Card className="bg-success-50 border-success-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">On-Demand Care</h3>
                <p className="text-sm text-gray-500">{doctors.length} doctors available</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {doctors.slice(0, 2).map((doc) => (
                <div key={doc.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-700">{doc.fullName}</span>
                </div>
              ))}
            </div>
            <Button variant="success" size="sm" className="w-full" onClick={() => navigate('/patient/book')}>
              Get Instant Care
            </Button>
          </Card>
        </div>

        {/* Browse Specialists */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Browse Specialists</h2>
            <Link to="/patient/book" className="text-primary-500 text-sm font-medium flex items-center gap-1 hover:text-primary-600">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {doctors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {doctors.map((doctor) => (
                <Card key={doctor.id} padding="sm" className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex flex-col items-center text-center">
                    <Avatar name={doctor.fullName} size="xl" className="mb-3" />
                    <h3 className="font-medium text-gray-900">{doctor.fullName}</h3>
                    <p className="text-sm text-gray-500">{doctor.specialization}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                    <p className="text-primary-600 font-semibold mt-2">{doctor.consultationFee || 500} ETB</p>
                    <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => navigate('/patient/book')}>
                      View Profile
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <p className="text-gray-500">No doctors available at the moment</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/patient/book')}>
                Check Later
              </Button>
            </Card>
          )}
        </div>

        {/* Medical Records Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Consultations */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-500" />
                Recent Consultations
              </h2>
              <Link to="/patient/appointments" className="text-primary-500 text-sm font-medium">
                View all
              </Link>
            </div>
            {recentConsultations.length > 0 ? (
              <div className="space-y-3">
                {recentConsultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{consultation.doctor}</p>
                      <p className="text-sm text-gray-500">{consultation.diagnosis}</p>
                      <p className="text-xs text-gray-400 mt-1">{consultation.date}</p>
                    </div>
                    {consultation.hasPrescription && (
                      <Badge variant="success" size="sm">
                        <FileText className="w-3 h-3 mr-1" />
                        Rx
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Activity className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No consultations yet</p>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/patient/book')}
                className="p-4 bg-primary-50 rounded-xl text-left hover:bg-primary-100 transition-colors"
              >
                <Calendar className="w-6 h-6 text-primary-500 mb-2" />
                <p className="font-medium text-gray-900">Schedule Visit</p>
                <p className="text-sm text-gray-500">Book an appointment</p>
              </button>
              <button
                onClick={() => navigate('/patient/prescriptions')}
                className="p-4 bg-success-50 rounded-xl text-left hover:bg-success-100 transition-colors"
              >
                <FileText className="w-6 h-6 text-success-500 mb-2" />
                <p className="font-medium text-gray-900">Prescriptions</p>
                <p className="text-sm text-gray-500">View & download</p>
              </button>
              <button
                onClick={() => navigate('/patient/appointments')}
                className="p-4 bg-blue-50 rounded-xl text-left hover:bg-blue-100 transition-colors"
              >
                <Clock className="w-6 h-6 text-blue-500 mb-2" />
                <p className="font-medium text-gray-900">My Appointments</p>
                <p className="text-sm text-gray-500">View history</p>
              </button>
              <button
                onClick={() => navigate('/patient/profile')}
                className="p-4 bg-purple-50 rounded-xl text-left hover:bg-purple-100 transition-colors"
              >
                <Activity className="w-6 h-6 text-purple-500 mb-2" />
                <p className="font-medium text-gray-900">Health Profile</p>
                <p className="text-sm text-gray-500">Update records</p>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </PatientLayout>
  );
}
