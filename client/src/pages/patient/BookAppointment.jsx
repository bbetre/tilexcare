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
  AlertCircle
} from 'lucide-react';
import { PatientLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge, Modal, Input, Select } from '../../components/ui';
import { doctorsAPI, appointmentsAPI } from '../../services/api';

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

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const data = await doctorsAPI.getAll();
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book an Appointment</h1>
          <p className="text-gray-500 mt-1">Find and book appointments with our specialists</p>
        </div>

        {/* Search and Filters */}
        <Card padding="sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search by doctor name, specialty, or condition..."
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter Toggle (Mobile) */}
            <Button
              variant="outline"
              icon={Filter}
              className="lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3">
              <Select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-48"
              >
                {specialties.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
              
              <Select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-36"
              >
                <option value="all">All Prices</option>
                <option value="low">Under 400 ETB</option>
                <option value="mid">400-500 ETB</option>
                <option value="high">Over 500 ETB</option>
              </Select>

              <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlineOnly}
                  onChange={(e) => setOnlineOnly(e.target.checked)}
                  className="w-4 h-4 text-primary-500 rounded"
                />
                <span className="text-sm text-gray-700">Online Now</span>
              </label>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 space-y-3">
              <Select
                label="Specialty"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                {specialties.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
              
              <Select
                label="Price Range"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="all">All Prices</option>
                <option value="low">Under 400 ETB</option>
                <option value="mid">400-500 ETB</option>
                <option value="high">Over 500 ETB</option>
              </Select>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlineOnly}
                  onChange={(e) => setOnlineOnly(e.target.checked)}
                  className="w-4 h-4 text-primary-500 rounded"
                />
                <span className="text-sm text-gray-700">Show Online Doctors Only</span>
              </label>
            </div>
          )}
        </Card>

        {/* Results Count */}
        <p className="text-sm text-gray-500">
          Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
        </p>

        {/* Doctor List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="relative">
                  <Avatar name={doctor.fullName} size="xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{doctor.fullName}</h3>
                      <p className="text-sm text-gray-500">{doctor.specialization}</p>
                    </div>
                    <Badge variant="success" size="sm">Verified</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      4.8
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {doctor.yearsOfExperience || 5}+ years
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{doctor.bio || 'Experienced healthcare professional dedicated to patient care.'}</p>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-semibold text-primary-600">
                      {doctor.consultationFee || 500} ETB
                    </span>
                    <Button size="sm" onClick={() => handleBookClick(doctor)}>
                      View Availability
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <Card className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No doctors found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
          </Card>
        )}
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
    </PatientLayout>
  );
}
