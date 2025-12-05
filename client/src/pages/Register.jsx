import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Mail, Lock, User, Stethoscope, Award, Eye, EyeOff, Check } from 'lucide-react';
import { Button, Input, Select } from '../components/ui';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    fullName: '',
    specialization: '',
    licenseNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (response.ok) {
        navigate('/login', { state: { message: 'Registration successful! Please login.' } });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-500 to-primary-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Heart className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="text-3xl font-bold text-white">TilexCare</h1>
          <p className="text-white/80 mt-2">Join our healthcare community</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-500' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200'
              }`}>
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm font-medium hidden sm:inline">Account Type</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200">
              <div className={`h-full bg-primary-500 transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-500' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="text-sm font-medium hidden sm:inline">Details</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 text-center mb-4">I want to join as a...</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('patient')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      formData.role === 'patient'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <User className={`w-10 h-10 mx-auto mb-3 ${
                      formData.role === 'patient' ? 'text-primary-500' : 'text-gray-400'
                    }`} />
                    <p className="font-semibold text-gray-900">Patient</p>
                    <p className="text-xs text-gray-500 mt-1">Book appointments & consultations</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('doctor')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      formData.role === 'doctor'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Stethoscope className={`w-10 h-10 mx-auto mb-3 ${
                      formData.role === 'doctor' ? 'text-primary-500' : 'text-gray-400'
                    }`} />
                    <p className="font-semibold text-gray-900">Doctor</p>
                    <p className="text-xs text-gray-500 mt-1">Provide consultations</p>
                  </button>
                </div>

                <Button type="button" className="w-full mt-6" size="lg" onClick={handleNext}>
                  Continue
                </Button>
              </div>
            )}

            {/* Step 2: Account Details */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 text-center mb-4">
                  {formData.role === 'doctor' ? 'Doctor Registration' : 'Create Your Account'}
                </h2>

                <Input
                  label="Full Name"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  icon={User}
                  required
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={Mail}
                  required
                />

                <div className="relative">
                  <Input
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    icon={Lock}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  icon={Lock}
                  required
                />

                {formData.role === 'doctor' && (
                  <>
                    <Select
                      label="Specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select specialization</option>
                      <option value="General Practitioner">General Practitioner</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Pediatrician">Pediatrician</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Gynecologist">Gynecologist</option>
                      <option value="Orthopedic">Orthopedic</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Psychiatrist">Psychiatrist</option>
                    </Select>

                    <Input
                      label="License Number"
                      name="licenseNumber"
                      placeholder="Enter your medical license number"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      icon={Award}
                      required
                    />

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                      <strong>Note:</strong> Your account will be reviewed by our admin team before activation. 
                      You'll need to upload your credentials after registration.
                    </div>
                  </>
                )}

                <div className="flex items-start gap-2 mt-4">
                  <input type="checkbox" className="w-4 h-4 mt-1 text-primary-500 rounded" required />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <a href="#" className="text-primary-500 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary-500 hover:underline">Privacy Policy</a>
                  </span>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button type="button" variant="secondary" className="flex-1" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" loading={loading}>
                    Create Account
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/80 text-sm mt-8">
          © 2025 TilexCare. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;
