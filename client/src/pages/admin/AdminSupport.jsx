import { useState } from 'react';
import {
  MessageSquare,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  Send,
  Filter
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Card, Button, Badge, Avatar, Input, Select } from '../../components/ui';

// Support tickets - placeholder until support system is implemented
// In production, these would come from a support tickets API
const tickets = [];

export default function AdminSupport() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const config = {
      open: { variant: 'warning', label: 'Open' },
      in_progress: { variant: 'primary', label: 'In Progress' },
      resolved: { variant: 'success', label: 'Resolved' },
      closed: { variant: 'secondary', label: 'Closed' }
    };
    const { variant, label } = config[status] || config.open;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: { variant: 'danger', label: 'High' },
      medium: { variant: 'warning', label: 'Medium' },
      low: { variant: 'secondary', label: 'Low' }
    };
    const { variant, label } = config[priority] || config.low;
    return <Badge variant={variant} size="sm">{label}</Badge>;
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support</h1>
            <p className="text-gray-500 mt-1">Manage support tickets and user inquiries</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card padding="sm" className="text-center">
            <MessageSquare className="w-6 h-6 text-primary-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Tickets</p>
          </Card>
          <Card padding="sm" className="text-center">
            <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
            <p className="text-sm text-gray-500">Open</p>
          </Card>
          <Card padding="sm" className="text-center">
            <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            <p className="text-sm text-gray-500">In Progress</p>
          </Card>
          <Card padding="sm" className="text-center">
            <CheckCircle className="w-6 h-6 text-success-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
            <p className="text-sm text-gray-500">Resolved</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <Card>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-40"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </Select>
              </div>
            </Card>

            {/* Tickets */}
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className={`cursor-pointer transition-all ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-primary-500' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Avatar name={ticket.user.name} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{ticket.user.name} • {ticket.user.role}</p>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-1">{ticket.lastMessage}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {getStatusBadge(ticket.status)}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredTickets.length === 0 && (
                <Card className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No tickets found</p>
                </Card>
              )}
            </div>
          </div>

          {/* Ticket Detail */}
          <Card className="h-fit">
            {selectedTicket ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Ticket Details</h2>
                  {getStatusBadge(selectedTicket.status)}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Subject</p>
                    <p className="font-medium">{selectedTicket.subject}</p>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar name={selectedTicket.user.name} size="md" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedTicket.user.name}</p>
                      <p className="text-sm text-gray-500">{selectedTicket.user.email}</p>
                      <Badge variant="secondary" size="sm" className="mt-1">
                        {selectedTicket.user.role}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Last Message</p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{selectedTicket.lastMessage}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Reply</p>
                    <textarea
                      className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={4}
                      placeholder="Type your reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" icon={Send}>
                      Send Reply
                    </Button>
                    <Button variant="outline">
                      Close Ticket
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a ticket to view details</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
