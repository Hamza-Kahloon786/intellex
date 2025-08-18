// import { useState, useEffect, createContext, useContext } from 'react';
// import Dashboard from './Components/Dashboard';
// import LoginForm from './Components/LoginForm';
// import { Bot, Bell, Users, MessageSquare, Settings, LogOut } from 'lucide-react';

// // Auth Context
// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// // API Base URL
// const API_BASE = 'http://localhost:8000';

// function App() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [websocket, setWebsocket] = useState(null);
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');

//   useEffect(() => {
//     // Check for existing auth token
//     const token = localStorage.getItem('auth_token');
//     if (token) {
//       validateToken(token);
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (user) {
//       setupWebSocket();
//       fetchNotifications();
      
//       // Request notification permission
//       if (Notification.permission === 'default') {
//         Notification.requestPermission();
//       }
//     }

//     return () => {
//       if (websocket) {
//         websocket.close();
//       }
//     };
//   }, [user]);

//   const validateToken = async (token) => {
//     try {
//       const response = await fetch(`${API_BASE}/api/auth/validate`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (response.ok) {
//         const userData = await response.json();
//         setUser(userData.user);
//         localStorage.setItem('auth_token', token);
//       } else {
//         localStorage.removeItem('auth_token');
//       }
//     } catch (error) {
//       console.error('Token validation error:', error);
//       localStorage.removeItem('auth_token');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       const response = await fetch(`${API_BASE}/api/auth/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setUser(data.user);
//         localStorage.setItem('auth_token', data.access_token);
//         return { success: true };
//       } else {
//         const errorData = await response.json();
//         console.error('Login error response:', errorData);
//         return { success: false, error: errorData.detail || 'Login failed' };
//       }
//     } catch (error) {
//       console.error('Login network error:', error);
//       return { success: false, error: 'Network error. Please check if the backend server is running.' };
//     }
//   };

//   const register = async (email, password, fullName, companyName) => {
//     try {
//       const response = await fetch(`${API_BASE}/api/auth/register`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email,
//           password,
//           full_name: fullName,
//           company_name: companyName || null
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setUser(data.user);
//         localStorage.setItem('auth_token', data.access_token);
//         return { success: true };
//       } else {
//         const errorData = await response.json();
//         console.error('Register error response:', errorData);
//         return { success: false, error: errorData.detail || 'Registration failed' };
//       }
//     } catch (error) {
//       console.error('Register network error:', error);
//       return { success: false, error: 'Network error. Please check if the backend server is running.' };
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('auth_token');
//     if (websocket) {
//       websocket.close();
//     }
//     setWebsocket(null);
//     setNotifications([]);
//     setUnreadCount(0);
//     setConnectionStatus('disconnected');
//   };

//   const setupWebSocket = () => {
//     try {
//       const ws = new WebSocket(`ws://localhost:8000/ws/${user.id}`);
      
//       ws.onopen = () => {
//         console.log('✅ WebSocket connected');
//         setConnectionStatus('connected');
        
//         // Send ping to keep alive
//         const pingInterval = setInterval(() => {
//           if (ws.readyState === WebSocket.OPEN) {
//             ws.send(JSON.stringify({ type: 'ping' }));
//           }
//         }, 30000);

//         ws.pingInterval = pingInterval;
//       };

//       ws.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           handleWebSocketMessage(data);
//         } catch (error) {
//           console.error('WebSocket message parse error:', error);
//         }
//       };

//       ws.onclose = (event) => {
//         console.log('🔌 WebSocket disconnected:', event.code);
//         setConnectionStatus('disconnected');
        
//         if (ws.pingInterval) {
//           clearInterval(ws.pingInterval);
//         }

//         // Reconnect after 3 seconds if user is still logged in
//         if (user && event.code !== 1000) {
//           setTimeout(() => {
//             if (user) {
//               setupWebSocket();
//             }
//           }, 3000);
//         }
//       };

//       ws.onerror = (error) => {
//         console.error('❌ WebSocket error:', error);
//         setConnectionStatus('error');
//       };

//       setWebsocket(ws);
//     } catch (error) {
//       console.error('WebSocket setup error:', error);
//       setConnectionStatus('error');
//     }
//   };

//   const handleWebSocketMessage = (data) => {
//     switch (data.type) {
//       case 'stats_update':
//         setUnreadCount(data.unread_messages);
//         break;

//       case 'new_message':
//         setUnreadCount(prev => prev + 1);
        
//         const messageNotification = {
//           id: Date.now(),
//           type: 'new_message',
//           title: `New ${data.platform} message`,
//           message: `Message from ${data.sender}: ${data.content?.substring(0, 50)}...`,
//           platform: data.platform,
//           timestamp: new Date(),
//           read: false
//         };
        
//         setNotifications(prev => [messageNotification, ...prev.slice(0, 19)]);
        
//         // Browser notification
//         if (Notification.permission === 'granted') {
//           new Notification(messageNotification.title, {
//             body: messageNotification.message,
//             icon: '/favicon.ico',
//             tag: 'intellex-message'
//           });
//         }
        
//         // Play notification sound
//         playNotificationSound();
//         break;

//       case 'new_lead':
//         const leadNotification = {
//           id: Date.now(),
//           type: 'new_lead',
//           title: '🎯 New Qualified Lead!',
//           message: `New lead from ${data.platform} with score ${data.score}%`,
//           platform: data.platform,
//           timestamp: new Date(),
//           read: false
//         };
        
//         setNotifications(prev => [leadNotification, ...prev.slice(0, 19)]);
        
//         if (Notification.permission === 'granted') {
//           new Notification(leadNotification.title, {
//             body: leadNotification.message,
//             icon: '/favicon.ico',
//             tag: 'intellex-lead'
//           });
//         }
        
//         playNotificationSound('lead');
//         break;

//       case 'pong':
//         // WebSocket keepalive response
//         break;

//       default:
//         console.log('Unknown WebSocket message type:', data.type);
//     }
//   };

//   const playNotificationSound = (type = 'message') => {
//     try {
//       // Create audio context and play notification sound
//       const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       const oscillator = audioContext.createOscillator();
//       const gainNode = audioContext.createGain();
      
//       oscillator.connect(gainNode);
//       gainNode.connect(audioContext.destination);
      
//       oscillator.frequency.value = type === 'lead' ? 800 : 600;
//       oscillator.type = 'sine';
      
//       gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
//       gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
//       oscillator.start(audioContext.currentTime);
//       oscillator.stop(audioContext.currentTime + 0.5);
//     } catch (error) {
//       console.log('Audio notification not available');
//     }
//   };

//   const fetchNotifications = async () => {
//     try {
//       const token = localStorage.getItem('auth_token');
//       const response = await fetch(`${API_BASE}/api/notifications`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         setNotifications(data.notifications || []);
//       }
//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//     }
//   };

//   const markAllAsRead = async () => {
//     setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
//   };

//   const apiRequest = async (url, options = {}) => {
//     const token = localStorage.getItem('auth_token');
//     const defaultOptions = {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       }
//     };

//     const response = await fetch(`${API_BASE}${url}`, {
//       ...defaultOptions,
//       ...options,
//       headers: {
//         ...defaultOptions.headers,
//         ...options.headers
//       }
//     });

//     if (response.status === 401) {
//       // Token expired, logout user
//       logout();
//       throw new Error('Session expired');
//     }

//     return response;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <Bot className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
//           <p className="text-gray-600">Loading Intellex CRM...</p>
//           <p className="text-xs text-gray-400 mt-2">Connecting to backend server...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <AuthContext.Provider value={{ login, register }}>
//         <LoginForm />
//       </AuthContext.Provider>
//     );
//   }

//   return (
//     <AuthContext.Provider value={{ user, logout, apiRequest }}>
//       <div className="min-h-screen bg-gray-100">
//         {/* Top Navigation */}
//         <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex justify-between h-16">
//               {/* Logo */}
//               <div className="flex items-center">
//                 <Bot className="h-8 w-8 text-blue-600" />
//                 <span className="ml-2 text-xl font-bold text-gray-900">Intellex CRM</span>
//                 <span className="ml-2 text-sm text-gray-500 hidden md:block">
//                   Multi-Account Social Media Manager
//                 </span>
                
//                 {/* Connection Status */}
//                 <div className="ml-4 flex items-center">
//                   <div className={`h-2 w-2 rounded-full ${
//                     connectionStatus === 'connected' ? 'bg-green-500' :
//                     connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
//                   }`}></div>
//                   <span className="ml-2 text-xs text-gray-500 hidden md:block">
//                     {connectionStatus === 'connected' ? 'Real-time' :
//                      connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}
//                   </span>
//                 </div>
//               </div>

//               {/* Right side - Notifications & User */}
//               <div className="flex items-center space-x-4">
//                 {/* Notification Bell */}
//                 <div className="relative">
//                   <button
//                     onClick={() => setShowNotifications(!showNotifications)}
//                     className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors"
//                   >
//                     <Bell className="h-6 w-6" />
//                     {unreadCount > 0 && (
//                       <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-medium animate-pulse">
//                         {unreadCount > 99 ? '99+' : unreadCount}
//                       </span>
//                     )}
//                   </button>

//                   {/* Notifications Dropdown */}
//                   {showNotifications && (
//                     <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
//                       <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//                         <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
//                         {notifications.some(n => !n.read) && (
//                           <button
//                             onClick={markAllAsRead}
//                             className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
//                           >
//                             Mark all read
//                           </button>
//                         )}
//                       </div>
                      
//                       <div className="max-h-80 overflow-y-auto">
//                         {notifications.length === 0 ? (
//                           <div className="p-4 text-center text-gray-500">
//                             <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
//                             <p>No notifications yet</p>
//                             <p className="text-xs mt-1">You'll be notified of new messages and leads</p>
//                           </div>
//                         ) : (
//                           notifications.slice(0, 10).map((notification) => (
//                             <div
//                               key={notification.id}
//                               className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
//                                 !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
//                               }`}
//                             >
//                               <div className="flex items-start space-x-3">
//                                 <div className={`flex-shrink-0 p-2 rounded-full ${
//                                   notification.type === 'new_message' ? 'bg-blue-100' :
//                                   notification.type === 'new_lead' ? 'bg-green-100' : 'bg-gray-100'
//                                 }`}>
//                                   {notification.type === 'new_message' ? (
//                                     <MessageSquare className="h-4 w-4 text-blue-600" />
//                                   ) : notification.type === 'new_lead' ? (
//                                     <Users className="h-4 w-4 text-green-600" />
//                                   ) : (
//                                     <Settings className="h-4 w-4 text-gray-600" />
//                                   )}
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                   <p className="text-sm font-medium text-gray-900">
//                                     {notification.title}
//                                   </p>
//                                   <p className="text-sm text-gray-600 truncate">
//                                     {notification.message}
//                                   </p>
//                                   <div className="flex items-center mt-1 space-x-2">
//                                     <p className="text-xs text-gray-500">
//                                       {new Date(notification.timestamp).toLocaleTimeString()}
//                                     </p>
//                                     {notification.platform && (
//                                       <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
//                                         {notification.platform}
//                                       </span>
//                                     )}
//                                   </div>
//                                 </div>
//                                 {!notification.read && (
//                                   <div className="flex-shrink-0">
//                                     <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           ))
//                         )}
//                       </div>
                      
//                       {notifications.length > 10 && (
//                         <div className="p-3 text-center border-t border-gray-200">
//                           <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
//                             View all notifications
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 {/* User Menu */}
//                 <div className="flex items-center space-x-3">
//                   <div className="hidden md:block text-right">
//                     <p className="text-sm font-medium text-gray-700">{user.full_name}</p>
//                     <p className="text-xs text-gray-500">{user.company_name || user.email}</p>
//                   </div>
//                   <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
//                     <span className="text-white text-sm font-medium">
//                       {user.full_name?.charAt(0).toUpperCase() || 'U'}
//                     </span>
//                   </div>
//                   <button
//                     onClick={logout}
//                     className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors"
//                     title="Logout"
//                   >
//                     <LogOut className="h-5 w-5" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </nav>

//         {/* Click outside to close notifications */}
//         {showNotifications && (
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setShowNotifications(false)}
//           />
//         )}

//         {/* Main Dashboard */}
//         <Dashboard />

//         {/* Status Bar */}
//         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-30">
//           <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-600">
//             <div className="flex items-center space-x-4">
//               <span className="flex items-center space-x-1">
//                 <div className={`h-2 w-2 rounded-full ${
//                   connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
//                 }`}></div>
//                 <span>
//                   {connectionStatus === 'connected' ? 'System Online' : 'System Offline'}
//                 </span>
//               </span>
//               <span>
//                 WebSocket {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
//               </span>
//               {unreadCount > 0 && (
//                 <span className="text-blue-600 font-medium">
//                   {unreadCount} unread messages
//                 </span>
//               )}
//             </div>
//             <div className="flex items-center space-x-4">
//               <span>Real-time notifications enabled</span>
//               <span>AI Auto-response active</span>
//               <span className="text-xs text-gray-400">v2.0.0</span>
//             </div>
//           </div>
//         </div>

//         {/* Offline Notice */}
//         {connectionStatus === 'error' && (
//           <div className="fixed top-16 left-0 right-0 bg-red-100 border-b border-red-200 px-4 py-2 z-30">
//             <div className="max-w-7xl mx-auto text-center">
//               <p className="text-red-800 text-sm">
//                 ⚠️ Connection lost. Attempting to reconnect... Some features may be limited.
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </AuthContext.Provider>
//   );
// }

// export default App;



































import { useState, useEffect, createContext, useContext } from 'react';
import Dashboard from './Components/Dashboard';
import { Bot, Bell, Users, MessageSquare, Settings } from 'lucide-react';

// App Context (replacing Auth Context)
const AppContext = createContext();
export const useApp = () => useContext(AppContext);

function app() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [websocket, setWebsocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connected'); // Default to connected
  
  // Mock user data (no authentication needed)
  const user = {
    id: 'demo-user',
    full_name: 'Demo User',
    email: 'demo@company.com',
    company_name: 'Demo Company'
  };

  useEffect(() => {
    // Initialize the app
    setupMockWebSocket();
    loadMockNotifications();
    
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  const setupMockWebSocket = () => {
    // Simulate WebSocket connection
    setConnectionStatus('connected');
    
    // Simulate periodic messages for demo purposes
    const mockMessageInterval = setInterval(() => {
      if (Math.random() > 0.95) { // 5% chance every 5 seconds
        handleMockMessage();
      }
    }, 5000);

    const mockLeadInterval = setInterval(() => {
      if (Math.random() > 0.98) { // 2% chance every 10 seconds
        handleMockLead();
      }
    }, 10000);

    // Store intervals for cleanup
    setWebsocket({
      mockMessageInterval,
      mockLeadInterval,
      close: () => {
        clearInterval(mockMessageInterval);
        clearInterval(mockLeadInterval);
      }
    });
  };

  const handleMockMessage = () => {
    const platforms = ['Instagram', 'Facebook', 'Twitter', 'LinkedIn'];
    const senders = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emma Wilson'];
    const messages = [
      'Hi, I\'m interested in your services...',
      'Can you tell me more about pricing?',
      'When are you available for a call?',
      'I saw your post and wanted to connect',
      'Do you have any case studies available?'
    ];

    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const sender = senders[Math.floor(Math.random() * senders.length)];
    const content = messages[Math.floor(Math.random() * messages.length)];

    setUnreadCount(prev => prev + 1);
    
    const messageNotification = {
      id: Date.now(),
      type: 'new_message',
      title: `New ${platform} message`,
      message: `Message from ${sender}: ${content}`,
      platform: platform,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [messageNotification, ...prev.slice(0, 19)]);
    
    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification(messageNotification.title, {
        body: messageNotification.message,
        icon: '/favicon.ico',
        tag: 'intellex-message'
      });
    }
    
    // Play notification sound
    playNotificationSound();
  };

  const handleMockLead = () => {
    const platforms = ['Instagram', 'Facebook', 'LinkedIn'];
    const scores = [75, 82, 91, 88, 95];
    
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const score = scores[Math.floor(Math.random() * scores.length)];

    const leadNotification = {
      id: Date.now(),
      type: 'new_lead',
      title: '🎯 New Qualified Lead!',
      message: `New lead from ${platform} with score ${score}%`,
      platform: platform,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [leadNotification, ...prev.slice(0, 19)]);
    
    if (Notification.permission === 'granted') {
      new Notification(leadNotification.title, {
        body: leadNotification.message,
        icon: '/favicon.ico',
        tag: 'intellex-lead'
      });
    }
    
    playNotificationSound('lead');
  };

  const playNotificationSound = (type = 'message') => {
    try {
      // Create audio context and play notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = type === 'lead' ? 800 : 600;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification not available');
    }
  };

  const loadMockNotifications = () => {
    // Load some initial mock notifications
    const mockNotifications = [
      {
        id: 1,
        type: 'new_message',
        title: 'New Instagram message',
        message: 'Message from Alice Cooper: Hello, I\'m interested in your product...',
        platform: 'Instagram',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false
      },
      {
        id: 2,
        type: 'new_lead',
        title: '🎯 New Qualified Lead!',
        message: 'New lead from LinkedIn with score 89%',
        platform: 'LinkedIn',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  // Mock API request function (no actual backend calls)
  const apiRequest = async (url, options = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock successful response
    return {
      ok: true,
      json: async () => ({ success: true, data: {} })
    };
  };

  return (
    <AppContext.Provider value={{ user, apiRequest }}>
      <div className="min-h-screen bg-gray-100">
        {/* Top Navigation */}
        <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Bot className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Intellex CRM</span>
                <span className="ml-2 text-sm text-gray-500 hidden md:block">
                  Multi-Account Social Media Manager
                </span>
                
                {/* Connection Status */}
                <div className="ml-4 flex items-center">
                  <div className={`h-2 w-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="ml-2 text-xs text-gray-500 hidden md:block">
                    {connectionStatus === 'connected' ? 'Demo Mode' :
                     connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}
                  </span>
                </div>
              </div>

              {/* Right side - Notifications & User */}
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors"
                  >
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-medium animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        {notifications.some(n => !n.read) && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p>No notifications yet</p>
                            <p className="text-xs mt-1">You'll be notified of new messages and leads</p>
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 p-2 rounded-full ${
                                  notification.type === 'new_message' ? 'bg-blue-100' :
                                  notification.type === 'new_lead' ? 'bg-green-100' : 'bg-gray-100'
                                }`}>
                                  {notification.type === 'new_message' ? (
                                    <MessageSquare className="h-4 w-4 text-blue-600" />
                                  ) : notification.type === 'new_lead' ? (
                                    <Users className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Settings className="h-4 w-4 text-gray-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 truncate">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <p className="text-xs text-gray-500">
                                      {new Date(notification.timestamp).toLocaleTimeString()}
                                    </p>
                                    {notification.platform && (
                                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                        {notification.platform}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {!notification.read && (
                                  <div className="flex-shrink-0">
                                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {notifications.length > 10 && (
                        <div className="p-3 text-center border-t border-gray-200">
                          <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                            View all notifications
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-700">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.company_name || user.email}</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Click outside to close notifications */}
        {showNotifications && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowNotifications(false)}
          />
        )}

        {/* Main Dashboard */}
        <Dashboard />

        {/* Status Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-30">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Demo Mode Active</span>
              </span>
              <span>Mock WebSocket Connected</span>
              {unreadCount > 0 && (
                <span className="text-blue-600 font-medium">
                  {unreadCount} unread messages
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span>Real-time notifications enabled</span>
              <span>AI Auto-response active</span>
              <span className="text-xs text-gray-400">v2.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default app;