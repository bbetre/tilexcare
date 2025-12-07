// Use environment variable or default to localhost for development
// In Docker production, nginx proxies /api to the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Generic fetch wrapper with error handling
const fetchAPI = async (endpoint, options = {}) => {
  try {
    // Add cache-busting timestamp for GET requests
    const separator = endpoint.includes('?') ? '&' : '?';
    const cacheBuster = options.method && options.method !== 'GET' ? '' : `${separator}_t=${Date.now()}`;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}${cacheBuster}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
        'Cache-Control': 'no-cache'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// ==================== AUTH ====================
export const authAPI = {
  login: (credentials) => fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  register: (userData) => fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  })
};

// ==================== DASHBOARD ====================
export const dashboardAPI = {
  getPatientDashboard: () => fetchAPI('/dashboard/patient'),
  getDoctorDashboard: () => fetchAPI('/dashboard/doctor'),
  getAdminDashboard: () => fetchAPI('/dashboard/admin'),
  getStats: () => fetchAPI('/dashboard/stats')
};

// ==================== DOCTORS ====================
export const doctorsAPI = {
  getAll: () => fetchAPI('/doctors'),
  getById: (id) => fetchAPI(`/doctors/${id}`),
  getAvailability: (doctorId) => fetchAPI(`/doctors/${doctorId}/availability`),
  getMyAvailability: () => fetchAPI('/doctors/availability'),
  setAvailability: (slots) => fetchAPI('/doctors/availability', {
    method: 'POST',
    body: JSON.stringify({ slots })
  }),
  deleteAvailability: (slotId) => fetchAPI(`/doctors/availability/${slotId}`, {
    method: 'DELETE'
  }),
  getMyProfile: () => fetchAPI('/doctors/profile'),
  updateProfile: (data) => fetchAPI('/doctors/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  getMyPatients: () => fetchAPI('/doctors/patients')
};

// ==================== PATIENTS ====================
export const patientsAPI = {
  getMyProfile: () => fetchAPI('/patients/profile'),
  updateProfile: (data) => fetchAPI('/patients/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  getById: (patientId) => fetchAPI(`/patients/${patientId}`)
};

// ==================== APPOINTMENTS ====================
export const appointmentsAPI = {
  getMyAppointments: () => fetchAPI('/appointments'),
  getAll: () => fetchAPI('/appointments/all'),
  book: (availabilityId, paymentMethod) => fetchAPI('/appointments/book', {
    method: 'POST',
    body: JSON.stringify({ availabilityId, paymentMethod })
  }),
  cancel: (appointmentId) => fetchAPI(`/appointments/${appointmentId}/cancel`, {
    method: 'PUT'
  }),
  getById: (id) => fetchAPI(`/appointments/${id}`),
  updateStatus: (appointmentId, status) => fetchAPI(`/appointments/${appointmentId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  })
};

// ==================== CONSULTATIONS ====================
export const consultationsAPI = {
  save: (appointmentId, data) => fetchAPI(`/consultations/${appointmentId}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  get: (appointmentId) => fetchAPI(`/consultations/${appointmentId}`)
};

// ==================== PRESCRIPTIONS ====================
export const prescriptionsAPI = {
  getMyPrescriptions: () => fetchAPI('/prescriptions'),
  getDoctorPrescriptions: () => fetchAPI('/prescriptions/doctor'),
  getById: (id) => fetchAPI(`/prescriptions/${id}`),
  create: (data) => fetchAPI('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// ==================== ADMIN ====================
export const adminAPI = {
  getPendingDoctors: () => fetchAPI('/admin/pending-doctors'),
  verifyDoctor: (id, status) => fetchAPI(`/admin/verify-doctor/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  getAllUsers: () => fetchAPI('/admin/users'),
  getTransactions: () => fetchAPI('/admin/transactions'),
  getAnalytics: () => fetchAPI('/admin/analytics')
};

// ==================== ZOOM ====================
export const zoomAPI = {
  getSignature: (appointmentId) => fetchAPI('/zoom/signature', {
    method: 'POST',
    body: JSON.stringify({ appointmentId })
  })
};

// ==================== EARNINGS ====================
export const earningsAPI = {
  getSummary: () => fetchAPI('/earnings/summary'),
  getTransactions: (page = 1, limit = 20) => fetchAPI(`/earnings/transactions?page=${page}&limit=${limit}`),
  getByPeriod: (period = 'month') => fetchAPI(`/earnings/by-period?period=${period}`)
};

// ==================== ANALYTICS ====================
export const analyticsAPI = {
  getAnalytics: () => fetchAPI('/analytics')
};

// ==================== PAYMENTS (Admin) ====================
export const paymentsAPI = {
  getOverview: () => fetchAPI('/payments/overview'),
  getPending: () => fetchAPI('/payments/pending'),
  getTransactionDetails: (transactionId) => fetchAPI(`/payments/transaction/${transactionId}`),
  updateTransactionStatus: (transactionId, status, notes) => fetchAPI(`/payments/transaction/${transactionId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes })
  }),
  bulkUpdateTransactions: (transactionIds, status, notes) => fetchAPI('/payments/bulk-update', {
    method: 'POST',
    body: JSON.stringify({ transactionIds, status, notes })
  }),
  getDoctorPayoutDetails: (doctorId) => fetchAPI(`/payments/payout/${doctorId}`),
  processDoctorPayout: (doctorId, data) => fetchAPI(`/payments/payout/${doctorId}/process`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// ==================== USERS (Admin) ====================
export const usersAPI = {
  getAll: () => fetchAPI('/users'),
  getVerification: () => fetchAPI('/users/verification'),
  getDoctorDetails: (doctorId) => fetchAPI(`/users/doctor/${doctorId}`),
  approveDoctor: (doctorId) => fetchAPI(`/users/verification/${doctorId}/approve`, { method: 'PUT' }),
  rejectDoctor: (doctorId, reason) => fetchAPI(`/users/verification/${doctorId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason })
  }),
  suspendUser: (userId, userType) => fetchAPI(`/users/${userId}/suspend`, {
    method: 'PUT',
    body: JSON.stringify({ userType })
  }),
  activateUser: (userId, userType) => fetchAPI(`/users/${userId}/activate`, {
    method: 'PUT',
    body: JSON.stringify({ userType })
  }),
  deleteUser: (userId) => fetchAPI(`/users/${userId}`, { method: 'DELETE' })
};

// ==================== RATINGS ====================
export const ratingsAPI = {
  getDoctorsWithRatings: () => fetchAPI('/ratings/doctors'),
  getDoctorProfile: (doctorId) => fetchAPI(`/ratings/doctor/${doctorId}`),
  getDoctorRatings: (doctorId, limit = 10, offset = 0) => 
    fetchAPI(`/ratings/doctor/${doctorId}/ratings?limit=${limit}&offset=${offset}`),
  submitRating: (data) => fetchAPI('/ratings', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  canRateAppointment: (appointmentId) => fetchAPI(`/ratings/can-rate/${appointmentId}`)
};

export default {
  auth: authAPI,
  dashboard: dashboardAPI,
  doctors: doctorsAPI,
  appointments: appointmentsAPI,
  consultations: consultationsAPI,
  prescriptions: prescriptionsAPI,
  admin: adminAPI,
  zoom: zoomAPI,
  earnings: earningsAPI,
  analytics: analyticsAPI,
  payments: paymentsAPI,
  users: usersAPI,
  ratings: ratingsAPI
};
