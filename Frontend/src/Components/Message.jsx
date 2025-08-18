
// Message.jsx 
import React from 'react';
import { User, Clock } from 'lucide-react';
import RobotAvatar from './RobotAvatar';

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
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          ) : (
            <RobotAvatar size="sm" />
          )}
        </div>

        {/* Message Content */}
        <div className={`${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
          
          {/* Message Bubble - Clean without badges */}
          <div className={`
            px-4 py-3 rounded-lg shadow-sm
            ${isUser 
              ? 'bg-blue-500 text-white rounded-br-none max-w-xs' 
              : 'bg-white text-gray-800 rounded-bl-none max-w-2xl border'
            }
          `}>
            <div className="whitespace-pre-wrap break-words">
              {message}
            </div>
            
            {/* Simple timestamp for bot messages - no source info */}
            {!isUser && timestamp && (
              <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {formatTime(timestamp)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          {!isUser && actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => onActionClick?.(action)}
                  className={`
                    px-3 py-1 text-sm rounded-full border transition-colors duration-200
                    ${action.priority === 'high' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 ring-2 ring-blue-200' 
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Suggestions - Clean styling */}
          {!isUser && suggestions && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 max-w-2xl">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="px-3 py-1 text-xs rounded-full border transition-colors duration-200 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
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

export default Message;