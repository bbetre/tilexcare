import { useState } from 'react';
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Star,
  Clock,
  Download,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Card, Button, Select, Badge } from '../../components/ui';

// Mock data
const mockMetrics = {
  totalAppointments: 1250,
  appointmentGrowth: 15.2,
  completionRate: 98,
  avgRating: 4.8,
  avgWaitTime: 12,
  conversionRate: 45,
  revenuePerAppointment: 485
};

const mockSpecialtyData = [
  { name: 'General Practitioner', appointments: 450, revenue: 180000, doctors: 12 },
  { name: 'Dermatologist', appointments: 280, revenue: 140000, doctors: 8 },
  { name: 'Pediatrician', appointments: 220, revenue: 99000, doctors: 6 },
  { name: 'Cardiologist', appointments: 150, revenue: 90000, doctors: 5 },
  { name: 'Gynecologist', appointments: 100, revenue: 55000, doctors: 4 },
];

const mockTopDoctors = [
  { name: 'Dr. Abebe Kebede', specialty: 'General Practitioner', appointments: 85, rating: 4.9, revenue: 42500 },
  { name: 'Dr. Sara Haile', specialty: 'Dermatologist', appointments: 72, rating: 4.8, revenue: 36000 },
  { name: 'Dr. Yonas Tesfaye', specialty: 'Pediatrician', appointments: 68, rating: 4.9, revenue: 30600 },
  { name: 'Dr. Meron Alemu', specialty: 'Cardiologist', appointments: 55, rating: 4.7, revenue: 33000 },
];

const mockMonthlyData = [
  { month: 'Jul', appointments: 850, revenue: 382500 },
  { month: 'Aug', appointments: 920, revenue: 414000 },
  { month: 'Sep', appointments: 980, revenue: 441000 },
  { month: 'Oct', appointments: 1050, revenue: 472500 },
  { month: 'Nov', appointments: 1150, revenue: 517500 },
  { month: 'Dec', appointments: 1250, revenue: 562500 },
];

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
              <Badge variant={mockMetrics.appointmentGrowth > 0 ? 'success' : 'danger'} size="sm">
                {mockMetrics.appointmentGrowth > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(mockMetrics.appointmentGrowth)}%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockMetrics.totalAppointments.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Appointments</p>
          </Card>

          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-success-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockMetrics.completionRate}%</p>
            <p className="text-xs text-gray-500">Completion Rate</p>
          </Card>

          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockMetrics.avgRating}</p>
            <p className="text-xs text-gray-500">Avg. Rating</p>
          </Card>

          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockMetrics.avgWaitTime} min</p>
            <p className="text-xs text-gray-500">Avg. Wait Time</p>
          </Card>

          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockMetrics.conversionRate}%</p>
            <p className="text-xs text-gray-500">Conversion Rate</p>
          </Card>

          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-success-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockMetrics.revenuePerAppointment} ETB</p>
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
            <BarChart data={mockMonthlyData} dataKey="appointments" color="primary" />
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
              <span className="text-gray-500">Total (6 months)</span>
              <span className="font-semibold text-gray-900">
                {mockMonthlyData.reduce((sum, d) => sum + d.appointments, 0).toLocaleString()} appointments
              </span>
            </div>
          </Card>

          {/* Revenue Trends */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Revenue Trends</h2>
            </div>
            <BarChart data={mockMonthlyData} dataKey="revenue" color="success" />
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
              <span className="text-gray-500">Total (6 months)</span>
              <span className="font-semibold text-gray-900">
                {mockMonthlyData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()} ETB
              </span>
            </div>
          </Card>
        </div>

        {/* Specialty Performance & Top Doctors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Specialties */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Specialties</h2>
            <div className="space-y-4">
              {mockSpecialtyData.map((specialty, index) => (
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
                        style={{ width: `${(specialty.appointments / mockSpecialtyData[0].appointments) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                      <span>{specialty.doctors} doctors</span>
                      <span>{specialty.revenue.toLocaleString()} ETB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Performing Doctors */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Doctors</h2>
            <div className="space-y-4">
              {mockTopDoctors.map((doctor, index) => (
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
                    <p className="text-sm font-medium text-success-600">{doctor.revenue.toLocaleString()} ETB</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-bold text-primary-600">52</p>
            <p className="text-sm text-gray-500 mt-1">Active Doctors</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-success-600">1,250</p>
            <p className="text-sm text-gray-500 mt-1">Registered Patients</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-purple-600">8</p>
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
