import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  User,
  FileText,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { DoctorLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge, Modal } from '../../components/ui';

// Mock data
const mockAppointments = {
  today: [
    { id: '1', patientName: 'Betre Hailu', reason: 'Follow-up consultation', time: '10:00 AM', status: 'confirmed', type: 'scheduled' },
    { id: '2', patientName: 'Sara Tesfaye', reason: 'Headache and fever', time: '10:30 AM', status: 'in-progress', type: 'on-demand' },
    { id: '3', patientName: 'Yonas Bekele', reason: 'Skin rash', time: '11:00 AM', status: 'confirmed', type: 'scheduled' },
  ],
  upcoming: [
    { id: '4', patientName: 'Meron Alemu', reason: 'General checkup', date: '2025-12-06', time: '09:00 AM', status: 'confirmed', type: 'scheduled' },
    { id: '5', patientName: 'Tigist Haile', reason: 'Blood pressure check', date: '2025-12-06', time: '10:00 AM', status: 'confirmed', type: 'scheduled' },
    { id: '6', patientName: 'Dawit Mengistu', reason: 'Diabetes follow-up', date: '2025-12-07', time: '02:00 PM', status: 'pending', type: 'scheduled' },
  ],
  completed: [
    { id: '7', patientName: 'Helen Tadesse', reason: 'Allergic reaction', date: '2025-12-04', time: '03:00 PM', status: 'completed', type: 'on-demand', hasPrescription: true },
    { id: '8', patientName: 'Abebe Kebede', reason: 'Annual checkup', date: '2025-12-04', time: '11:00 AM', status: 'completed', type: 'scheduled', hasPrescription: true },
    { id: '9', patientName: 'Lemlem Girma', reason: 'Stomach pain', date: '2025-12-03', time: '04:00 PM', status: 'completed', type: 'scheduled', hasPrescription: false },
  ],
  cancelled: [
    { id: '10', patientName: 'Kidist Alemu', reason: 'Consultation', date: '2025-12-02', time: '09:00 AM', status: 'cancelled', type: 'scheduled' },
  ]
};

const statusConfig = {
  confirmed: { label: 'Confirmed', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  'in-progress': { label: 'In Progress', variant: 'info' },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'danger' }
};

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const getAppointments = () => {
    switch (activeTab) {
      case 'today': return mockAppointments.today;
      case 'upcoming': return mockAppointments.upcoming;
      case 'completed': return mockAppointments.completed;
      case 'cancelled': return mockAppointments.cancelled;
      default: return [];
    }
  };

  const appointments = getAppointments();

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
            { id: 'today', label: 'Today', count: mockAppointments.today.length },
            { id: 'upcoming', label: 'Upcoming', count: mockAppointments.upcoming.length },
            { id: 'completed', label: 'Completed', count: mockAppointments.completed.length },
            { id: 'cancelled', label: 'Cancelled', count: mockAppointments.cancelled.length },
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
          {appointments.length === 0 ? (
            <Card className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No {activeTab} appointments</h3>
              <p className="text-gray-500 mt-1">Your {activeTab} appointments will appear here</p>
            </Card>
          ) : (
            appointments.map((apt) => (
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
                        {apt.time}
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
