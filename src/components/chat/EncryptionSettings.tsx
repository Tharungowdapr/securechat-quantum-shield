
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface EncryptionSettingsProps {
  onRotateKeys: () => void;
}

export const EncryptionSettings: React.FC<EncryptionSettingsProps> = ({ onRotateKeys }) => {
  const [encryptionMethod, setEncryptionMethod] = useState('hybrid');
  const [kmpEnabled, setKmpEnabled] = useState(true);
  const [rfEnabled, setRfEnabled] = useState(true);

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-3">Encryption Settings</h3>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Encryption Method
        </label>
        <select 
          value={encryptionMethod}
          onChange={(e) => setEncryptionMethod(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="aes">AES-256-GCM</option>
          <option value="kyber">Kyber (Post-Quantum)</option>
          <option value="hybrid">Hybrid (AES + Kyber)</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          IDS Scan Options
        </label>
        <div className="flex items-center mb-2">
          <input 
            type="checkbox" 
            checked={kmpEnabled}
            onChange={(e) => setKmpEnabled(e.target.checked)}
            className="mr-2"
          />
          <label>KMP Pattern Matching</label>
        </div>
        <div className="flex items-center">
          <input 
            type="checkbox" 
            checked={rfEnabled}
            onChange={(e) => setRfEnabled(e.target.checked)}
            className="mr-2"
          />
          <label>Random Forest Analysis</label>
        </div>
      </div>
      
      <div className="mt-6">
        <Button 
          onClick={onRotateKeys}
          className="bg-yellow-500 text-white w-full hover:bg-yellow-600"
        >
          <i className="fas fa-sync-alt mr-1"></i> Rotate Keys (DKMS)
        </Button>
      </div>
    </div>
  );
};
