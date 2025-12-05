import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  RefreshCw,
  Download,
  Search,
  Filter,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Card, Button, Badge, Input, Select, Modal } from '../../components/ui';

// Mock data
const mockStats = {
  totalRevenue: 156000,
  monthlyRevenue: 45000,
  pendingPayouts: 28500,
  refundRequests: 3,
  platformFee: 15600
};

const mockTransactions = [
  { id: '1', patient: 'Betre Hailu', doctor: 'Dr. Abebe Kebede', amount: 500, fee: 50, date: '2025-12-05', status: 'completed', method: 'Chapa' },
  { id: '2', patient: 'Sara Tesfaye', doctor: 'Dr. Sara Haile', amount: 500, fee: 50, date: '2025-12-05', status: 'completed', method: 'Stripe' },
  { id: '3', patient: 'Yonas Bekele', doctor: 'Dr. Yonas Tesfaye', amount: 450, fee: 45, date: '2025-12-04', status: 'completed', method: 'Chapa' },
  { id: '4', patient: 'Meron Alemu', doctor: 'Dr. Meron Alemu', amount: 600, fee: 60, date: '2025-12-04', status: 'pending', method: 'Chapa' },
  { id: '5', patient: 'Tigist Haile', doctor: 'Dr. Abebe Kebede', amount: 500, fee: 50, date: '2025-12-03', status: 'refunded', method: 'Stripe' },
];

const mockPayouts = [
  { id: '1', doctor: 'Dr. Abebe Kebede', amount: 15000, date: '2025-12-01', status: 'completed', method: 'Chapa' },
  { id: '2', doctor: 'Dr. Sara Haile', amount: 12000, date: '2025-12-01', status: 'completed', method: 'Bank Transfer' },
  { id: '3', doctor: 'Dr. Yonas Tesfaye', amount: 8500, date: '2025-12-01', status: 'pending', method: 'Chapa' },
];

const mockRefundRequests = [
  { id: '1', patient: 'Kidist Alemu', doctor: 'Dr. Meron Alemu', amount: 600, date: '2025-12-04', reason: 'Doctor did not join the call', status: 'pending' },
  { id: '2', patient: 'Solomon Tadesse', doctor: 'Dr. Sara Haile', amount: 500, date: '2025-12-03', reason: 'Technical issues during consultation', status: 'pending' },
  { id: '3', patient: 'Hana Girma', doctor: 'Dr. Abebe Kebede', amount: 500, date: '2025-12-02', reason: 'Appointment cancelled by doctor', status: 'pending' },
];

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRefund, setSelectedRefund] = useState(null);

  const handleApproveRefund = (refund) => {
    console.log('Approving refund:', refund.id);
    setSelectedRefund(null);
  };

  const handleRejectRefund = (refund) => {
    console.log('Rejecting refund:', refund.id);
    setSelectedRefund(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments & Payouts</h1>
            <p className="text-gray-500 mt-1">Manage platform payments and doctor payouts</p>
          </div>
          <Button icon={Download}>
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white border-0">
            <div>
              <p className="text-success-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">{mockStats.totalRevenue.toLocaleString()} ETB</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-gray-500 text-sm">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{mockStats.monthlyRevenue.toLocaleString()} ETB</p>
              <div className="flex items-center gap-1 mt-1 text-success-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                +12.5%
              </div>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-gray-500 text-sm">Platform Fees</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{mockStats.platformFee.toLocaleString()} ETB</p>
            </div>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <div>
              <p className="text-yellow-700 text-sm">Pending Payouts</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{mockStats.pendingPayouts.toLocaleString()} ETB</p>
            </div>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <div>
              <p className="text-red-700 text-sm">Refund Requests</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{mockStats.refundRequests}</p>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          {[
            { id: 'transactions', label: 'Transactions' },
            { id: 'payouts', label: 'Payouts' },
            { id: 'refunds', label: 'Refund Requests', count: mockRefundRequests.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-red-100 text-red-600">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <Card padding="sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search..."
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </Select>
          </div>
        </Card>

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">#{tx.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{tx.patient}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{tx.doctor}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{tx.amount} ETB</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{tx.fee} ETB</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{tx.method}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{tx.date}</td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          tx.status === 'completed' ? 'success' :
                          tx.status === 'pending' ? 'warning' : 'danger'
                        }>
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">#{payout.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{payout.doctor}</td>
                      <td className="px-6 py-4 text-sm font-medium text-success-600">{payout.amount.toLocaleString()} ETB</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{payout.method}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{payout.date}</td>
                      <td className="px-6 py-4">
                        <Badge variant={payout.status === 'completed' ? 'success' : 'warning'}>
                          {payout.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {payout.status === 'pending' && (
                          <Button size="sm" variant="success">
                            Process
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Refunds Tab */}
        {activeTab === 'refunds' && (
          <div className="space-y-4">
            {mockRefundRequests.map((refund) => (
              <Card key={refund.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="w-6 h-6 text-red-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{refund.patient}</h3>
                      <Badge variant="warning">Pending Review</Badge>
                    </div>
                    <p className="text-sm text-gray-500">Doctor: {refund.doctor}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Reason:</span> {refund.reason}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Requested: {refund.date}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="text-xl font-bold text-gray-900">{refund.amount} ETB</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedRefund(refund)}>
                        Review
                      </Button>
                      <Button size="sm" variant="success" icon={Check} onClick={() => handleApproveRefund(refund)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="danger" icon={X} onClick={() => handleRejectRefund(refund)}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Refund Review Modal */}
      <Modal
        isOpen={!!selectedRefund}
        onClose={() => setSelectedRefund(null)}
        title="Review Refund Request"
      >
        {selectedRefund && (
          <div className="space-y-6">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Refund Request</p>
                  <p className="text-sm text-red-700">Amount: {selectedRefund.amount} ETB</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Patient</p>
                <p className="font-medium">{selectedRefund.patient}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Doctor</p>
                <p className="font-medium">{selectedRefund.doctor}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Reason</p>
                <p className="font-medium">{selectedRefund.reason}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Request Date</p>
                <p className="font-medium">{selectedRefund.date}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedRefund(null)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" icon={X} onClick={() => handleRejectRefund(selectedRefund)}>
                Reject
              </Button>
              <Button variant="success" className="flex-1" icon={Check} onClick={() => handleApproveRefund(selectedRefund)}>
                Approve Refund
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
