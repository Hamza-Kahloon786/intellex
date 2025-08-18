// chatInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';

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

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Quick action buttons
  const quickActions = [
    "Show me your products",
    "What are your prices?",
    "I need custom development",
    "Contact support"
  ];

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Quick Actions */}
      <div className="mb-3 flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => setMessage(action)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors duration-200"
            disabled={isLoading}
          >
            {action}
          </button>
        ))}
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        
        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="chat-input resize-none min-h-[48px] max-h-[120px] pr-12"
            disabled={isLoading}
            maxLength={maxLength}
            rows={1}
          />
          
          {/* Character Count */}
          <div className="absolute bottom-2 right-3 text-xs text-gray-400">
            {message.length}/{maxLength}
          </div>
        </div>

        {/* Voice Input Button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`
            p-3 rounded-full transition-colors duration-200
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
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

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="send-button"
          title="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* Status Messages */}
      {isListening && (
        <div className="mt-2 text-center">
          <span className="text-sm text-red-600 animate-pulse">
            🎤 Listening... Speak now
          </span>
        </div>
      )}

      {isLoading && (
        <div className="mt-2 text-center">
          <span className="text-sm text-gray-500">
            AI is thinking...
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;