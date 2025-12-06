import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  User,
  FileText,
  MessageSquare,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { DoctorLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge, Modal } from '../../components/ui';
import { appointmentsAPI } from '../../services/api';

const statusConfig = {
  confirmed: { label: 'Confirmed', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  'in-progress': { label: 'In Progress', variant: 'info' },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'danger' }
};

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  // Fetch appointments on mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await appointmentsAPI.getMyAppointments();
        // Transform data to match expected format
        const transformed = data.map(apt => ({
          id: apt.id,
          patientName: apt.PatientProfile?.fullName || 'Unknown Patient',
          reason: 'Consultation',
          date: apt.Availability?.date || '',
          time: apt.Availability?.startTime || '',
          status: apt.status,
          type: 'scheduled'
        }));
        setAppointments(transformed);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Format time for display
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Filter appointments based on tab
  const getFilteredAppointments = () => {
    switch (activeTab) {
      case 'today':
        return appointments.filter(apt => apt.date === today && apt.status !== 'cancelled' && apt.status !== 'completed');
      case 'upcoming':
        return appointments.filter(apt => apt.date > today && apt.status !== 'cancelled');
      case 'completed':
        return appointments.filter(apt => apt.status === 'completed');
      case 'cancelled':
        return appointments.filter(apt => apt.status === 'cancelled');
      default:
        return [];
    }
  };

  const filteredAppointments = getFilteredAppointments();

  // Count for tabs
  const counts = {
    today: appointments.filter(apt => apt.date === today && apt.status !== 'cancelled' && apt.status !== 'completed').length,
    upcoming: appointments.filter(apt => apt.date > today && apt.status !== 'cancelled').length,
    completed: appointments.filter(apt => apt.status === 'completed').length,
    cancelled: appointments.filter(apt => apt.status === 'cancelled').length
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
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-500 mt-1">Manage your patient appointments</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          {[
            { id: 'today', label: 'Today', count: counts.today },
            { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
            { id: 'completed', label: 'Completed', count: counts.completed },
            { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
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
                activeTab === tab.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No {activeTab} appointments</h3>
              <p className="text-gray-500 mt-1">Your {activeTab} appointments will appear here</p>
            </Card>
          ) : (
            filteredAppointments.map((apt) => (
              <Card key={apt.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar name={apt.patientName} size="lg" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{apt.patientName}</h3>
                      <Badge variant={statusConfig[apt.status].variant}>
                        {statusConfig[apt.status].label}
                      </Badge>
                      {apt.type === 'on-demand' && (
                        <Badge variant="warning">On-demand</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{apt.reason}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                      {apt.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {apt.date}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(apt.time)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                    {apt.status === 'in-progress' && (
                      <Button size="sm" icon={Video} onClick={() => navigate(`/room/${apt.id}`)}>
                        Rejoin Call
                      </Button>
                    )}
                    
                    {apt.status === 'confirmed' && activeTab === 'today' && (
                      <Button size="sm" icon={Video} onClick={() => navigate(`/room/${apt.id}`)}>
                        Start Call
                      </Button>
                    )}

                    {apt.status === 'confirmed' && activeTab !== 'today' && (
                      <Button size="sm" variant="outline" onClick={() => setSelectedPatient(apt)}>
                        View Details
                      </Button>
                    )}

                    {apt.status === 'completed' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setSelectedPatient(apt)}>
                          View Details
                        </Button>
                        {apt.hasPrescription && (
                          <Button size="sm" variant="ghost" icon={FileText}>
                            View Rx
                          </Button>
                        )}
                      </>
                    )}

                    {apt.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="success">Accept</Button>
                        <Button size="sm" variant="outline">Decline</Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      <Modal
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title="Appointment Details"
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar name={selectedPatient.patientName} size="xl" />
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{selectedPatient.patientName}</h3>
                <p className="text-gray-500">Patient</p>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{selectedPatient.date || 'Today'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{selectedPatient.time}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg col-span-2">
                <p className="text-sm text-gray-500">Reason for Visit</p>
                <p className="font-medium">{selectedPatient.reason}</p>
              </div>
            </div>

            {/* Patient Medical History (Mock) */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Patient History</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Previous Consultations</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Known Allergies</span>
                  <span className="font-medium">Penicillin</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Blood Type</span>
                  <span className="font-medium">O+</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" icon={MessageSquare}>
                Message Patient
              </Button>
              {selectedPatient.status === 'confirmed' && (
                <Button className="flex-1" icon={Video} onClick={() => {
                  setSelectedPatient(null);
                  navigate(`/room/${selectedPatient.id}`);
                }}>
                  Start Consultation
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DoctorLayout>
  );
}
