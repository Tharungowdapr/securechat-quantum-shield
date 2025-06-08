
import React, { useState, useEffect } from 'react';
import { useNetworkRouting } from '@/hooks/useNetworkRouting';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const NetworkTopology = () => {
  const { networkNodes, networkConnections, findShortestPath, getRandomNodes } = useNetworkRouting();
  const [selectedPath, setSelectedPath] = useState<any>(null);
  const [sourceNode, setSourceNode] = useState('A');
  const [destinationNode, setDestinationNode] = useState('G');

  const handleFindPath = async () => {
    const path = await findShortestPath(sourceNode, destinationNode);
    setSelectedPath(path);
  };

  const handleRandomPath = async () => {
    const { source, destination } = getRandomNodes();
    setSourceNode(source);
    setDestinationNode(destination);
    const path = await findShortestPath(source, destination);
    setSelectedPath(path);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-network-wired mr-2"></i>
            Network Topology
          </CardTitle>
          <CardDescription>
            Secure routing using Dijkstra's algorithm with security metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Path Finding Controls */}
            <div className="space-y-4">
              <h3 className="font-semibold">Find Secure Path</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Source Node</label>
                  <select
                    value={sourceNode}
                    onChange={(e) => setSourceNode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {networkNodes.map((node) => (
                      <option key={node.node_id} value={node.node_id}>
                        {node.node_name} ({node.node_id})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Destination Node</label>
                  <select
                    value={destinationNode}
                    onChange={(e) => setDestinationNode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {networkNodes.map((node) => (
                      <option key={node.node_id} value={node.node_id}>
                        {node.node_name} ({node.node_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleFindPath} className="flex-1">
                  Find Path
                </Button>
                <Button onClick={handleRandomPath} variant="outline">
                  Random
                </Button>
              </div>

              {selectedPath && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Optimal Secure Path</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="font-medium">Path:</span>
                      <span className="ml-2 font-mono bg-white px-2 py-1 rounded">
                        {selectedPath.path.join(' → ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Weight: <strong>{selectedPath.totalWeight}</strong></span>
                      <span>Security Score: <strong>{selectedPath.securityScore.toFixed(2)}</strong></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Network Visualization (Simple) */}
            <div className="space-y-4">
              <h3 className="font-semibold">Network Nodes</h3>
              <div className="grid grid-cols-2 gap-2">
                {networkNodes.map((node) => {
                  const isInPath = selectedPath?.path.includes(node.node_id);
                  const securityLevel = node.security_metric < 0.2 ? 'high' : 
                                      node.security_metric < 0.35 ? 'medium' : 'low';
                  
                  return (
                    <div
                      key={node.node_id}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isInPath 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{node.node_id}</div>
                          <div className="text-sm text-gray-600">{node.node_name}</div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          securityLevel === 'high' ? 'bg-green-500' :
                          securityLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} title={`Security: ${node.security_metric}`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                    High Security
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                    Medium Security
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                    Low Security
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Connections */}
      <Card>
        <CardHeader>
          <CardTitle>Network Connections</CardTitle>
          <CardDescription>Secure communication links between nodes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {networkConnections.map((connection) => {
              const isInPath = selectedPath?.path.includes(connection.source_node_id) && 
                              selectedPath?.path.includes(connection.destination_node_id);
              
              return (
                <div
                  key={`${connection.source_node_id}-${connection.destination_node_id}`}
                  className={`p-3 rounded border ${
                    isInPath ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono">
                      {connection.source_node_id} ↔ {connection.destination_node_id}
                    </span>
                    <span className="text-sm font-semibold">
                      {connection.weight}
                    </span>
                  </div>
                  {connection.is_secure && (
                    <div className="text-xs text-green-600 mt-1">
                      <i className="fas fa-shield-alt mr-1"></i>
                      Secure
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
