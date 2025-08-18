import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { 
  Calendar, Clock, User, Phone, Mail, CheckCircle, 
  XCircle, RefreshCw, Plus, Settings, Filter, Download 
} from 'lucide-react';

const BookingManager = () => {
  const { apiRequest } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');
  const [bookings, setBookings] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchBookings();
    checkCalendarConnection();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/api/booking/list');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCalendarConnection = async () => {
    try {
      const response = await apiRequest('/api/booking/status');
      if (response.ok) {
        const data = await response.json();
        setCalendarConnected(data.connected || false);
      }
    } catch (error) {
      console.error('Error checking calendar connection:', error);
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      const response = await apiRequest('/api/booking/auth/google');
      if (response.ok) {
        const data = await response.json();
        window.open(data.authorization_url, '_blank');
      }
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
    }
  };

  const checkAvailability = async (date) => {
    try {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59);

      const response = await apiRequest(
        `/api/booking/availability?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setAvailability(data.slots || []);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await apiRequest(`/api/booking/${bookingId}/cancel`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        fetchBookings();
        alert('Booking cancelled successfully');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  const renderCalendarConnection = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Google Calendar Integration</h3>
            <p className="text-sm text-gray-600">
              {calendarConnected ? 'Connected and syncing' : 'Connect to enable booking system'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {calendarConnected ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          ) : (
            <button
              onClick={connectGoogleCalendar}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Connect Calendar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderBookingsList = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Bookings</h3>
        <div className="flex items-center space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={fetchBookings}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.customer_name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        {booking.customer_email && (
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {booking.customer_email}
                          </span>
                        )}
                        {booking.customer_phone && (
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {booking.customer_phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.service_type}</div>
                  <div className="text-sm text-gray-500">{booking.duration_minutes} minutes</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDateTime(booking.appointment_date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button className="text-blue-600 hover:text-blue-900">
                      View
                    </button>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No bookings found</p>
            <p className="text-sm mt-1">
              {calendarConnected 
                ? 'Bookings will appear here when customers make appointments'
                : 'Connect your Google Calendar to start accepting bookings'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAvailabilityCalendar = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Availability Calendar</h3>
        <button
          onClick={() => checkAvailability(selectedDate)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Check Availability</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Select Date</h4>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Available Time Slots</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availability.length > 0 ? (
              availability.map((slot, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    slot.available 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {new Date(slot.start_time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {new Date(slot.end_time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      slot.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {slot.available ? 'Available' : 'Booked'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                Select a date and click "Check Availability" to see time slots
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Settings</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Booking Duration
          </label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2">
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
            <option value="120">2 hours</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Hours
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Time</label>
              <input
                type="time"
                defaultValue="09:00"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Time</label>
              <input
                type="time"
                defaultValue="17:00"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Services
          </label>
          <div className="space-y-2">
            {['Consultation', 'Product Demo', 'Support Call', 'Training Session'].map(service => (
              <div key={service} className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">{service}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
              <p className="text-gray-600">Manage appointments and calendar integration</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <div className="text-sm text-gray-500">
                {bookings.length} total bookings
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'calendar', label: 'Calendar', icon: Calendar },
              { id: 'bookings', label: 'Bookings', icon: Clock },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderCalendarConnection()}
        
        {activeTab === 'calendar' && renderAvailabilityCalendar()}
        {activeTab === 'bookings' && renderBookingsList()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default BookingManager;