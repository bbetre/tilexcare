import { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Filter,
  Clock,
  User,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  MoreVertical,
  Phone,
  Mail,
  DollarSign,
  Check,
  X
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Card, Button, Badge, Avatar, Input, Select, Modal } from '../../components/ui';
import { appointmentsAPI } from '../../services/api';

export default function AdminAppointments() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentsAPI.getAll();
      setAppointments(data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleViewDetails = async (apt) => {
    try {
      const details = await appointmentsAPI.getById(apt.id);
      setSelectedAppointment(details);
    } catch (err) {
      console.error('Error fetching appointment details:', err);
      setSelectedAppointment(apt);
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      setActionLoading(true);
      await appointmentsAPI.updateStatus(appointmentId, status);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment status:', err);
      alert('Failed to update appointment status');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.PatientProfile?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.DoctorProfile?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const variants = {
      confirmed: 'primary',
      completed: 'success',
      cancelled: 'danger',
      pending: 'warning'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-500 mt-1">Manage all platform appointments</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card padding="sm" className="text-center">
            <Calendar className="w-6 h-6 text-primary-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </Card>
          <Card padding="sm" className="text-center">
            <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
            <p className="text-sm text-gray-500">Confirmed</p>
          </Card>
          <Card padding="sm" className="text-center">
            <CheckCircle className="w-6 h-6 text-success-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </Card>
          <Card padding="sm" className="text-center">
            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
            <p className="text-sm text-gray-500">Cancelled</p>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by patient or doctor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </Select>
          </div>
        </Card>

        {/* Appointments List */}
        <Card>
          {filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Patient</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Doctor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date & Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Payment</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={apt.PatientProfile?.fullName || 'Patient'} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900">{apt.PatientProfile?.fullName || 'Unknown'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={apt.DoctorProfile?.fullName || 'Doctor'} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900">{apt.DoctorProfile?.fullName || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{apt.DoctorProfile?.specialization || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{apt.Availability?.date || '-'}</p>
                        <p className="text-sm text-gray-500">
                          {apt.Availability?.startTime} - {apt.Availability?.endTime}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(apt.status)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={apt.paymentStatus === 'paid' ? 'success' : 'warning'}>
                          {apt.paymentStatus || 'pending'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(apt)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No appointments found</p>
            </div>
          )}
        </Card>
      </div>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        title="Appointment Details"
        size="lg"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`p-4 rounded-lg ${
              selectedAppointment.status === 'confirmed' ? 'bg-blue-50 border border-blue-200' :
              selectedAppointment.status === 'completed' ? 'bg-green-50 border border-green-200' :
              selectedAppointment.status === 'cancelled' ? 'bg-red-50 border border-red-200' :
              'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold capitalize">{selectedAppointment.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment</p>
                  <p className="font-semibold capitalize">{selectedAppointment.paymentStatus || 'pending'}</p>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> Patient Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedAppointment.PatientProfile?.fullName || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedAppointment.PatientProfile?.User?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedAppointment.PatientProfile?.phoneNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium capitalize">{selectedAppointment.PatientProfile?.gender || '-'}</p>
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4" /> Doctor Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedAppointment.DoctorProfile?.fullName || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Specialty</p>
                  <p className="font-medium">{selectedAppointment.DoctorProfile?.specialization || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedAppointment.DoctorProfile?.User?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  <p className="font-medium">{selectedAppointment.DoctorProfile?.consultationFee || 0} ETB</p>
                </div>
              </div>
            </div>

            {/* Schedule Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Schedule
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{selectedAppointment.Availability?.date || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">
                    {selectedAppointment.Availability?.startTime} - {selectedAppointment.Availability?.endTime}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedAppointment(null)}>
                Close
              </Button>
              {selectedAppointment.status === 'pending' && (
                <>
                  <Button 
                    variant="success" 
                    className="flex-1" 
                    icon={Check}
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}
                    disabled={actionLoading}
                  >
                    Confirm
                  </Button>
                  <Button 
                    variant="danger" 
                    className="flex-1" 
                    icon={X}
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                </>
              )}
              {selectedAppointment.status === 'confirmed' && (
                <>
                  <Button 
                    variant="success" 
                    className="flex-1" 
                    icon={CheckCircle}
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'completed')}
                    disabled={actionLoading}
                  >
                    Mark Completed
                  </Button>
                  <Button 
                    variant="danger" 
                    className="flex-1" 
                    icon={XCircle}
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
