import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Star,
  Clock,
  Download,
  ArrowUp,
  ArrowDown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Card, Button, Select, Badge } from '../../components/ui';
import { analyticsAPI } from '../../services/api';

// Simple bar chart
const BarChart = ({ data, dataKey, color = 'primary' }) => {
  const max = Math.max(...data.map(d => d[dataKey]));
  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    purple: 'bg-purple-500'
  };
  
  return (
    <div className="flex items-end gap-2 h-48">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div
            className={`w-full ${colorClasses[color]} rounded-t-lg transition-all duration-300 hover:opacity-80`}
            style={{ height: `${(item[dataKey] / max) * 100}%` }}
          />
          <span className="text-xs text-gray-500 mt-2">{item.month}</span>
        </div>
      ))}
    </div>
  );
};

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await analyticsAPI.getAnalytics();
        setAnalyticsData(data);
      } catch (err) {
        console.error('Analytics fetch error:', err);
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

  const metrics = analyticsData?.metrics || {};
  const specialtyData = analyticsData?.specialtyData || [];
  const topDoctors = analyticsData?.topDoctors || [];
  const monthlyData = analyticsData?.monthlyData || [];
  const summary = analyticsData?.summary || {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">Platform performance and insights</p>
          </div>
          <div className="flex gap-3">
            <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-40">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </Select>
            <Button icon={Download}>
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-primary-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{(metrics.totalAppointments || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Appointments</p>
          </Card>

          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-success-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.completionRate || 0}%</p>
            <p className="text-xs text-gray-500">Completion Rate</p>
          </Card>

          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.avgRating || 0}</p>
            <p className="text-xs text-gray-500">Avg. Rating</p>
          </Card>

          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.avgWaitTime || 0} min</p>
            <p className="text-xs text-gray-500">Avg. Wait Time</p>
          </Card>

          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.conversionRate || 0}%</p>
            <p className="text-xs text-gray-500">Conversion Rate</p>
          </Card>

          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-success-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.revenuePerAppointment || 0} ETB</p>
            <p className="text-xs text-gray-500">Avg. Revenue/Apt</p>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointment Trends */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Appointment Trends</h2>
            </div>
            {monthlyData.length > 0 ? (
              <>
                <BarChart data={monthlyData} dataKey="appointments" color="primary" />
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total (6 months)</span>
                  <span className="font-semibold text-gray-900">
                    {monthlyData.reduce((sum, d) => sum + d.appointments, 0).toLocaleString()} appointments
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">No data available</div>
            )}
          </Card>

          {/* Revenue Trends */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Revenue Trends</h2>
            </div>
            {monthlyData.length > 0 ? (
              <>
                <BarChart data={monthlyData} dataKey="revenue" color="success" />
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total (6 months)</span>
                  <span className="font-semibold text-gray-900">
                    {monthlyData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()} ETB
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">No data available</div>
            )}
          </Card>
        </div>

        {/* Specialty Performance & Top Doctors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Specialties */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Specialties</h2>
            {specialtyData.length > 0 ? (
              <div className="space-y-4">
                {specialtyData.map((specialty, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-8 text-center">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{specialty.name}</span>
                        <span className="text-sm text-gray-500">{specialty.appointments} appointments</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${specialtyData[0]?.appointments > 0 ? (specialty.appointments / specialtyData[0].appointments) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                        <span>{specialty.doctors} doctors</span>
                        <span>{(specialty.revenue || 0).toLocaleString()} ETB</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No specialty data available</div>
            )}
          </Card>

          {/* Top Performing Doctors */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Doctors</h2>
            {topDoctors.length > 0 ? (
              <div className="space-y-4">
                {topDoctors.map((doctor, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-600">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{doctor.name}</p>
                      <p className="text-sm text-gray-500">{doctor.specialty}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{doctor.rating}</span>
                      </div>
                      <p className="text-sm text-gray-500">{doctor.appointments} appointments</p>
                      <p className="text-sm font-medium text-success-600">{(doctor.revenue || 0).toLocaleString()} ETB</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No doctor data available</div>
            )}
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-bold text-primary-600">{summary.activeDoctors || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Active Doctors</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-success-600">{(summary.totalPatients || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Registered Patients</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-purple-600">{summary.specialtiesCount || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Specialties Available</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-yellow-600">99.9%</p>
            <p className="text-sm text-gray-500 mt-1">Platform Uptime</p>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
