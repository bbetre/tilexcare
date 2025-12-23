import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Award,
  FileText,
  Save,
  Edit2,
  Upload,
  Shield,
  Star,
  Loader2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { DoctorLayout } from '../../components/layout';
import { Card, Button, Avatar, Input, Select, Textarea, Badge, ImageUpload } from '../../components/ui';
import { doctorsAPI } from '../../services/api';

export default function DoctorProfile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    specialization: '',
    licenseNumber: '',
    yearsOfExperience: '',
    bio: '',
    education: '',
    languages: '',
    consultationFee: '',
    hospitalAffiliation: '',
    qualifications: '',
    consultationTypes: 'video',
    availableForEmergency: false,
    isAvailable: true,
    profilePictureUrl: ''
  });

  const [certificates, setCertificates] = useState([
    { id: '1', name: 'Medical License', status: 'verified', uploadDate: '2024-01-15' },
    { id: '2', name: 'Board Certification', status: 'verified', uploadDate: '2024-01-15' },
    { id: '3', name: 'CPR Certification', status: 'pending', uploadDate: '2024-06-20' },
  ]);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await doctorsAPI.getMyProfile();
        setFormData({
          fullName: data.fullName || '',
          email: data.email || user.email || '',
          phoneNumber: data.phoneNumber || '',
          specialization: data.specialization || '',
          licenseNumber: data.licenseNumber || '',
          yearsOfExperience: data.yearsOfExperience?.toString() || '',
          bio: data.bio || '',
          education: data.education || '',
          languages: data.languages || '',
          consultationFee: data.consultationFee?.toString() || '',
          hospitalAffiliation: data.hospitalAffiliation || '',
          qualifications: data.qualifications || '',
          consultationTypes: data.consultationTypes || 'video',
          availableForEmergency: data.availableForEmergency || false,
          isAvailable: data.isAvailable !== false,
          verificationStatus: data.verificationStatus,
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
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleProfilePictureUpload = async (file) => {
    try {
      const result = await doctorsAPI.uploadProfilePicture(file);
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

      await doctorsAPI.updateProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        specialization: formData.specialization,
        bio: formData.bio,
        consultationFee: formData.consultationFee,
        yearsOfExperience: formData.yearsOfExperience,
        languages: formData.languages,
        hospitalAffiliation: formData.hospitalAffiliation,
        education: formData.education,
        qualifications: formData.qualifications,
        consultationTypes: formData.consultationTypes,
        availableForEmergency: formData.availableForEmergency,
        isAvailable: formData.isAvailable
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
      <DoctorLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-500 mt-1">Manage your professional profile</p>
          </div>
          {!isEditing ? (
            <Button icon={Edit2} onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={saving}>
                Cancel
              </Button>
              <Button icon={saving ? Loader2 : Save} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        {/* Availability Toggle Card */}
        <Card className={`border-2 ${formData.isAvailable ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Availability Status</h3>
              <p className="text-sm text-gray-600 mt-1">
                {formData.isAvailable
                  ? 'You are visible to patients and can receive appointment bookings'
                  : 'You are hidden from patient listings and cannot receive new bookings'}
              </p>
            </div>
            <button
              onClick={() => {
                const newValue = !formData.isAvailable;
                setFormData({ ...formData, isAvailable: newValue });
                // Auto-save availability toggle
                doctorsAPI.updateProfile({ isAvailable: newValue })
                  .then(() => {
                    setSuccessMessage(newValue ? 'You are now available for bookings' : 'You are now hidden from patients');
                    setTimeout(() => setSuccessMessage(''), 3000);
                  })
                  .catch((err) => {
                    console.error('Error updating availability:', err);
                    setFormData({ ...formData, isAvailable: !newValue }); // Revert on error
                    setError('Failed to update availability');
                  });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${formData.isAvailable
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-red-500 text-white hover:bg-red-600'
                }`}
            >
              {formData.isAvailable ? (
                <>
                  <ToggleRight className="w-5 h-5" />
                  Available
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5" />
                  Unavailable
                </>
              )}
            </button>
          </div>
        </Card>

        {/* Profile Header Card */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ImageUpload
              currentImage={formData.profilePictureUrl ? `http://localhost:5000${formData.profilePictureUrl}` : null}
              onUpload={handleProfilePictureUpload}
              size="2xl"
              shape="circle"
            />
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{formData.fullName || 'Doctor'}</h2>
              <p className="text-primary-600">{formData.specialization}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                <Badge variant={formData.verificationStatus === 'verified' ? 'success' : 'warning'}>
                  <Shield className="w-3 h-3 mr-1" />
                  {formData.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                </Badge>
                <Badge variant={formData.isAvailable ? 'success' : 'danger'}>
                  {formData.isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
                <Badge variant="primary">
                  <Star className="w-3 h-3 mr-1" />
                  4.9 Rating
                </Badge>
                {formData.yearsOfExperience && (
                  <Badge variant="default">{formData.yearsOfExperience} years exp.</Badge>
                )}
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm text-gray-500">Consultation Fee</p>
              <p className="text-2xl font-bold text-primary-600">{formData.consultationFee || 0} ETB</p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          {[
            { id: 'profile', label: 'Profile Info', icon: User },
            { id: 'credentials', label: 'Credentials', icon: Award },
            { id: 'security', label: 'Security', icon: Shield }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Info Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
              <div className="space-y-4">
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
                  label="Languages"
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Amharic, English, Oromo"
                />
                <Input
                  label="Hospital/Clinic Affiliation"
                  name="hospitalAffiliation"
                  value={formData.hospitalAffiliation}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="St. Paul's Hospital"
                />
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Professional Information</h3>
              <div className="space-y-4">
                <Select
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="General Practitioner">General Practitioner</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="Orthopedic">Orthopedic</option>
                </Select>
                <Input
                  label="License Number"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <Input
                  label="Years of Experience"
                  name="yearsOfExperience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <Input
                  label="Consultation Fee (ETB)"
                  name="consultationFee"
                  type="number"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Biography</h3>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                placeholder="Tell patients about yourself..."
              />
              <div className="mt-4">
                <Input
                  label="Education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Your medical education"
                />
              </div>
            </Card>
          </div>
        )}

        {/* Credentials Tab */}
        {activeTab === 'credentials' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Uploaded Documents</h3>
                <Button variant="outline" size="sm" icon={Upload}>
                  Upload New
                </Button>
              </div>
              <div className="space-y-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{cert.name}</h4>
                        <p className="text-sm text-gray-500">Uploaded: {cert.uploadDate}</p>
                      </div>
                    </div>
                    <Badge variant={cert.status === 'verified' ? 'success' : 'warning'}>
                      {cert.status === 'verified' ? 'Verified' : 'Pending Review'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
              <div className="p-4 bg-success-50 rounded-lg border border-success-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success-500 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-success-900">Profile Verified</p>
                    <p className="text-sm text-success-700">Your credentials have been verified by TilexCare admin team.</p>
                  </div>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">New appointment notifications</p>
                    <p className="text-sm text-gray-500">Get notified when patients book appointments</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-500 rounded" />
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">On-demand requests</p>
                    <p className="text-sm text-gray-500">Get notified for instant consultation requests</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-500 rounded" />
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Payout notifications</p>
                    <p className="text-sm text-gray-500">Get notified when payouts are processed</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-500 rounded" />
                </label>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
