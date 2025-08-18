

// export default ChatInterface; 
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2, User, Bot } from 'lucide-react';

// Updated RobotAvatar Component with movement
const RobotAvatar = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div 
        className={`${sizeClasses[size]} bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-300 transition-all duration-300 hover:scale-110 hover:rotate-12`}
        style={{
          animation: 'float 3s ease-in-out infinite, wiggle 4s ease-in-out infinite'
        }}
      >
        <Bot className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} text-black`} />
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
      `}</style>
    </div>
  );
};

// Clean Message Component with new color scheme
const Message = ({ 
  message, 
  isUser = false, 
  timestamp, 
  suggestions = [], 
  actions = [],
  source,
  responseType,
  faqMatched,
  faqKey,
  onSuggestionClick,
  onActionClick 
}) => {
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-4xl`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          {isUser ? (
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-yellow-400">
              <User className="w-4 h-4 text-black" />
            </div>
          ) : (
            <RobotAvatar size="sm" />
          )}
        </div>

        {/* Message Content */}
        <div className={`${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
          
          {/* Message Bubble with new colors */}
          <div className={`
            px-4 py-3 rounded-lg shadow-sm border-2
            ${isUser 
              ? 'bg-yellow-500 text-black rounded-br-none max-w-xs border-yellow-400' 
              : 'bg-gray-900 text-white rounded-bl-none max-w-2xl border-yellow-500'
            }
          `}>
            <div className="whitespace-pre-wrap break-words">
              {message}
            </div>
            
            {/* Timestamp for bot messages */}
            {!isUser && timestamp && (
              <div className="flex justify-end mt-2 pt-2 border-t border-gray-700">
                <span className="text-xs text-gray-400">
                  {formatTime(timestamp)}
                </span>
              </div>
            )}
          </div>

          {/* Actions with new styling */}
          {!isUser && actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => onActionClick?.(action)}
                  className={`
                    px-3 py-1 text-sm rounded-full border-2 transition-all duration-200 hover:scale-105
                    ${action.priority === 'high' 
                      ? 'bg-yellow-500 text-black border-yellow-400 hover:bg-yellow-400 shadow-lg' 
                      : 'bg-gray-800 text-white border-yellow-500 hover:bg-gray-700 hover:border-yellow-400'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Suggestions with new styling */}
          {!isUser && suggestions && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 max-w-2xl">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="px-3 py-1 text-xs rounded-full border-2 transition-all duration-200 hover:scale-105 bg-gray-800 text-yellow-400 border-yellow-500 hover:bg-gray-700 hover:text-yellow-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Timestamp for user messages */}
          {isUser && timestamp && (
            <span className="text-xs text-gray-400 mt-1">
              {formatTime(timestamp)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Chat Input Component with new color scheme and hover effects
const ChatInput = ({ 
  onSendMessage, 
  isLoading = false, 
  placeholder = "Type your message...",
  maxLength = 1000 
}) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (trimmedMessage && !isLoading) {
      onSendMessage(trimmedMessage);
      setMessage('');
    }
  };

  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Voice input (if supported)
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(prev => prev + transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Quick action buttons with new colors
  const quickActions = [
    "Show me your products",
    "What are your prices?",
    "I need custom development",
    "Contact support"
  ];

  return (
    <div className="border-t-2 border-yellow-500 bg-black p-4">
      {/* Quick Actions with new styling */}
      <div className="mb-3 flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => setMessage(action)}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-yellow-400 hover:text-yellow-300 border border-yellow-500 hover:border-yellow-400 px-3 py-1 rounded-full transition-all duration-200 hover:scale-105"
            disabled={isLoading}
          >
            {action}
          </button>
        ))}
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        
        {/* Text Input with enhanced hover and focus effects */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full resize-none min-h-[48px] max-h-[120px] pr-12 px-4 py-3 bg-gray-900 border-2 border-yellow-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 hover:border-yellow-400 hover:bg-gray-800 transition-all duration-200 focus:outline-none"
            disabled={isLoading}
            maxLength={maxLength}
            rows={1}
          />
          
          {/* Character Count */}
          <div className="absolute bottom-2 right-3 text-xs text-gray-400">
            <span className={message.length > maxLength * 0.9 ? 'text-yellow-400' : ''}>
              {message.length}/{maxLength}
            </span>
          </div>
        </div>

        {/* Voice Input Button with new colors */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`
            p-3 rounded-full transition-all duration-200 hover:scale-110 border-2
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white border-red-400' 
              : 'bg-gray-800 hover:bg-gray-700 text-yellow-400 border-yellow-500 hover:border-yellow-400'
            }
          `}
          disabled={isLoading}
          title={isListening ? 'Stop listening' : 'Voice input'}
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Send Button with new colors */}
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="p-3 bg-yellow-500 text-black rounded-full hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 border-2 border-yellow-400 disabled:hover:scale-100"
          title="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* Status Messages with new colors */}
      {isListening && (
        <div className="mt-2 text-center">
          <span className="text-sm text-red-400 animate-pulse">
            🎤 Listening... Speak now
          </span>
        </div>
      )}

      {isLoading && (
        <div className="mt-2 text-center">
          <span className="text-sm text-yellow-400">
            AI is thinking...
          </span>
        </div>
      )}
    </div>
  );
};

// Main Chat Interface Component with new color scheme
const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      message: "👋 **Welcome to Nozama.ai!**\n\nI'm here to help you with:\n🤖 **AI Chatbot Products** - Browse our marketplace\n💼 **Custom Development** - Tailored solutions for your business\n💰 **Pricing & Plans** - Find the right fit for your budget\n❓ **Support & Questions** - Get answers to any questions\n\n**How can I assist you today?**",
      isUser: false,
      timestamp: new Date().toISOString(),
      suggestions: ['Show me products', 'Custom chatbot request', 'Pricing information', 'How to buy'],
      source: 'greeting',
      responseType: 'greeting'
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState(`user_${Date.now()}`);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to backend
  const sendMessage = async (messageText) => {
    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      message: messageText,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          user_id: userId
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Add bot response
        const botMessage = {
          id: Date.now() + 1,
          message: data.response,
          isUser: false,
          timestamp: data.timestamp,
          suggestions: data.suggestions || [],
          actions: data.actions || [],
          source: data.source,
          responseType: data.response_type,
          faqMatched: data.faq_matched,
          faqKey: data.faq_key
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Handle error response
        const errorMessage = {
          id: Date.now() + 1,
          message: data.response || 'Sorry, something went wrong. Please try again.',
          isUser: false,
          timestamp: new Date().toISOString(),
          suggestions: data.suggestions || ['Try again', 'Contact support'],
          source: 'error',
          responseType: 'error'
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        message: 'Connection error. Please check your internet and try again.',
        isUser: false,
        timestamp: new Date().toISOString(),
        suggestions: ['Try again', 'Contact support'],
        source: 'error',
        responseType: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  // Handle action clicks
  const handleActionClick = (action) => {
    if (action.action === 'redirect' && action.url) {
      window.open(action.url, '_blank');
    } else if (action.action === 'external_link' && action.url) {
      window.open(action.url, '_blank');
    } else if (action.action === 'mailto' && action.url) {
      window.location.href = action.url;
    } else if (action.action === 'open_contact_form') {
      console.log('Opening contact form...');
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-black">
      {/* Header with new color scheme */}
      <div className="bg-black border-b-2 border-yellow-500 p-4">
        <div className="flex items-center space-x-3">
          <RobotAvatar size="md" />
          <div>
            <h1 className="text-lg font-semibold text-yellow-400">AI CHATBOT MARKET PLACE</h1>
            <p className="text-sm text-white"></p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-white">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages with new background */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
        {messages.map((msg) => (
          <Message
            key={msg.id}
            message={msg.message}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
            suggestions={msg.suggestions}
            actions={msg.actions}
            source={msg.source}
            responseType={msg.responseType}
            faqMatched={msg.faqMatched}
            faqKey={msg.faqKey}
            onSuggestionClick={handleSuggestionClick}
            onActionClick={handleActionClick}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-900 border border-yellow-500 rounded-lg px-4 py-3 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
              <span className="text-sm text-white">AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input with new color scheme */}
      <ChatInput
        onSendMessage={sendMessage}
        isLoading={isLoading}
        placeholder="Ask me about AI chatbots, pricing, or custom development..."
      />
    </div>
  );
};

export default ChatInterface;