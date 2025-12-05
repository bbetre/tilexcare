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
  Activity
} from 'lucide-react';
import { PatientLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge } from '../../components/ui';

// Mock data - replace with API calls
const mockNextAppointment = {
  id: '1',
  doctorName: 'Dr. Abebe Kebede',
  specialty: 'General Practitioner',
  date: '2025-12-06',
  time: '10:00 AM',
  status: 'confirmed'
};

const mockOnlineDoctors = [
  { id: '1', name: 'Dr. Sara Haile', specialty: 'Dermatologist', fee: 500, rating: 4.9, online: true },
  { id: '2', name: 'Dr. Yonas Tesfaye', specialty: 'Pediatrician', fee: 450, rating: 4.8, online: true },
];

const mockSpecialists = [
  { id: '1', name: 'Dr. Abebe Kebede', specialty: 'General Practitioner', fee: 400, rating: 4.9, image: null },
  { id: '2', name: 'Dr. Sara Haile', specialty: 'Dermatologist', fee: 500, rating: 4.8, image: null },
  { id: '3', name: 'Dr. Yonas Tesfaye', specialty: 'Pediatrician', fee: 450, rating: 4.7, image: null },
  { id: '4', name: 'Dr. Meron Alemu', specialty: 'Cardiologist', fee: 600, rating: 4.9, image: null },
];

const mockRecentConsultations = [
  { id: '1', doctor: 'Dr. Abebe Kebede', date: '2025-11-28', diagnosis: 'Common Cold', hasPrescription: true },
  { id: '2', doctor: 'Dr. Sara Haile', date: '2025-11-20', diagnosis: 'Skin Allergy', hasPrescription: true },
  { id: '3', doctor: 'Dr. Yonas Tesfaye', date: '2025-11-15', diagnosis: 'Routine Checkup', hasPrescription: false },
];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const userName = user.email?.split('@')[0] || 'there';

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
          <Card className="lg:col-span-2 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-primary-100 text-sm">Next Appointment</p>
                  <h3 className="text-xl font-semibold mt-1">{mockNextAppointment.doctorName}</h3>
                  <p className="text-primary-100">{mockNextAppointment.specialty}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {mockNextAppointment.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {mockNextAppointment.time}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                className="bg-white text-primary-600 hover:bg-primary-50"
                icon={Video}
                onClick={() => navigate(`/room/${mockNextAppointment.id}`)}
              >
                Join Call
              </Button>
            </div>
          </Card>

          {/* On-Demand Widget */}
          <Card className="bg-success-50 border-success-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">On-Demand Care</h3>
                <p className="text-sm text-gray-500">{mockOnlineDoctors.length} doctors online</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {mockOnlineDoctors.slice(0, 2).map((doc) => (
                <div key={doc.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-700">{doc.name}</span>
                </div>
              ))}
            </div>
            <Button variant="success" size="sm" className="w-full">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockSpecialists.map((doctor) => (
              <Card key={doctor.id} padding="sm" className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <Avatar name={doctor.name} size="xl" className="mb-3" />
                  <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-500">{doctor.specialty}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{doctor.rating}</span>
                  </div>
                  <p className="text-primary-600 font-semibold mt-2">{doctor.fee} ETB</p>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    View Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>
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
            <div className="space-y-3">
              {mockRecentConsultations.map((consultation) => (
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
