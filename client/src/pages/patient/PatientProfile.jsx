import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Heart,
  FileText,
  Shield,
  Save,
  Edit2,
  Loader2
} from 'lucide-react';
import { PatientLayout } from '../../components/layout';
import { Card, Button, Avatar, Input, Select, Textarea, Badge, ImageUpload } from '../../components/ui';
import { patientsAPI } from '../../services/api';

export default function PatientProfile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    previousSurgeries: '',
    profilePictureUrl: ''
  });

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await patientsAPI.getMyProfile();
        setFormData({
          fullName: data.fullName || '',
          email: data.email || user.email || '',
          phoneNumber: data.phoneNumber || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          address: data.address || '',
          emergencyContact: data.emergencyContact || '',
          bloodType: data.bloodType || '',
          allergies: data.allergies || '',
          chronicConditions: data.chronicConditions || '',
          currentMedications: data.currentMedications || '',
          previousSurgeries: data.previousSurgeries || '',
          profilePictureUrl: data.profilePictureUrl || ''
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user.email]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePictureUpload = async (file) => {
    try {
      const result = await patientsAPI.uploadProfilePicture(file);
      setFormData(prev => ({ ...prev, profilePictureUrl: result.profilePictureUrl }));
      setSuccessMessage('Profile picture updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      throw new Error(err.message || 'Failed to upload profile picture');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await patientsAPI.updateProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        bloodType: formData.bloodType,
        allergies: formData.allergies,
        chronicConditions: formData.chronicConditions,
        currentMedications: formData.currentMedications,
        previousSurgeries: formData.previousSurgeries
      });

      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
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

  return (
    <PatientLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-600" />
            </div>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-600" />
            </div>
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">My Profile</h1>
            <p className="text-gray-500 mt-1 text-lg">Manage your personal and medical information</p>
          </div>
          {!isEditing ? (
            <Button icon={Edit2} onClick={() => setIsEditing(true)} size="lg" className="shadow-lg shadow-primary-500/20">
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={saving}>
                Cancel
              </Button>
              <Button icon={saving ? Loader2 : Save} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
            <ImageUpload
              currentImage={formData.profilePictureUrl ? `http://localhost:5000${formData.profilePictureUrl}` : null}
              onUpload={handleProfilePictureUpload}
              size="2xl"
              shape="circle"
            />
            <div className="text-center sm:text-left space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{formData.fullName || 'Patient'}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500">
                <Mail className="w-4 h-4" />
                <span>{formData.email}</span>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                <Badge variant="surface" className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1">
                  Patient Account
                </Badge>
                <Badge variant="surface" className="bg-green-50 text-green-700 border-green-100 px-3 py-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Verified
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white p-1.5 rounded-2xl inline-flex shadow-sm border border-gray-100 mb-6">
          {[
            { id: 'personal', label: 'Personal Info', icon: User },
            { id: 'medical', label: 'Medical History', icon: Heart },
            { id: 'security', label: 'Security', icon: Shield }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === tab.id
                ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                icon={User}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={true}
                icon={Mail}
                helperText="Email cannot be changed"
              />
              <Input
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={!isEditing}
                icon={Phone}
                placeholder="+251 91 234 5678"
              />
              <Input
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditing}
                icon={Calendar}
              />
              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                icon={MapPin}
              />
              <Input
                label="Emergency Contact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                disabled={!isEditing}
                icon={Phone}
              />
            </div>
          </Card>
        )}

        {/* Medical History Tab */}
        {activeTab === 'medical' && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Medical Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Blood Type"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </Select>
                <Input
                  label="Allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="List any allergies"
                />
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Health History</h3>
              <div className="space-y-6">
                <Textarea
                  label="Chronic Conditions"
                  name="chronicConditions"
                  value={formData.chronicConditions}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="List any chronic conditions"
                  rows={3}
                />
                <Textarea
                  label="Current Medications"
                  name="currentMedications"
                  value={formData.currentMedications}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="List current medications"
                  rows={3}
                />
                <Textarea
                  label="Previous Surgeries"
                  name="previousSurgeries"
                  value={formData.previousSurgeries}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="List any previous surgeries"
                  rows={3}
                />
              </div>
            </Card>

            {/* Medical Records Summary */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Records</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-primary-50 rounded-lg text-center">
                  <FileText className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-sm text-gray-500">Consultations</p>
                </div>
                <div className="p-4 bg-success-50 rounded-lg text-center">
                  <FileText className="w-8 h-8 text-success-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">8</p>
                  <p className="text-sm text-gray-500">Prescriptions</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">2</p>
                  <p className="text-sm text-gray-500">Upcoming</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>
              <div className="max-w-md space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="Enter current password"
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm new password"
                />
                <Button>Update Password</Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Share medical history with doctors</p>
                    <p className="text-sm text-gray-500">Allow doctors to view your medical history during consultations</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-500 rounded" />
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Email notifications</p>
                    <p className="text-sm text-gray-500">Receive appointment reminders and updates via email</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-500 rounded" />
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">SMS notifications</p>
                    <p className="text-sm text-gray-500">Receive appointment reminders via SMS</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-500 rounded" />
                </label>
              </div>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-700 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="danger">Delete Account</Button>
            </Card>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
