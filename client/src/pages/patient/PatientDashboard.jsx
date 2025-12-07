import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  ChevronRight,
  ChevronLeft,
  Star,
  Zap,
  FileText,
  Activity,
  Loader2,
  CreditCard,
  Check,
  Award,
  Building,
  Globe,
  GraduationCap,
  Mail,
  Phone,
  User
} from 'lucide-react';
import { PatientLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge, Modal } from '../../components/ui';
import { dashboardAPI, doctorsAPI, appointmentsAPI, ratingsAPI } from '../../services/api';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Booking modal state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorAvailability, setDoctorAvailability] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('chapa');
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Doctor profile modal state
  const [profileDoctor, setProfileDoctor] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Fetch dashboard data
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboard, doctorsList] = await Promise.all([
          dashboardAPI.getPatientDashboard(),
          ratingsAPI.getDoctorsWithRatings() // Use ratings API for real ratings
        ]);
        setDashboardData(dashboard);
        setDoctors(doctorsList.slice(0, 4)); // Show first 4 doctors
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const userName = dashboardData?.patient?.fullName || user.email?.split('@')[0] || 'there';
  const nextAppointment = dashboardData?.nextAppointment;
  const recentConsultations = dashboardData?.recentConsultations || [];

  // Format time for display
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Booking modal handlers
  const handleBookClick = async (doctor) => {
    setSelectedDoctor(doctor);
    setBookingStep(1);
    setSelectedSlot(null);
    setDoctorAvailability([]);
    
    try {
      setLoadingAvailability(true);
      const slots = await doctorsAPI.getAvailability(doctor.id);
      setDoctorAvailability(slots);
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedDoctor(null);
    setBookingStep(1);
    setSelectedSlot(null);
  };

  const handleProceedToPayment = () => {
    if (selectedSlot) {
      setBookingStep(2);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedSlot) return;
    
    try {
      setBookingLoading(true);
      await appointmentsAPI.book(selectedSlot.id);
      setBookingStep(3);
      setTimeout(() => {
        handleCloseModal();
        navigate('/patient/appointments');
      }, 2000);
    } catch (err) {
      console.error('Booking error:', err);
      alert(err.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  // Group availability by date
  const groupedAvailability = doctorAvailability.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  // View doctor profile
  const handleViewProfile = async (doctor) => {
    try {
      setLoadingProfile(true);
      const profileData = await ratingsAPI.getDoctorProfile(doctor.id);
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

  return (
    <PatientLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}, {userName}! 👋
            </h1>
            <p className="text-gray-500 mt-1">How are you feeling today?</p>
          </div>
          <Button icon={Calendar} onClick={() => navigate('/patient/book')}>
            Book Appointment
          </Button>
        </div>

        {/* Quick Stats / Next Appointment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Next Appointment Card */}
          {nextAppointment ? (
            <Card className="lg:col-span-2 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-primary-100 text-sm">Next Appointment</p>
                    <h3 className="text-xl font-semibold mt-1">{nextAppointment.doctorName}</h3>
                    <p className="text-primary-100">{nextAppointment.specialty}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {nextAppointment.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(nextAppointment.startTime)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="bg-white text-primary-600 hover:bg-primary-50"
                  icon={Video}
                  onClick={() => navigate(`/room/${nextAppointment.id}`)}
                >
                  Join Call
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="lg:col-span-2 bg-gray-50 border-gray-200">
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                <h3 className="font-semibold text-gray-900">No Upcoming Appointments</h3>
                <p className="text-gray-500 text-sm mt-1">Book an appointment to get started</p>
                <Button className="mt-4" onClick={() => navigate('/patient/book')}>
                  Book Now
                </Button>
              </div>
            </Card>
          )}

          {/* On-Demand Widget */}
          <Card className="bg-success-50 border-success-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">On-Demand Care</h3>
                <p className="text-sm text-gray-500">{doctors.length} doctors available</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {doctors.slice(0, 2).map((doc) => (
                <div key={doc.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-700">{doc.fullName}</span>
                </div>
              ))}
            </div>
            <Button variant="success" size="sm" className="w-full" onClick={() => navigate('/patient/book')}>
              Get Instant Care
            </Button>
          </Card>
        </div>

        {/* Browse Specialists */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Browse Verified Specialists</h2>
            <Link to="/patient/book" className="text-primary-500 text-sm font-medium flex items-center gap-1 hover:text-primary-600">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {doctors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {doctors.map((doctor) => (
                <Card key={doctor.id} padding="sm" className="hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="relative cursor-pointer" 
                      onClick={() => handleViewProfile(doctor)}
                      title="View Profile"
                    >
                      <Avatar name={doctor.fullName} size="xl" className="mb-3 hover:ring-2 hover:ring-primary-300 transition-all" />
                      <span className="absolute bottom-2 right-0 w-3 h-3 bg-success-500 rounded-full border-2 border-white" title="Verified" />
                    </div>
                    <h3 
                      className="font-medium text-gray-900 cursor-pointer hover:text-primary-600 transition-colors"
                      onClick={() => handleViewProfile(doctor)}
                    >
                      {doctor.fullName}
                    </h3>
                    <p className="text-sm text-primary-600">{doctor.specialization}</p>
                    {doctor.bio && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{doctor.bio}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium">{doctor.rating || '0.0'}</span>
                      <span className="text-xs text-gray-400">({doctor.reviewCount || 0} reviews)</span>
                    </div>
                    <p className="text-primary-600 font-semibold mt-2">{doctor.consultationFee || 500} ETB</p>
                    <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => handleBookClick(doctor)}>
                      Book Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <p className="text-gray-500">No verified doctors available at the moment</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/patient/book')}>
                Check Later
              </Button>
            </Card>
          )}
        </div>

        {/* Medical Records Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Consultations */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-500" />
                Recent Consultations
              </h2>
              <Link to="/patient/appointments" className="text-primary-500 text-sm font-medium">
                View all
              </Link>
            </div>
            {recentConsultations.length > 0 ? (
              <div className="space-y-3">
                {recentConsultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{consultation.doctor}</p>
                      <p className="text-sm text-gray-500">{consultation.diagnosis}</p>
                      <p className="text-xs text-gray-400 mt-1">{consultation.date}</p>
                    </div>
                    {consultation.hasPrescription && (
                      <Badge variant="success" size="sm">
                        <FileText className="w-3 h-3 mr-1" />
                        Rx
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Activity className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No consultations yet</p>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/patient/book')}
                className="p-4 bg-primary-50 rounded-xl text-left hover:bg-primary-100 transition-colors"
              >
                <Calendar className="w-6 h-6 text-primary-500 mb-2" />
                <p className="font-medium text-gray-900">Schedule Visit</p>
                <p className="text-sm text-gray-500">Book an appointment</p>
              </button>
              <button
                onClick={() => navigate('/patient/prescriptions')}
                className="p-4 bg-success-50 rounded-xl text-left hover:bg-success-100 transition-colors"
              >
                <FileText className="w-6 h-6 text-success-500 mb-2" />
                <p className="font-medium text-gray-900">Prescriptions</p>
                <p className="text-sm text-gray-500">View & download</p>
              </button>
              <button
                onClick={() => navigate('/patient/appointments')}
                className="p-4 bg-blue-50 rounded-xl text-left hover:bg-blue-100 transition-colors"
              >
                <Clock className="w-6 h-6 text-blue-500 mb-2" />
                <p className="font-medium text-gray-900">My Appointments</p>
                <p className="text-sm text-gray-500">View history</p>
              </button>
              <button
                onClick={() => navigate('/patient/profile')}
                className="p-4 bg-purple-50 rounded-xl text-left hover:bg-purple-100 transition-colors"
              >
                <Activity className="w-6 h-6 text-purple-500 mb-2" />
                <p className="font-medium text-gray-900">Health Profile</p>
                <p className="text-sm text-gray-500">Update records</p>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={!!selectedDoctor}
        onClose={handleCloseModal}
        title={bookingStep === 3 ? 'Booking Confirmed!' : `Book with ${selectedDoctor?.fullName}`}
        size="lg"
      >
        {selectedDoctor && (
          <div>
            {/* Step 1: Select Date & Time */}
            {bookingStep === 1 && (
              <div className="space-y-6">
                {/* Doctor Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar name={selectedDoctor.fullName} size="lg" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedDoctor.fullName}</h3>
                    <p className="text-sm text-gray-500">{selectedDoctor.specialization}</p>
                    <p className="text-primary-600 font-medium mt-1">{selectedDoctor.consultationFee || 500} ETB</p>
                  </div>
                </div>

                {/* Availability Slots */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Available Slots</label>
                  {loadingAvailability ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                    </div>
                  ) : Object.keys(groupedAvailability).length > 0 ? (
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {Object.entries(groupedAvailability).map(([date, slots]) => (
                        <div key={date}>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {slots.map((slot) => (
                              <button
                                key={slot.id}
                                onClick={() => setSelectedSlot(slot)}
                                className={`py-2 px-3 rounded-lg border text-sm transition-colors ${
                                  selectedSlot?.id === slot.id
                                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                {formatTime(slot.startTime)}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p>No available slots at the moment</p>
                      <p className="text-sm mt-1">Please check back later</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                  <Button
                    onClick={handleProceedToPayment}
                    disabled={!selectedSlot}
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {bookingStep === 2 && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Doctor</span>
                    <span className="font-medium">{selectedDoctor.fullName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">{selectedSlot?.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium">{formatTime(selectedSlot?.startTime)} - {formatTime(selectedSlot?.endTime)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-gray-500">Consultation Fee</span>
                    <span className="font-semibold text-primary-600">{selectedDoctor.consultationFee || 500} ETB</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'chapa' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="chapa"
                        checked={paymentMethod === 'chapa'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-primary-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Chapa</p>
                        <p className="text-sm text-gray-500">Pay with Telebirr, CBE, or bank transfer</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'stripe' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="stripe"
                        checked={paymentMethod === 'stripe'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-primary-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Stripe</p>
                        <p className="text-sm text-gray-500">Pay with credit/debit card</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t">
                  <Button variant="secondary" onClick={() => setBookingStep(1)}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button onClick={handleConfirmPayment} icon={CreditCard} disabled={bookingLoading}>
                    {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Pay {selectedDoctor.consultationFee || 500} ETB
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {bookingStep === 3 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Booking Confirmed!</h3>
                <p className="text-gray-500 mt-2">
                  Your appointment with {selectedDoctor.fullName} has been scheduled for {selectedSlot?.date} at {formatTime(selectedSlot?.startTime)}.
                </p>
                <p className="text-sm text-gray-400 mt-4">Redirecting to appointments...</p>
              </div>
            )}
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

            {/* About / Biography */}
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

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
              <Button variant="outline" className="flex-1" onClick={() => setProfileDoctor(null)}>
                Close
              </Button>
              <Button className="flex-1" onClick={() => {
                setProfileDoctor(null);
                handleBookClick(profileDoctor.doctor);
              }}>
                Book Appointment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PatientLayout>
  );
}
