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
  Loader2,
  Stethoscope,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Eye,
  Star,
  MessageSquare,
  Award,
  Building,
  Globe,
  Zap,
  GraduationCap,
  User,
  Check
} from 'lucide-react';
import { PatientLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge, Modal, Textarea } from '../../components/ui';
import { appointmentsAPI, ratingsAPI } from '../../services/api';

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

  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [appointmentToRate, setAppointmentToRate] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratedAppointments, setRatedAppointments] = useState(new Set());

  // Doctor profile modal state
  const [profileDoctor, setProfileDoctor] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Fetch appointments on mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await appointmentsAPI.getMyAppointments();
        // Transform data to match expected format with full details
        const transformed = data.map(apt => ({
          id: apt.id,
          doctorId: apt.doctorId || apt.DoctorProfile?.id, // Include doctorId for profile access
          doctorName: apt.DoctorProfile?.fullName || 'Unknown Doctor',
          doctorEmail: apt.DoctorProfile?.User?.email || '',
          specialty: apt.DoctorProfile?.specialization || 'General',
          bio: apt.DoctorProfile?.bio || '',
          date: apt.Availability?.date || '',
          time: apt.Availability?.startTime || '',
          endTime: apt.Availability?.endTime || '',
          status: apt.status,
          paymentStatus: apt.paymentStatus,
          fee: apt.DoctorProfile?.consultationFee || 500,
          // Consultation details if completed
          consultation: apt.Consultation ? {
            diagnosis: apt.Consultation.diagnosis,
            symptoms: apt.Consultation.symptoms,
            notes: apt.Consultation.notes,
            followUp: apt.Consultation.followUp
          } : null,
          hasPrescription: !!apt.Consultation?.Prescription,
          createdAt: apt.createdAt
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

  // Rating handlers
  const handleRateClick = (appointment) => {
    setAppointmentToRate(appointment);
    setRatingValue(0);
    setRatingHover(0);
    setReviewText('');
    setIsAnonymous(false);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (!appointmentToRate || ratingValue === 0) return;

    try {
      setRatingLoading(true);
      await ratingsAPI.submitRating({
        appointmentId: appointmentToRate.id,
        rating: ratingValue,
        review: reviewText || null,
        isAnonymous
      });

      // Mark as rated
      setRatedAppointments(prev => new Set([...prev, appointmentToRate.id]));
      setShowRatingModal(false);
      setAppointmentToRate(null);
      alert('Thank you for your feedback!');
    } catch (err) {
      console.error('Rating error:', err);
      alert(err.message || 'Failed to submit rating');
    } finally {
      setRatingLoading(false);
    }
  };

  // Check if appointment can be rated
  const canRate = (appointment) => {
    return appointment.status === 'completed' && !ratedAppointments.has(appointment.id);
  };

  // View doctor profile
  const handleViewProfile = async (doctorId) => {
    try {
      setLoadingProfile(true);
      const profileData = await ratingsAPI.getDoctorProfile(doctorId);
      setProfileDoctor(profileData);
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400 opacity-50" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
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
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">My Appointments</h1>
            <p className="text-gray-500 mt-1 text-lg">Track and manage your medical consultations.</p>
          </div>
          <Button icon={Calendar} size="lg" className="shadow-lg shadow-primary-500/20" onClick={() => navigate('/patient/book')}>
            Book New Visit
          </Button>
        </div>

        {/* Tabs */}
        <div className="bg-white p-1.5 rounded-2xl inline-flex shadow-sm border border-gray-100 overflow-x-auto max-w-full">
          {['upcoming', 'past', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 capitalize whitespace-nowrap ${activeTab === tab
                ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div className="space-y-6">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No {activeTab} appointments</h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                {activeTab === 'upcoming'
                  ? 'Your schedule is clear. Book a consultation to get expert medical advice.'
                  : `You don't have any ${activeTab} appointments in your history.`
                }
              </p>
              {activeTab === 'upcoming' && (
                <Button className="mt-6" onClick={() => navigate('/patient/book')}>
                  Book Appointment
                </Button>
              )}
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedAppointment(appointment)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Doctor & Status */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative">
                      <Avatar name={appointment.doctorName} size="xl" className="ring-4 ring-gray-50 group-hover:ring-primary-50 transition-all" />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${appointment.status === 'confirmed' ? 'bg-success-500' :
                        appointment.status === 'pending' ? 'bg-warning-500' : 'bg-gray-400'
                        }`}>
                        {appointment.status === 'confirmed' && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">
                          {appointment.doctorName}
                        </h3>
                        <Badge variant={statusConfig[appointment.status].variant}>
                          {statusConfig[appointment.status].label}
                        </Badge>
                      </div>
                      <p className="text-primary-600 font-medium text-sm mb-3">{appointment.specialty}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-700">{appointment.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-700">{formatTime(appointment.time)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{appointment.fee} ETB</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end lg:w-48 pt-4 lg:pt-0 border-t lg:border-0 border-gray-50" onClick={(e) => e.stopPropagation()}>
                    {isJoinable(appointment) && (
                      <Button
                        className="w-full justify-center shadow-lg shadow-primary-500/20 animate-pulse"
                        icon={Video}
                        onClick={() => navigate(`/room/${appointment.id}`)}
                      >
                        Join Call
                      </Button>
                    )}

                    <div className="flex gap-2 w-full">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 justify-center"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        Details
                      </Button>

                      {appointment.status === 'completed' && appointment.hasPrescription && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 justify-center text-success-600 border-success-200 hover:bg-success-50"
                          icon={FileText}
                          onClick={() => navigate('/patient/prescriptions')}
                        >
                          Rx
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2 w-full">
                      {canRate(appointment) && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Star}
                          className="flex-1 justify-center text-yellow-600 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300"
                          onClick={() => handleRateClick(appointment)}
                        >
                          Rate
                        </Button>
                      )}

                      {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 justify-center text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleCancelClick(appointment)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
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
            {/* Doctor Info - Clickable for profile */}
            <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-lg">
              <div
                className="cursor-pointer"
                onClick={() => handleViewProfile(selectedAppointment.doctorId)}
                title="View Doctor Profile"
              >
                <Avatar name={selectedAppointment.doctorName} size="xl" className="hover:ring-2 hover:ring-primary-300 transition-all" />
              </div>
              <div className="flex-1">
                <h3
                  className="font-semibold text-gray-900 cursor-pointer hover:text-primary-600 transition-colors"
                  onClick={() => handleViewProfile(selectedAppointment.doctorId)}
                >
                  {selectedAppointment.doctorName}
                </h3>
                <p className="text-sm text-primary-600 flex items-center gap-1">
                  <Stethoscope className="w-4 h-4" />
                  {selectedAppointment.specialty}
                </p>
                {selectedAppointment.bio && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{selectedAppointment.bio}</p>
                )}
                <button
                  className="text-xs text-primary-500 hover:text-primary-700 mt-1 flex items-center gap-1"
                  onClick={() => handleViewProfile(selectedAppointment.doctorId)}
                >
                  <Eye className="w-3 h-3" /> View Full Profile
                </button>
              </div>
              <Badge variant={statusConfig[selectedAppointment.status].variant} size="lg">
                {statusConfig[selectedAppointment.status].label}
              </Badge>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Date
                </p>
                <p className="font-medium text-gray-900">{selectedAppointment.date}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Time
                </p>
                <p className="font-medium text-gray-900">
                  {formatTime(selectedAppointment.time)} - {formatTime(selectedAppointment.endTime)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <CreditCard className="w-4 h-4" /> Fee
                </p>
                <p className="font-medium text-primary-600">{selectedAppointment.fee} ETB</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Video className="w-4 h-4" /> Type
                </p>
                <p className="font-medium text-gray-900">Video Consultation</p>
              </div>
            </div>

            {/* Consultation Details (for completed appointments) */}
            {selectedAppointment.consultation && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-500" />
                  Consultation Summary
                </h4>

                {selectedAppointment.consultation.symptoms && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Symptoms</p>
                    <p className="text-gray-900">{selectedAppointment.consultation.symptoms}</p>
                  </div>
                )}

                {selectedAppointment.consultation.diagnosis && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 mb-1">Diagnosis</p>
                    <p className="font-medium text-blue-900">{selectedAppointment.consultation.diagnosis}</p>
                  </div>
                )}

                {selectedAppointment.consultation.notes && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700 mb-1">Doctor's Notes</p>
                    <p className="text-yellow-900">{selectedAppointment.consultation.notes}</p>
                  </div>
                )}

                {selectedAppointment.consultation.followUp && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700 mb-1">Follow-up Recommended</p>
                    <p className="text-purple-900">{selectedAppointment.consultation.followUp}</p>
                  </div>
                )}
              </div>
            )}

            {/* Instructions for upcoming appointments */}
            {(selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'pending') && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Before your appointment</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Find a quiet, well-lit space</li>
                  <li>• Have your medical history ready if needed</li>
                  <li>• Join the call 5 minutes before the scheduled time</li>
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </Button>

              {selectedAppointment.hasPrescription && (
                <Button
                  variant="outline"
                  className="flex-1"
                  icon={FileText}
                  onClick={() => navigate('/patient/prescriptions')}
                >
                  View Prescription
                </Button>
              )}

              {(selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'pending') && (
                <Button
                  variant="danger"
                  onClick={() => handleCancelClick(selectedAppointment)}
                >
                  Cancel
                </Button>
              )}

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
              disabled={cancelLoading}
            >
              {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rating Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title="Rate Your Experience"
      >
        {appointmentToRate && (
          <div className="space-y-6">
            {/* Doctor Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar name={appointmentToRate.doctorName} size="lg" />
              <div>
                <h3 className="font-semibold text-gray-900">{appointmentToRate.doctorName}</h3>
                <p className="text-sm text-gray-500">{appointmentToRate.specialty}</p>
                <p className="text-xs text-gray-400">{appointmentToRate.date}</p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-3">How would you rate your experience?</p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingValue(star)}
                    onMouseEnter={() => setRatingHover(star)}
                    onMouseLeave={() => setRatingHover(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${star <= (ratingHover || ratingValue)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {ratingValue === 1 && 'Poor'}
                {ratingValue === 2 && 'Fair'}
                {ratingValue === 3 && 'Good'}
                {ratingValue === 4 && 'Very Good'}
                {ratingValue === 5 && 'Excellent'}
              </p>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Write a review (optional)
              </label>
              <Textarea
                placeholder="Share your experience with this doctor..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
              />
            </div>

            {/* Anonymous Option */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-primary-500 rounded"
              />
              <span className="text-sm text-gray-700">Submit anonymously</span>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowRatingModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmitRating}
                disabled={ratingValue === 0 || ratingLoading}
              >
                {ratingLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Star className="w-4 h-4 mr-2" />
                )}
                Submit Rating
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Doctor Profile Modal */}
      <Modal
        isOpen={!!profileDoctor || loadingProfile}
        onClose={() => setProfileDoctor(null)}
        title={profileDoctor?.doctor?.fullName || 'Doctor Profile'}
        size="lg"
      >
        {loadingProfile ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : profileDoctor && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Doctor Header */}
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
              <Avatar name={profileDoctor.doctor.fullName} size="xl" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-gray-900">{profileDoctor.doctor.fullName}</h3>
                  <Badge variant="success">Verified</Badge>
                </div>
                <p className="text-primary-600 font-medium">{profileDoctor.doctor.specialization}</p>
                {profileDoctor.doctor.hospitalAffiliation && (
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Building className="w-4 h-4" />
                    {profileDoctor.doctor.hospitalAffiliation}
                  </p>
                )}
                <p className="text-lg font-semibold text-primary-600 mt-2">
                  {profileDoctor.doctor.consultationFee || 500} ETB / consultation
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Full Name:</span>
                  <span className="font-medium text-gray-900">{profileDoctor.doctor.fullName}</span>
                </div>
                {profileDoctor.doctor.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Email:</span>
                    <a href={`mailto:${profileDoctor.doctor.email}`} className="font-medium text-primary-600 hover:underline">
                      {profileDoctor.doctor.email}
                    </a>
                  </div>
                )}
                {profileDoctor.doctor.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Phone:</span>
                    <a href={`tel:${profileDoctor.doctor.phoneNumber}`} className="font-medium text-primary-600 hover:underline">
                      {profileDoctor.doctor.phoneNumber}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Specialization:</span>
                  <span className="font-medium text-gray-900">{profileDoctor.doctor.specialization}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-yellow-50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xl font-bold text-gray-900">{profileDoctor.stats.averageRating}</span>
                </div>
                <p className="text-xs text-gray-600">{profileDoctor.stats.totalRatings} reviews</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-xl font-bold text-blue-600">{profileDoctor.stats.completedAppointments}</p>
                <p className="text-xs text-gray-600">Consultations</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-xl font-bold text-green-600">{profileDoctor.doctor.yearsOfExperience || '5'}+</p>
                <p className="text-xs text-gray-600">Years Exp.</p>
              </div>
            </div>

            {/* Biography */}
            {profileDoctor.doctor.bio && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Biography</h4>
                <p className="text-sm text-gray-600">{profileDoctor.doctor.bio}</p>
              </div>
            )}

            {/* Qualifications & Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileDoctor.doctor.qualifications && profileDoctor.doctor.qualifications.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary-500" />
                    Qualifications
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {profileDoctor.doctor.qualifications.map((q, i) => (
                      <li key={i}>• {q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {profileDoctor.doctor.education && profileDoctor.doctor.education.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary-500" />
                    Education
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {profileDoctor.doctor.education.map((e, i) => (
                      <li key={i}>• {e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="flex flex-wrap gap-2">
              {profileDoctor.doctor.languages && profileDoctor.doctor.languages.length > 0 && (
                <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  <Globe className="w-4 h-4 text-gray-500" />
                  {profileDoctor.doctor.languages.join(', ')}
                </div>
              )}
              {profileDoctor.doctor.consultationTypes && profileDoctor.doctor.consultationTypes.includes('video') && (
                <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  <Video className="w-4 h-4" />
                  Video Consultation
                </div>
              )}
              {profileDoctor.doctor.availableForEmergency && (
                <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                  <Zap className="w-4 h-4" />
                  Emergency Available
                </div>
              )}
            </div>

            {/* Rating Distribution */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Rating Distribution</h4>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = profileDoctor.stats.ratingDistribution[star] || 0;
                  const percentage = profileDoctor.stats.totalRatings > 0
                    ? (count / profileDoctor.stats.totalRatings) * 100
                    : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-3">{star}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-gray-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Reviews */}
            {profileDoctor.recentReviews.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recent Reviews</h4>
                <div className="space-y-3">
                  {profileDoctor.recentReviews.map((review) => (
                    <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{review.patientName}</span>
                        <div className="flex items-center gap-0.5">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      {review.review && (
                        <p className="text-sm text-gray-600">{review.review}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="pt-4 border-t sticky bottom-0 bg-white">
              <Button variant="outline" className="w-full" onClick={() => setProfileDoctor(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PatientLayout>
  );
}
