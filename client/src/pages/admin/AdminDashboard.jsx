import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Activity,
  ChevronRight,
  Clock
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge } from '../../components/ui';

// Mock data
const mockStats = {
  totalDoctors: 52,
  activeDoctors: 48,
  pendingVerification: 4,
  totalPatients: 1250,
  todayAppointments: 87,
  monthlyRevenue: 156000,
  revenueGrowth: 12.5
};

const mockPendingDoctors = [
  { id: '1', name: 'Dr. Kidist Alemu', specialty: 'Neurologist', submittedDate: '2025-12-04', documents: 3 },
  { id: '2', name: 'Dr. Solomon Tadesse', specialty: 'Psychiatrist', submittedDate: '2025-12-03', documents: 2 },
  { id: '3', name: 'Dr. Hana Girma', specialty: 'Ophthalmologist', submittedDate: '2025-12-02', documents: 3 },
];

const mockRecentActivity = [
  { id: '1', type: 'verification', message: 'Dr. Abebe Kebede was verified', time: '2 hours ago' },
  { id: '2', type: 'appointment', message: 'New appointment booked by Betre Hailu', time: '3 hours ago' },
  { id: '3', type: 'payment', message: 'Payment of 500 ETB received', time: '4 hours ago' },
  { id: '4', type: 'registration', message: 'New patient registered: Sara Tesfaye', time: '5 hours ago' },
  { id: '5', type: 'payout', message: 'Payout of 15,000 ETB processed for Dr. Yonas', time: '6 hours ago' },
];

const mockAlerts = [
  { id: '1', type: 'warning', message: '4 doctors pending verification', action: 'Review' },
  { id: '2', type: 'info', message: '2 refund requests pending', action: 'View' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of TilexCare platform</p>
        </div>

        {/* Alerts */}
        {mockAlerts.length > 0 && (
          <div className="space-y-2">
            {mockAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className={`w-5 h-5 ${alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
                  <span className={alert.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'}>
                    {alert.message}
                  </span>
                </div>
                <Button size="sm" variant={alert.type === 'warning' ? 'secondary' : 'outline'}>
                  {alert.action}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Active Doctors</p>
                <p className="text-3xl font-bold mt-1">{mockStats.activeDoctors}</p>
                <p className="text-primary-200 text-sm mt-1">{mockStats.totalDoctors} total</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success-100 text-sm">Total Patients</p>
                <p className="text-3xl font-bold mt-1">{mockStats.totalPatients.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Today's Appointments</p>
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
                <p className="text-yellow-100 text-sm">Monthly Revenue</p>
                <p className="text-3xl font-bold mt-1">{(mockStats.monthlyRevenue / 1000).toFixed(0)}K ETB</p>
                <div className="flex items-center gap-1 mt-1 text-yellow-100 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  +{mockStats.revenueGrowth}%
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Verifications */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Pending Verifications</h2>
                <Badge variant="warning">{mockStats.pendingVerification}</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/verification')}>
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {mockPendingDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar name={doctor.name} size="md" />
                    <div>
                      <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-500">{doctor.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-gray-500">Submitted</p>
                      <p className="font-medium">{doctor.submittedDate}</p>
                    </div>
                    <Button size="sm" onClick={() => navigate('/admin/verification')}>
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'verification' ? 'bg-success-100' :
                    activity.type === 'appointment' ? 'bg-primary-100' :
                    activity.type === 'payment' ? 'bg-yellow-100' :
                    activity.type === 'payout' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    <Activity className={`w-4 h-4 ${
                      activity.type === 'verification' ? 'text-success-600' :
                      activity.type === 'appointment' ? 'text-primary-600' :
                      activity.type === 'payment' ? 'text-yellow-600' :
                      activity.type === 'payout' ? 'text-purple-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-gray-900">98%</p>
            <p className="text-sm text-gray-500">Appointment Completion</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-gray-900">4.8</p>
            <p className="text-sm text-gray-500">Avg. Doctor Rating</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-gray-900">12 min</p>
            <p className="text-sm text-gray-500">Avg. Wait Time</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-gray-900">99.9%</p>
            <p className="text-sm text-gray-500">Platform Uptime</p>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
