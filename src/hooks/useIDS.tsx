
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IDSResult {
  threatDetected: boolean;
  threatLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  kmpResults: any;
  mlResults: any;
  scanDuration: number;
}

export const useIDS = () => {
  const [threatPatterns, setThreatPatterns] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load threat patterns from database
  const initializeIDS = useCallback(async () => {
    try {
      const { data: patterns } = await supabase
        .rpc('get_active_threat_patterns');
      
      if (patterns) {
        setThreatPatterns(patterns.map((p: any) => p.pattern));
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize IDS:', error);
    }
  }, []);

  // KMP pattern matching algorithm
  const computeLPS = (pattern: string): number[] => {
    const lps = new Array(pattern.length).fill(0);
    let length = 0;
    let i = 1;

    while (i < pattern.length) {
      if (pattern[i] === pattern[length]) {
        length++;
        lps[i] = length;
        i++;
      } else {
        if (length !== 0) {
          length = lps[length - 1];
        } else {
          lps[i] = 0;
          i++;
        }
      }
    }
    return lps;
  };

  const kmpSearch = (text: string, pattern: string): boolean => {
    if (!pattern) return false;
    
    const lps = computeLPS(pattern);
    let i = 0; // index for text
    let j = 0; // index for pattern

    while (i < text.length) {
      if (pattern[j] === text[i]) {
        i++;
        j++;
      }

      if (j === pattern.length) {
        return true; // Found match
      } else if (i < text.length && pattern[j] !== text[i]) {
        if (j !== 0) {
          j = lps[j - 1];
        } else {
          i++;
        }
      }
    }
    return false;
  };

  // Run KMP scan
  const runKMPScan = (message: string): any => {
    const startTime = Date.now();
    const matches = [];
    
    for (const pattern of threatPatterns) {
      if (kmpSearch(message.toLowerCase(), pattern.toLowerCase())) {
        matches.push(pattern);
      }
    }
    
    const scanDuration = Date.now() - startTime;
    
    return {
      found: matches.length > 0,
      matches,
      count: matches.length,
      scanDuration,
      threatLevel: matches.length > 0 ? 'HIGH' : 'SAFE'
    };
  };

  // Extract features for ML analysis
  const extractMLFeatures = (message: string): number[] => {
    const features = [];
    
    // Feature 1: Message length normalized
    features.push(Math.min(message.length / 1000, 1));
    
    // Feature 2: Uppercase ratio
    features.push((message.match(/[A-Z]/g) || []).length / message.length);
    
    // Feature 3: Digit ratio
    features.push((message.match(/\d/g) || []).length / message.length);
    
    // Feature 4: Special character ratio
    features.push((message.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length / message.length);
    
    // Feature 5: Word count ratio
    const words = message.split(/\s+/).filter(word => word.length > 0);
    features.push(words.length / message.length);
    
    // Feature 6: Average word length
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length || 0;
    features.push(Math.min(avgWordLength / 20, 1));
    
    // Feature 7: Entropy estimation
    const charFreq: { [key: string]: number } = {};
    for (let char of message) {
      charFreq[char] = (charFreq[char] || 0) + 1;
    }
    let entropy = 0;
    for (let freq of Object.values(charFreq)) {
      const p = freq / message.length;
      entropy -= p * Math.log2(p);
    }
    features.push(Math.min(entropy / 8, 1));
    
    // Feature 8: Repeated patterns
    let repeatedPatterns = 0;
    for (let i = 0; i < message.length - 2; i++) {
      const pattern = message.substring(i, i + 3);
      if (message.indexOf(pattern, i + 1) !== -1) {
        repeatedPatterns++;
      }
    }
    features.push(Math.min(repeatedPatterns / message.length, 1));
    
    return features;
  };

  // Simplified ML classification
  const runMLScan = (message: string): any => {
    const startTime = Date.now();
    const features = extractMLFeatures(message);
    
    // Simple scoring based on features
    let suspiciousScore = 0;
    
    // High special character ratio
    if (features[3] > 0.3) suspiciousScore += 0.2;
    
    // Very short or very long messages
    if (features[0] < 0.1 || features[0] > 0.8) suspiciousScore += 0.15;
    
    // High entropy (random-looking text)
    if (features[6] > 0.7) suspiciousScore += 0.25;
    
    // Many repeated patterns
    if (features[7] > 0.1) suspiciousScore += 0.2;
    
    // Keywords that might indicate testing
    if (message.toLowerCase().includes('test') || 
        message.toLowerCase().includes('trigger')) {
      suspiciousScore += 0.3;
    }
    
    const scanDuration = Date.now() - startTime;
    
    let threatLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'SAFE';
    if (suspiciousScore >= 0.8) threatLevel = 'CRITICAL';
    else if (suspiciousScore >= 0.6) threatLevel = 'HIGH';
    else if (suspiciousScore >= 0.4) threatLevel = 'MEDIUM';
    else if (suspiciousScore >= 0.2) threatLevel = 'LOW';
    
    return {
      suspicious: suspiciousScore > 0.5,
      confidence: suspiciousScore,
      features,
      scanDuration,
      threatLevel
    };
  };

  // Main IDS scan function
  const scanMessage = async (message: string, transmissionId?: string): Promise<IDSResult> => {
    const overallStartTime = Date.now();
    
    // Run both scans
    const kmpResults = runKMPScan(message);
    const mlResults = runMLScan(message);
    
    // Combine threat levels
    const threatLevels = ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const kmpLevel = threatLevels.indexOf(kmpResults.threatLevel);
    const mlLevel = threatLevels.indexOf(mlResults.threatLevel);
    const combinedLevel = Math.max(kmpLevel, mlLevel);
    
    const result: IDSResult = {
      threatDetected: kmpResults.found || mlResults.suspicious,
      threatLevel: threatLevels[combinedLevel] as any,
      confidence: Math.max(kmpResults.found ? 1.0 : 0, mlResults.confidence),
      kmpResults,
      mlResults,
      scanDuration: Date.now() - overallStartTime
    };
    
    // Log scan results to database
    if (transmissionId) {
      try {
        await supabase
          .from('ids_scan_results')
          .insert({
            transmission_id: transmissionId,
            scan_type: 'combined',
            threat_detected: result.threatDetected,
            confidence_score: result.confidence,
            threat_patterns_matched: { kmp: kmpResults.matches, ml: mlResults.features },
            ml_features: mlResults.features,
            scan_duration: result.scanDuration
          });
      } catch (error) {
        console.error('Failed to log IDS results:', error);
      }
    }
    
    console.log(`🔍 IDS Scan Complete - Threat: ${result.threatLevel}, Confidence: ${result.confidence.toFixed(2)}`);
    
    return result;
  };

  return {
    isInitialized,
    initializeIDS,
    scanMessage,
    threatPatterns
  };
};
