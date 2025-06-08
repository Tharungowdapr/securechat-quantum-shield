
import React from 'react';

interface MessageListProps {
  messages: any[];
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  return (
    <div className="space-y-2">
      {messages.length === 0 ? (
        <div className="flex justify-center">
          <div className="bg-white rounded-lg p-3 shadow-sm text-center">
            <i className="fas fa-lock text-green-500 mb-2"></i>
            <p>Messages are end-to-end encrypted</p>
          </div>
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
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-sm relative ${
                  isOwn
                    ? 'bg-green-200 ml-auto'
                    : 'bg-white mr-auto'
                }`}
                style={{
                  borderTopRightRadius: isOwn ? '0' : '8px',
                  borderTopLeftRadius: isOwn ? '8px' : '0',
                  wordWrap: 'break-word'
                }}
              >
                <div className="break-words">{message.content}</div>
                <div className={`text-xs mt-1 text-right ${
                  isOwn ? 'text-green-700' : 'text-gray-500'
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
