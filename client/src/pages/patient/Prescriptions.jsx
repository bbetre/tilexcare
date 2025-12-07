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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
          <p className="text-gray-500 mt-1">View and download your prescriptions</p>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <Input
            placeholder="Search by doctor, diagnosis, or medication..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Prescriptions List */}
        <div className="space-y-4">
          {filteredPrescriptions.length === 0 ? (
            <Card className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No prescriptions found</h3>
              <p className="text-gray-500 mt-1">
                {searchQuery ? 'Try a different search term' : 'Your prescriptions will appear here after consultations'}
              </p>
            </Card>
          ) : (
            filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <Avatar name={prescription.doctorName} size="lg" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{prescription.doctorName}</h3>
                      <Badge variant="primary">{prescription.specialty}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      {prescription.date}
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg mb-3">
                      <p className="text-sm font-medium text-gray-700">Diagnosis</p>
                      <p className="text-gray-900">{prescription.diagnosis}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Pill className="w-4 h-4" />
                        Medications ({prescription.medications.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {prescription.medications.map((med, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary-50 text-primary-700 text-sm rounded-md"
                          >
                            {med.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Eye}
                      onClick={() => setSelectedPrescription(prescription)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      icon={Download}
                      onClick={() => handleDownload(prescription)}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </Card>
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
