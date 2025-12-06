import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  X,
  FileText,
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { PatientLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge, Modal } from '../../components/ui';
import { appointmentsAPI } from '../../services/api';

const statusConfig = {
  confirmed: { label: 'Confirmed', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  completed: { label: 'Completed', variant: 'info' },
  cancelled: { label: 'Cancelled', variant: 'danger' }
};

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

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
          doctorName: apt.DoctorProfile?.fullName || 'Unknown Doctor',
          specialty: apt.DoctorProfile?.specialization || 'General',
          date: apt.Availability?.date || '',
          time: apt.Availability?.startTime || '',
          endTime: apt.Availability?.endTime || '',
          status: apt.status,
          paymentStatus: apt.paymentStatus,
          fee: apt.DoctorProfile?.consultationFee || 500
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

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === 'upcoming') {
      return apt.date >= today && apt.status !== 'cancelled';
    } else if (activeTab === 'past') {
      return apt.date < today || apt.status === 'completed';
    } else if (activeTab === 'cancelled') {
      return apt.status === 'cancelled';
    }
    return true;
  });

  const handleCancelClick = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return;
    
    try {
      setCancelLoading(true);
      await appointmentsAPI.cancel(appointmentToCancel.id);
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentToCancel.id ? { ...apt, status: 'cancelled' } : apt
      ));
      setShowCancelModal(false);
      setAppointmentToCancel(null);
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert(err.message || 'Failed to cancel appointment');
    } finally {
      setCancelLoading(false);
    }
  };

  const isJoinable = (appointment) => {
    // Check if within 15 min of appointment time
    return appointment.status === 'confirmed' && appointment.date === today;
  };

  if (loading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </PatientLayout>
    );
  }

  if (error) {
    return (
      <PatientLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-gray-600">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-500 mt-1">View and manage your appointments</p>
          </div>
          <Button icon={Calendar} onClick={() => navigate('/patient/book')}>
            Book New
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          {['upcoming', 'past', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No {activeTab} appointments</h3>
              <p className="text-gray-500 mt-1">
                {activeTab === 'upcoming' 
                  ? 'Book an appointment to get started'
                  : `You don't have any ${activeTab} appointments`
                }
              </p>
              {activeTab === 'upcoming' && (
                <Button className="mt-4" onClick={() => navigate('/patient/book')}>
                  Book Appointment
                </Button>
              )}
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar name={appointment.doctorName} size="lg" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
                      <Badge variant={statusConfig[appointment.status].variant}>
                        {statusConfig[appointment.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{appointment.specialty}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {appointment.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(appointment.time)}
                      </span>
                      <span className="font-medium text-primary-600">
                        {appointment.fee} ETB
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                    {isJoinable(appointment) && (
                      <Button
                        size="sm"
                        icon={Video}
                        onClick={() => navigate(`/room/${appointment.id}`)}
                      >
                        Join Call
                      </Button>
                    )}
                    
                    {appointment.status === 'confirmed' && !isJoinable(appointment) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        View Details
                      </Button>
                    )}

                    {appointment.status === 'completed' && appointment.hasPrescription && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={FileText}
                        onClick={() => navigate('/patient/prescriptions')}
                      >
                        View Rx
                      </Button>
                    )}

                    {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleCancelClick(appointment)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        title="Appointment Details"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Doctor Info */}
            <div className="flex items-center gap-4">
              <Avatar name={selectedAppointment.doctorName} size="xl" />
              <div>
                <h3 className="font-semibold text-gray-900">{selectedAppointment.doctorName}</h3>
                <p className="text-sm text-gray-500">{selectedAppointment.specialty}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{selectedAppointment.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">{selectedAppointment.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={statusConfig[selectedAppointment.status].variant}>
                  {statusConfig[selectedAppointment.status].label}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fee</span>
                <span className="font-medium text-primary-600">{selectedAppointment.fee} ETB</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Before your appointment</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Ensure you have a stable internet connection</li>
                <li>• Find a quiet, well-lit space</li>
                <li>• Have your medical history ready if needed</li>
                <li>• Join the call 5 minutes before the scheduled time</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleCancelClick(selectedAppointment)}
              >
                Cancel Appointment
              </Button>
              {isJoinable(selectedAppointment) && (
                <Button
                  className="flex-1"
                  icon={Video}
                  onClick={() => navigate(`/room/${selectedAppointment.id}`)}
                >
                  Join Video Call
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Appointment"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-gray-900">
                Are you sure you want to cancel your appointment with{' '}
                <span className="font-semibold">{appointmentToCancel?.doctorName}</span>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Scheduled for {appointmentToCancel?.date} at {appointmentToCancel?.time}
              </p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Refund Policy:</strong> Cancellations made more than 24 hours before the appointment 
              are eligible for a full refund. Late cancellations may be subject to a cancellation fee.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowCancelModal(false)}
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleConfirmCancel}
            >
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </PatientLayout>
  );
}
