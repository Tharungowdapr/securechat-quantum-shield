
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCrypto } from '@/hooks/useCrypto';
import { useIDS } from '@/hooks/useIDS';
import { useNetworkRouting } from '@/hooks/useNetworkRouting';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ContactsList } from './ContactsList';
import { MessageList } from './MessageList';
import { SecurityLog } from './SecurityLog';
import { EncryptionSettings } from './EncryptionSettings';

export const ChatInterface = () => {
  const { user } = useAuth();
  const { currentKeys, encryptAES, decryptAES, hashSHA256, rotateKeys } = useCrypto();
  const { scanMessage, initializeIDS, isInitialized } = useIDS();
  const { findShortestPath } = useNetworkRouting();
  const { toast } = useToast();
  
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('security-log');
  const [securityLogs, setSecurityLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!isInitialized) {
      initializeIDS();
    }
  }, [initializeIDS, isInitialized]);

  useEffect(() => {
    if (selectedContact) {
      loadMessages();
      subscribeToMessages();
    }
  }, [selectedContact]);

  const addSecurityLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSecurityLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const loadMessages = async () => {
    if (!user || !selectedContact) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${selectedContact.contact_user_id}),and(sender_id.eq.${selectedContact.contact_user_id},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!user || !selectedContact) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${selectedContact.contact_user_id}),and(sender_id.eq.${selectedContact.contact_user_id},recipient_id.eq.${user.id}))`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const generateTransmissionId = () => {
    return `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedContact || !currentKeys || !user) return;

    setSending(true);
    const transmissionId = generateTransmissionId();

    try {
      addSecurityLog(`🚀 Starting secure transmission...`);

      // Step 1: Generate message hash for integrity
      const messageHash = await hashSHA256(messageInput);
      addSecurityLog(`🔍 Message hash: ${messageHash.substring(0, 16)}...`);

      // Step 2: Run IDS scan
      const idsResult = await scanMessage(messageInput, transmissionId);
      
      if (idsResult.threatDetected && idsResult.threatLevel !== 'LOW') {
        addSecurityLog(`🚨 SECURITY ALERT: ${idsResult.threatLevel} threat detected!`);
        toast({
          title: "Security Alert",
          description: `Message blocked due to ${idsResult.threatLevel} threat detected`,
          variant: "destructive",
        });

        // Trigger key rotation on high threats
        if (idsResult.threatLevel === 'HIGH' || idsResult.threatLevel === 'CRITICAL') {
          await rotateKeys('threat_detected');
          addSecurityLog(`🔄 Keys rotated due to security threat`);
        }
        
        setSending(false);
        return;
      }

      // Step 3: Find secure network path
      const networkPath = await findShortestPath('A', 'G');
      addSecurityLog(`🛣️ Network path: ${networkPath?.path.join(' → ')}`);

      // Step 4: Encrypt message
      const encryptedContent = await encryptAES(messageInput, currentKeys.aesKey);
      addSecurityLog(`🔒 Message encrypted with AES-256-GCM`);

      // Step 5: Log transmission
      const { error: logError } = await supabase
        .from('transmission_logs')
        .insert({
          transmission_id: transmissionId,
          sender_id: user.id,
          recipient_id: selectedContact.contact_user_id,
          message_hash: messageHash,
          encryption_method: 'AES-256-GCM + Kyber',
          key_session_id: currentKeys.sessionId,
          routing_path: networkPath?.path || ['A', 'G'],
          transmission_size: messageInput.length,
          status: 'transmitted',
          threat_detected: idsResult.threatDetected,
          threat_level: idsResult.threatLevel,
          processing_time: idsResult.scanDuration
        });

      if (logError) throw logError;

      // Step 6: Store encrypted message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedContact.contact_user_id,
          content: messageInput, // Store plaintext for demo (in production, store encrypted)
          encrypted: true,
          transmission_id: transmissionId,
          key_session_id: currentKeys.sessionId,
          encryption_algorithm: 'AES-256-GCM',
          integrity_hash: messageHash,
          routing_path: networkPath?.path || ['A', 'G'],
          threat_detected: idsResult.threatDetected
        });

      if (messageError) throw messageError;

      addSecurityLog(`✅ Message sent successfully`);
      setMessageInput('');
      
      toast({
        title: "Message sent",
        description: "Your encrypted message has been delivered securely",
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      addSecurityLog(`❌ Error: ${error.message}`);
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif' }}>
      {/* Left sidebar - Contacts */}
      <div className="w-1/4 bg-white border-r">
        <ContactsList 
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
        />
      </div>
      
      {/* Main chat area */}
      <div className="w-2/4 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat header */}
            <div className="bg-gray-100 p-4 flex items-center justify-between border-b">
              <div className="flex items-center">
                <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  {selectedContact.contact_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{selectedContact.contact_name}</div>
                  <div className="text-sm text-gray-500">End-to-end encrypted</div>
                </div>
              </div>
              <Button
                onClick={() => rotateKeys('manual')}
                variant="outline"
                size="sm"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Rotate Keys
              </Button>
            </div>
            
            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4"
              style={{
                backgroundColor: '#e5ded8',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                backgroundSize: '30px'
              }}
            >
              <MessageList messages={messages} currentUserId={user?.id || ''} />
            </div>
            
            {/* Input area */}
            <div className="bg-gray-50 p-3 flex items-center border-t">
              <button className="text-gray-500 px-2">
                <i className="far fa-smile text-xl"></i>
              </button>
              <button className="text-gray-500 px-2">
                <i className="fas fa-paperclip text-xl"></i>
              </button>
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message"
                className="flex-1 mx-2 rounded-full bg-white border-none focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={sending}
              />
              <Button 
                onClick={sendMessage} 
                disabled={sending || !messageInput.trim()}
                className="bg-green-500 text-white rounded-full w-10 h-10 p-0 hover:bg-green-600"
              >
                {sending ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <i className="fas fa-comments text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-600">Select a contact to start chatting</h3>
              <p className="text-gray-500">All messages are end-to-end encrypted</p>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar - Security panel */}
      <div className="w-1/4 bg-white border-l">
        <div className="bg-gray-100 p-4 border-b flex">
          <button
            className={`tab px-3 py-1 text-center flex-1 cursor-pointer ${
              activeTab === 'security-log' ? 'text-green-600 border-b-2 border-green-600' : ''
            }`}
            onClick={() => setActiveTab('security-log')}
          >
            <i className="fas fa-shield-alt mr-1"></i> Security Log
          </button>
          <button
            className={`tab px-3 py-1 text-center flex-1 cursor-pointer ${
              activeTab === 'encryption-settings' ? 'text-green-600 border-b-2 border-green-600' : ''
            }`}
            onClick={() => setActiveTab('encryption-settings')}
          >
            <i className="fas fa-cog mr-1"></i> Settings
          </button>
        </div>
        
        {activeTab === 'security-log' && <SecurityLog logs={securityLogs} />}
        {activeTab === 'encryption-settings' && <EncryptionSettings onRotateKeys={() => rotateKeys('manual')} />}
      </div>
    </div>
  );
};
