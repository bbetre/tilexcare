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
  Play,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { DoctorLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge } from '../../components/ui';
import { dashboardAPI } from '../../services/api';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
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
        const data = await dashboardAPI.getDoctorDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <DoctorLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-gray-600">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </DoctorLayout>
    );
  }

  const doctor = dashboardData?.doctor || {};
  const stats = dashboardData?.stats || {};
  const earnings = dashboardData?.earnings || {};
  const todayAppointments = dashboardData?.todayAppointments || [];
  const recentPrescriptions = dashboardData?.recentPrescriptions || [];
  const doctorName = doctor.fullName || user.email?.split('@')[0] || 'Doctor';

  return (
    <DoctorLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}, {doctorName}! 👋
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
                <p className="text-3xl font-bold mt-1">{stats.todayCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Total Appointments</p>
                <p className="text-3xl font-bold mt-1">{stats.totalAppointments || 0}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success-100 text-sm">This Month</p>
                <p className="text-3xl font-bold mt-1">{(earnings.thisMonth || 0).toLocaleString()} ETB</p>
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
                <p className="text-3xl font-bold mt-1">{stats.totalPatients || 0}</p>
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
            {todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.map((apt, index) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar name={apt.patientName} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{apt.patientName}</h3>
                          <Badge variant={apt.status === 'confirmed' ? 'success' : 'default'} size="sm">
                            {apt.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{apt.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatTime(apt.startTime)}</p>
                        {index === 0 && apt.status === 'confirmed' && (
                          <p className="text-xs text-success-600">Starting soon</p>
                        )}
                      </div>
                      {index === 0 && apt.status === 'confirmed' ? (
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
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No appointments scheduled for today</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/doctor/availability')}>
                  Set Availability
                </Button>
              </div>
            )}
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
                    <p className="text-xl font-bold text-success-600">{(earnings.thisMonth || 0).toLocaleString()} ETB</p>
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
              {recentPrescriptions.length > 0 ? (
                <div className="space-y-3">
                  {recentPrescriptions.map((rx) => (
                    <div key={rx.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{rx.patientName}</p>
                        <p className="text-xs text-gray-500">{rx.diagnosis || 'No diagnosis'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No prescriptions yet
                </div>
              )}
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
