TilexCare – Product Requirements Document (PRD)

Version: 1.0
Date: 2025
Owner: Product Team, TilexCare

1. Executive Summary

TilexCare is a telehealth platform designed to provide affordable access to licensed Ethiopian healthcare specialists through a secure, reliable digital environment. Patients can access both on-demand and scheduled appointments, consult via Zoom Video SDK, receive digital prescriptions, and pay seamlessly using Chapa or Stripe.

The system includes a multi-role experience with patient dashboards, provider dashboards, and an admin panel for verification and compliance. The platform follows HIPAA-inspired and GDPR-aligned standards for data privacy and security.

2. Goals and Non-Goals
2.1 Goals

Provide a trusted telehealth solution connecting Ethiopian patients with verified healthcare specialists.

Enable real-time and scheduled video consultations using Zoom Video SDK.

Provide secure patient onboarding with medical info and ID verification where necessary.

Provide robust doctor onboarding with manual verification and certificate uploads.

Offer reliable appointment scheduling with doctor-set availability.

Support payments using Chapa and Stripe.

Automate provider payouts post-consultation.

Ensure secure private real-time chat during active appointments.

Enable doctors to generate prescriptions digitally.

Provide a comprehensive admin panel for oversight, verification, and analytics.

Maintain HIPAA-inspired and GDPR-compliant data structures and workflows.

2.2 Non-Goals

Providing full EMR/EHR functionality (beyond basic consultation history).

Enabling post-appointment messaging (chat is appointment-only).

International patient support at MVP (Ethiopia only).

Asynchronous medical second opinions.

Integration with pharmacies or laboratories in MVP.

3. Background and Rationale

Access to specialist healthcare in Ethiopia is challenged by geographic, economic, and infrastructural constraints. Patients often wait days or weeks for in-person consultations. TilexCare addresses this problem by offering an affordable, accessible telehealth solution that bridges patients and specialists through a digital platform.

The platform reduces barriers by:

Providing flexible scheduling and on-demand consultations.

Allowing remote consultations using Zoom Video SDK.

Offering digital prescriptions.

Streamlining payments and payouts.

Ensuring patients are consulting with verified professionals.

4. Target Users and Personas
4.1 Patients (Primary User)

Residents of Ethiopia with access to a smartphone or computer.

Seeking affordable medical advice.

Often lack access to specialists locally.

Require easy booking, clear pricing, and secure consultation.

4.2 Providers (Secondary User)

Licensed Ethiopian doctors, specialists, and consultants.

Looking for a platform to reach more patients efficiently.

Require reliable scheduling, video consultations, prescription tools, and payouts.

4.3 Admin (Internal User)

Responsible for doctor verification, user management, payout monitoring, and system compliance.

Needs full visibility into platform activity.

5. Product Scope
5.1 Core Features (MVP)
Patient Features

Account creation and login

Profile setup (basic info, medical history)

Browse specialists

View doctor availability

Book appointments (scheduled or on-demand)

Join video consultation via embedded Zoom Video SDK

Real-time chat during appointment

Access consultation history

View prescriptions

Doctor Features

Account creation

Upload documents (license, credentials)

Set schedule and availability

Accept on-demand or scheduled appointments

View upcoming and past appointments

Conduct video consultations (Zoom SDK)

Access patient info before appointment

Write consultation notes

Generate and issue prescriptions

Admin Features

Doctor verification dashboard

Manage users

Approve or reject doctor profiles

View appointments and analytics

Handle refund requests

Monitor payouts

Manage content: specialities, pricing templates

View system logs

6. Functional Requirements
6.1 User Registration & Authentication

Users register via email or phone number.

Two-role selection: Patient or Doctor.

Doctors must upload required documents.

Admin manually approves doctor profile.

6.2 Appointment Booking
Scheduled

Patient selects:

Doctor

Date/time based on doctor availability

System confirms payment before booking is finalized.

On-Demand

Patient can request immediate consultation.

System matches with available doctor.

Doctor receives notification and accepts/declines.

6.3 Payments & Payouts

Patients can pay using Chapa or Stripe.

System triggers:

Payment → Appointment confirmation

After appointment completion:

Automatic payout sent to doctor’s account.

6.4 Video Consultations (Zoom SDK)

Embedded Zoom session inside the TilexCare frontend.

Invitation link generated programmatically.

Features:

High-quality video/audio

In-call chat

File transfer

Screen sharing (optional)

Consultation notes

Prescription writing

6.5 Prescriptions

Doctor creates prescription using template system.

Patient receives PDF/downloadable prescription.

6.6 Messaging

Chat is active only during the consultation.

Chat ends when the appointment ends.

Chat history is stored securely but not accessible for future messages.

6.7 Notifications

Appointment confirmations

Payment confirmations

Doctor approval notifications

Email + SMS using Notification API (internal microservice)

6.8 Admin Module

Manage doctors

Validate credentials

Refund handling

View payments/payouts

Monitor system health

Export analytics (CSV)

7. Non-Functional Requirements
7.1 Security & Compliance

HIPAA-like data protections:

Encryption in transit (TLS 1.3)

Encryption at rest

Audit logs for doctor access

Least-privilege access

GDPR requirements:

Data portability

Right to be forgotten

Consent tracking

Data minimization

7.2 Performance

System must support:

1,000+ concurrent consultations

API response time < 200ms average

7.3 Reliability

Uptime target: 99.9%

Automatic error alerts

Auto-scaling infrastructure

7.4 Scalability

Microservices architecture on Node.js/Express

Storage on PostgreSQL + S3

Containerized (Docker)

8. Success Metrics
MVP Success Indicators

1,000+ patient registrations in first month

50+ verified specialists onboarded

≥ 80% completed appointments

Average appointment rating ≥ 4.5/5

Successful payment completion rate ≥ 98%

9. Release Plan (MVP)
Phase 1 – Core Infrastructure

Authentication

Patient onboarding

Doctor onboarding & verification

Admin panel foundations

Phase 2 – Appointment System

Scheduling & on-demand workflows

Payments via Chapa & Stripe

Automatic payouts

Phase 3 – Video & Consultation Tools

Zoom SDK integration

Chat

Consultation notes

Prescription generation

Phase 4 – Polish & Compliance

UX enhancements

GDPR workflows

HIPAA-inspired security features

Logging & analytics
