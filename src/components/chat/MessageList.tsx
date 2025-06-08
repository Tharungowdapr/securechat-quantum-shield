
import React from 'react';

interface MessageListProps {
  messages: any[];
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  return (
    <div className="p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <i className="fas fa-lock text-4xl mb-4"></i>
          <p>Messages are end-to-end encrypted</p>
          <p className="text-sm">Start a secure conversation</p>
        </div>
      ) : (
        messages.map((message) => {
          const isOwn = message.sender_id === currentUserId;
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn
                    ? 'bg-green-500 text-white'
                    : 'bg-white border shadow-sm'
                }`}
              >
                <div className="break-words">{message.content}</div>
                <div className={`text-xs mt-1 flex items-center justify-between ${
                  isOwn ? 'text-green-100' : 'text-gray-500'
                }`}>
                  <span>
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {message.encrypted && (
                    <i className="fas fa-lock ml-2" title="Encrypted"></i>
                  )}
                  {message.threat_detected && (
                    <i className="fas fa-exclamation-triangle ml-2 text-yellow-500" title="Threat detected"></i>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
