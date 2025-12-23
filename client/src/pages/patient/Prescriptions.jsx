import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Search,
  Calendar,
  Pill,
  User,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { PatientLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge, Modal, Input } from '../../components/ui';
import { prescriptionsAPI } from '../../services/api';

export default function Prescriptions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await prescriptionsAPI.getMyPrescriptions();
        setPrescriptions(data || []);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPrescriptions = prescriptions.filter((rx) =>
    rx.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.medications?.some(m => m.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDownload = (prescription) => {
    // In real app, generate and download PDF
    console.log('Downloading prescription:', prescription.id);
    alert('Prescription PDF downloaded!');
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
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">Medications</h1>
            <p className="text-gray-500 mt-1 text-lg">Manage your prescriptions and medical records.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search medications..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-100 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredPrescriptions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No prescriptions found</h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                {searchQuery ? 'Try matching the medication name or doctor.' : 'Your prescribed medications will appear here.'}
              </p>
            </div>
          ) : (
            filteredPrescriptions.map((prescription) => (
              <div key={prescription.id} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Icon & Basic Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {prescription.diagnosis || 'General Prescription'}
                        </h3>
                        <Badge variant="surface" className="bg-gray-100 text-gray-700 border-gray-200">
                          RX-{prescription.id}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mb-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {prescription.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-gray-700">Dr. {prescription.doctorName}</span>
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {prescription.medications.slice(0, 3).map((med, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100">
                            <Pill className="w-3.5 h-3.5" /> {med.name}
                          </span>
                        ))}
                        {prescription.medications.length > 3 && (
                          <span className="inline-flex items-center px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-sm border border-gray-200">
                            +{prescription.medications.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 lg:pt-0 lg:border-l lg:border-gray-100 lg:pl-6">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedPrescription(prescription)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      icon={Download}
                      onClick={() => handleDownload(prescription)}
                      className="text-primary-600 border-primary-200 hover:bg-primary-50"
                    >
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Prescription Detail Modal */}
      <Modal
        isOpen={!!selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
        title="Prescription Details"
        size="lg"
      >
        {selectedPrescription && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">TilexCare Prescription</h3>
                  <p className="text-sm text-gray-500">ID: RX-{selectedPrescription.id}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">{selectedPrescription.date}</p>
            </div>

            {/* Doctor Info */}
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <Avatar name={selectedPrescription.doctorName} size="lg" />
              <div>
                <p className="text-sm text-gray-500">Prescribed by</p>
                <h4 className="font-semibold text-gray-900">{selectedPrescription.doctorName}</h4>
                <p className="text-sm text-gray-500">{selectedPrescription.specialty}</p>
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Diagnosis</h4>
              <p className="text-lg font-medium text-gray-900">{selectedPrescription.diagnosis}</p>
            </div>

            {/* Medications */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Medications</h4>
              <div className="space-y-3">
                {selectedPrescription.medications.map((med, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Pill className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{med.name}</h5>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                          <div>
                            <p className="text-gray-500">Dosage</p>
                            <p className="font-medium">{med.dosage}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Frequency</p>
                            <p className="font-medium">{med.frequency}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Duration</p>
                            <p className="font-medium">{med.duration}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selectedPrescription.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Doctor's Notes</h4>
                <p className="text-gray-700 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  {selectedPrescription.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedPrescription(null)}
              >
                Close
              </Button>
              <Button
                className="flex-1"
                icon={Download}
                onClick={() => handleDownload(selectedPrescription)}
              >
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PatientLayout>
  );
}
