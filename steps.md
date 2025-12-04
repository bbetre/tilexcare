Phase 0: Project Initialization & Architecture
Goal: Set up the foundation for a scalable, secure platform.

Repository Setup
Initialize a monorepo or separate repos for client and server.
Set up Git with main, staging, and dev branches.
Database & Infrastructure
Install Docker and create a docker-compose.yml to spin up a local PostgreSQL instance.
Set up an S3 Bucket (or MinIO locally) for storing doctor credentials and patient files.
Project Scaffolding
Backend: Initialize Node.js/Express project. Install helmet, cors, dotenv for security.
Frontend: Initialize React/Next.js app. Configure TailwindCSS for the design system.
Phase 1: Core Infrastructure (Auth & Onboarding)
Goal: Enable users to sign up, identify roles, and verify doctors.

Step 1: Database Schema (Users & Profiles)
Create tables: Users (id, email, password_hash, role), PatientProfiles, DoctorProfiles (verification_status, specialization, license_url).
Security Note: Ensure PII (Personally Identifiable Information) is isolated or encrypted where possible.
Step 2: Backend - Authentication & Management
Implement JWT Authentication (Access/Refresh tokens).
Create API Endpoints:
POST /auth/register: Handle role selection (Patient vs. Doctor).
POST /auth/login.
POST /upload: Secure endpoint for doctors to upload license documents (to S3).
Step 3: Frontend - Onboarding UI
Landing Page: High-impact design explaining the value prop.
Auth Forms: Multi-step registration.
Doctors: Add file upload step for credentials.
Dashboards (Shells):
Patient Dashboard: Sidebar with "Find a Doctor", "My Appointments".
Doctor Dashboard: "Availability", "Upcoming Sessions".
Admin Dashboard: "Verification Queue".
Step 4: Admin Verification Logic
Backend: Create PATCH /admin/verify-doctor/:id endpoint.
Frontend: Build a table in Admin Dashboard to view pending doctor applications, view their uploaded PDF/Images, and Approve/Reject.
Phase 2: Appointment System & Payments
Goal: Allow patients to book time and pay for it.

Step 5: Scheduling Logic
Database: Create AvailabilitySlots (doctor_id, start_time, end_time, is_booked) and Appointments (patient_id, doctor_id, slot_id, status, payment_status).
Backend:
POST /doctors/availability: Doctors set their working hours.
GET /doctors/:id/availability: Patients fetch open slots.
POST /appointments/book: Reserve a slot (temporarily pending payment).
Step 6: Payment Integration (Chapa & Stripe)
Backend:
Integrate Chapa (for ETB) and Stripe (for USD).
Create POST /payments/initialize: Generates a checkout link/session.
Implement Webhooks: Listen for payment.success to update Appointment status to CONFIRMED.
Frontend:
Add "Pay & Book" flow. Redirect user to payment gateway or use embedded elements.
Show success/failure confirmation screens.
Step 7: Payout Automation
Backend: Create a scheduled job (Cron) or trigger that runs after appointment completion to calculate platform fee vs. doctor payout and initiate transfer (via Chapa/Stripe Connect if supported, or log for manual payout in MVP).
Phase 3: Video & Consultation Tools
Goal: The core telehealth experience.

Step 8: Zoom Video SDK Integration
Setup: Create a Zoom Video SDK developer account. Get Client ID/Secret.
Backend:
Create GET /appointments/:id/join-token: Generates a JWT signature for the Zoom SDK session.
Ensure tokens are only issued to the specific Patient and Doctor linked to the appointment.
Frontend:
Build a Video Room Component.
Embed the Zoom Video SDK canvas.
Implement controls: Mute, Camera Toggle, End Call.
Step 9: In-Call Features (Chat & Notes)
Chat: Implement real-time chat using Socket.io or Zoom's built-in command channel.
Requirement: Chat history is ephemeral or stored securely only for the duration of the session (per PRD).
Doctor Tools:
Add a "Consultation Notes" text area in the Doctor's video view.
Save notes to ConsultationRecords table.
Step 10: Prescriptions
Backend:
Create Prescriptions table.
Endpoint POST /prescriptions: Generates a PDF (using libraries like pdfkit or puppeteer) from the doctor's input.
Frontend:
Doctor view: Form to input medication, dosage, frequency.
Patient view: "Download Prescription" button in Appointment History.
Phase 4: Polish, Compliance & Security
Goal: Make it production-ready and secure.

Step 11: Security Hardening (HIPAA/GDPR)
Data: Ensure all medical notes and prescriptions are encrypted at rest in the DB (e.g., using pgcrypto or application-level encryption).
Logs: Implement audit logging for every access to a patient record (AccessLogs table).
Consent: Add "Terms of Service" and "Privacy Policy" checkboxes with version tracking in the DB.
Step 12: Notifications
Implement an internal microservice or handler for Email/SMS.
Triggers:
"Appointment Confirmed" (Patient & Doctor).
"Appointment Starting in 15 min".
"Prescription Available".
Step 13: Final UX & QA
Responsive Check: Ensure Video Room works on mobile browsers.
Load Testing: Simulate concurrent users to ensure Node.js event loop doesn't block.
Analytics: Add dashboard widgets for Admin to see "Total Revenue", "Active Doctors".