import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  CreditCard,
  Building,
  ChevronDown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { DoctorLayout } from '../../components/layout';
import { Card, Button, Badge, Select } from '../../components/ui';
import { earningsAPI } from '../../services/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summary, txData, periodData] = await Promise.all([
          earningsAPI.getSummary(),
          earningsAPI.getTransactions(1, 10),
          earningsAPI.getByPeriod(period)
        ]);
        setEarningsData(summary);
        setTransactions(txData.transactions || []);
        
        // Transform period data for chart
        if (periodData && periodData.length > 0) {
          const transformed = periodData.map(item => ({
            label: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
            value: parseFloat(item.earnings) || 0
          }));
          setChartData(transformed);
        } else {
          // Default empty chart data
          setChartData([
            { label: 'Mon', value: 0 },
            { label: 'Tue', value: 0 },
            { label: 'Wed', value: 0 },
            { label: 'Thu', value: 0 },
            { label: 'Fri', value: 0 },
            { label: 'Sat', value: 0 },
            { label: 'Sun', value: 0 },
          ]);
        }
      } catch (err) {
        console.error('Error fetching earnings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

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

  const earnings = earningsData || {
    totalEarnings: 0,
    monthlyEarnings: 0,
    weeklyEarnings: 0,
    pendingPayouts: 0,
    totalConsultations: 0
  };

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
                <p className="text-success-100 text-sm">This Week</p>
                <p className="text-3xl font-bold mt-1">{(earnings.weeklyEarnings || 0).toLocaleString()} ETB</p>
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
                <p className="text-2xl font-bold text-gray-900 mt-1">{(earnings.monthlyEarnings || 0).toLocaleString()} ETB</p>
                <div className="flex items-center gap-1 mt-1 text-sm text-success-600">
                  <TrendingUp className="w-4 h-4" />
                  {earnings.totalConsultations || 0} consultations
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{(earnings.totalEarnings || 0).toLocaleString()} ETB</p>
                <p className="text-sm text-gray-400 mt-1">All time</p>
              </div>
            </div>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-700 text-sm">Pending Payout</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{(earnings.pendingPayouts || 0).toLocaleString()} ETB</p>
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
            <SimpleBarChart data={chartData.length > 0 ? chartData : [{ label: '-', value: 0 }]} />
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
              <span className="text-gray-500">Total this {period}</span>
              <span className="font-semibold text-gray-900">
                {chartData.reduce((sum, d) => sum + d.value, 0).toLocaleString()} ETB
              </span>
            </div>
          </Card>

          {/* Request Payout */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Payout</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Available for withdrawal</p>
                <p className="text-2xl font-bold text-gray-900">{(earnings.totalEarnings - earnings.pendingPayouts || 0).toLocaleString()} ETB</p>
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

              <Button className="w-full" disabled={(earnings.totalEarnings - earnings.pendingPayouts) <= 0}>
                Request Payout
              </Button>
            </div>
          </Card>
        </div>

        {/* Payout History & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payout History */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Consultation Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Total Consultations</p>
                    <p className="text-sm text-gray-500">All time</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{earnings.totalConsultations || 0}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Consultation Fee</p>
                    <p className="text-sm text-gray-500">Per session</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{earnings.consultationFee || 500} ETB</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {tx.Appointment?.PatientProfile?.fullName || 'Patient'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {tx.Appointment?.Availability?.date || new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-success-600">+{tx.doctorEarnings || 0} ETB</p>
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
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No transactions yet</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DoctorLayout>
  );
}
