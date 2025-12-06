# TilexCare Client

A modern telehealth platform frontend built with React, Vite, and TailwindCSS.

## Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool
- **TailwindCSS** - Styling
- **React Router 7** - Navigation
- **Lucide React** - Icons
- **Zoom Video SDK** - Video consultations
- **clsx** - Conditional classnames
- **date-fns** - Date utilities

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Badge.jsx
│   │   ├── Avatar.jsx
│   │   ├── Modal.jsx
│   │   └── index.js
│   └── layout/          # Layout components
│       ├── PatientLayout.jsx
│       ├── DoctorLayout.jsx
│       ├── AdminLayout.jsx
│       └── index.js
├── pages/
│   ├── patient/         # Patient dashboard & pages
│   │   ├── PatientDashboard.jsx
│   │   ├── BookAppointment.jsx
│   │   ├── PatientAppointments.jsx
│   │   ├── Prescriptions.jsx
│   │   └── PatientProfile.jsx
│   ├── doctor/          # Doctor dashboard & pages
│   │   ├── DoctorDashboard.jsx
│   │   ├── DoctorAppointments.jsx
│   │   ├── DoctorAvailability.jsx
│   │   ├── DoctorEarnings.jsx
│   │   └── DoctorProfile.jsx
│   ├── admin/           # Admin dashboard & pages
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminVerification.jsx
│   │   ├── AdminUsers.jsx
│   │   ├── AdminPayments.jsx
│   │   └── AdminAnalytics.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── VideoRoom.jsx
├── App.jsx              # Main app with routing
├── main.jsx             # Entry point
└── index.css            # Global styles & Tailwind
```

## Features

### Patient Features
- **Dashboard** - Welcome header, next appointment, browse specialists, on-demand care widget
- **Book Appointment** - Search doctors, filter by specialty/price/availability, booking modal with payment
- **My Appointments** - View upcoming/past/cancelled appointments, join video calls
- **Prescriptions** - View and download prescription PDFs
- **Profile** - Personal info, medical history, security settings

### Doctor Features
- **Dashboard** - Today's appointments, earnings overview, quick actions
- **Appointments** - Manage today/upcoming/completed/cancelled appointments
- **Availability** - Set weekly schedule, consultation fee, vacation dates
- **Earnings** - Revenue tracking, payout requests, transaction history
- **Profile** - Professional info, credentials, verification status

### Admin Features
- **Dashboard** - Platform overview, pending verifications, recent activity
- **Verification** - Review and approve/reject doctor applications
- **Users** - Manage patients and doctors, suspend/activate accounts
- **Payments** - Transaction history, payouts, refund management
- **Analytics** - Appointment trends, revenue charts, top performers

### Video Consultation
- Zoom Video SDK integration
- Mute/unmute, camera toggle, screen share
- In-call chat with file sharing
- Doctor tools: consultation notes, diagnosis, prescription generation

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#1A73E8` | Trust, CTAs, links |
| Success Green | `#2ECC71` | Health, affordability, success states |
| Light Gray | `#F7F9FC` | Backgrounds |
| Dark Gray | `#4A4A4A` | Text |

## Routes

### Public
- `/login` - User login
- `/register` - User registration

### Patient (requires patient role)
- `/patient` - Dashboard
- `/patient/book` - Book appointment
- `/patient/appointments` - My appointments
- `/patient/prescriptions` - Prescriptions
- `/patient/profile` - Profile

### Doctor (requires doctor role)
- `/doctor` - Dashboard
- `/doctor/appointments` - Appointments
- `/doctor/availability` - Availability management
- `/doctor/earnings` - Earnings & payouts
- `/doctor/profile` - Profile

### Admin (requires admin role)
- `/admin` - Dashboard
- `/admin/verification` - Doctor verification
- `/admin/users` - User management
- `/admin/payments` - Payments & payouts
- `/admin/analytics` - Analytics

### Shared
- `/room/:id` - Video consultation room (patient & doctor)

## API Integration

The frontend is fully integrated with the backend REST API. All mock data has been replaced with real API calls.

### API Service Layer (`/src/services/api.js`)

Centralized API service with the following modules:

| Module | Endpoints | Description |
|--------|-----------|-------------|
| `authAPI` | login, register | Authentication |
| `dashboardAPI` | getPatientDashboard, getDoctorDashboard, getAdminDashboard | Role-specific dashboard data |
| `doctorsAPI` | getAll, getById, getAvailability, setAvailability | Doctor management |
| `appointmentsAPI` | getMyAppointments, book, cancel, getById | Appointment booking & management |
| `consultationsAPI` | save, get | Consultation notes & data |
| `prescriptionsAPI` | getMyPrescriptions, getById, create | Prescription management |
| `adminAPI` | getPendingDoctors, verifyDoctor, getAllUsers | Admin operations |
| `earningsAPI` | getSummary, getTransactions, getByPeriod | Doctor earnings tracking |
| `zoomAPI` | getSignature | Video call authentication |

### Connected Pages

All major pages now fetch real data from the backend:

- **Patient Dashboard** - Next appointment, doctors list, recent consultations
- **Book Appointment** - Real doctor list with availability slots
- **Patient Appointments** - Real appointment history with cancel functionality
- **Doctor Dashboard** - Today's appointments, earnings, prescriptions
- **Doctor Appointments** - Real appointment management
- **Doctor Availability** - Set and save availability slots to database
- **Doctor Earnings** - Real earnings summary and transaction history
- **Admin Dashboard** - Platform stats, pending verifications, activity

### Error Handling

All API-connected pages include:
- Loading states with spinner
- Error states with retry button
- Empty states when no data available

## Demo Accounts

Run `npm run seed` in the server directory to create example accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@tilexcare.com | password123 |
| **Patient** | patient@tilexcare.com | password123 |
| **Verified Doctor** | doctor@tilexcare.com | password123 |
| **Pending Doctor** | pending.doctor@tilexcare.com | password123 |

### Account Features
- **Admin**: Full platform access, doctor verification, analytics
- **Patient**: Book appointments, view prescriptions, join video calls
- **Verified Doctor**: Manage appointments, set availability, view earnings
- **Pending Doctor**: Awaiting verification (for testing admin verification flow)
