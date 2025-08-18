import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { 
  Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, Clock, 
  Users, TrendingUp, Calendar, Play, Pause, Download,
  Settings, Plus, Search, Filter, BarChart3, Globe,
  Mic, MicOff, Volume2, VolumeX, Star, MapPin
} from 'lucide-react';

const CallCenter = () => {
  const { apiRequest, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [callLogs, setCallLogs] = useState([]);
  const [analytics, setAnalytics] = useState({
    total_calls: 0,
    answered_calls: 0,
    missed_calls: 0,
    avg_call_duration: 0,
    total_bookings: 0,
    lead_conversion_rate: 0,
    today_calls: 0,
    answer_rate: 0
  });
  const [voiceConfig, setVoiceConfig] = useState({
    phone_number: '',
    transfer_number: '',
    business_hours: {},
    welcome_message: '',
    after_hours_message: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [playingRecording, setPlayingRecording] = useState(null);

  useEffect(() => {
    fetchCallLogs();
    fetchAnalytics();
    fetchVoiceConfig();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchCallLogs();
      fetchAnalytics();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchCallLogs = async () => {
    try {
      const response = await apiRequest('/api/voice/call-logs?limit=100');
      if (response.ok) {
        const data = await response.json();
        setCallLogs(data.calls || []);
      }
    } catch (error) {
      console.error('Error fetching call logs:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await apiRequest('/api/voice/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchVoiceConfig = async () => {
    try {
      const response = await apiRequest('/api/voice/config');
      if (response.ok) {
        const data = await response.json();
        setVoiceConfig(data.config || {});
      }
    } catch (error) {
      console.error('Error fetching voice config:', error);
    }
  };

  const makeOutboundCall = async (phoneNumber, message) => {
    try {
      setLoading(true);
      const response = await apiRequest('/api/voice/outbound-call', {
        method: 'POST',
        body: JSON.stringify({
          to_number: phoneNumber,
          message: message,
          language: 'en'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Call initiated! Call SID: ${data.call_sid}`);
        fetchCallLogs();
      } else {
        alert('Failed to make call');
      }
    } catch (error) {
      console.error('Error making call:', error);
      alert('Error making call');
    } finally {
      setLoading(false);
    }
  };

  const updateVoiceConfig = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/api/voice/config', {
        method: 'POST',
        body: JSON.stringify(voiceConfig)
      });
      
      if (response.ok) {
        alert('Voice configuration updated successfully!');
      } else {
        alert('Failed to update configuration');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Error updating configuration');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStatusIcon = (status, direction) => {
    if (direction === 'inbound') {
      switch (status) {
        case 'completed': return <PhoneIncoming className="w-4 h-4 text-green-600" />;
        case 'no-answer': return <PhoneIncoming className="w-4 h-4 text-yellow-600" />;
        case 'busy': return <PhoneIncoming className="w-4 h-4 text-red-600" />;
        default: return <PhoneIncoming className="w-4 h-4 text-gray-600" />;
      }
    } else {
      switch (status) {
        case 'completed': return <PhoneOutgoing className="w-4 h-4 text-green-600" />;
        case 'no-answer': return <PhoneOutgoing className="w-4 h-4 text-yellow-600" />;
        case 'busy': return <PhoneOutgoing className="w-4 h-4 text-red-600" />;
        default: return <PhoneOutgoing className="w-4 h-4 text-gray-600" />;
      }
    }
  };

  const getCallStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'no-answer': return 'bg-yellow-100 text-yellow-800';
      case 'busy': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Calls</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.total_calls}</p>
              <p className="text-xs text-blue-600 mt-1">{analytics.today_calls} today</p>
            </div>
            <Phone className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Answer Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.answer_rate}%</p>
              <p className="text-xs text-green-600 mt-1">{analytics.answered_calls} answered</p>
            </div>
            <PhoneCall className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(analytics.avg_call_duration)}</p>
              <p className="text-xs text-purple-600 mt-1">per call</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.total_bookings}</p>
              <p className="text-xs text-yellow-600 mt-1">{analytics.lead_conversion_rate}% conversion</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Real-time Call Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Center Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="font-medium text-green-800">Voice AI Online</p>
              <p className="text-sm text-green-600">Ready to handle calls</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <Globe className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Languages: EN, AR</p>
              <p className="text-sm text-blue-600">Bilingual support active</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-purple-800">AI Performance</p>
              <p className="text-sm text-purple-600">95% accuracy rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Calls */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Calls</h3>
          <button 
            onClick={() => setActiveTab('calls')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {callLogs.slice(0, 5).map((call) => (
            <div key={call.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getCallStatusIcon(call.status, call.direction)}
                  <div>
                    <p className="font-medium text-gray-900">{call.from_number}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(call.started_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getCallStatusColor(call.status)}`}>
                    {call.status}
                  </span>
                  {call.duration && (
                    <span className="text-sm text-gray-500">{formatDuration(call.duration)}</span>
                  )}
                  {call.lead_score > 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Lead: {call.lead_score}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCallLogs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Call Logs</h2>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Call Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Call Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {callLogs.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getCallStatusIcon(call.status, call.direction)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {call.direction === 'inbound' ? call.from_number : call.to_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(call.started_at).toLocaleString()}
                        </div>
                        {call.caller_location && (
                          <div className="text-xs text-gray-400 flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {call.caller_location.country_code}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.duration ? formatDuration(call.duration) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getCallStatusColor(call.status)}`}>
                      {call.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center">
                      <Globe className="w-4 h-4 mr-1 text-gray-400" />
                      {call.language_detected?.toUpperCase() || 'EN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {call.lead_score > 0 ? (
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          call.lead_score >= 80 ? 'bg-green-100 text-green-800' :
                          call.lead_score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {call.lead_score}%
                        </span>
                        {call.lead_score >= 80 && <Star className="w-4 h-4 text-yellow-400 ml-1" />}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {call.recording_url && (
                        <button
                          onClick={() => setPlayingRecording(playingRecording === call.id ? null : call.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Play Recording"
                        >
                          {playingRecording === call.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                      )}
                      {call.transcript && (
                        <button
                          className="text-green-600 hover:text-green-800"
                          title="View Transcript"
                          onClick={() => alert(call.transcript)}
                        >
                          📝
                        </button>
                      )}
                      {call.booking_created && (
                        <button
                          className="text-purple-600 hover:text-purple-800"
                          title="View Booking"
                        >
                          📅
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderConfiguration = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Voice AI Configuration</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phone Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phone Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Phone Number
              </label>
              <input
                type="text"
                value={voiceConfig.phone_number}
                onChange={(e) => setVoiceConfig({...voiceConfig, phone_number: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Human Transfer Number (Optional)
              </label>
              <input
                type="text"
                value={voiceConfig.transfer_number}
                onChange={(e) => setVoiceConfig({...voiceConfig, transfer_number: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
              />
            </div>
          </div>
        </div>

        {/* AI Messages */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Messages</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Message
              </label>
              <textarea
                value={voiceConfig.welcome_message}
                onChange={(e) => setVoiceConfig({...voiceConfig, welcome_message: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Thank you for calling! How can I help you today?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                After Hours Message
              </label>
              <textarea
                value={voiceConfig.after_hours_message}
                onChange={(e) => setVoiceConfig({...voiceConfig, after_hours_message: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="We're currently closed. Please leave a message..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
            <div key={day} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 capitalize">{day}</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={voiceConfig.business_hours?.[day]?.open || false}
                    onChange={(e) => setVoiceConfig({
                      ...voiceConfig,
                      business_hours: {
                        ...voiceConfig.business_hours,
                        [day]: {
                          ...voiceConfig.business_hours?.[day],
                          open: e.target.checked
                        }
                      }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Open</span>
                </label>
              </div>
              
              {voiceConfig.business_hours?.[day]?.open && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={voiceConfig.business_hours?.[day]?.start || '09:00'}
                      onChange={(e) => setVoiceConfig({
                        ...voiceConfig,
                        business_hours: {
                          ...voiceConfig.business_hours,
                          [day]: {
                            ...voiceConfig.business_hours?.[day],
                            start: e.target.value
                          }
                        }
                      })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Time</label>
                    <input
                      type="time"
                      value={voiceConfig.business_hours?.[day]?.end || '17:00'}
                      onChange={(e) => setVoiceConfig({
                        ...voiceConfig,
                        business_hours: {
                          ...voiceConfig.business_hours,
                          [day]: {
                            ...voiceConfig.business_hours?.[day],
                            end: e.target.value
                          }
                        }
                      })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={updateVoiceConfig}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          <span>Save Configuration</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'calls', label: 'Call Logs', icon: Phone },
              { id: 'config', label: 'Configuration', icon: Settings }
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'calls' && renderCallLogs()}
        {activeTab === 'config' && renderConfiguration()}
      </div>
    </div>
  );
};

export default CallCenter;