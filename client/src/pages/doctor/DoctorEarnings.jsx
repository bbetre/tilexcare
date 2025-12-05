import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  CreditCard,
  Building,
  ChevronDown
} from 'lucide-react';
import { DoctorLayout } from '../../components/layout';
import { Card, Button, Badge, Select } from '../../components/ui';

// Mock data
const mockEarnings = {
  balance: 12500,
  thisMonth: 18000,
  lastMonth: 15500,
  totalEarnings: 156000,
  pendingPayout: 8500
};

const mockPayoutHistory = [
  { id: '1', amount: 15000, date: '2025-11-28', status: 'completed', method: 'Chapa' },
  { id: '2', amount: 12000, date: '2025-11-15', status: 'completed', method: 'Bank Transfer' },
  { id: '3', amount: 18000, date: '2025-10-30', status: 'completed', method: 'Chapa' },
  { id: '4', amount: 14500, date: '2025-10-15', status: 'completed', method: 'Bank Transfer' },
];

const mockTransactions = [
  { id: '1', patient: 'Betre Hailu', date: '2025-12-05', amount: 500, status: 'completed' },
  { id: '2', patient: 'Sara Tesfaye', date: '2025-12-05', amount: 500, status: 'completed' },
  { id: '3', patient: 'Yonas Bekele', date: '2025-12-04', amount: 500, status: 'completed' },
  { id: '4', patient: 'Meron Alemu', date: '2025-12-04', amount: 500, status: 'pending' },
  { id: '5', patient: 'Tigist Haile', date: '2025-12-03', amount: 500, status: 'completed' },
];

// Simple bar chart component
const SimpleBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div
            className="w-full bg-primary-500 rounded-t-lg transition-all duration-300 hover:bg-primary-600"
            style={{ height: `${(item.value / max) * 100}%` }}
          />
          <span className="text-xs text-gray-500 mt-2">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default function DoctorEarnings() {
  const [period, setPeriod] = useState('month');
  const [payoutMethod, setPayoutMethod] = useState('chapa');

  const weeklyData = [
    { label: 'Mon', value: 2500 },
    { label: 'Tue', value: 3000 },
    { label: 'Wed', value: 2000 },
    { label: 'Thu', value: 3500 },
    { label: 'Fri', value: 4000 },
    { label: 'Sat', value: 1500 },
    { label: 'Sun', value: 1500 },
  ];

  const monthChange = ((mockEarnings.thisMonth - mockEarnings.lastMonth) / mockEarnings.lastMonth * 100).toFixed(1);
  const isPositive = parseFloat(monthChange) >= 0;

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h1>
            <p className="text-gray-500 mt-1">Track your earnings and manage payouts</p>
          </div>
          <Button icon={Download}>
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success-100 text-sm">Available Balance</p>
                <p className="text-3xl font-bold mt-1">{mockEarnings.balance.toLocaleString()} ETB</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{mockEarnings.thisMonth.toLocaleString()} ETB</p>
                <div className={`flex items-center gap-1 mt-1 text-sm ${isPositive ? 'text-success-600' : 'text-red-600'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {monthChange}% vs last month
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{mockEarnings.totalEarnings.toLocaleString()} ETB</p>
                <p className="text-sm text-gray-400 mt-1">All time</p>
              </div>
            </div>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-700 text-sm">Pending Payout</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{mockEarnings.pendingPayout.toLocaleString()} ETB</p>
                <p className="text-sm text-yellow-600 mt-1">Processing</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Earnings Chart */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Earnings Overview</h2>
              <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-32">
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </Select>
            </div>
            <SimpleBarChart data={weeklyData} />
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
              <span className="text-gray-500">Total this week</span>
              <span className="font-semibold text-gray-900">
                {weeklyData.reduce((sum, d) => sum + d.value, 0).toLocaleString()} ETB
              </span>
            </div>
          </Card>

          {/* Request Payout */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Payout</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Available for withdrawal</p>
                <p className="text-2xl font-bold text-gray-900">{mockEarnings.balance.toLocaleString()} ETB</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payout Method</label>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    payoutMethod === 'chapa' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="payout"
                      value="chapa"
                      checked={payoutMethod === 'chapa'}
                      onChange={(e) => setPayoutMethod(e.target.value)}
                      className="w-4 h-4 text-primary-500"
                    />
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Chapa</span>
                  </label>
                  <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    payoutMethod === 'bank' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="payout"
                      value="bank"
                      checked={payoutMethod === 'bank'}
                      onChange={(e) => setPayoutMethod(e.target.value)}
                      className="w-4 h-4 text-primary-500"
                    />
                    <Building className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Bank Transfer</span>
                  </label>
                </div>
              </div>

              <Button className="w-full" disabled={mockEarnings.balance === 0}>
                Request Payout
              </Button>
            </div>
          </Card>
        </div>

        {/* Payout History & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payout History */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payout History</h2>
            <div className="space-y-3">
              {mockPayoutHistory.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-success-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{payout.amount.toLocaleString()} ETB</p>
                      <p className="text-sm text-gray-500">{payout.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="success" size="sm">Completed</Badge>
                    <p className="text-xs text-gray-400 mt-1">{payout.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
            <div className="space-y-3">
              {mockTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{tx.patient}</p>
                    <p className="text-sm text-gray-500">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-success-600">+{tx.amount} ETB</p>
                    <Badge 
                      variant={tx.status === 'completed' ? 'success' : 'warning'} 
                      size="sm"
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DoctorLayout>
  );
}
