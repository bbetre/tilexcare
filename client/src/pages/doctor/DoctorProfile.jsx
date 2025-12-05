import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Award,
  FileText,
  Camera,
  Save,
  Edit2,
  Upload,
  Shield,
  Star
} from 'lucide-react';
import { DoctorLayout } from '../../components/layout';
import { Card, Button, Avatar, Input, Select, Textarea, Badge } from '../../components/ui';

export default function DoctorProfile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [formData, setFormData] = useState({
    fullName: 'Dr. Abebe Kebede',
    email: user.email || 'abebe@tilexcare.com',
    phone: '+251 91 234 5678',
    specialization: 'General Practitioner',
    licenseNumber: 'ETH-MED-2015-1234',
    experience: '10',
    bio: 'Experienced general practitioner with over 10 years of experience in primary care. Specialized in preventive medicine and chronic disease management. Committed to providing compassionate, patient-centered care.',
    education: 'MD, Addis Ababa University School of Medicine',
    languages: 'Amharic, English, Oromo',
    consultationFee: '500'
  });

  const [certificates, setCertificates] = useState([
    { id: '1', name: 'Medical License', status: 'verified', uploadDate: '2024-01-15' },
    { id: '2', name: 'Board Certification', status: 'verified', uploadDate: '2024-01-15' },
    { id: '3', name: 'CPR Certification', status: 'pending', uploadDate: '2024-06-20' },
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
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
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button icon={Save} onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Profile Header Card */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar name={formData.fullName} size="2xl" />
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{formData.fullName}</h2>
              <p className="text-primary-600">{formData.specialization}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                <Badge variant="success">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
                <Badge variant="primary">
                  <Star className="w-3 h-3 mr-1" />
                  4.9 Rating
                </Badge>
                <Badge variant="default">{formData.experience} years exp.</Badge>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm text-gray-500">Consultation Fee</p>
              <p className="text-2xl font-bold text-primary-600">{formData.consultationFee} ETB</p>
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
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
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
                  disabled={!isEditing}
                  icon={Mail}
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={Phone}
                />
                <Input
                  label="Languages"
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  disabled={!isEditing}
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
                  name="experience"
                  type="number"
                  value={formData.experience}
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
