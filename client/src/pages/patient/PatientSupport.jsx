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
    setTicketForm({ subject: '', category: 'general', message: '' });

    // Reset after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <PatientLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">How can we help you?</h1>
          <p className="text-gray-500 mt-2">
            Find answers to common questions or reach out to our support team
          </p>
        </div>

        {/* Quick Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Live Chat</h3>
            <p className="text-sm text-gray-500 mt-1">Chat with our support team</p>
            <p className="text-xs text-gray-400 mt-2">Available 8 AM - 10 PM</p>
            <Button variant="outline" size="sm" className="mt-3">
              Start Chat
            </Button>
          </Card>

          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Phone Support</h3>
            <p className="text-sm text-gray-500 mt-1">Call us directly</p>
            <p className="text-xs font-medium text-gray-700 mt-2">+251 911 123 456</p>
            <Button variant="outline" size="sm" className="mt-3">
              Call Now
            </Button>
          </Card>

          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Email Support</h3>
            <p className="text-sm text-gray-500 mt-1">Send us an email</p>
            <p className="text-xs font-medium text-gray-700 mt-2">support@tilexcare.com</p>
            <Button variant="outline" size="sm" className="mt-3">
              Send Email
            </Button>
          </Card>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <Card 
                key={index} 
                padding="none" 
                className="overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 pt-0 text-gray-600 text-sm border-t border-gray-100">
                    <p className="pt-3">{faq.answer}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Submit Ticket Form */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary-500" />
            Submit a Support Ticket
          </h2>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Ticket Submitted!</h3>
              <p className="text-gray-500 mt-2">
                We've received your request and will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <Input
                    placeholder="Brief description of your issue"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="appointment">Appointment Issue</option>
                    <option value="payment">Payment Problem</option>
                    <option value="technical">Technical Issue</option>
                    <option value="prescription">Prescription Question</option>
                    <option value="account">Account Help</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <Textarea
                  placeholder="Please describe your issue or question in detail..."
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Typical response time: 24 hours
                </p>
                <Button type="submit" icon={Send} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Emergency Notice */}
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Medical Emergency?</h3>
              <p className="text-sm text-red-700 mt-1">
                If you are experiencing a medical emergency, please call emergency services immediately 
                or go to your nearest hospital. TilexCare is not designed for emergency medical situations.
              </p>
              <p className="text-sm font-medium text-red-800 mt-2">
                Emergency: 911 | Ambulance: +251 911
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PatientLayout>
  );
}
