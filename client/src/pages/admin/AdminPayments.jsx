import { useState, useEffect } from 'react';
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
  AlertCircle,
  Loader2,
  Eye,
  User,
  Stethoscope,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Banknote
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Card, Button, Badge, Input, Select, Modal, Textarea } from '../../components/ui';
import { paymentsAPI } from '../../services/api';

export default function AdminPayments() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayouts: 0,
    refundRequests: 0,
    platformFee: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  
  // New state for payment management
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({ status: 'completed', notes: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [payoutDetails, setPayoutDetails] = useState(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ payoutMethod: 'bank_transfer', payoutReference: '', notes: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await paymentsAPI.getOverview();
      setStats(data.stats || {});
      setTransactions(data.transactions || []);
      setPayouts(data.payouts || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewTransaction = async (tx) => {
    try {
      setTransactionLoading(true);
      const details = await paymentsAPI.getTransactionDetails(tx.id);
      setSelectedTransaction(details);
    } catch (err) {
      console.error('Error fetching transaction details:', err);
      setSelectedTransaction(tx);
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleUpdateTransactionStatus = async (transactionId, status) => {
    try {
      setActionLoading(true);
      await paymentsAPI.updateTransactionStatus(transactionId, status, statusUpdateData.notes);
      await fetchData();
      setSelectedTransaction(null);
      setShowStatusModal(false);
      setStatusUpdateData({ status: 'completed', notes: '' });
    } catch (err) {
      console.error('Error updating transaction:', err);
      alert('Failed to update transaction status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (selectedTransactions.length === 0) {
      alert('Please select transactions to update');
      return;
    }
    try {
      setActionLoading(true);
      await paymentsAPI.bulkUpdateTransactions(selectedTransactions, statusUpdateData.status, statusUpdateData.notes);
      await fetchData();
      setSelectedTransactions([]);
      setShowStatusModal(false);
      setStatusUpdateData({ status: 'completed', notes: '' });
    } catch (err) {
      console.error('Error bulk updating:', err);
      alert('Failed to update transactions');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewPayoutDetails = async (payout) => {
    try {
      setPayoutLoading(true);
      setSelectedPayout(payout);
      const details = await paymentsAPI.getDoctorPayoutDetails(payout.id);
      setPayoutDetails(details);
    } catch (err) {
      console.error('Error fetching payout details:', err);
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleProcessPayout = async () => {
    if (!payoutForm.payoutReference) {
      alert('Please enter a payout reference');
      return;
    }
    try {
      setActionLoading(true);
      await paymentsAPI.processDoctorPayout(selectedPayout.id, payoutForm);
      await fetchData();
      setSelectedPayout(null);
      setPayoutDetails(null);
      setShowPayoutModal(false);
      setPayoutForm({ payoutMethod: 'bank_transfer', payoutReference: '', notes: '' });
    } catch (err) {
      console.error('Error processing payout:', err);
      alert('Failed to process payout');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleTransactionSelection = (txId) => {
    setSelectedTransactions(prev => 
      prev.includes(txId) ? prev.filter(id => id !== txId) : [...prev, txId]
    );
  };

  const selectAllPending = () => {
    const pendingIds = transactions.filter(tx => tx.status === 'pending').map(tx => tx.id);
    setSelectedTransactions(pendingIds);
  };

  const handleApproveRefund = (refund) => {
    console.log('Approving refund:', refund.id);
    setSelectedRefund(null);
  };

  const handleRejectRefund = (refund) => {
    console.log('Rejecting refund:', refund.id);
    setSelectedRefund(null);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.patient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.doctor?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              <p className="text-2xl font-bold mt-1">{(stats.totalRevenue || 0).toLocaleString()} ETB</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-gray-500 text-sm">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{(stats.monthlyRevenue || 0).toLocaleString()} ETB</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-gray-500 text-sm">Platform Fees</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{(stats.platformFee || 0).toLocaleString()} ETB</p>
            </div>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <div>
              <p className="text-yellow-700 text-sm">Pending Payouts</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{(stats.pendingPayouts || 0).toLocaleString()} ETB</p>
            </div>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <div>
              <p className="text-red-700 text-sm">Refund Requests</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.refundRequests || 0}</p>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          {[
            { id: 'transactions', label: 'Transactions', count: transactions.length },
            { id: 'payouts', label: 'Payouts', count: payouts.length },
            { id: 'refunds', label: 'Refund Requests', count: refundRequests.length },
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
          <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {selectedTransactions.length > 0 && (
              <Card padding="sm" className="bg-primary-50 border-primary-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary-700">
                    {selectedTransactions.length} transaction(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedTransactions([])}>
                      Clear Selection
                    </Button>
                    <Button size="sm" variant="success" icon={CheckCircle} onClick={() => {
                      setStatusUpdateData({ status: 'completed', notes: '' });
                      setShowStatusModal(true);
                    }}>
                      Mark Completed
                    </Button>
                    <Button size="sm" variant="danger" icon={XCircle} onClick={() => {
                      setStatusUpdateData({ status: 'failed', notes: '' });
                      setShowStatusModal(true);
                    }}>
                      Mark Failed
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={selectAllPending}>
                Select All Pending
              </Button>
              <Button size="sm" variant="outline" icon={RefreshCw} onClick={fetchData}>
                Refresh
              </Button>
            </div>

            <Card padding="none">
              {filteredTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTransactions(filteredTransactions.map(tx => tx.id));
                              } else {
                                setSelectedTransactions([]);
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredTransactions.map((tx) => (
                        <tr 
                          key={tx.id} 
                          className={`hover:bg-gray-50 ${selectedTransactions.includes(tx.id) ? 'bg-primary-50' : ''}`}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedTransactions.includes(tx.id)}
                              onChange={() => toggleTransactionSelection(tx.id)}
                              className="rounded border-gray-300"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{tx.patient}</td>
                          <td className="px-4 py-4 text-sm text-gray-500">{tx.doctor}</td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{tx.amount} ETB</td>
                          <td className="px-4 py-4 text-sm text-gray-500">{tx.fee} ETB</td>
                          <td className="px-4 py-4 text-sm text-gray-500 capitalize">{tx.method}</td>
                          <td className="px-4 py-4 text-sm text-gray-500">{tx.date}</td>
                          <td className="px-4 py-4">
                            <Badge variant={
                              tx.status === 'completed' ? 'success' :
                              tx.status === 'pending' ? 'warning' : 'danger'
                            }>
                              {tx.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" icon={Eye} onClick={() => handleViewTransaction(tx)} />
                              {tx.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-success-600 hover:bg-success-50"
                                    icon={CheckCircle} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateTransactionStatus(tx.id, 'completed');
                                    }}
                                  />
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-red-600 hover:bg-red-50"
                                    icon={XCircle} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateTransactionStatus(tx.id, 'failed');
                                    }}
                                  />
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No transactions found</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
          <Card padding="none">
            {payouts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{payout.doctor}</td>
                        <td className="px-6 py-4 text-sm font-medium text-success-600">{(payout.amount || 0).toLocaleString()} ETB</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{payout.transactions} consultations</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{payout.method}</td>
                        <td className="px-6 py-4">
                          <Badge variant={payout.status === 'paid' ? 'success' : 'warning'}>
                            {payout.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" icon={Eye} onClick={() => handleViewPayoutDetails(payout)}>
                              Details
                            </Button>
                            {payout.status === 'pending' && payout.amount > 0 && (
                              <Button size="sm" variant="success" icon={Banknote} onClick={() => {
                                setSelectedPayout(payout);
                                setShowPayoutModal(true);
                              }}>
                                Process Payout
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No payouts found</p>
                <p className="text-sm text-gray-400 mt-1">Doctor earnings will appear here after completed consultations</p>
              </div>
            )}
          </Card>
        )}

        {/* Refunds Tab */}
        {activeTab === 'refunds' && (
          <div className="space-y-4">
            {refundRequests.length > 0 ? refundRequests.map((refund) => (
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
            )) : (
              <Card className="text-center py-12">
                <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No refund requests</p>
                <p className="text-sm text-gray-400 mt-1">Refund requests will appear here when patients request refunds</p>
              </Card>
            )}
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

      {/* Transaction Details Modal */}
      <Modal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        title="Transaction Details"
        size="lg"
      >
        {transactionLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : selectedTransaction && (
          <div className="space-y-6">
            {/* Amount Summary */}
            <div className="p-4 bg-gradient-to-r from-success-50 to-success-100 rounded-lg border border-success-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-success-700">Total Amount</p>
                  <p className="text-xl font-bold text-success-900">
                    {selectedTransaction.amount || 0} ETB
                  </p>
                </div>
                <div>
                  <p className="text-sm text-success-700">Platform Fee</p>
                  <p className="text-xl font-bold text-success-900">
                    {selectedTransaction.platformFee || selectedTransaction.fee || 0} ETB
                  </p>
                </div>
                <div>
                  <p className="text-sm text-success-700">Doctor Earning</p>
                  <p className="text-xl font-bold text-success-900">
                    {selectedTransaction.doctorEarning || 0} ETB
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Transaction ID</p>
                <p className="font-medium font-mono text-xs">{selectedTransaction.id}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Reference</p>
                <p className="font-medium">{selectedTransaction.transactionRef || '-'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium capitalize">{selectedTransaction.paymentMethod || selectedTransaction.method || 'Chapa'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={selectedTransaction.status === 'completed' ? 'success' : 'warning'}>
                  {selectedTransaction.status}
                </Badge>
              </div>
            </div>

            {/* Patient Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> Patient
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedTransaction.patient?.name || selectedTransaction.patient || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedTransaction.patient?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedTransaction.patient?.phone || '-'}</p>
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4" /> Doctor
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedTransaction.doctor?.name || selectedTransaction.doctor || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedTransaction.doctor?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Specialty</p>
                  <p className="font-medium">{selectedTransaction.doctor?.specialty || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  <p className="font-medium">{selectedTransaction.doctor?.fee || 0} ETB</p>
                </div>
              </div>
            </div>

            {/* Appointment Info */}
            {selectedTransaction.appointment && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Appointment
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{selectedTransaction.appointment.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{selectedTransaction.appointment.time}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Update Actions */}
            {selectedTransaction.status === 'pending' && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-3">Update Payment Status</h4>
                <div className="flex gap-2">
                  <Button 
                    variant="success" 
                    className="flex-1" 
                    icon={CheckCircle}
                    disabled={actionLoading}
                    onClick={() => handleUpdateTransactionStatus(selectedTransaction.id, 'completed')}
                  >
                    Mark Completed
                  </Button>
                  <Button 
                    variant="danger" 
                    className="flex-1" 
                    icon={XCircle}
                    disabled={actionLoading}
                    onClick={() => handleUpdateTransactionStatus(selectedTransaction.id, 'failed')}
                  >
                    Mark Failed
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedTransaction(null)}>
                Close
              </Button>
              <Button variant="primary" className="flex-1" icon={Download}>
                Download Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Transaction Status"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              You are about to update <span className="font-bold">{selectedTransactions.length}</span> transaction(s) 
              to <span className="font-bold capitalize">{statusUpdateData.status}</span>.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select
              value={statusUpdateData.status}
              onChange={(e) => setStatusUpdateData({ ...statusUpdateData, status: e.target.value })}
            >
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <Textarea
              placeholder="Add notes about this status change..."
              value={statusUpdateData.notes}
              onChange={(e) => setStatusUpdateData({ ...statusUpdateData, notes: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              className="flex-1" 
              disabled={actionLoading}
              onClick={handleBulkUpdateStatus}
            >
              {actionLoading ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payout Details Modal */}
      <Modal
        isOpen={!!selectedPayout && !showPayoutModal}
        onClose={() => { setSelectedPayout(null); setPayoutDetails(null); }}
        title="Payout Details"
        size="lg"
      >
        {payoutLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : payoutDetails && (
          <div className="space-y-6">
            {/* Doctor Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4" /> Doctor Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{payoutDetails.doctor?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{payoutDetails.doctor?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bank Name</p>
                  <p className="font-medium">{payoutDetails.doctor?.bankName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bank Account</p>
                  <p className="font-medium">{payoutDetails.doctor?.bankAccount || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Pending Payout */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-3">Pending Payout</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-yellow-700">Amount</p>
                  <p className="text-2xl font-bold text-yellow-900">{payoutDetails.pendingPayout?.amount?.toLocaleString()} ETB</p>
                </div>
                <div>
                  <p className="text-sm text-yellow-700">Transactions</p>
                  <p className="text-2xl font-bold text-yellow-900">{payoutDetails.pendingPayout?.transactionCount}</p>
                </div>
              </div>
            </div>

            {/* Pending Transactions List */}
            {payoutDetails.pendingPayout?.transactions?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pending Transactions</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {payoutDetails.pendingPayout.transactions.map((tx) => (
                    <div key={tx.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{tx.patient}</p>
                        <p className="text-sm text-gray-500">{tx.date}</p>
                      </div>
                      <p className="font-medium text-success-600">{tx.amount} ETB</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Payouts */}
            {payoutDetails.paidPayouts?.recentPayouts?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recent Payouts</h4>
                <div className="space-y-2">
                  {payoutDetails.paidPayouts.recentPayouts.slice(0, 5).map((payout) => (
                    <div key={payout.id} className="p-3 bg-success-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-success-900">{payout.payoutReference}</p>
                        <p className="text-sm text-success-700">{payout.payoutDate}</p>
                      </div>
                      <p className="font-medium text-success-600">{payout.amount} ETB</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => { setSelectedPayout(null); setPayoutDetails(null); }}>
                Close
              </Button>
              {payoutDetails.pendingPayout?.amount > 0 && (
                <Button variant="success" className="flex-1" icon={Banknote} onClick={() => setShowPayoutModal(true)}>
                  Process Payout
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Process Payout Modal */}
      <Modal
        isOpen={showPayoutModal}
        onClose={() => { setShowPayoutModal(false); setPayoutForm({ payoutMethod: 'bank_transfer', payoutReference: '', notes: '' }); }}
        title="Process Doctor Payout"
      >
        <div className="space-y-4">
          <div className="p-4 bg-success-50 rounded-lg border border-success-200">
            <p className="text-success-800">
              Processing payout of <span className="font-bold">{selectedPayout?.amount?.toLocaleString() || payoutDetails?.pendingPayout?.amount?.toLocaleString()} ETB</span> to <span className="font-bold">{selectedPayout?.doctor || payoutDetails?.doctor?.name}</span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payout Method *</label>
            <Select
              value={payoutForm.payoutMethod}
              onChange={(e) => setPayoutForm({ ...payoutForm, payoutMethod: e.target.value })}
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payout Reference *</label>
            <Input
              placeholder="Enter transaction reference number..."
              value={payoutForm.payoutReference}
              onChange={(e) => setPayoutForm({ ...payoutForm, payoutReference: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <Textarea
              placeholder="Add notes about this payout..."
              value={payoutForm.notes}
              onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setShowPayoutModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="success" 
              className="flex-1" 
              icon={Send}
              disabled={actionLoading || !payoutForm.payoutReference}
              onClick={handleProcessPayout}
            >
              {actionLoading ? 'Processing...' : 'Confirm Payout'}
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
