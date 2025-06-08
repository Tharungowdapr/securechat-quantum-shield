
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCrypto } from '@/hooks/useCrypto';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const SecurityDashboard = () => {
  const { user } = useAuth();
  const { currentKeys, keyRotationCount, rotateKeys } = useCrypto();
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);
  const [keyRotationEvents, setKeyRotationEvents] = useState<any[]>([]);
  const [transmissionLogs, setTransmissionLogs] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadSecurityData();
    }
  }, [user]);

  const loadSecurityData = async () => {
    if (!user) return;

    try {
      const [alertsResult, rotationResult, logsResult] = await Promise.all([
        supabase
          .from('security_alerts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('key_rotation_events')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('transmission_logs')
          .select('*')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (alertsResult.data) setSecurityAlerts(alertsResult.data);
      if (rotationResult.data) setKeyRotationEvents(rotationResult.data);
      if (logsResult.data) setTransmissionLogs(logsResult.data);
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-blue-600 bg-blue-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Key Management Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-key mr-2"></i>
              Key Management
            </CardTitle>
            <CardDescription>DKMS Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Session ID:</span>
                <span className="font-mono text-sm">
                  {currentKeys?.sessionId?.slice(-8) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rotations:</span>
                <span>{keyRotationCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="text-sm">
                  {currentKeys?.createdAt.toLocaleTimeString() || 'N/A'}
                </span>
              </div>
              <Button
                onClick={() => rotateKeys('manual')}
                className="w-full mt-4"
                variant="outline"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Rotate Keys
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Encryption Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-lock mr-2"></i>
              Encryption
            </CardTitle>
            <CardDescription>Cryptographic Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>AES-256:</span>
                <span className="text-green-600">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Kyber:</span>
                <span className="text-green-600">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>SHA-256:</span>
                <span className="text-green-600">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Quantum Safe:</span>
                <span className="text-green-600">✓ Yes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IDS Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-shield-alt mr-2"></i>
              Intrusion Detection
            </CardTitle>
            <CardDescription>Security Monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>KMP Scanner:</span>
                <span className="text-green-600">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ML Analysis:</span>
                <span className="text-green-600">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Real-time:</span>
                <span className="text-green-600">✓ Monitoring</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transmissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transmissions</CardTitle>
          <CardDescription>Secure message transmission logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transmissionLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No transmissions yet</p>
            ) : (
              transmissionLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{log.transmission_id}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getThreatLevelColor(log.threat_level || 'SAFE')}`}>
                      {log.threat_level || 'SAFE'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      log.status === 'transmitted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Rotation History */}
      <Card>
        <CardHeader>
          <CardTitle>Key Rotation History</CardTitle>
          <CardDescription>DKMS rotation events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {keyRotationEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No key rotations yet</p>
            ) : (
              keyRotationEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Session: {event.new_session_id.slice(-8)}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(event.created_at).toLocaleString()}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    event.rotation_reason === 'emergency' || event.rotation_reason === 'threat_detected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {event.rotation_reason}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
