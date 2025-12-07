import { useState } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Book,
  Video,
  CreditCard,
  Calendar,
  Shield
} from 'lucide-react';
import { DoctorLayout } from '../../components/layout';
import { Card, Button, Input, Textarea, Badge } from '../../components/ui';

export default function DoctorSupport() {
  const [activeTab, setActiveTab] = useState('faq');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'general',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      id: 1,
      category: 'appointments',
      question: 'How do I set my availability for appointments?',
      answer: 'Go to the "Availability" page from the sidebar. You can set your available time slots by selecting dates and times. Patients will only be able to book appointments during your available slots.'
    },
    {
      id: 2,
      category: 'appointments',
      question: 'How do I start a video consultation?',
      answer: 'When it\'s time for your appointment, go to the "Appointments" page and click the "Start" button next to the scheduled appointment. This will open the video consultation room where you can connect with your patient.'
    },
    {
      id: 3,
      category: 'payments',
      question: 'When do I receive my earnings?',
      answer: 'Earnings are processed after each completed consultation. You can view your earnings breakdown on the "Earnings" page. Payouts are typically processed within 3-5 business days to your registered bank account.'
    },
    {
      id: 4,
      category: 'payments',
      question: 'How is the consultation fee calculated?',
      answer: 'You set your own consultation fee in your profile settings. The platform takes a small percentage as a service fee, and the remaining amount is your earning. You can see the exact breakdown on each transaction.'
    },
    {
      id: 5,
      category: 'prescriptions',
      question: 'How do I create a prescription for a patient?',
      answer: 'During or after a video consultation, you can create a prescription by clicking the "Write Prescription" button. Fill in the diagnosis, medications, dosage, and instructions. The prescription will be automatically sent to the patient.'
    },
    {
      id: 6,
      category: 'account',
      question: 'How do I update my profile and credentials?',
      answer: 'Go to the "Profile" page from the sidebar. You can update your personal information, specialization, consultation fee, and upload updated credentials. Note that credential changes may require re-verification.'
    },
    {
      id: 7,
      category: 'technical',
      question: 'What should I do if the video call is not working?',
      answer: 'First, ensure you have a stable internet connection and have granted camera/microphone permissions. Try refreshing the page or using a different browser (Chrome or Firefox recommended). If issues persist, contact support.'
    },
    {
      id: 8,
      category: 'patients',
      question: 'How can I view my patient history?',
      answer: 'Go to the "Patients" page to see all patients you\'ve consulted with. Click on any patient to view their consultation history, prescriptions, and health notes you\'ve recorded.'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Topics', icon: Book },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'technical', label: 'Technical', icon: Video },
    { id: 'account', label: 'Account', icon: Shield }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

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
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-500 mt-1">Get help with your account and consultations</p>
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Email Support</h3>
            <p className="text-sm text-gray-500 mt-1">support@tilexcare.com</p>
            <p className="text-xs text-gray-400 mt-2">Response within 24 hours</p>
          </Card>
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6 text-success-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Phone Support</h3>
            <p className="text-sm text-gray-500 mt-1">+251 911 123 456</p>
            <p className="text-xs text-gray-400 mt-2">Mon-Fri, 9AM-6PM</p>
          </Card>
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Live Chat</h3>
            <p className="text-sm text-gray-500 mt-1">Chat with our team</p>
            <p className="text-xs text-gray-400 mt-2">Available 24/7</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          {[
            { id: 'faq', label: 'FAQs', icon: HelpCircle },
            { id: 'ticket', label: 'Submit Ticket', icon: MessageSquare },
            { id: 'resources', label: 'Resources', icon: Book }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <cat.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* FAQ List */}
            <div className="lg:col-span-3 space-y-3">
              {filteredFaqs.map((faq) => (
                <Card 
                  key={faq.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{faq.question}</h4>
                      {expandedFaq === faq.id && (
                        <p className="text-gray-600 mt-3 pt-3 border-t border-gray-100">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Submit Ticket Tab */}
        {activeTab === 'ticket' && (
          <div className="max-w-2xl">
            {submitted ? (
              <Card className="text-center py-12">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Ticket Submitted!</h3>
                <p className="text-gray-500 mt-2">
                  We've received your support request and will get back to you within 24 hours.
                </p>
                <Button className="mt-6" onClick={() => setSubmitted(false)}>
                  Submit Another Ticket
                </Button>
              </Card>
            ) : (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Submit a Support Ticket</h3>
                <form onSubmit={handleSubmitTicket} className="space-y-4">
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
                      <option value="technical">Technical Issue</option>
                      <option value="payments">Payments & Earnings</option>
                      <option value="appointments">Appointments</option>
                      <option value="account">Account & Profile</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <Textarea
                      placeholder="Please describe your issue in detail..."
                      rows={6}
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" icon={Send} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                </form>
              </Card>
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Book className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Doctor's Guide</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Complete guide on using the platform, managing appointments, and best practices.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" icon={ExternalLink}>
                    View Guide
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Video Tutorials</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Step-by-step video tutorials for common tasks and features.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" icon={ExternalLink}>
                    Watch Videos
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-success-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Payment FAQ</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Information about earnings, payouts, and payment processing.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" icon={ExternalLink}>
                    Learn More
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Privacy & Security</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Learn about data protection and patient privacy guidelines.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" icon={ExternalLink}>
                    Read Policy
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
