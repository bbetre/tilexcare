import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  Calendar,
  User,
  Pill,
  Eye,
  Download,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  Filter
} from 'lucide-react';
import { DoctorLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge, Modal, Input, Select, Textarea } from '../../components/ui';
import { prescriptionsAPI } from '../../services/api';

export default function DoctorPrescriptions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const data = await prescriptionsAPI.getDoctorPrescriptions();
        setPrescriptions(data || []);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = prescriptions.filter(rx => {
    const matchesSearch = 
      rx.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.medications?.some(m => m.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || rx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = {
    total: prescriptions.length,
    active: prescriptions.filter(rx => rx.status === 'active').length,
    completed: prescriptions.filter(rx => rx.status === 'completed').length,
    thisMonth: prescriptions.filter(rx => {
      const date = new Date(rx.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length
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

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
            <p className="text-gray-500 mt-1">Manage patient prescriptions</p>
          </div>
          <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
            New Prescription
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card padding="sm" className="text-center">
            <FileText className="w-6 h-6 text-primary-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </Card>
          <Card padding="sm" className="text-center">
            <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            <p className="text-sm text-gray-500">Active</p>
          </Card>
          <Card padding="sm" className="text-center">
            <CheckCircle className="w-6 h-6 text-success-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </Card>
          <Card padding="sm" className="text-center">
            <Calendar className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
            <p className="text-sm text-gray-500">This Month</p>
          </Card>
        </div>

        {/* Filters */}
        <Card padding="sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by patient, diagnosis, or medication..."
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
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        </Card>

        {/* Prescriptions List */}
        <div className="space-y-4">
          {filteredPrescriptions.length > 0 ? (
            filteredPrescriptions.map((rx) => (
              <Card key={rx.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{rx.patientName}</h3>
                        <Badge variant={
                          rx.status === 'active' ? 'success' :
                          rx.status === 'completed' ? 'secondary' : 'danger'
                        }>
                          {rx.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Diagnosis:</span> {rx.diagnosis || 'Not specified'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(rx.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Pill className="w-4 h-4" />
                          {rx.medications?.length || 0} medications
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" icon={Eye} onClick={() => setSelectedPrescription(rx)}>
                      View
                    </Button>
                    <Button variant="ghost" size="sm" icon={Download}>
                      PDF
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No prescriptions found</h3>
              <p className="text-gray-500 mt-1">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Create your first prescription'}
              </p>
              <Button className="mt-4" icon={Plus} onClick={() => setShowCreateModal(true)}>
                New Prescription
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* View Prescription Modal */}
      <Modal
        isOpen={!!selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
        title="Prescription Details"
        size="lg"
      >
        {selectedPrescription && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar name={selectedPrescription.patientName} size="lg" />
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedPrescription.patientName}</h3>
                  <p className="text-sm text-gray-500">Prescribed on {formatDate(selectedPrescription.createdAt)}</p>
                </div>
              </div>
              <Badge variant={selectedPrescription.status === 'active' ? 'success' : 'secondary'}>
                {selectedPrescription.status}
              </Badge>
            </div>

            {/* Diagnosis */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Diagnosis</h4>
              <p className="text-blue-800">{selectedPrescription.diagnosis || 'Not specified'}</p>
            </div>

            {/* Medications */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Pill className="w-4 h-4" /> Medications
              </h4>
              <div className="space-y-3">
                {selectedPrescription.medications?.length > 0 ? (
                  selectedPrescription.medications.map((med, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{med.name}</h5>
                          <p className="text-sm text-gray-500 mt-1">{med.dosage}</p>
                        </div>
                        <Badge variant="outline">{med.frequency}</Badge>
                      </div>
                      {med.instructions && (
                        <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-200">
                          <span className="font-medium">Instructions:</span> {med.instructions}
                        </p>
                      )}
                      {med.duration && (
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Duration:</span> {med.duration}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No medications listed</p>
                )}
              </div>
            </div>

            {/* Notes */}
            {selectedPrescription.notes && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2">Additional Notes</h4>
                <p className="text-yellow-800">{selectedPrescription.notes}</p>
              </div>
            )}

            {/* Valid Until */}
            {selectedPrescription.validUntil && (
              <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="text-gray-600">Valid Until</span>
                <span className="font-medium">{formatDate(selectedPrescription.validUntil)}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedPrescription(null)}>
                Close
              </Button>
              <Button variant="primary" className="flex-1" icon={Download}>
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Prescription Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Prescription"
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 text-sm">
              To create a prescription, please start or complete a consultation with the patient first. 
              Prescriptions can be created during or after a video consultation.
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setShowCreateModal(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </DoctorLayout>
  );
}
