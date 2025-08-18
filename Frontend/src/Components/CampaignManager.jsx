import { useState, useEffect } from 'react';
import { 
  Plus, Send, Edit3, Trash2, Play, Pause, Users, TrendingUp,
  Clock, MessageSquare, Target, BarChart3, Settings, Eye,
  Calendar, CheckCircle, XCircle, AlertCircle, Zap
} from 'lucide-react';

// Mock useAuth hook for demo
const useAuth = () => ({
  apiRequest: async (url, options = {}) => {
    // Mock API responses
    const mockData = {
      '/api/followup/campaigns': { campaigns: [] },
      '/api/followup/templates': { templates: [] },
      '/api/followup/analytics': { 
        total_sent: 1234,
        success_rate: 85.2,
        response_rate: 23.5,
        recent_activity: 45
      },
      '/api/followup/scheduled': { followups: [] }
    };
    
    return {
      ok: true,
      json: async () => mockData[url] || {}
    };
  }
});

const CampaignManager = () => {
  const { apiRequest } = useAuth();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [loading, setLoading] = useState(false);
  
  // Campaign states
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [scheduledFollowups, setScheduledFollowups] = useState([]);
  
  // Modal states
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  
  // Form states
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    platform: 'facebook',
    target_audience: {},
    messages: [],
    active: true
  });
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'missed_inquiry',
    platform: 'facebook',
    delay_hours: 4,
    message_template: '',
    active: true
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCampaigns(),
        fetchTemplates(),
        fetchAnalytics(),
        fetchScheduledFollowups()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await apiRequest('/api/followup/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await apiRequest('/api/followup/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await apiRequest('/api/followup/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchScheduledFollowups = async () => {
    try {
      const response = await apiRequest('/api/followup/scheduled');
      if (response.ok) {
        const data = await response.json();
        setScheduledFollowups(data.followups || []);
      }
    } catch (error) {
      console.error('Error fetching scheduled followups:', error);
    }
  };

  const createCampaign = async () => {
    try {
      const response = await apiRequest('/api/followup/campaigns', {
        method: 'POST',
        body: JSON.stringify(newCampaign)
      });
      
      if (response.ok) {
        await fetchCampaigns();
        setShowCreateCampaign(false);
        resetNewCampaign();
        alert('Campaign created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    }
  };

  const createTemplate = async () => {
    try {
      const response = await apiRequest('/api/followup/templates', {
        method: 'POST',
        body: JSON.stringify(newTemplate)
      });
      
      if (response.ok) {
        await fetchTemplates();
        setShowCreateTemplate(false);
        resetNewTemplate();
        alert('Template created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template');
    }
  };

  const toggleCampaignStatus = async (campaignId, currentStatus) => {
    try {
      const response = await apiRequest(`/api/followup/campaigns/${campaignId}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !currentStatus })
      });
      
      if (response.ok) {
        await fetchCampaigns();
      }
    } catch (error) {
      console.error('Error updating campaign status:', error);
    }
  };

  const resetNewCampaign = () => {
    setNewCampaign({
      name: '',
      description: '',
      platform: 'facebook',
      target_audience: {},
      messages: [],
      active: true
    });
  };

  const resetNewTemplate = () => {
    setNewTemplate({
      name: '',
      type: 'missed_inquiry',
      platform: 'facebook',
      delay_hours: 4,
      message_template: '',
      active: true
    });
  };

  const addMessageToCampaign = () => {
    const newMessage = {
      sequence: newCampaign.messages.length + 1,
      delay_hours: 0,
      content: '',
      subject: ''
    };
    setNewCampaign({
      ...newCampaign,
      messages: [...newCampaign.messages, newMessage]
    });
  };

  const updateCampaignMessage = (index, field, value) => {
    const updatedMessages = [...newCampaign.messages];
    updatedMessages[index][field] = value;
    setNewCampaign({
      ...newCampaign,
      messages: updatedMessages
    });
  };

  const removeCampaignMessage = (index) => {
    const updatedMessages = newCampaign.messages.filter((_, i) => i !== index);
    setNewCampaign({
      ...newCampaign,
      messages: updatedMessages
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'facebook': return '📘';
      case 'whatsapp': return '💬';
      case 'instagram': return '📷';
      case 'email': return '📧';
      case 'sms': return '📱';
      default: return '💬';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.total_sent || 0}</p>
            </div>
            <Send className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.success_rate?.toFixed(1) || 0}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.response_rate?.toFixed(1) || 0}%</p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Activity</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.recent_activity || 0}</p>
            </div>
            <Zap className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recent Follow-ups */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Follow-ups</h3>
          <span className="text-sm text-gray-500">{scheduledFollowups.length} scheduled</span>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {scheduledFollowups.slice(0, 10).map((followup) => (
            <div key={followup.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getPlatformIcon(followup.platform)}</span>
                  <div>
                <label className="block text-sm font-medium text-gray-700">Template Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Missed Inquiry Follow-up"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Template Type</label>
                  <select
                    value={newTemplate.type}
                    onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="missed_inquiry">Missed Inquiry</option>
                    <option value="follow_up">General Follow-up</option>
                    <option value="welcome">Welcome Message</option>
                    <option value="abandoned_cart">Abandoned Cart</option>
                    <option value="feedback_request">Feedback Request</option>
                    <option value="promotional">Promotional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Platform</label>
                  <select
                    value={newTemplate.platform}
                    onChange={(e) => setNewTemplate({...newTemplate, platform: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Delay (hours)</label>
                <input
                  type="number"
                  value={newTemplate.delay_hours}
                  onChange={(e) => setNewTemplate({...newTemplate, delay_hours: parseInt(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  placeholder="4"
                />
                <p className="mt-1 text-sm text-gray-500">
                  How many hours after the trigger event should this message be sent?
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Message Template</label>
                <textarea
                  value={newTemplate.message_template}
                  onChange={(e) => setNewTemplate({...newTemplate, message_template: e.target.value})}
                  rows={6}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hi {name}, I noticed you were interested in our services but we didn't get a chance to connect. Would you like to schedule a quick call to discuss how we can help you?"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Use {name}, {company}, {product} for personalization
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="template-active"
                  checked={newTemplate.active}
                  onChange={(e) => setNewTemplate({...newTemplate, active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="template-active" className="ml-2 block text-sm text-gray-900">
                  Activate template immediately
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowCreateTemplate(false);
                  resetNewTemplate();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={createTemplate}
                disabled={!newTemplate.name || !newTemplate.message_template}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      
    )
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics & Performance</h2>
      
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Campaign Performance</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.success_rate?.toFixed(1) || 0}%</p>
              <p className="text-sm text-green-600">↗ 12% from last month</p>
            </div>
            <BarChart3 className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-3xl font-bold text-gray-900">{campaigns.filter(c => c.active).length}</p>
              <p className="text-sm text-gray-600">of {campaigns.length} total</p>
            </div>
            <Target className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Volume</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.total_sent || 0}</p>
              <p className="text-sm text-blue-600">messages sent</p>
            </div>
            <Send className="h-12 w-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Platform</h3>
        <div className="space-y-4">
          {['facebook', 'whatsapp', 'email', 'sms'].map((platform) => (
            <div key={platform} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getPlatformIcon(platform)}</span>
                <div>
                  <p className="font-medium text-gray-900 capitalize">{platform}</p>
                  <p className="text-sm text-gray-600">
                    {Math.floor(Math.random() * 500) + 100} messages sent
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {(Math.random() * 30 + 70).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">success rate</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Send className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Campaign "Welcome Series" sent to 25 new subscribers
                </p>
                <p className="text-sm text-gray-500">
                  {Math.floor(Math.random() * 60) + 1} minutes ago
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Delivered
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Campaign Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto-send campaigns</p>
                <p className="text-sm text-gray-600">Automatically send scheduled messages</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email notifications</p>
                <p className="text-sm text-gray-600">Get notified of campaign performance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default sending time zone
              </label>
              <select className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC-8 (Pacific Time)</option>
                <option>UTC+0 (Greenwich Mean Time)</option>
                <option>UTC+1 (Central European Time)</option>
              </select>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Integration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://your-app.com/webhook"
              />
              <p className="text-sm text-gray-500 mt-1">
                Receive real-time updates about campaign events
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Rate Limit
              </label>
              <select className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>100 requests/minute</option>
                <option>500 requests/minute</option>
                <option>1000 requests/minute</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                Regenerate API Key
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max retry attempts
            </label>
            <input
              type="number"
              min="1"
              max="5"
              defaultValue="3"
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retry delay (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              defaultValue="5"
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch size
            </label>
            <select className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>50 messages</option>
              <option>100 messages</option>
              <option>200 messages</option>
              <option>500 messages</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archive campaigns after
            </label>
            <select className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>30 days</option>
              <option>60 days</option>
              <option>90 days</option>
              <option>Never</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Campaign Manager</h1>
          <p className="text-gray-600 mt-2">
            Manage your drip campaigns and automated follow-up messages
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'campaigns', label: 'Campaigns', icon: Target },
              { id: 'templates', label: 'Templates', icon: MessageSquare },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-3 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-gray-100 min-h-96">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'campaigns' && renderCampaigns()}
              {activeTab === 'templates' && renderTemplates()}
              {activeTab === 'analytics' && renderAnalytics()}
              {activeTab === 'settings' && renderSettings()}
            </>
          )}
        </div>

        {/* Modals */}
        {renderCreateCampaignModal()}
        {renderCreateTemplateModal()}
      </div>
    </div>
    </div>
    </div>
    
  );
};

export default CampaignManager;
                    