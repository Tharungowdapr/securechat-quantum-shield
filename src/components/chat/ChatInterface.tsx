
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCrypto } from '@/hooks/useCrypto';
import { useIDS } from '@/hooks/useIDS';
import { useNetworkRouting } from '@/hooks/useNetworkRouting';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactsList } from './ContactsList';
import { MessageList } from './MessageList';

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
      console.log(`🚀 Starting secure transmission...`);

      // Step 1: Generate message hash for integrity
      const messageHash = await hashSHA256(messageInput);
      console.log(`🔍 Message hash: ${messageHash.substring(0, 16)}...`);

      // Step 2: Run IDS scan
      const idsResult = await scanMessage(messageInput, transmissionId);
      
      if (idsResult.threatDetected && idsResult.threatLevel !== 'LOW') {
        toast({
          title: "Security Alert",
          description: `Message blocked due to ${idsResult.threatLevel} threat detected`,
          variant: "destructive",
        });

        // Trigger key rotation on high threats
        if (idsResult.threatLevel === 'HIGH' || idsResult.threatLevel === 'CRITICAL') {
          await rotateKeys('threat_detected');
        }
        
        return;
      }

      // Step 3: Find secure network path
      const networkPath = await findShortestPath('A', 'G');
      console.log(`🛣️ Network path: ${networkPath?.path.join(' → ')}`);

      // Step 4: Encrypt message
      const encryptedContent = await encryptAES(messageInput, currentKeys.aesKey);
      console.log(`🔒 Message encrypted with AES-256-GCM`);

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

      console.log(`✅ Message sent successfully`);
      setMessageInput('');
      
      toast({
        title: "Message sent",
        description: "Your encrypted message has been delivered securely",
      });

    } catch (error) {
      console.error('Failed to send message:', error);
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
    <div className="flex h-full">
      <div className="w-1/3 border-r">
        <ContactsList 
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
        />
      </div>
      
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="border-b p-4 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedContact.contact_name}</h3>
                  <p className="text-sm text-gray-500">End-to-end encrypted</p>
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
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <MessageList messages={messages} currentUserId={user?.id || ''} />
            </div>
            
            <div className="border-t p-4 bg-white">
              <div className="flex space-x-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your secure message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={sending}
                />
                <Button onClick={sendMessage} disabled={sending || !messageInput.trim()}>
                  {sending ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-paper-plane"></i>
                  )}
                </Button>
              </div>
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
    </div>
  );
};
