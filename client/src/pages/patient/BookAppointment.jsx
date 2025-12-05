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
  Check
} from 'lucide-react';
import { PatientLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge, Modal, Input, Select } from '../../components/ui';

// Mock data
const mockDoctors = [
  { id: '1', name: 'Dr. Abebe Kebede', specialty: 'General Practitioner', fee: 400, rating: 4.9, experience: '10 years', online: true, bio: 'Experienced general practitioner with focus on preventive care.' },
  { id: '2', name: 'Dr. Sara Haile', specialty: 'Dermatologist', fee: 500, rating: 4.8, experience: '8 years', online: true, bio: 'Specialist in skin conditions and cosmetic dermatology.' },
  { id: '3', name: 'Dr. Yonas Tesfaye', specialty: 'Pediatrician', fee: 450, rating: 4.7, experience: '12 years', online: false, bio: 'Dedicated to children\'s health and development.' },
  { id: '4', name: 'Dr. Meron Alemu', specialty: 'Cardiologist', fee: 600, rating: 4.9, experience: '15 years', online: false, bio: 'Expert in cardiovascular health and heart disease prevention.' },
  { id: '5', name: 'Dr. Tigist Bekele', specialty: 'Gynecologist', fee: 550, rating: 4.8, experience: '9 years', online: true, bio: 'Women\'s health specialist with expertise in reproductive health.' },
  { id: '6', name: 'Dr. Dawit Mengistu', specialty: 'Orthopedic', fee: 650, rating: 4.6, experience: '11 years', online: false, bio: 'Specializing in bone and joint conditions.' },
];

const specialties = [
  'All Specialties',
  'General Practitioner',
  'Dermatologist',
  'Pediatrician',
  'Cardiologist',
  'Gynecologist',
  'Orthopedic',
  'Neurologist',
  'Psychiatrist'
];

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [priceRange, setPriceRange] = useState('all');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Booking modal state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('chapa');
  const [bookingStep, setBookingStep] = useState(1); // 1: select time, 2: payment, 3: confirmation

  const filteredDoctors = mockDoctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All Specialties' || doctor.specialty === selectedSpecialty;
    const matchesOnline = !onlineOnly || doctor.online;
    const matchesPrice = priceRange === 'all' ||
      (priceRange === 'low' && doctor.fee <= 400) ||
      (priceRange === 'mid' && doctor.fee > 400 && doctor.fee <= 500) ||
      (priceRange === 'high' && doctor.fee > 500);
    return matchesSearch && matchesSpecialty && matchesOnline && matchesPrice;
  });

  const handleBookClick = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingStep(1);
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleCloseModal = () => {
    setSelectedDoctor(null);
    setBookingStep(1);
  };

  const handleProceedToPayment = () => {
    if (selectedDate && selectedTime) {
      setBookingStep(2);
    }
  };

  const handleConfirmPayment = () => {
    // In real app, integrate with Chapa/Stripe
    setBookingStep(3);
    setTimeout(() => {
      handleCloseModal();
      navigate('/patient/appointments');
    }, 2000);
  };

  // Generate next 7 days for date selection
  const getNextDays = () => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate()
      });
    }
    return days;
  };

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
                  <Avatar name={doctor.name} size="xl" />
                  {doctor.online && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-success-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-500">{doctor.specialty}</p>
                    </div>
                    {doctor.online && (
                      <Badge variant="success" size="sm">Online</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      {doctor.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {doctor.experience}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{doctor.bio}</p>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-semibold text-primary-600">
                      {doctor.fee} ETB
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
        title={bookingStep === 3 ? 'Booking Confirmed!' : `Book with ${selectedDoctor?.name}`}
        size="lg"
      >
        {selectedDoctor && (
          <div>
            {/* Step 1: Select Date & Time */}
            {bookingStep === 1 && (
              <div className="space-y-6">
                {/* Doctor Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar name={selectedDoctor.name} size="lg" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedDoctor.name}</h3>
                    <p className="text-sm text-gray-500">{selectedDoctor.specialty}</p>
                    <p className="text-primary-600 font-medium mt-1">{selectedDoctor.fee} ETB</p>
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Date</label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {getNextDays().map((day) => (
                      <button
                        key={day.date}
                        onClick={() => setSelectedDate(day.date)}
                        className={`flex-shrink-0 w-16 py-3 rounded-lg border-2 transition-colors ${
                          selectedDate === day.date
                            ? 'border-primary-500 bg-primary-50 text-primary-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="text-xs text-gray-500">{day.day}</p>
                        <p className="text-lg font-semibold">{day.dayNum}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Time</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 px-3 rounded-lg border text-sm transition-colors ${
                            selectedTime === time
                              ? 'border-primary-500 bg-primary-50 text-primary-600'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                  <Button
                    onClick={handleProceedToPayment}
                    disabled={!selectedDate || !selectedTime}
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
                    <span className="font-medium">{selectedDoctor.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-gray-500">Consultation Fee</span>
                    <span className="font-semibold text-primary-600">{selectedDoctor.fee} ETB</span>
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
                  <Button onClick={handleConfirmPayment} icon={CreditCard}>
                    Pay {selectedDoctor.fee} ETB
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
                  Your appointment with {selectedDoctor.name} has been scheduled for {selectedDate} at {selectedTime}.
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
