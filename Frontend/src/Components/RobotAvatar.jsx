
// RobotAvatar.jsx
import React from 'react';

const RobotAvatar = ({ isThinking = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
      {/* Robot Body */}
      <div className={`
        ${sizeClasses[size]} 
        bg-gradient-to-br from-yellow-400 to-yellow-600 
        rounded-2xl 
        shadow-lg 
        flex items-center justify-center 
        relative
        ${isThinking ? 'animate-pulse' : 'animate-bounce'}
        border-2 border-yellow-300
        transition-all duration-300 ease-in-out
        hover:scale-110 hover:rotate-12
      `}
      style={{
        animation: isThinking 
          ? 'pulse 2s infinite, float 3s ease-in-out infinite' 
          : 'float 3s ease-in-out infinite, wiggle 4s ease-in-out infinite'
      }}>
        
        {/* Robot Eyes */}
        <div className="flex space-x-1">
          <div className={`
            ${size === 'xl' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-2 h-2' : 'w-1.5 h-1.5'} 
            bg-black 
            rounded-full 
            ${isThinking ? 'animate-ping' : 'animate-pulse'}
            shadow-sm
          `}></div>
          <div className={`
            ${size === 'xl' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-2 h-2' : 'w-1.5 h-1.5'} 
            bg-black 
            rounded-full 
            ${isThinking ? 'animate-ping' : 'animate-pulse'}
            shadow-sm
          `}
          style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Robot Antenna */}
        <div className={`
          absolute 
          ${size === 'xl' ? '-top-2' : '-top-1'} 
          left-1/2 transform -translate-x-1/2
        `}>
          <div className={`
            ${size === 'xl' ? 'w-1 h-3' : 'w-0.5 h-2'} 
            bg-yellow-700 
            rounded-full
          `}></div>
          <div className={`
            ${size === 'xl' ? 'w-1.5 h-1.5' : 'w-1 h-1'} 
            bg-red-400 
            rounded-full 
            mx-auto 
            animate-bounce
          `}
          style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Status Indicator */}
        {isThinking && (
          <div className="absolute -bottom-1 -right-1">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-ping border-2 border-white shadow-sm"></div>
          </div>
        )}
      </div>

      {/* Thinking Dots */}
      {isThinking && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-black border border-yellow-500 rounded-lg px-3 py-1 shadow-lg">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
      `}</style>
    </div>
  );
};

export default RobotAvatar;