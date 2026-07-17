import { ReactFlow, Background, BackgroundVariant, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlow } from '../../store/flowStore';
import { FlowNode } from './FlowNode';

// Stable ref required by React Flow.
const nodeTypes = {
  source: FlowNode,
  master: FlowNode,
  animation: FlowNode,
  review: FlowNode,
  promote: FlowNode,
};

export function CreationFlowCanvas() {
  const nodes = useFlow((s) => s.nodes);
  const edges = useFlow((s) => s.edges);
  const onNodesChange = useFlow((s) => s.onNodesChange);
  const onEdgesChange = useFlow((s) => s.onEdgesChange);
  const onConnect = useFlow((s) => s.onConnect);
  const select = useFlow((s) => s.select);
  const confirmEdge = useFlow((s) => s.confirmEdge);

  return (
    <div className="canvas-wrap">
      <div className="canvas-atmos" aria-hidden />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, n) => select(n.id)}
        onEdgeClick={(_, e) => confirmEdge(e.id)}
        onPaneClick={() => select(null)}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.4}
        maxZoom={1.6}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={26} size={1.4} color="#d3ccbe" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
