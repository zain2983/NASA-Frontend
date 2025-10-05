"use client"

import React, { useMemo } from 'react'

interface GraphVisualizationProps {
  graphData?: {
    nodes: Array<{
      id: string
      label: string
      type: 'publication' | 'entity' | 'section'
      size?: number
      color?: string
      properties?: any
    }>
    edges: Array<{
      id: string
      source: string
      target: string
      type: string
      color?: string
    }>
    papers: any[]
    query_entities: string[]
    matched_entities: any[]
  }
}

export function GraphVisualization({ graphData }: GraphVisualizationProps) {
  const [draggedNode, setDraggedNode] = React.useState<string | null>(null)
  const [nodePositions, setNodePositions] = React.useState<Record<string, { x: number; y: number }>>({})

  // Calculate initial node positions in circular layout with more spacing
  const initialPositions = useMemo(() => {
    if (!graphData?.nodes) return {}

    const nodes = graphData.nodes
    const centerX = 400
    const centerY = 300
    
    // Separate nodes by type
    const publications = nodes.filter(n => n.type === 'publication')
    const entities = nodes.filter(n => n.type === 'entity')
    const sections = nodes.filter(n => n.type === 'section')
    
    const positions: Record<string, { x: number; y: number }> = {}
    
    nodes.forEach((node) => {
      let position = { x: centerX, y: centerY }
      
      if (node.type === 'publication') {
        // Publications in a small circle at center with more spacing
        const pubIndex = publications.findIndex(p => p.id === node.id)
        const radius = 80
        const angle = (pubIndex * 2 * Math.PI) / Math.max(publications.length, 1)
        position = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        }
      } else if (node.type === 'entity') {
        // Entities in outer ring with more spacing
        const entityIndex = entities.findIndex(e => e.id === node.id)
        const radius = 280
        const angle = (entityIndex * 2 * Math.PI) / Math.max(entities.length, 1)
        position = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        }
      } else if (node.type === 'section') {
        // Sections in inner ring with more spacing
        const sectionIndex = sections.findIndex(s => s.id === node.id)
        const radius = 180
        const angle = (sectionIndex * 2 * Math.PI) / Math.max(sections.length, 1)
        position = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        }
      }
      
      positions[node.id] = position
    })
    
    return positions
  }, [graphData])

  // Initialize positions on first load
  React.useEffect(() => {
    if (Object.keys(nodePositions).length === 0 && Object.keys(initialPositions).length > 0) {
      setNodePositions(initialPositions)
    }
  }, [initialPositions, nodePositions])

  const positionedNodes = useMemo(() => {
    if (!graphData?.nodes) return []
    
    return graphData.nodes.map((node) => {
      const position = nodePositions[node.id] || { x: 400, y: 300 }
      return {
        ...node,
        position,
        size: node.type === 'publication' ? 40 : node.type === 'entity' ? 35 : 30
      }
    })
  }, [graphData, nodePositions])

  // Drag and drop handlers
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault()
    setDraggedNode(nodeId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNode) return
    
    const svg = e.currentTarget as SVGSVGElement
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) * 800) / rect.width
    const y = ((e.clientY - rect.top) * 600) / rect.height
    
    setNodePositions(prev => ({
      ...prev,
      [draggedNode]: { x, y }
    }))
  }

  const handleMouseUp = () => {
    setDraggedNode(null)
  }

  // Filter edges to only include those where both nodes exist
  const validEdges = useMemo(() => {
    if (!graphData?.edges || !positionedNodes.length) return []
    
    const nodeIds = new Set(positionedNodes.map(n => n.id))
    return graphData.edges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    )
  }, [graphData, positionedNodes])

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-900">
        <div className="text-center text-gray-400">
          <div className="text-xl mb-2">📊</div>
          <div>No graph data available</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative bg-slate-900 overflow-auto">
      {/* SVG Canvas for the graph */}
      <svg 
        className="w-full h-full" 
        viewBox="0 0 800 600"
        style={{ minHeight: '600px' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Defs for simple solid colors */}
        <defs>
          {/* Simple animations */}
          <animateTransform
            id="pulse"
            attributeName="transform"
            type="scale"
            values="1;1.1;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </defs>

        {/* Render edges first (so they appear behind nodes) */}
        {validEdges.map((edge) => {
          const sourceNode = positionedNodes.find(n => n.id === edge.source)
          const targetNode = positionedNodes.find(n => n.id === edge.target)
          
          if (!sourceNode || !targetNode) return null

          const isAnimated = edge.type === 'mentions'
          const strokeColor = edge.type === 'mentions' ? '#10B981' : '#F59E0B'
          const strokeDasharray = edge.type === 'mentions' ? '0' : '5,3'

          return (
            <g key={edge.id}>
              {/* Main edge */}
              <path
                d={`M ${sourceNode.position.x} ${sourceNode.position.y} Q ${(sourceNode.position.x + targetNode.position.x) / 2} ${(sourceNode.position.y + targetNode.position.y) / 2 - 30} ${targetNode.position.x} ${targetNode.position.y}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                strokeDasharray={strokeDasharray}
                opacity="0.8"
              >
                {/* Animated dash for mentions */}
                {isAnimated && (
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;20"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
              </path>
              
              {/* Edge label */}
              <text
                x={(sourceNode.position.x + targetNode.position.x) / 2}
                y={(sourceNode.position.y + targetNode.position.y) / 2 - 40}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-300"
                style={{
                  fontSize: '9px'
                }}
              >
                {edge.type === 'mentions' ? 'MENTIONS' : 'SECTION'}
              </text>
            </g>
          )
        })}

        {/* Render nodes */}
        {positionedNodes.map((node) => {
          const fillColor = node.type === 'publication' ? '#8B5CF6' : 
                           node.type === 'entity' ? '#10B981' : '#F59E0B'
          const isDragging = draggedNode === node.id
          
          return (
            <g 
              key={node.id}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              style={{ cursor: 'grab' }}
              className="transition-transform duration-200 hover:scale-110"
            >
              {/* Node circle */}
              <circle
                cx={node.position.x}
                cy={node.position.y}
                r={node.size! / 2}
                fill={fillColor}
                stroke="#ffffff"
                strokeWidth="2"
                opacity={isDragging ? 0.8 : 1}
                style={{ 
                  cursor: isDragging ? 'grabbing' : 'grab',
                  filter: isDragging ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none'
                }}
              >
                {/* Subtle pulse animation */}
                <animate
                  attributeName="r"
                  values={`${node.size! / 2};${node.size! / 2 + 2};${node.size! / 2}`}
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              
              {/* Node label */}
              <text
                x={node.position.x}
                y={node.position.y + node.size! / 2 + 12}
                textAnchor="middle"
                className="text-xs font-medium fill-white select-none"
                style={{
                  fontSize: '9px',
                  pointerEvents: 'none',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                }}
              >
                {node.label.length > 12 ? node.label.substring(0, 12) + '...' : node.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 text-white">
        <div className="text-sm font-bold mb-2">Graph Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#8B5CF6' }}></div>
            <span>Publications</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
            <span>Entities</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
            <span>Sections</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-300">
          💡 Drag nodes to move them
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 text-white">
        <div className="text-sm font-bold mb-1">Graph Stats</div>
        <div className="text-xs space-y-1">
          <div>📄 Publications: {positionedNodes.filter(n => n.type === 'publication').length}</div>
          <div>🏷️ Entities: {positionedNodes.filter(n => n.type === 'entity').length}</div>
          <div>📋 Sections: {positionedNodes.filter(n => n.type === 'section').length}</div>
          <div>🔗 Connections: {validEdges.length}</div>
        </div>
      </div>
    </div>
  )
}