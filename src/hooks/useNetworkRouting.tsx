
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NetworkPath {
  path: string[];
  totalWeight: number;
  securityScore: number;
}

export const useNetworkRouting = () => {
  const [networkNodes, setNetworkNodes] = useState<any[]>([]);
  const [networkConnections, setNetworkConnections] = useState<any[]>([]);

  // Load network topology
  useEffect(() => {
    loadNetworkTopology();
  }, []);

  const loadNetworkTopology = async () => {
    try {
      const [nodesResult, connectionsResult] = await Promise.all([
        supabase.from('network_nodes').select('*').eq('is_active', true),
        supabase.from('network_connections').select('*').eq('is_secure', true)
      ]);

      if (nodesResult.data) setNetworkNodes(nodesResult.data);
      if (connectionsResult.data) setNetworkConnections(connectionsResult.data);
    } catch (error) {
      console.error('Failed to load network topology:', error);
    }
  };

  // Find shortest path using Supabase function
  const findShortestPath = async (source: string, destination: string): Promise<NetworkPath | null> => {
    try {
      const { data, error } = await supabase
        .rpc('find_shortest_path', {
          source_node: source,
          destination_node: destination
        });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          path: result.path,
          totalWeight: result.total_weight,
          securityScore: result.security_score
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to find shortest path:', error);
      return null;
    }
  };

  // Get random source and destination nodes for demo
  const getRandomNodes = () => {
    const nodeIds = networkNodes.map(n => n.node_id);
    if (nodeIds.length < 2) return { source: 'A', destination: 'G' };
    
    const source = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    let destination = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    while (destination === source) {
      destination = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    }
    
    return { source, destination };
  };

  return {
    networkNodes,
    networkConnections,
    findShortestPath,
    getRandomNodes,
    loadNetworkTopology
  };
};
