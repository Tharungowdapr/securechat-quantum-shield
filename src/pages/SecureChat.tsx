
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthModal } from '@/components/auth/AuthModal';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { NetworkTopology } from '@/components/network/NetworkTopology';
import { useAuth } from '@/hooks/useAuth';
import { useCrypto } from '@/hooks/useCrypto';
import { useNetworkRouting } from '@/hooks/useNetworkRouting';
import { useIDS } from '@/hooks/useIDS';

const SecureChat = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing SecureChat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <i className="fas fa-shield-alt mr-2"></i>
          <h1 className="text-xl font-bold">SecureChat</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            {user?.email || 'Anonymous'}
          </span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-white text-green-600 px-3 py-1 rounded hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex h-screen">
        <div className="w-1/6 bg-white border-r border-gray-200">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full text-left px-3 py-2 rounded ${
                activeTab === 'chat' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-comments mr-2"></i>
              Chat
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-3 py-2 rounded ${
                activeTab === 'security' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-shield-alt mr-2"></i>
              Security
            </button>
            <button
              onClick={() => setActiveTab('network')}
              className={`w-full text-left px-3 py-2 rounded ${
                activeTab === 'network' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-network-wired mr-2"></i>
              Network
            </button>
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'security' && <SecurityDashboard />}
          {activeTab === 'network' && <NetworkTopology />}
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default SecureChat;
