import { useState } from 'react';
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Send,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { PatientLayout } from '../../components/layout';
import { Card, Button, Input, Textarea, Badge } from '../../components/ui';

const faqs = [
  {
    question: 'How do I book an appointment?',
    answer: 'Navigate to "Book Appointment" from the menu, select a doctor, choose an available time slot, and complete the payment to confirm your booking.'
  },
  {
    question: 'How do I join a video consultation?',
    answer: 'On the day of your appointment, go to "My Appointments" and click the "Join Call" button that appears 15 minutes before your scheduled time.'
  },
  {
    question: 'How can I cancel an appointment?',
    answer: 'Go to "My Appointments", find the appointment you want to cancel, and click the "Cancel" button. Cancellations made 24+ hours in advance are eligible for a full refund.'
  },
  {
    question: 'Where can I find my prescriptions?',
    answer: 'All prescriptions from your consultations are available in the "Prescriptions" section. You can view details and download them as PDFs.'
  },
  {
    question: 'How do I update my medical history?',
    answer: 'Go to your "Profile" page and update your medical information including allergies, conditions, and medications.'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept payments through Chapa (mobile money, bank transfer) and other local payment methods available in Ethiopia.'
  },
  {
    question: 'Is my medical information secure?',
    answer: 'Yes, all your medical data is encrypted and stored securely. We comply with healthcare data protection standards to ensure your privacy.'
  },
  {
    question: 'What if I have technical issues during a call?',
    answer: 'Ensure you have a stable internet connection. If issues persist, try refreshing the page or rejoining the call. Contact support if the problem continues.'
  }
];

export default function PatientSupport() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'general',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState(null);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.message) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitting(false);
    setSubmitted(true);
    setTicketId(Math.floor(Math.random() * 10000));
    setTicketForm({ subject: '', category: 'general', message: '' });

    // Reset after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <PatientLayout>
      <div className="space-y-12 animate-fade-in">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto pt-8">
          <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm rotate-3 hover:rotate-6 transition-transform">
            <HelpCircle className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-3">How can we help you?</h1>
          <p className="text-xl text-gray-500">
            Find answers to common questions or reach out to our support team for assistance.
          </p>
        </div>

        {/* Quick Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group cursor-pointer">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors">
              <MessageCircle className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-500 mb-6">Chat directly with our support team for immediate assistance.</p>
            <div className="inline-flex items-center justify-center px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Available Now
            </div>
            <Button variant="outline" className="w-full justify-center">Start Chat</Button>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group cursor-pointer">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition-colors">
              <Phone className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-gray-500 mb-6">Call our dedicated helpline for complex inquiries.</p>
            <p className="text-lg font-bold text-gray-900 mb-5 font-mono">+251 911 123 456</p>
            <Button variant="outline" className="w-full justify-center">Call Now</Button>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group cursor-pointer">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-600 transition-colors">
              <Mail className="w-7 h-7 text-orange-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-500 mb-6">Send us a detailed message and we'll reply within 24h.</p>
            <p className="text-sm font-medium text-gray-900 mb-5">support@tilexcare.com</p>
            <Button variant="outline" className="w-full justify-center">Send Email</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-semibold text-gray-900 text-lg">{faq.question}</span>
                    <span className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transition-transform duration-200 ${expandedFaq === index ? 'rotate-180 bg-primary-50 text-primary-600' : 'text-gray-400'}`}>
                      <ChevronDown className="w-5 h-5" />
                    </span>
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="px-6 pb-6 pt-0 text-gray-500 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Ticket Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/50 p-6 lg:p-8 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary-500" />
                Submit a Ticket
              </h2>

              {submitted ? (
                <div className="text-center py-12 animate-fade-in">
                  <div className="w-20 h-20 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-success-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
                  <p className="text-gray-500">
                    We've received your message. Ticket ID: #T-{ticketId}
                  </p>
                  <Button variant="outline" className="mt-8" onClick={() => setSubmitted(false)}>Send Another</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Issue Category
                    </label>
                    <div className="relative">
                      <select
                        value={ticketForm.category}
                        onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border-0 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-primary-100 appearance-none cursor-pointer"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="appointment">Appointment Issue</option>
                        <option value="payment">Payment Problem</option>
                        <option value="technical">Technical Issue</option>
                        <option value="prescription">Prescription Question</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  <Input
                    label="Subject"
                    placeholder="Brief description..."
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    required
                  />

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Message
                    </label>
                    <Textarea
                      placeholder="Describe your issue in detail..."
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                      rows={6}
                      required
                      className="bg-gray-50 border-0 focus:bg-white transition-colors"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full shadow-lg shadow-primary-500/25" disabled={submitting}>
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-5 h-5" /> Submit Ticket
                      </div>
                    )}
                  </Button>

                  <p className="text-center text-xs text-gray-400 mt-4">
                    By submitting, you agree to our support terms.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="bg-red-50 rounded-2xl border border-red-100 p-6 flex items-start gap-5">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900">Is this a medical emergency?</h3>
            <p className="text-red-700 mt-1 max-w-3xl">
              TilexCare is <span className="font-bold">not</span> for emergency situations. If you or someone else is experiencing a life-threatening emergency, please call your local emergency number immediately.
            </p>
            <div className="flex items-center gap-4 mt-4 font-mono font-bold text-red-800">
              <span className="bg-red-100 px-3 py-1 rounded-lg">911</span>
              <span className="bg-red-100 px-3 py-1 rounded-lg">+251 911 (Ambulance)</span>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
