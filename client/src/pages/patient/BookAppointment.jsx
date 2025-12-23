import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  Clock,
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard,
  Check,
  Loader2,
  AlertCircle,
  Award,
  Building,
  Globe,
  Video,
  Zap,
  GraduationCap,
  Mail,
  Phone,
  User,
  CheckCircle2
} from 'lucide-react';
import { PatientLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge, Modal, Input, Select } from '../../components/ui';
import { doctorsAPI, appointmentsAPI, ratingsAPI } from '../../services/api';

const specialties = [
  'All Specialties',
  'General Practitioner',
  'Dermatologist',
  'Pediatrician',
  'Cardiologist',
  'Gynecologist',
  'Orthopedic',
  'Neurologist',
  'Psychiatrist',
  'Internal Medicine'
];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [priceRange, setPriceRange] = useState('all');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Booking modal state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorAvailability, setDoctorAvailability] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('chapa');
  const [bookingStep, setBookingStep] = useState(1); // 1: select time, 2: payment, 3: confirmation
  const [bookingLoading, setBookingLoading] = useState(false);

  // Doctor profile modal state
  const [profileDoctor, setProfileDoctor] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch doctors on mount with real ratings
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const data = await ratingsAPI.getDoctorsWithRatings();
        setDoctors(data);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Filter doctors based on search and filters
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All Specialties' || doctor.specialization === selectedSpecialty;
    const fee = doctor.consultationFee || 500;
    const matchesPrice = priceRange === 'all' ||
      (priceRange === 'low' && fee <= 400) ||
      (priceRange === 'mid' && fee > 400 && fee <= 500) ||
      (priceRange === 'high' && fee > 500);
    return matchesSearch && matchesSpecialty && matchesPrice;
  });

  const handleBookClick = async (doctor) => {
    setSelectedDoctor(doctor);
    setBookingStep(1);
    setSelectedSlot(null);
    setDoctorAvailability([]);

    // Fetch doctor's availability
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

  // Format time for display
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">Book an Appointment</h1>
            <p className="text-gray-500 mt-1 text-lg">Find the right specialist for your needs.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="hidden md:flex" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
              Filters
            </Button>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors..."
                className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-100 w-full md:w-64 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 flex-shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filters
                </h3>
                <button onClick={() => {
                  setSelectedSpecialty('All Specialties');
                  setPriceRange('all');
                  setOnlineOnly(false);
                }} className="text-xs text-primary-600 hover:underline">
                  Reset
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Specialty</label>
                  <div className="space-y-2">
                    {specialties.map((s) => (
                      <label key={s} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedSpecialty === s ? 'border-primary-500' : 'border-gray-300 group-hover:border-primary-400'
                          }`}>
                          {selectedSpecialty === s && <div className="w-2 h-2 bg-primary-500 rounded-full" />}
                        </div>
                        <span className={`text-sm ${selectedSpecialty === s ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                          {s}
                        </span>
                        <input
                          type="radio"
                          name="specialty"
                          className="hidden"
                          checked={selectedSpecialty === s}
                          onChange={() => setSelectedSpecialty(s)}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-gray-100" />

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Price Range</label>
                  <Select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                  >
                    <option value="all">All Prices</option>
                    <option value="low">Under 400 ETB</option>
                    <option value="mid">400-500 ETB</option>
                    <option value="high">Over 500 ETB</option>
                  </Select>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-primary-50 rounded-xl border border-primary-100 transition-colors hover:bg-primary-100/50">
                    <input
                      type="checkbox"
                      checked={onlineOnly}
                      onChange={(e) => setOnlineOnly(e.target.checked)}
                      className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Online Now</span>
                      <span className="text-xs text-gray-500">Show available doctors only</span>
                    </div>
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Results Grid */}
          <div className="flex-1 w-full">
            {/* Results Count */}
            <p className="text-sm text-gray-500 mb-4">
              Showing <span className="font-semibold text-gray-900">{filteredDoctors.length}</span> specialist{filteredDoctors.length !== 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/40 hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="relative cursor-pointer"
                        onClick={() => handleViewProfile(doctor)}
                      >
                        <Avatar name={doctor.fullName} size="xl" className="ring-4 ring-gray-50 group-hover:ring-primary-50 transition-all" />
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />
                        </span>
                      </div>
                      <Badge variant="surface" className="bg-gray-50 text-gray-600 border-gray-100">
                        {doctor.experience || '5+'} yrs exp
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <h3
                        className="font-bold text-lg text-gray-900 mb-1 cursor-pointer hover:text-primary-600 transition-colors"
                        onClick={() => handleViewProfile(doctor)}
                      >
                        {doctor.fullName}
                      </h3>
                      <p className="text-primary-600 font-medium text-sm">{doctor.specialization}</p>
                    </div>

                    <div className="flex items-center gap-1 mb-4 text-sm">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-bold text-gray-900">{doctor.rating || '4.9'}</span>
                      <span className="text-gray-400">({doctor.reviewCount || 128} reviews)</span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mt-auto">
                      {doctor.hospitalAffiliation && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{doctor.hospitalAffiliation}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{doctor.languages?.join(', ') || 'English, Amharic'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Consultation Fee</span>
                      <span className="text-lg font-bold text-primary-600">{doctor.consultationFee || 500} ETB</span>
                    </div>
                    <Button className="w-full shadow-lg shadow-primary-500/10" onClick={() => handleBookClick(doctor)}>
                      Check Availability
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredDoctors.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No doctors found</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                  We couldn't find any specialists matching your criteria. Try adjusting your filters or search terms.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => {
                  setSearchQuery('');
                  setSelectedSpecialty('All Specialties');
                  setPriceRange('all');
                  setOnlineOnly(false);
                }}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
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
                                className={`py-2 px-3 rounded-lg border text-sm transition-colors ${selectedSlot?.id === slot.id
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
                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'chapa' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
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
                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'stripe' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
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
