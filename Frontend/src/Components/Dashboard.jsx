// import { useState, useEffect } from 'react';
// import { useAuth } from '../app';
// import { 
//   Users, MessageSquare, TrendingUp, Bell, Plus, 
//   Facebook, MessageCircle, Instagram, Phone,
//   Eye, EyeOff, Trash2, Settings, Star, RefreshCw,
//   CheckCircle, XCircle, Clock, AlertCircle
// } from 'lucide-react';

// const Dashboard = () => {
//   const { user, apiRequest } = useAuth();
//   const [activeTab, setActiveTab] = useState('overview');
//   const [loading, setLoading] = useState(false);
  
//   // Data states
//   const [accounts, setAccounts] = useState([]);
//   const [conversations, setConversations] = useState([]);
//   const [leads, setLeads] = useState([]);
//   const [analytics, setAnalytics] = useState({
//     total_accounts: 0,
//     total_conversations: 0,
//     unread_messages: 0,
//     qualified_leads: 0,
//     today_messages: 0,
//     today_leads: 0,
//     platform_breakdown: [],
//     response_rate: 95,
//     avg_response_time: "< 1 minute"
//   });

//   // Modal states
//   const [showAddAccount, setShowAddAccount] = useState(false);
//   const [accountValidating, setAccountValidating] = useState(false);
//   const [newAccount, setNewAccount] = useState({
//     platform: 'facebook',
//     account_name: '',
//     account_id: '',
//     access_token: '',
//     webhook_verify_token: '',
//     page_id: '',
//     business_phone_number: ''
//   });

//   useEffect(() => {
//     fetchAllData();
    
//     // Refresh data every 30 seconds
//     const interval = setInterval(fetchAllData, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchAllData = async () => {
//     try {
//       await Promise.all([
//         fetchAccounts(),
//         fetchConversations(),
//         fetchLeads(),
//         fetchAnalytics()
//       ]);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };

//   const fetchAccounts = async () => {
//     try {
//       const response = await apiRequest('/api/accounts');
//       if (response.ok) {
//         const data = await response.json();
//         setAccounts(data.accounts || []);
//       }
//     } catch (error) {
//       console.error('Error fetching accounts:', error);
//     }
//   };

//   const fetchConversations = async () => {
//     try {
//       const response = await apiRequest('/api/conversations?limit=20');
//       if (response.ok) {
//         const data = await response.json();
//         setConversations(data.conversations || []);
//       }
//     } catch (error) {
//       console.error('Error fetching conversations:', error);
//     }
//   };

//   const fetchLeads = async () => {
//     try {
//       const response = await apiRequest('/api/leads');
//       if (response.ok) {
//         const data = await response.json();
//         setLeads(data.leads || []);
//       }
//     } catch (error) {
//       console.error('Error fetching leads:', error);
//     }
//   };

//   const fetchAnalytics = async () => {
//     try {
//       const response = await apiRequest('/api/analytics/dashboard');
//       if (response.ok) {
//         const data = await response.json();
//         setAnalytics(data);
//       }
//     } catch (error) {
//       console.error('Error fetching analytics:', error);
//     }
//   };

//   const addAccount = async () => {
//     setAccountValidating(true);
//     try {
//       const response = await apiRequest('/api/accounts', {
//         method: 'POST',
//         body: JSON.stringify(newAccount)
//       });
      
//       if (response.ok) {
//         await fetchAccounts();
//         await fetchAnalytics();
//         setShowAddAccount(false);
//         resetNewAccount();
        
//         // Show success message
//         alert('Account connected successfully!');
//       } else {
//         const error = await response.json();
//         alert(`Error: ${error.detail}`);
//       }
//     } catch (error) {
//       console.error('Error adding account:', error);
//       alert('Failed to connect account. Please check your credentials.');
//     } finally {
//       setAccountValidating(false);
//     }
//   };

//   const removeAccount = async (accountId) => {
//     if (!confirm('Are you sure you want to remove this account? This will archive all conversations.')) {
//       return;
//     }

//     try {
//       const response = await apiRequest(`/api/accounts/${accountId}`, {
//         method: 'DELETE'
//       });
      
//       if (response.ok) {
//         await fetchAccounts();
//         await fetchAnalytics();
//         alert('Account removed successfully');
//       } else {
//         alert('Failed to remove account');
//       }
//     } catch (error) {
//       console.error('Error removing account:', error);
//       alert('Failed to remove account');
//     }
//   };

//   const markConversationRead = async (conversationId) => {
//     try {
//       const response = await apiRequest(`/api/conversations/${conversationId}/mark-read`, {
//         method: 'POST'
//       });
      
//       if (response.ok) {
//         await fetchConversations();
//         await fetchAnalytics();
//       }
//     } catch (error) {
//       console.error('Error marking conversation as read:', error);
//     }
//   };

//   const updateLeadStatus = async (leadId, newStatus) => {
//     try {
//       const response = await apiRequest(`/api/leads/${leadId}`, {
//         method: 'PUT',
//         body: JSON.stringify({ status: newStatus })
//       });
      
//       if (response.ok) {
//         await fetchLeads();
//         await fetchAnalytics();
//       }
//     } catch (error) {
//       console.error('Error updating lead:', error);
//     }
//   };

//   const resetNewAccount = () => {
//     setNewAccount({
//       platform: 'facebook',
//       account_name: '',
//       account_id: '',
//       access_token: '',
//       webhook_verify_token: '',
//       page_id: '',
//       business_phone_number: ''
//     });
//   };

//   const getPlatformIcon = (platform) => {
//     switch (platform) {
//       case 'facebook': return <Facebook className="w-5 h-5 text-blue-600" />;
//       case 'whatsapp': return <Phone className="w-5 h-5 text-green-600" />;
//       case 'instagram': return <Instagram className="w-5 h-5 text-pink-600" />;
//       default: return <MessageCircle className="w-5 h-5 text-gray-600" />;
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
//       case 'token_expired': return <Clock className="w-4 h-4 text-yellow-600" />;
//       case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
//       default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
//     }
//   };

//   const getLeadScoreColor = (score) => {
//     if (score >= 80) return 'text-green-600 bg-green-100';
//     if (score >= 50) return 'text-yellow-600 bg-yellow-100';
//     return 'text-red-600 bg-red-100';
//   };

//   const formatTime = (timestamp) => {
//     return new Date(timestamp).toLocaleString();
//   };

//   const renderOverview = () => (
//     <div className="space-y-6">
//       {/* Header with Refresh */}
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
//         <button
//           onClick={fetchAllData}
//           disabled={loading}
//           className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//         >
//           <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//           <span>Refresh</span>
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//         <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-blue-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Connected Accounts</p>
//               <p className="text-2xl font-bold text-gray-900">{analytics.total_accounts}</p>
//             </div>
//             <Users className="h-8 w-8 text-blue-600" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-purple-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Conversations</p>
//               <p className="text-2xl font-bold text-gray-900">{analytics.total_conversations}</p>
//             </div>
//             <MessageSquare className="h-8 w-8 text-purple-600" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-red-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Unread Messages</p>
//               <p className="text-2xl font-bold text-red-600">{analytics.unread_messages}</p>
//             </div>
//             <Bell className="h-8 w-8 text-red-600" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-green-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Qualified Leads</p>
//               <p className="text-2xl font-bold text-green-600">{analytics.qualified_leads}</p>
//             </div>
//             <TrendingUp className="h-8 w-8 text-green-600" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-blue-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Today's Messages</p>
//               <p className="text-2xl font-bold text-blue-600">{analytics.today_messages}</p>
//             </div>
//             <MessageSquare className="h-8 w-8 text-blue-600" />
//           </div>
//         </div>
//       </div>

//       {/* Platform Breakdown */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Activity</h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {analytics.platform_breakdown.map((platform) => (
//             <div key={platform.platform} className="border rounded-lg p-4">
//               <div className="flex items-center space-x-3 mb-2">
//                 {getPlatformIcon(platform.platform)}
//                 <span className="font-medium capitalize">{platform.platform}</span>
//               </div>
//               <div className="space-y-1 text-sm text-gray-600">
//                 <p>{platform.accounts} accounts connected</p>
//                 <p>{platform.today_messages} messages today</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Recent Conversations */}
//       <div className="bg-white rounded-lg shadow-md">
//         <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//           <h3 className="text-lg font-semibold text-gray-900">Recent Conversations</h3>
//           <span className="text-sm text-gray-500">{conversations.length} active conversations</span>
//         </div>
//         <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
//           {conversations.length === 0 ? (
//             <div className="p-8 text-center text-gray-500">
//               <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
//               <p>No conversations yet</p>
//               <p className="text-sm mt-1">Connect your social accounts to start receiving messages</p>
//             </div>
//           ) : (
//             conversations.map((conversation) => (
//               <div key={conversation.id} className={`p-4 hover:bg-gray-50 ${conversation.unread_count > 0 ? 'bg-blue-50' : ''}`}>
//                 <div className="flex items-start space-x-3">
//                   <div className="flex-shrink-0">
//                     {getPlatformIcon(conversation.platform)}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center justify-between">
//                       <p className="text-sm font-medium text-gray-900">
//                         {conversation.customer_name || conversation.customer_id}
//                       </p>
//                       <div className="flex items-center space-x-2">
//                         <span className="text-xs text-gray-500">
//                           {formatTime(conversation.last_message_at)}
//                         </span>
//                         {conversation.unread_count > 0 && (
//                           <button
//                             onClick={() => markConversationRead(conversation.id)}
//                             className="text-blue-600 hover:text-blue-800"
//                           >
//                             <Eye className="w-4 h-4" />
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                     <div className="flex items-center mt-1 space-x-2">
//                       <span className={`text-xs px-2 py-1 rounded-full ${
//                         conversation.platform === 'facebook' ? 'bg-blue-100 text-blue-800' :
//                         conversation.platform === 'whatsapp' ? 'bg-green-100 text-green-800' :
//                         'bg-pink-100 text-pink-800'
//                       }`}>
//                         {conversation.platform}
//                       </span>
//                       <span className="text-xs text-gray-500">
//                         {conversation.message_count} messages
//                       </span>
//                       {conversation.unread_count > 0 && (
//                         <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
//                           {conversation.unread_count} unread
//                         </span>
//                       )}
//                       {conversation.lead_score > 0 && (
//                         <span className={`text-xs px-2 py-1 rounded-full ${getLeadScoreColor(conversation.lead_score)}`}>
//                           Lead: {conversation.lead_score}%
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   const renderAccounts = () => (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">Social Media Accounts</h2>
//         <button
//           onClick={() => setShowAddAccount(true)}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
//         >
//           <Plus className="w-4 h-4" />
//           <span>Add Account</span>
//         </button>
//       </div>

//       {/* Account Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {accounts.map((account) => (
//           <div key={account.id} className="bg-white rounded-lg shadow-md p-6 border">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center space-x-3">
//                 {getPlatformIcon(account.platform)}
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">{account.account_name}</h3>
//                   <p className="text-sm text-gray-500">{account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}</p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="flex items-center space-x-1">
//                   {getStatusIcon(account.status)}
//                   <span className={`text-xs px-2 py-1 rounded-full ${
//                     account.status === 'active' ? 'bg-green-100 text-green-800' :
//                     account.status === 'token_expired' ? 'bg-yellow-100 text-yellow-800' :
//                     'bg-red-100 text-red-800'
//                   }`}>
//                     {account.status}
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => removeAccount(account.id)}
//                   className="text-red-600 hover:text-red-800"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
            
//             <div className="space-y-2 text-sm text-gray-600">
//               <p><span className="font-medium">Account ID:</span> {account.account_id}</p>
//               <p><span className="font-medium">Added:</span> {formatTime(account.created_at)}</p>
//               <p><span className="font-medium">Last Sync:</span> {formatTime(account.last_sync)}</p>
//               {account.page_id && <p><span className="font-medium">Page ID:</span> {account.page_id}</p>}
//               {account.business_phone_number && <p><span className="font-medium">Phone:</span> {account.business_phone_number}</p>}
//               {account.error_message && (
//                 <p className="text-red-600"><span className="font-medium">Error:</span> {account.error_message}</p>
//               )}
//             </div>
            
//             {/* Webhook URL */}
//             <div className="mt-4 p-3 bg-gray-50 rounded-lg">
//               <p className="text-xs font-medium text-gray-700">Webhook URL:</p>
//               <p className="text-xs text-gray-600 font-mono break-all">
//                 {`${window.location.origin}/api/webhook/${account.platform}`}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {accounts.length === 0 && (
//         <div className="text-center py-12">
//           <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
//           <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts connected</h3>
//           <p className="mt-1 text-sm text-gray-500">Get started by connecting your first social media account.</p>
//           <div className="mt-6">
//             <button
//               onClick={() => setShowAddAccount(true)}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
//             >
//               Add Account
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   const renderLeads = () => (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">Leads Management</h2>
//         <div className="text-sm text-gray-500">
//           {leads.filter(lead => lead.lead_score >= 50).length} qualified leads
//         </div>
//       </div>
      
//       <div className="bg-white rounded-lg shadow-md overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Score</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {leads.map((lead) => (
//                 <tr key={lead.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       {getPlatformIcon(lead.platform)}
//                       <div className="ml-3">
//                         <div className="text-sm font-medium text-gray-900">
//                           {lead.customer_name || lead.customer_id}
//                         </div>
//                         {lead.customer_phone && (
//                           <div className="text-sm text-gray-500">{lead.customer_phone}</div>
//                         )}
//                         {lead.customer_email && (
//                           <div className="text-sm text-gray-500">{lead.customer_email}</div>
//                         )}
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//                       {lead.platform}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLeadScoreColor(lead.lead_score)}`}>
//                         {lead.lead_score}%
//                       </span>
//                       {lead.lead_score >= 80 && <Star className="ml-1 w-4 h-4 text-yellow-400" />}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <select
//                       value={lead.status}
//                       onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
//                       className={`text-xs px-2.5 py-0.5 rounded-full border-0 font-medium focus:ring-2 focus:ring-blue-500 ${
//                         lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
//                         lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
//                         lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
//                         lead.status === 'won' ? 'bg-green-200 text-green-900' :
//                         'bg-gray-100 text-gray-800'
//                       }`}
//                     >
//                       <option value="new">New</option>
//                       <option value="contacted">Contacted</option>
//                       <option value="qualified">Qualified</option>
//                       <option value="proposal">Proposal</option>
//                       <option value="negotiation">Negotiation</option>
//                       <option value="won">Won</option>
//                       <option value="lost">Lost</option>
//                     </select>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {formatTime(lead.created_at)}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
//                     <button className="text-green-600 hover:text-green-900">Contact</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           {leads.length === 0 && (
//             <div className="p-8 text-center text-gray-500">
//               <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
//               <p>No leads yet</p>
//               <p className="text-sm mt-1">AI will automatically identify potential customers based on their messages</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   const renderAddAccountModal = () => (
//     showAddAccount && (
//       <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
//         <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
//           <div className="mt-3">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Add Social Media Account</h3>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Platform</label>
//                 <select
//                   value={newAccount.platform}
//                   onChange={(e) => setNewAccount({...newAccount, platform: e.target.value})}
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="facebook">Facebook Messenger</option>
//                   <option value="whatsapp">WhatsApp Business</option>
//                   <option value="instagram">Instagram</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Account Name</label>
//                 <input
//                   type="text"
//                   value={newAccount.account_name}
//                   onChange={(e) => setNewAccount({...newAccount, account_name: e.target.value})}
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="My Business Page"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Account ID</label>
//                 <input
//                   type="text"
//                   value={newAccount.account_id}
//                   onChange={(e) => setNewAccount({...newAccount, account_id: e.target.value})}
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="123456789"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Access Token</label>
//                 <input
//                   type="password"
//                   value={newAccount.access_token}
//                   onChange={(e) => setNewAccount({...newAccount, access_token: e.target.value})}
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Your access token"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Webhook Verify Token</label>
//                 <input
//                   type="text"
//                   value={newAccount.webhook_verify_token}
//                   onChange={(e) => setNewAccount({...newAccount, webhook_verify_token: e.target.value})}
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="your_verify_token"
//                 />
//               </div>

//               {(newAccount.platform === 'facebook' || newAccount.platform === 'instagram') && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Page ID</label>
//                   <input
//                     type="text"
//                     value={newAccount.page_id}
//                     onChange={(e) => setNewAccount({...newAccount, page_id: e.target.value})}
//                     className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Page ID"
//                   />
//                 </div>
//               )}

//               {newAccount.platform === 'whatsapp' && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Business Phone Number ID</label>
//                   <input
//                     type="text"
//                     value={newAccount.business_phone_number}
//                     onChange={(e) => setNewAccount({...newAccount, business_phone_number: e.target.value})}
//                     className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Phone Number ID"
//                   />
//                 </div>
//               )}

//               {/* Webhook URL Info */}
//               <div className="p-3 bg-blue-50 rounded-lg">
//                 <p className="text-sm font-medium text-blue-800">Webhook URL:</p>
//                 <p className="text-xs text-blue-600 font-mono break-all">
//                   {`${window.location.origin}/api/webhook/${newAccount.platform}`}
//                 </p>
//                 <p className="text-xs text-blue-600 mt-1">
//                   Use this URL in your {newAccount.platform} app settings
//                 </p>
//               </div>
//             </div>

//             <div className="flex justify-end space-x-3 mt-6">
//               <button
//                 onClick={() => {
//                   setShowAddAccount(false);
//                   resetNewAccount();
//                 }}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
//                 disabled={accountValidating}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={addAccount}
//                 disabled={accountValidating || !newAccount.account_name || !newAccount.access_token}
//                 className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//               >
//                 {accountValidating && <RefreshCw className="w-4 h-4 animate-spin" />}
//                 <span>{accountValidating ? 'Validating...' : 'Add Account'}</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 pb-20">
//       {/* Navigation Tabs */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex space-x-8">
//             {[
//               { id: 'overview', label: 'Overview', icon: TrendingUp },
//               { id: 'accounts', label: 'Accounts', icon: Settings },
//               { id: 'leads', label: 'Leads', icon: Users }
//             ].map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
//                   activeTab === tab.id
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }`}
//               >
//                 <tab.icon className="w-4 h-4" />
//                 <span>{tab.label}</span>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
//         {activeTab === 'overview' && renderOverview()}
//         {activeTab === 'accounts' && renderAccounts()}
//         {activeTab === 'leads' && renderLeads()}
//       </div>

//       {/* Add Account Modal */}
//       {renderAddAccountModal()}
//     </div>
//   );
// };

// export default Dashboard;





















































import { useState, useEffect, createContext, useContext } from 'react';
import { 
  Users, MessageSquare, TrendingUp, Bell, Plus, 
  Facebook, MessageCircle, Instagram, Phone,
  Eye, EyeOff, Trash2, Settings, Star, RefreshCw,
  CheckCircle, XCircle, Clock, AlertCircle
} from 'lucide-react';

// Create a local context for app state (since we removed useAuth)
const AppContext = createContext();
const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    // Fallback for when used without context
    return {
      user: {
        id: 'demo-user',
        full_name: 'Demo User',
        email: 'demo@company.com',
        company_name: 'Demo Company'
      },
      apiRequest: async () => ({ ok: true, json: async () => ({}) })
    };
  }
  return context;
};

const Dashboard = () => {
  const { user, apiRequest } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Mock data states with realistic demo data
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      platform: 'facebook',
      account_name: 'Demo Business Page',
      account_id: 'demo123456',
      status: 'active',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      last_sync: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      page_id: 'page123456',
      error_message: null
    },
    {
      id: 2,
      platform: 'instagram',
      account_name: 'Demo Instagram',
      account_id: 'instagram789',
      status: 'active',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      last_sync: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      page_id: 'ig_page789',
      error_message: null
    },
    {
      id: 3,
      platform: 'whatsapp',
      account_name: 'Business WhatsApp',
      account_id: 'wa456789',
      status: 'token_expired',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      last_sync: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      business_phone_number: '+1234567890',
      error_message: 'Access token expired'
    }
  ]);

  const [conversations, setConversations] = useState([
    {
      id: 1,
      platform: 'facebook',
      customer_name: 'John Smith',
      customer_id: 'john_smith_123',
      unread_count: 2,
      message_count: 15,
      last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      lead_score: 85
    },
    {
      id: 2,
      platform: 'instagram',
      customer_name: 'Sarah Johnson',
      customer_id: 'sarah_j_456',
      unread_count: 0,
      message_count: 8,
      last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      lead_score: 92
    },
    {
      id: 3,
      platform: 'whatsapp',
      customer_name: 'Mike Davis',
      customer_id: '+1987654321',
      unread_count: 1,
      message_count: 5,
      last_message_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      lead_score: 73
    },
    {
      id: 4,
      platform: 'facebook',
      customer_name: 'Emma Wilson',
      customer_id: 'emma_w_789',
      unread_count: 0,
      message_count: 12,
      last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      lead_score: 45
    }
  ]);

  const [leads, setLeads] = useState([
    {
      id: 1,
      platform: 'facebook',
      customer_name: 'John Smith',
      customer_id: 'john_smith_123',
      customer_phone: '+1234567890',
      customer_email: 'john@example.com',
      lead_score: 85,
      status: 'qualified',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
      id: 2,
      platform: 'instagram',
      customer_name: 'Sarah Johnson',
      customer_id: 'sarah_j_456',
      customer_phone: '+1987654321',
      customer_email: 'sarah@example.com',
      lead_score: 92,
      status: 'new',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
    },
    {
      id: 3,
      platform: 'whatsapp',
      customer_name: 'Mike Davis',
      customer_id: '+1555123456',
      customer_phone: '+1555123456',
      customer_email: null,
      lead_score: 73,
      status: 'contacted',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
    },
    {
      id: 4,
      platform: 'linkedin',
      customer_name: 'Alex Chen',
      customer_id: 'alex_chen_pro',
      customer_phone: null,
      customer_email: 'alex@techcorp.com',
      lead_score: 88,
      status: 'proposal',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
    }
  ]);

  const [analytics, setAnalytics] = useState({
    total_accounts: 3,
    total_conversations: 47,
    unread_messages: 3,
    qualified_leads: 12,
    today_messages: 28,
    today_leads: 2,
    platform_breakdown: [
      { platform: 'facebook', accounts: 1, today_messages: 15 },
      { platform: 'instagram', accounts: 1, today_messages: 8 },
      { platform: 'whatsapp', accounts: 1, today_messages: 5 }
    ],
    response_rate: 95,
    avg_response_time: "< 1 minute"
  });

  // Modal states
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [accountValidating, setAccountValidating] = useState(false);
  const [newAccount, setNewAccount] = useState({
    platform: 'facebook',
    account_name: '',
    account_id: '',
    access_token: '',
    webhook_verify_token: '',
    page_id: '',
    business_phone_number: ''
  });

  useEffect(() => {
    // Simulate data fetching
    fetchAllData();
    
    // Refresh data every 30 seconds (in demo mode, just update timestamps)
    const interval = setInterval(() => {
      updateTimestamps();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const updateTimestamps = () => {
    // Update some random conversation timestamps to simulate activity
    setConversations(prev => prev.map(conv => {
      if (Math.random() > 0.8) { // 20% chance to update
        return {
          ...conv,
          last_message_at: new Date().toISOString(),
          unread_count: conv.unread_count + (Math.random() > 0.5 ? 1 : 0)
        };
      }
      return conv;
    }));

    // Update analytics with slight variations
    setAnalytics(prev => ({
      ...prev,
      unread_messages: Math.max(0, prev.unread_messages + (Math.random() > 0.7 ? 1 : -1)),
      today_messages: prev.today_messages + (Math.random() > 0.8 ? 1 : 0)
    }));
  };

  const addAccount = async () => {
    setAccountValidating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newAccountData = {
        id: accounts.length + 1,
        ...newAccount,
        status: 'active',
        created_at: new Date().toISOString(),
        last_sync: new Date().toISOString(),
        error_message: null
      };
      
      setAccounts(prev => [...prev, newAccountData]);
      setAnalytics(prev => ({
        ...prev,
        total_accounts: prev.total_accounts + 1
      }));
      
      setShowAddAccount(false);
      resetNewAccount();
      alert('Account connected successfully!');
    } catch (error) {
      alert('Failed to connect account. Please check your credentials.');
    } finally {
      setAccountValidating(false);
    }
  };

  const removeAccount = async (accountId) => {
    if (!confirm('Are you sure you want to remove this account? This will archive all conversations.')) {
      return;
    }

    setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    setAnalytics(prev => ({
      ...prev,
      total_accounts: prev.total_accounts - 1
    }));
    alert('Account removed successfully');
  };

  const markConversationRead = async (conversationId) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, unread_count: 0 }
        : conv
    ));
    
    setAnalytics(prev => ({
      ...prev,
      unread_messages: Math.max(0, prev.unread_messages - 1)
    }));
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, status: newStatus }
        : lead
    ));
  };

  const resetNewAccount = () => {
    setNewAccount({
      platform: 'facebook',
      account_name: '',
      account_id: '',
      access_token: '',
      webhook_verify_token: '',
      page_id: '',
      business_phone_number: ''
    });
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-5 h-5 text-blue-600" />;
      case 'whatsapp': return <Phone className="w-5 h-5 text-green-600" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-600" />;
      case 'linkedin': return <MessageCircle className="w-5 h-5 text-blue-700" />;
      default: return <MessageCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'token_expired': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getLeadScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <button
          onClick={fetchAllData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connected Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.total_accounts}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Conversations</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.total_conversations}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread Messages</p>
              <p className="text-2xl font-bold text-red-600">{analytics.unread_messages}</p>
            </div>
            <Bell className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Qualified Leads</p>
              <p className="text-2xl font-bold text-green-600">{analytics.qualified_leads}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Messages</p>
              <p className="text-2xl font-bold text-blue-600">{analytics.today_messages}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics.platform_breakdown.map((platform) => (
            <div key={platform.platform} className="border rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                {getPlatformIcon(platform.platform)}
                <span className="font-medium capitalize">{platform.platform}</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{platform.accounts} accounts connected</p>
                <p>{platform.today_messages} messages today</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Conversations</h3>
          <span className="text-sm text-gray-500">{conversations.length} active conversations</span>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Connect your social accounts to start receiving messages</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div key={conversation.id} className={`p-4 hover:bg-gray-50 ${conversation.unread_count > 0 ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getPlatformIcon(conversation.platform)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {conversation.customer_name || conversation.customer_id}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.last_message_at)}
                        </span>
                        {conversation.unread_count > 0 && (
                          <button
                            onClick={() => markConversationRead(conversation.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        conversation.platform === 'facebook' ? 'bg-blue-100 text-blue-800' :
                        conversation.platform === 'whatsapp' ? 'bg-green-100 text-green-800' :
                        conversation.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {conversation.platform}
                      </span>
                      <span className="text-xs text-gray-500">
                        {conversation.message_count} messages
                      </span>
                      {conversation.unread_count > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                          {conversation.unread_count} unread
                        </span>
                      )}
                      {conversation.lead_score > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${getLeadScoreColor(conversation.lead_score)}`}>
                          Lead: {conversation.lead_score}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderAccounts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Social Media Accounts</h2>
        <button
          onClick={() => setShowAddAccount(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getPlatformIcon(account.platform)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{account.account_name}</h3>
                  <p className="text-sm text-gray-500">{account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {getStatusIcon(account.status)}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    account.status === 'active' ? 'bg-green-100 text-green-800' :
                    account.status === 'token_expired' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {account.status}
                  </span>
                </div>
                <button
                  onClick={() => removeAccount(account.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Account ID:</span> {account.account_id}</p>
              <p><span className="font-medium">Added:</span> {formatTime(account.created_at)}</p>
              <p><span className="font-medium">Last Sync:</span> {formatTime(account.last_sync)}</p>
              {account.page_id && <p><span className="font-medium">Page ID:</span> {account.page_id}</p>}
              {account.business_phone_number && <p><span className="font-medium">Phone:</span> {account.business_phone_number}</p>}
              {account.error_message && (
                <p className="text-red-600"><span className="font-medium">Error:</span> {account.error_message}</p>
              )}
            </div>
            
            {/* Webhook URL */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-700">Webhook URL (Demo):</p>
              <p className="text-xs text-gray-600 font-mono break-all">
                {`${window.location.origin}/api/webhook/${account.platform}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts connected</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by connecting your first social media account.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowAddAccount(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Add Account
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderLeads = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Leads Management</h2>
        <div className="text-sm text-gray-500">
          {leads.filter(lead => lead.lead_score >= 50).length} qualified leads
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPlatformIcon(lead.platform)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.customer_name || lead.customer_id}
                        </div>
                        {lead.customer_phone && (
                          <div className="text-sm text-gray-500">{lead.customer_phone}</div>
                        )}
                        {lead.customer_email && (
                          <div className="text-sm text-gray-500">{lead.customer_email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {lead.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLeadScoreColor(lead.lead_score)}`}>
                        {lead.lead_score}%
                      </span>
                      {lead.lead_score >= 80 && <Star className="ml-1 w-4 h-4 text-yellow-400" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                      className={`text-xs px-2.5 py-0.5 rounded-full border-0 font-medium focus:ring-2 focus:ring-blue-500 ${
                        lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                        lead.status === 'won' ? 'bg-green-200 text-green-900' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="proposal">Proposal</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(lead.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-green-600 hover:text-green-900">Contact</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No leads yet</p>
              <p className="text-sm mt-1">AI will automatically identify potential customers based on their messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAddAccountModal = () => (
    showAddAccount && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Social Media Account</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Platform</label>
                <select
                  value={newAccount.platform}
                  onChange={(e) => setNewAccount({...newAccount, platform: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="facebook">Facebook Messenger</option>
                  <option value="whatsapp">WhatsApp Business</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Account Name</label>
                <input
                  type="text"
                  value={newAccount.account_name}
                  onChange={(e) => setNewAccount({...newAccount, account_name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Business Page"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Account ID</label>
                <input
                  type="text"
                  value={newAccount.account_id}
                  onChange={(e) => setNewAccount({...newAccount, account_id: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Access Token (Demo)</label>
                <input
                  type="password"
                  value={newAccount.access_token}
                  onChange={(e) => setNewAccount({...newAccount, access_token: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Demo token - any value works"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Webhook Verify Token (Demo)</label>
                <input
                  type="text"
                  value={newAccount.webhook_verify_token}
                  onChange={(e) => setNewAccount({...newAccount, webhook_verify_token: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="demo_verify_token"
                />
              </div>

              {(newAccount.platform === 'facebook' || newAccount.platform === 'instagram') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Page ID</label>
                  <input
                    type="text"
                    value={newAccount.page_id}
                    onChange={(e) => setNewAccount({...newAccount, page_id: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="page_123456"
                  />
                </div>
              )}

              {newAccount.platform === 'whatsapp' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Phone Number ID</label>
                  <input
                    type="text"
                    value={newAccount.business_phone_number}
                    onChange={(e) => setNewAccount({...newAccount, business_phone_number: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1234567890"
                  />
                </div>
              )}

              {/* Demo Notice */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Demo Mode:</p>
                <p className="text-xs text-blue-600 mt-1">
                  This is a demo - any values will work. In production, use real API credentials.
                </p>
                <p className="text-xs text-blue-600 font-mono break-all mt-2">
                  Webhook URL: {`${window.location.origin}/api/webhook/${newAccount.platform}`}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddAccount(false);
                  resetNewAccount();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                disabled={accountValidating}
              >
                Cancel
              </button>
              <button
                onClick={addAccount}
                disabled={accountValidating || !newAccount.account_name || !newAccount.access_token}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {accountValidating && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{accountValidating ? 'Adding Account...' : 'Add Account'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <AppContext.Provider value={{ user, apiRequest }}>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Navigation Tabs */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'accounts', label: 'Accounts', icon: Settings },
                { id: 'leads', label: 'Leads', icon: Users }
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
          {activeTab === 'accounts' && renderAccounts()}
          {activeTab === 'leads' && renderLeads()}
        </div>

        {/* Add Account Modal */}
        {renderAddAccountModal()}
      </div>
    </AppContext.Provider>
  );
};

export default Dashboard;