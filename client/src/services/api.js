const API_BASE_URL = 'http://localhost:5000';

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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
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
  setAvailability: (slots) => fetchAPI('/doctors/availability', {
    method: 'POST',
    body: JSON.stringify({ slots })
  }),
  updateProfile: (data) => fetchAPI('/doctors/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
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
  getById: (id) => fetchAPI(`/appointments/${id}`)
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
  analytics: analyticsAPI
};
