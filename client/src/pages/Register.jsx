import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Mail, Lock, User, Stethoscope, Award, Eye, EyeOff, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
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
    if (step === 1) setStep(2);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
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
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Branding & Visual */}
      <div className="hidden lg:flex relative bg-primary-600 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542736667-069246bdbc6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-900/90 backdrop-blur-sm"></div>

        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold mb-6 leading-tight">
            Join the TilexCare <br /> Community.
          </h1>
          <p className="text-primary-100 text-lg mb-8 leading-relaxed">
            Create your account today to access premium healthcare services, connect with verified doctors, and take control of your well-being.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <User className="w-8 h-8 text-secondary-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">For Patients</h3>
              <p className="text-sm text-primary-200">Find doctors & book appointments instantly.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <Stethoscope className="w-8 h-8 text-secondary-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">For Doctors</h3>
              <p className="text-sm text-primary-200">Manage your practice & reach more patients.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Register Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden inline-flex w-12 h-12 bg-primary-50 rounded-xl items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 font-display">Create Account</h2>
            <p className="mt-2 text-gray-500">
              {step === 1 ? 'Choose how you want to join us.' : 'Please fill in your details.'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className={`h-2 rounded-full flex-1 transition-all duration-300 ${step >= 1 ? 'bg-primary-500' : 'bg-gray-100'}`} />
            <div className={`h-2 rounded-full flex-1 transition-all duration-300 ${step >= 2 ? 'bg-primary-500' : 'bg-gray-100'}`} />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('patient')}
                    className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group ${formData.role === 'patient'
                      ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${formData.role === 'patient' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-white'
                      }`}>
                      <User className="w-6 h-6" />
                    </div>
                    <h3 className={`font-semibold ${formData.role === 'patient' ? 'text-primary-900' : 'text-gray-900'}`}>Patient</h3>
                    <p className="text-xs text-gray-500 mt-1">I want to book appointments</p>
                    {formData.role === 'patient' && (
                      <div className="absolute top-4 right-4 text-primary-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('doctor')}
                    className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group ${formData.role === 'doctor'
                      ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${formData.role === 'doctor' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-white'
                      }`}>
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <h3 className={`font-semibold ${formData.role === 'doctor' ? 'text-primary-900' : 'text-gray-900'}`}>Doctor</h3>
                    <p className="text-xs text-gray-500 mt-1">I want to treat patients</p>
                    {formData.role === 'doctor' && (
                      <div className="absolute top-4 right-4 text-primary-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                </div>

                <Button type="button" size="xl" className="w-full mt-6" onClick={handleNext}>
                  Continue <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <Input
                  label="Full Name"
                  name="fullName"
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  icon={User}
                  required
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  icon={Mail}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="******"
                      value={formData.password}
                      onChange={handleChange}
                      icon={Lock}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[2.2rem] text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <Input
                    label="Confirm"
                    name="confirmPassword"
                    type="password"
                    placeholder="******"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    icon={Lock}
                    required
                  />
                </div>

                {formData.role === 'doctor' && (
                  <div className="p-5 bg-gray-50 rounded-2xl space-y-4 border border-gray-100">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary-500" />
                      Professional Details
                    </h4>
                    <Select
                      label="Specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select your specialty</option>
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
                      label="Medical License Number"
                      name="licenseNumber"
                      placeholder="License ID"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      icon={Award}
                      required
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={handleBack} className="px-6">
                    Back
                  </Button>
                  <Button type="submit" size="xl" className="flex-1 shadow-lg shadow-primary-500/25" loading={loading}>
                    Create Account
                  </Button>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
