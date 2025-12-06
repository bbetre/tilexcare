import { useState, useEffect } from 'react';
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
  Clock,
  Loader2
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge } from '../../components/ui';
import { dashboardAPI } from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getAdminDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error('Admin dashboard fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-gray-600">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const stats = dashboardData?.stats || {};
  const revenue = dashboardData?.revenue || {};
  const pendingVerifications = dashboardData?.pendingVerifications || [];
  const recentActivity = dashboardData?.recentActivity || [];

  // Build alerts from data
  const alerts = [];
  if (stats.pendingDoctors > 0) {
    alerts.push({ id: '1', type: 'warning', message: `${stats.pendingDoctors} doctors pending verification`, action: 'Review' });
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of TilexCare platform</p>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert) => (
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
                <Button 
                  size="sm" 
                  variant={alert.type === 'warning' ? 'secondary' : 'outline'}
                  onClick={() => navigate('/admin/verification')}
                >
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
                <p className="text-primary-100 text-sm">Verified Doctors</p>
                <p className="text-3xl font-bold mt-1">{stats.verifiedDoctors || 0}</p>
                <p className="text-primary-200 text-sm mt-1">{stats.totalDoctors || 0} total</p>
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
                <p className="text-3xl font-bold mt-1">{(stats.totalPatients || 0).toLocaleString()}</p>
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
                <p className="text-3xl font-bold mt-1">{stats.todayAppointments || 0}</p>
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
                <p className="text-3xl font-bold mt-1">{((revenue.monthly || 0) / 1000).toFixed(0)}K ETB</p>
                <p className="text-yellow-200 text-sm mt-1">Total: {((revenue.total || 0) / 1000).toFixed(0)}K ETB</p>
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
                <Badge variant="warning">{stats.pendingDoctors || 0}</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/verification')}>
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            {pendingVerifications.length > 0 ? (
              <div className="space-y-4">
                {pendingVerifications.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar name={doctor.fullName} size="md" />
                      <div>
                        <h3 className="font-medium text-gray-900">{doctor.fullName}</h3>
                        <p className="text-sm text-gray-500">{doctor.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-gray-500">License</p>
                        <p className="font-medium">{doctor.licenseNumber}</p>
                      </div>
                      <Button size="sm" onClick={() => navigate('/admin/verification')}>
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No pending verifications</p>
              </div>
            )}
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary-100">
                      <Activity className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.patient && activity.doctor 
                          ? `${activity.patient} → ${activity.doctor}`
                          : 'New activity'}
                      </p>
                      <p className="text-xs text-gray-500">{activity.status} • {activity.date}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No recent activity
              </div>
            )}
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
