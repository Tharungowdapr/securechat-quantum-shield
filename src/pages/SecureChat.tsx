
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthModal } from '@/components/auth/AuthModal';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { NetworkTopology } from '@/components/network/NetworkTopology';
import { useAuth } from '@/hooks/useAuth';

const SecureChat = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    } else if (user) {
      setShowAuthModal(false);
    }
  }, [user, loading]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

  // Show auth modal if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-lock text-6xl text-green-600 mb-4"></i>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SecureChat</h1>
          <p className="text-gray-600 mb-8">End-to-end encrypted messaging with quantum-safe security</p>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <i className="fas fa-lock mr-2"></i>
          <h1 className="text-xl font-bold">SecureChat</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            {user?.user_metadata?.full_name || user?.email || 'User'}
          </span>
          <button
            onClick={handleSignOut}
            className="bg-white text-green-600 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
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
              className={`w-full text-left px-3 py-2 rounded transition-colors ${
                activeTab === 'chat' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-comments mr-2"></i>
              Chat
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-3 py-2 rounded transition-colors ${
                activeTab === 'security' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-shield-alt mr-2"></i>
              Security
            </button>
            <button
              onClick={() => setActiveTab('network')}
              className={`w-full text-left px-3 py-2 rounded transition-colors ${
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

      {/* Show auth modal when explicitly requested */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default SecureChat;
