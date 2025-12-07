import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Calendar,
  Clock,
  Phone,
  Mail,
  FileText,
  Activity,
  Eye,
  MessageSquare,
  Loader2,
  AlertCircle,
  User,
  Heart,
  Stethoscope
} from 'lucide-react';
import { DoctorLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge, Modal, Input } from '../../components/ui';
import { doctorsAPI } from '../../services/api';

export default function DoctorPatients() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const data = await doctorsAPI.getMyPatients();
        setPatients(data || []);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.condition?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
          <p className="text-gray-500 mt-1">View and manage your patient records</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Total Patients</p>
                <p className="text-3xl font-bold mt-1">{patients.length}</p>
              </div>
              <Users className="w-10 h-10 text-primary-200" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => {
                    const lastVisit = new Date(p.lastVisit);
                    const now = new Date();
                    return lastVisit.getMonth() === now.getMonth() && lastVisit.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-success-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">New This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => {
                    const firstVisit = new Date(p.firstVisit);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return firstVisit >= weekAgo;
                  }).length}
                </p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card padding="sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search patients by name, email, or condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Patients List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedPatient(patient)}>
                <div className="flex items-start gap-4">
                  <Avatar name={patient.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{patient.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{patient.email}</p>
                    {patient.condition && (
                      <Badge variant="primary" size="sm" className="mt-2">
                        {patient.condition}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Last Visit</p>
                    <p className="font-medium text-gray-900">{formatDate(patient.lastVisit)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Visits</p>
                    <p className="font-medium text-gray-900">{patient.totalVisits || 0}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" icon={Eye}>
                  View Details
                </Button>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No patients found</h3>
                <p className="text-gray-500 mt-1">
                  {searchQuery ? 'Try adjusting your search' : 'Your patients will appear here after consultations'}
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      <Modal
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title="Patient Details"
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Patient Header */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar name={selectedPatient.name} size="xl" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedPatient.name}</h3>
                <p className="text-gray-500">{selectedPatient.email}</p>
                {selectedPatient.condition && (
                  <Badge variant="primary" className="mt-2">{selectedPatient.condition}</Badge>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedPatient.email || '-'}</p>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedPatient.phone || '-'}</p>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium capitalize">{selectedPatient.gender || '-'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{formatDate(selectedPatient.dateOfBirth)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Blood Type</p>
                <p className="font-medium">{selectedPatient.bloodType || '-'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{selectedPatient.address || '-'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                <p className="text-sm text-gray-500">Emergency Contact</p>
                <p className="font-medium">{selectedPatient.emergencyContact || '-'}</p>
              </div>
            </div>

            {/* Medical Information */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4" /> Medical Information
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-red-700">Allergies</p>
                  <p className="font-medium text-red-900">{selectedPatient.allergies || 'None reported'}</p>
                </div>
                <div>
                  <p className="text-sm text-red-700">Chronic Conditions</p>
                  <p className="font-medium text-red-900">{selectedPatient.chronicConditions || 'None reported'}</p>
                </div>
                <div>
                  <p className="text-sm text-red-700">Current Medications</p>
                  <p className="font-medium text-red-900">{selectedPatient.currentMedications || 'None reported'}</p>
                </div>
                <div>
                  <p className="text-sm text-red-700">Previous Surgeries</p>
                  <p className="font-medium text-red-900">{selectedPatient.previousSurgeries || 'None reported'}</p>
                </div>
              </div>
            </div>

            {/* Visit History */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Visit History
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-900">{selectedPatient.totalVisits || 0}</p>
                  <p className="text-sm text-blue-700">Total Visits</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">{formatDate(selectedPatient.firstVisit)}</p>
                  <p className="text-sm text-blue-700">First Visit</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">{formatDate(selectedPatient.lastVisit)}</p>
                  <p className="text-sm text-blue-700">Last Visit</p>
                </div>
              </div>
            </div>

            {/* Health Notes */}
            {selectedPatient.healthNotes && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" /> Health Notes
                </h4>
                <p className="text-gray-600">{selectedPatient.healthNotes}</p>
              </div>
            )}

            {/* Recent Consultations */}
            {selectedPatient.recentConsultations && selectedPatient.recentConsultations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" /> Recent Consultations
                </h4>
                <div className="space-y-2">
                  {selectedPatient.recentConsultations.map((consultation, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{consultation.diagnosis || 'General Consultation'}</p>
                        <p className="text-sm text-gray-500">{formatDate(consultation.date)}</p>
                      </div>
                      <Badge variant={consultation.status === 'completed' ? 'success' : 'warning'}>
                        {consultation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" icon={FileText}>
                View Prescriptions
              </Button>
              <Button variant="primary" className="flex-1" icon={MessageSquare}>
                Send Message
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DoctorLayout>
  );
}
