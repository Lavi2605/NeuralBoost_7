import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Phone, Globe, Shield, AlertTriangle } from 'lucide-react';
import { CHANNEL_COLORS, SEVERITY_LEVELS } from '../../data/phishingTypes';

const CHANNEL_ICONS = {
  email: Mail,
  sms: MessageSquare,
  voice: Phone,
  social: Globe,
  web: Globe
};

// Custom node component
const AttackNode = ({ data }) => {
  const Icon = CHANNEL_ICONS[data.channel] || Shield;
  const severity = SEVERITY_LEVELS[data.severity];
  
  return (
    <motion.div
      className="px-4 py-3 rounded-xl border-2 shadow-lg min-w-[180px]"
      style={{
        background: `linear-gradient(135deg, ${CHANNEL_COLORS[data.channel]}20, rgba(15, 22, 41, 0.8))`,
        backdropFilter: 'blur(12px)',
        borderColor: CHANNEL_COLORS[data.channel],
        boxShadow: `0 4px 12px rgba(0, 0, 0, 0.3), 0 0 20px ${CHANNEL_COLORS[data.channel]}30`
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="p-2 rounded-lg"
          style={{
            background: `${CHANNEL_COLORS[data.channel]}20`,
            color: CHANNEL_COLORS[data.channel]
          }}
        >
          <Icon size={18} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-text">{data.label}</h3>
          <div className="flex items-center gap-1 mt-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: `${CHANNEL_COLORS[data.channel]}20`,
                color: CHANNEL_COLORS[data.channel]
              }}
            >
              {data.channel}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: severity.bgColor,
                color: severity.color
              }}
            >
              {severity.label}
            </span>
          </div>
        </div>
      </div>
      {data.severity === 'high' && (
        <motion.div
          className="flex items-center gap-1 text-xs text-warning"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <AlertTriangle size={12} />
          <span>High Risk</span>
        </motion.div>
      )}
    </motion.div>
  );
};

// Channel node component
const ChannelNode = ({ data }) => {
  const Icon = CHANNEL_ICONS[data.channel] || Globe;
  
  return (
    <motion.div
      className="px-6 py-4 rounded-xl border-2 shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${CHANNEL_COLORS[data.channel]}30, rgba(15, 22, 41, 0.9))`,
        backdropFilter: 'blur(12px)',
        borderColor: CHANNEL_COLORS[data.channel],
        boxShadow: `0 4px 16px rgba(0, 0, 0, 0.4), 0 0 30px ${CHANNEL_COLORS[data.channel]}40`
      }}
      whileHover={{ scale: 1.08 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3">
        <div
          className="p-3 rounded-lg"
          style={{
            background: `${CHANNEL_COLORS[data.channel]}30`,
            color: CHANNEL_COLORS[data.channel]
          }}
        >
          <Icon size={24} />
        </div>
        <span className="text-base font-bold text-text">{data.label}</span>
      </div>
    </motion.div>
  );
};

// Root node component
const RootNode = () => {
  return (
    <motion.div
      className="px-8 py-6 rounded-2xl border-2 shadow-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.3))',
        backdropFilter: 'blur(16px)',
        borderColor: '#8b5cf6',
        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)'
      }}
      animate={{
        boxShadow: [
          '0 8px 32px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)',
          '0 8px 32px rgba(139, 92, 246, 0.7), 0 0 60px rgba(139, 92, 246, 0.5)',
          '0 8px 32px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)'
        ]
      }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      <div className="flex items-center gap-3">
        <Shield size={32} className="text-primary" />
        <span className="text-xl font-bold text-text">Phishing Attack Initiated</span>
      </div>
    </motion.div>
  );
};

const nodeTypes = {
  root: RootNode,
  channel: ChannelNode,
  attack: AttackNode
};

export default function FlowchartView({ types, onNodeClick, prefersReducedMotion = false }) {
  // Build flowchart data structure
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes = [];
    const edges = [];
    
    // Root node
    nodes.push({
      id: 'root',
      type: 'root',
      position: { x: 400, y: 0 },
      data: { label: 'Phishing Attack Initiated' }
    });
    
    // Group types by channel
    const channelGroups = {};
    types.forEach(type => {
      if (!channelGroups[type.channel]) {
        channelGroups[type.channel] = [];
      }
      channelGroups[type.channel].push(type);
    });
    
    // Create channel nodes and attack nodes
    const channelPositions = {
      email: { x: 150, y: 150 },
      sms: { x: 400, y: 150 },
      voice: { x: 650, y: 150 },
      social: { x: 275, y: 150 },
      web: { x: 525, y: 150 }
    };
    
    let channelIndex = 0;
    Object.keys(channelGroups).forEach((channel, idx) => {
      const channelPos = channelPositions[channel] || { x: 200 + idx * 200, y: 150 };
      
      // Channel node
      nodes.push({
        id: `channel-${channel}`,
        type: 'channel',
        position: channelPos,
        data: { label: channel.charAt(0).toUpperCase() + channel.slice(1), channel }
      });
      
      // Edge from root to channel
      edges.push({
        id: `e-root-${channel}`,
        source: 'root',
        target: `channel-${channel}`,
        animated: !prefersReducedMotion,
        style: { stroke: CHANNEL_COLORS[channel], strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: CHANNEL_COLORS[channel]
        }
      });
      
      // Attack nodes for this channel
      channelGroups[channel].forEach((type, typeIdx) => {
        const attackX = channelPos.x - 100 + (typeIdx * 200);
        const attackY = 300;
        
        nodes.push({
          id: type.id,
          type: 'attack',
          position: { x: attackX, y: attackY },
          data: {
            label: type.name,
            channel: type.channel,
            severity: type.severity,
            type: type
          }
        });
        
        // Edge from channel to attack
        edges.push({
          id: `e-${channel}-${type.id}`,
          source: `channel-${channel}`,
          target: type.id,
          animated: !prefersReducedMotion,
          style: { stroke: CHANNEL_COLORS[channel], strokeWidth: 1.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: CHANNEL_COLORS[channel]
          }
        });
      });
      
      channelIndex++;
    });
    
    return { nodes, edges };
  }, [types, prefersReducedMotion]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Update nodes/edges when types change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);
  
  const onNodeClickHandler = useCallback((event, node) => {
    if (node.data.type) {
      onNodeClick(node.data.type);
    }
  }, [onNodeClick]);
  
  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden bg-subtle border border-border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        style={{ background: 'transparent' }}
      >
        <Background color="#1e2a44" gap={20} size={1} />
        <Controls
          style={{
            button: {
              backgroundColor: 'rgba(15, 22, 41, 0.8)',
              color: '#e2e8f0',
              border: '1px solid rgba(30, 42, 68, 0.8)',
              borderRadius: '8px'
            }
          }}
        />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'root') return '#8b5cf6';
            if (node.type === 'channel') return CHANNEL_COLORS[node.data.channel] || '#6366f1';
            return CHANNEL_COLORS[node.data.channel] || '#6366f1';
          }}
          maskColor="rgba(11, 18, 32, 0.6)"
          style={{
            backgroundColor: 'rgba(15, 22, 41, 0.8)',
            border: '1px solid rgba(30, 42, 68, 0.8)'
          }}
        />
      </ReactFlow>
    </div>
  );
}

