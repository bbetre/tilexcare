import { useState, useEffect } from 'react';
import {
  UserCheck,
  FileText,
  Eye,
  Check,
  X,
  Download,
  ExternalLink,
  Clock,
  Mail,
  Phone,
  Award,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge, Modal, Textarea } from '../../components/ui';
import { usersAPI } from '../../services/api';

export default function AdminVerification() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [verifiedDoctors, setVerifiedDoctors] = useState([]);
  const [rejectedDoctors, setRejectedDoctors] = useState([]);
  
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [doctorToReject, setDoctorToReject] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getVerification();
      setPendingDoctors(data.pending || []);
      setVerifiedDoctors(data.verified || []);
      setRejectedDoctors(data.rejected || []);
    } catch (err) {
      console.error('Error fetching verification data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (doctor) => {
    try {
      setActionLoading(true);
      await usersAPI.approveDoctor(doctor.id);
      setSelectedDoctor(null);
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error approving doctor:', err);
      alert('Failed to approve doctor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (doctor) => {
    setDoctorToReject(doctor);
    setShowRejectModal(true);
    setSelectedDoctor(null);
  };

  const handleConfirmReject = async () => {
    try {
      setActionLoading(true);
      await usersAPI.rejectDoctor(doctorToReject.id, rejectReason);
      setShowRejectModal(false);
      setDoctorToReject(null);
      setRejectReason('');
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error rejecting doctor:', err);
      alert('Failed to reject doctor');
    } finally {
      setActionLoading(false);
    }
  };

  const getDoctorsList = () => {
    switch (activeTab) {
      case 'pending': return pendingDoctors;
      case 'verified': return verifiedDoctors;
      case 'rejected': return rejectedDoctors;
      default: return [];
    }
  };

  const handleViewDoctor = async (doctor) => {
    try {
      setActionLoading(true);
      const details = await usersAPI.getDoctorDetails(doctor.id);
      setSelectedDoctor(details);
    } catch (err) {
      console.error('Error fetching doctor details:', err);
      // Fallback to basic info if API fails
      setSelectedDoctor(doctor);
    } finally {
      setActionLoading(false);
    }
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Verification</h1>
          <p className="text-gray-500 mt-1">Review and verify doctor applications</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          {[
            { id: 'pending', label: 'Pending', count: pendingDoctors.length },
            { id: 'verified', label: 'Verified', count: verifiedDoctors.length },
            { id: 'rejected', label: 'Rejected', count: rejectedDoctors.length },
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
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === tab.id 
                  ? tab.id === 'pending' ? 'bg-yellow-100 text-yellow-600' : 
                    tab.id === 'verified' ? 'bg-success-100 text-success-600' : 
                    'bg-red-100 text-red-600'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Doctor List */}
        <div className="space-y-4">
          {getDoctorsList().length === 0 ? (
            <Card className="text-center py-12">
              <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No {activeTab} applications</h3>
            </Card>
          ) : (
            getDoctorsList().map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar name={doctor.name} size="lg" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                      <Badge variant={
                        activeTab === 'pending' ? 'warning' :
                        activeTab === 'verified' ? 'success' : 'danger'
                      }>
                        {activeTab === 'pending' ? 'Pending Review' :
                         activeTab === 'verified' ? 'Verified' : 'Rejected'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{doctor.specialty}</p>
                    
                    {activeTab === 'pending' && (
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Submitted: {doctor.submittedDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {doctor.documents?.length || 0} documents
                        </span>
                      </div>
                    )}

                    {activeTab === 'verified' && (
                      <p className="text-sm text-gray-500 mt-1">Verified on {doctor.verifiedDate}</p>
                    )}

                    {activeTab === 'rejected' && (
                      <p className="text-sm text-red-600 mt-1">Reason: {doctor.reason}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {activeTab === 'pending' && (
                      <>
                        <Button size="sm" variant="outline" icon={Eye} onClick={() => setSelectedDoctor(doctor)}>
                          Review
                        </Button>
                        <Button size="sm" variant="success" icon={Check} onClick={() => handleApprove(doctor)} disabled={actionLoading}>
                          Approve
                        </Button>
                        <Button size="sm" variant="danger" icon={X} onClick={() => handleRejectClick(doctor)}>
                          Reject
                        </Button>
                      </>
                    )}
                    {activeTab !== 'pending' && (
                      <Button size="sm" variant="outline" icon={Eye} onClick={() => handleViewDoctor(doctor)}>
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Doctor Review Modal */}
      <Modal
        isOpen={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        title="Review Application"
        size="xl"
      >
        {selectedDoctor && (
          <div className="space-y-6">
            {/* Doctor Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar name={selectedDoctor.name} size="xl" />
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{selectedDoctor.name}</h3>
                <p className="text-primary-600">{selectedDoctor.specialty}</p>
                <p className="text-sm text-gray-500">{selectedDoctor.experience} experience</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
                <p className="font-medium">{selectedDoctor.email}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Phone className="w-4 h-4" />
                  Phone
                </div>
                <p className="font-medium">{selectedDoctor.phone}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Award className="w-4 h-4" />
                  License Number
                </div>
                <p className="font-medium">{selectedDoctor.licenseNumber}</p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Biography</h4>
              <p className="text-gray-600">{selectedDoctor.bio}</p>
            </div>

            {/* Documents */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Uploaded Documents</h4>
              <div className="space-y-2">
                {selectedDoctor.documents?.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500 uppercase">{doc.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" icon={Eye}>
                        View
                      </Button>
                      <Button size="sm" variant="ghost" icon={Download}>
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedDoctor(null)}>
                Close
              </Button>
              <Button variant="danger" className="flex-1" icon={X} onClick={() => handleRejectClick(selectedDoctor)}>
                Reject
              </Button>
              <Button variant="success" className="flex-1" icon={Check} onClick={() => handleApprove(selectedDoctor)}>
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Application"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to reject the application from{' '}
            <span className="font-semibold">{doctorToReject?.name}</span>?
          </p>
          
          <Textarea
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Please provide a reason for rejection..."
            rows={3}
          />

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleConfirmReject} disabled={!rejectReason.trim()}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
