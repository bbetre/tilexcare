import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  Video,
  TrendingUp,
  FileText,
  ChevronRight,
  Play
} from 'lucide-react';
import { DoctorLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge } from '../../components/ui';

// Mock data
const mockStats = {
  todayAppointments: 5,
  pendingAppointments: 3,
  weeklyEarnings: 4500,
  monthlyEarnings: 18000,
  totalPatients: 127
};

const mockUpcomingAppointments = [
  { id: '1', patientName: 'Betre Hailu', reason: 'Follow-up consultation', time: '10:00 AM', type: 'scheduled' },
  { id: '2', patientName: 'Sara Tesfaye', reason: 'Headache and fever', time: '10:30 AM', type: 'on-demand' },
  { id: '3', patientName: 'Yonas Bekele', reason: 'Skin rash', time: '11:00 AM', type: 'scheduled' },
  { id: '4', patientName: 'Meron Alemu', reason: 'General checkup', time: '02:00 PM', type: 'scheduled' },
];

const mockRecentPrescriptions = [
  { id: '1', patientName: 'Tigist Haile', diagnosis: 'Common Cold', date: '2025-12-04', medications: 2 },
  { id: '2', patientName: 'Dawit Mengistu', diagnosis: 'Hypertension', date: '2025-12-04', medications: 3 },
  { id: '3', patientName: 'Helen Tadesse', diagnosis: 'Allergic Rhinitis', date: '2025-12-03', medications: 2 },
];

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <DoctorLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}, Dr. {user.email?.split('@')[0] || 'Doctor'}! 👋
            </h1>
            <p className="text-gray-500 mt-1">Here's your schedule for today</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" icon={Clock} onClick={() => navigate('/doctor/availability')}>
              Set Availability
            </Button>
            <Button icon={Video} onClick={() => navigate('/doctor/appointments')}>
              Start Consultation
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Today's Appointments</p>
                <p className="text-3xl font-bold mt-1">{mockStats.todayAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pending</p>
                <p className="text-3xl font-bold mt-1">{mockStats.pendingAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success-100 text-sm">This Week</p>
                <p className="text-3xl font-bold mt-1">{mockStats.weeklyEarnings.toLocaleString()} ETB</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Patients</p>
                <p className="text-3xl font-bold mt-1">{mockStats.totalPatients}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/appointments')}>
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {mockUpcomingAppointments.map((apt, index) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar name={apt.patientName} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{apt.patientName}</h3>
                        {apt.type === 'on-demand' && (
                          <Badge variant="warning" size="sm">On-demand</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{apt.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{apt.time}</p>
                      {index === 0 && (
                        <p className="text-xs text-success-600">Starting soon</p>
                      )}
                    </div>
                    {index === 0 ? (
                      <Button size="sm" icon={Play} onClick={() => navigate(`/room/${apt.id}`)}>
                        Start
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Stats & Actions */}
          <div className="space-y-6">
            {/* Earnings Summary */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">This Month</p>
                    <p className="text-xl font-bold text-success-600">{mockStats.monthlyEarnings.toLocaleString()} ETB</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-success-500" />
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate('/doctor/earnings')}>
                  View Earnings Details
                </Button>
              </div>
            </Card>

            {/* Recent Prescriptions */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Prescriptions</h2>
              </div>
              <div className="space-y-3">
                {mockRecentPrescriptions.map((rx) => (
                  <div key={rx.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{rx.patientName}</p>
                      <p className="text-xs text-gray-500">{rx.diagnosis}</p>
                    </div>
                    <Badge variant="default" size="sm">{rx.medications} meds</Badge>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-4" onClick={() => navigate('/doctor/prescriptions')}>
                View all prescriptions
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
