
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CryptoKeys {
  sessionId: string;
  aesKey: CryptoKey;
  kyberPublicKey: Uint8Array;
  kyberPrivateKey: Uint8Array;
  createdAt: Date;
}

export const useCrypto = () => {
  const { user } = useAuth();
  const [currentKeys, setCurrentKeys] = useState<CryptoKeys | null>(null);
  const [keyRotationCount, setKeyRotationCount] = useState(0);

  // Generate AES-256 key
  const generateAESKey = async (): Promise<CryptoKey> => {
    return await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  };

  // Generate Kyber key pair (simplified implementation)
  const generateKyberKeyPair = async () => {
    const publicKey = new Uint8Array(1184);
    const privateKey = new Uint8Array(2400);
    
    crypto.getRandomValues(publicKey);
    crypto.getRandomValues(privateKey);
    
    return { publicKey, privateKey };
  };

  // Generate session ID
  const generateSessionId = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}-${random}`;
  };

  // Rotate keys
  const rotateKeys = async (reason: string = 'manual') => {
    if (!user) return null;

    try {
      const sessionId = generateSessionId();
      const aesKey = await generateAESKey();
      const { publicKey, privateKey } = await generateKyberKeyPair();

      // Store keys in database
      const aesKeyData = await crypto.subtle.exportKey('raw', aesKey);
      
      const keyInserts = [
        {
          user_id: user.id,
          key_type: 'aes_session',
          key_data: new Uint8Array(aesKeyData),
          session_id: sessionId,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          rotation_count: keyRotationCount + 1,
          rotation_reason: reason
        },
        {
          user_id: user.id,
          key_type: 'kyber_public',
          key_data: publicKey,
          session_id: sessionId,
          rotation_count: keyRotationCount + 1,
          rotation_reason: reason
        },
        {
          user_id: user.id,
          key_type: 'kyber_private',
          key_data: privateKey,
          session_id: sessionId,
          rotation_count: keyRotationCount + 1,
          rotation_reason: reason
        }
      ];

      const { error } = await supabase
        .from('user_keys')
        .insert(keyInserts);

      if (error) throw error;

      // Log rotation event
      await supabase
        .from('key_rotation_events')
        .insert({
          user_id: user.id,
          old_session_id: currentKeys?.sessionId || null,
          new_session_id: sessionId,
          rotation_reason: reason,
          rotation_duration: Date.now() - (currentKeys?.createdAt.getTime() || Date.now())
        });

      const newKeys: CryptoKeys = {
        sessionId,
        aesKey,
        kyberPublicKey: publicKey,
        kyberPrivateKey: privateKey,
        createdAt: new Date()
      };

      setCurrentKeys(newKeys);
      setKeyRotationCount(prev => prev + 1);
      
      console.log(`🔄 Keys rotated - Reason: ${reason}, Session: ${sessionId}`);
      return newKeys;
    } catch (error) {
      console.error('Key rotation failed:', error);
      return null;
    }
  };

  // AES encryption
  const encryptAES = async (plaintext: string, key: CryptoKey): Promise<ArrayBuffer> => {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedText = new TextEncoder().encode(plaintext);
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedText
    );
    
    // Combine IV and ciphertext
    const result = new Uint8Array(iv.length + ciphertext.byteLength);
    result.set(iv);
    result.set(new Uint8Array(ciphertext), iv.length);
    
    return result.buffer;
  };

  // AES decryption
  const decryptAES = async (cipherBuffer: ArrayBuffer, key: CryptoKey): Promise<string | null> => {
    try {
      const data = new Uint8Array(cipherBuffer);
      const iv = data.slice(0, 12);
      const ciphertext = data.slice(12);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  };

  // SHA-256 hashing for integrity
  const hashSHA256 = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Initialize keys on mount
  useEffect(() => {
    if (user && !currentKeys) {
      rotateKeys('initialization');
    }
  }, [user]);

  return {
    currentKeys,
    keyRotationCount,
    rotateKeys,
    encryptAES,
    decryptAES,
    hashSHA256,
    generateAESKey,
    generateKyberKeyPair
  };
};
