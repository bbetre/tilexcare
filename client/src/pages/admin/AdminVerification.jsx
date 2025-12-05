import { useState } from 'react';
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
  Award
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge, Modal, Textarea } from '../../components/ui';

// Mock data
const mockPendingDoctors = [
  {
    id: '1',
    name: 'Dr. Kidist Alemu',
    email: 'kidist@email.com',
    phone: '+251 91 234 5678',
    specialty: 'Neurologist',
    experience: '8 years',
    licenseNumber: 'ETH-MED-2017-5678',
    submittedDate: '2025-12-04',
    documents: [
      { name: 'Medical License', type: 'pdf', url: '#' },
      { name: 'Board Certification', type: 'pdf', url: '#' },
      { name: 'ID Document', type: 'image', url: '#' },
    ],
    bio: 'Specialized neurologist with expertise in headache disorders and epilepsy management.'
  },
  {
    id: '2',
    name: 'Dr. Solomon Tadesse',
    email: 'solomon@email.com',
    phone: '+251 91 876 5432',
    specialty: 'Psychiatrist',
    experience: '12 years',
    licenseNumber: 'ETH-MED-2013-9012',
    submittedDate: '2025-12-03',
    documents: [
      { name: 'Medical License', type: 'pdf', url: '#' },
      { name: 'Psychiatry Certification', type: 'pdf', url: '#' },
    ],
    bio: 'Experienced psychiatrist focusing on anxiety disorders and depression treatment.'
  },
  {
    id: '3',
    name: 'Dr. Hana Girma',
    email: 'hana@email.com',
    phone: '+251 91 345 6789',
    specialty: 'Ophthalmologist',
    experience: '6 years',
    licenseNumber: 'ETH-MED-2019-3456',
    submittedDate: '2025-12-02',
    documents: [
      { name: 'Medical License', type: 'pdf', url: '#' },
      { name: 'Ophthalmology Certification', type: 'pdf', url: '#' },
      { name: 'Fellowship Certificate', type: 'pdf', url: '#' },
    ],
    bio: 'Eye care specialist with training in cataract surgery and retinal diseases.'
  },
];

const mockVerifiedDoctors = [
  { id: '4', name: 'Dr. Abebe Kebede', specialty: 'General Practitioner', verifiedDate: '2025-11-28', status: 'verified' },
  { id: '5', name: 'Dr. Sara Haile', specialty: 'Dermatologist', verifiedDate: '2025-11-25', status: 'verified' },
];

const mockRejectedDoctors = [
  { id: '6', name: 'Dr. Test User', specialty: 'Unknown', rejectedDate: '2025-11-20', reason: 'Invalid license number', status: 'rejected' },
];

export default function AdminVerification() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [doctorToReject, setDoctorToReject] = useState(null);

  const handleApprove = (doctor) => {
    console.log('Approving doctor:', doctor.id);
    setSelectedDoctor(null);
    // In real app, call API
  };

  const handleRejectClick = (doctor) => {
    setDoctorToReject(doctor);
    setShowRejectModal(true);
    setSelectedDoctor(null);
  };

  const handleConfirmReject = () => {
    console.log('Rejecting doctor:', doctorToReject?.id, 'Reason:', rejectReason);
    setShowRejectModal(false);
    setDoctorToReject(null);
    setRejectReason('');
    // In real app, call API
  };

  const getDoctorsList = () => {
    switch (activeTab) {
      case 'pending': return mockPendingDoctors;
      case 'verified': return mockVerifiedDoctors;
      case 'rejected': return mockRejectedDoctors;
      default: return [];
    }
  };

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
            { id: 'pending', label: 'Pending', count: mockPendingDoctors.length },
            { id: 'verified', label: 'Verified', count: mockVerifiedDoctors.length },
            { id: 'rejected', label: 'Rejected', count: mockRejectedDoctors.length },
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
                        <Button size="sm" variant="success" icon={Check} onClick={() => handleApprove(doctor)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="danger" icon={X} onClick={() => handleRejectClick(doctor)}>
                          Reject
                        </Button>
                      </>
                    )}
                    {activeTab !== 'pending' && (
                      <Button size="sm" variant="outline" icon={Eye}>
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
