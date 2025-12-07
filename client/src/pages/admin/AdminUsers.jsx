import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Ban,
  Mail,
  UserCheck,
  UserX,
  Loader2,
  AlertCircle,
  Trash2,
  DollarSign,
  Calendar
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Card, Button, Avatar, Badge, Modal, Input, Select } from '../../components/ui';
import { usersAPI } from '../../services/api';

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  const [activeTab, setActiveTab] = useState('patients');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAll();
      setPatients(data.patients || []);
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const users = activeTab === 'patients' ? patients : doctors;

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSuspend = async (user) => {
    try {
      setActionLoading(true);
      await usersAPI.suspendUser(user.id, activeTab === 'doctors' ? 'doctor' : 'patient');
      setShowActionMenu(null);
      setSelectedUser(null);
      fetchData();
    } catch (err) {
      console.error('Error suspending user:', err);
      alert('Failed to suspend user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (user) => {
    try {
      setActionLoading(true);
      await usersAPI.activateUser(user.id, activeTab === 'doctors' ? 'doctor' : 'patient');
      setShowActionMenu(null);
      setSelectedUser(null);
      fetchData();
    } catch (err) {
      console.error('Error activating user:', err);
      alert('Failed to activate user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (user) => {
    try {
      setActionLoading(true);
      await usersAPI.deleteUser(user.id);
      setShowDeleteConfirm(null);
      setSelectedUser(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-gray-600">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage patients and doctors on the platform</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          {[
            { id: 'patients', label: 'Patients', count: patients.length },
            { id: 'doctors', label: 'Doctors', count: doctors.length },
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
              {tab.label}
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === tab.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <Card padding="sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </Card>

        {/* Users Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'patients' ? 'Phone' : 'Specialty'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'patients' ? 'Appointments' : 'Patients'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activeTab === 'patients' ? user.phone : user.specialty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.joinDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activeTab === 'patients' ? user.appointments : user.patients}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={
                        user.status === 'active' ? 'success' :
                        user.status === 'suspended' ? 'danger' : 'warning'
                      }>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="relative">
                        <button
                          onClick={() => setShowActionMenu(showActionMenu === user.id ? null : user.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        {showActionMenu === user.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Mail className="w-4 h-4" />
                              Send Email
                            </button>
                            {user.status === 'active' ? (
                              <button
                                onClick={() => handleSuspend(user)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Ban className="w-4 h-4" />
                                Suspend User
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(user)}
                                className="w-full px-4 py-2 text-left text-sm text-success-600 hover:bg-success-50 flex items-center gap-2"
                              >
                                <UserCheck className="w-4 h-4" />
                                Activate User
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No users found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </Card>
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar name={selectedUser.name} size="xl" />
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{selectedUser.name}</h3>
                <p className="text-gray-500">{selectedUser.email}</p>
                <Badge variant={selectedUser.status === 'active' ? 'success' : 'danger'} className="mt-2">
                  {selectedUser.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Joined</p>
                <p className="font-medium">{selectedUser.joinDate}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  {activeTab === 'patients' ? 'Total Appointments' : 'Total Patients'}
                </p>
                <p className="font-medium">
                  {activeTab === 'patients' ? selectedUser.appointments : selectedUser.patients}
                </p>
              </div>
              {activeTab === 'patients' && (
                <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedUser.phone}</p>
                </div>
              )}
              {activeTab === 'doctors' && (
                <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                  <p className="text-sm text-gray-500">Specialty</p>
                  <p className="font-medium">{selectedUser.specialty}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                className="flex-1" 
                icon={Mail}
                onClick={() => window.location.href = `mailto:${selectedUser.email}`}
              >
                Send Email
              </Button>
              {selectedUser.status === 'active' ? (
                <Button 
                  variant="danger" 
                  className="flex-1" 
                  icon={Ban}
                  onClick={() => handleSuspend(selectedUser)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Suspending...' : 'Suspend User'}
                </Button>
              ) : (
                <Button 
                  variant="success" 
                  className="flex-1" 
                  icon={UserCheck}
                  onClick={() => handleActivate(selectedUser)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Activating...' : 'Activate User'}
                </Button>
              )}
            </div>
            <div className="pt-2">
              <Button 
                variant="danger" 
                className="w-full" 
                icon={Trash2}
                onClick={() => setShowDeleteConfirm(selectedUser)}
              >
                Delete User Permanently
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-800">
              Are you sure you want to permanently delete <strong>{showDeleteConfirm?.name}</strong>? 
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => setShowDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              className="flex-1" 
              icon={Trash2}
              onClick={() => handleDelete(showDeleteConfirm)}
              disabled={actionLoading}
            >
              {actionLoading ? 'Deleting...' : 'Delete User'}
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
