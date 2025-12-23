import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Calendar,
  CalendarCheck,
  FileText,
  User,
  Headphones,
  Bell,
  Menu,
  X,
  LogOut,
  Stethoscope,
  ChevronDown,
  Search,
  Settings
} from 'lucide-react';
import { Avatar, Button } from '../ui';

const navigation = [
  { name: 'Dashboard', href: '/patient', icon: LayoutDashboard },
  { name: 'Book Appointment', href: '/patient/book', icon: Calendar },
  { name: 'My Appointments', href: '/patient/appointments', icon: CalendarCheck },
  { name: 'Prescriptions', href: '/patient/prescriptions', icon: FileText },
  { name: 'My Profile', href: '/patient/profile', icon: User },
  { name: 'Support', href: '/patient/support', icon: Headphones },
];

export default function PatientLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={clsx(
          "fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link to="/patient" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gray-900 tracking-tight">TilexCare</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden ml-auto p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-white">
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            <div className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Menu
            </div>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className={clsx("w-5 h-5 transition-colors", isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600")} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User Profile Snippet (Bottom Sidebar) */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <Avatar name={user.fullName || 'User'} size="sm" className="bg-primary-100 text-primary-700" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.fullName || 'Patient Account'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email || 'patient@tilexcare.com'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search (Optional placeholder for now) */}
            <div className="hidden sm:flex items-center max-w-md">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search for doctors, specialists..."
                  className="pl-10 pr-4 py-2 w-64 bg-gray-100/50 border-transparent focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-primary-50 rounded-xl text-sm transition-all duration-200 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl hover:text-primary-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            <div className="hidden md:flex items-center pl-3 border-l border-gray-200">
              <div className="text-right mr-3 hidden lg:block">
                <p className="text-sm font-medium text-gray-900">{user.fullName || 'Patient'}</p>
                <p className="text-xs text-gray-500">ID: {user._id?.slice(-6).toUpperCase() || 'P-001'}</p>
              </div>
              <Avatar name={user.fullName} size="md" className="ring-2 ring-transparent hover:ring-primary-100 transition-all cursor-pointer" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
