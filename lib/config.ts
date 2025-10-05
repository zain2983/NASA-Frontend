// Configuration for the NASA Research Chat application

export const config = {
  // Backend API base URL
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  
  // Graph RAG endpoints
  GRAPH_RAG: {
    SEARCH: '/graph-rag/search',
    CHAT: '/graph-rag/chat',
    GRAPH: '/graph-rag/graph',
    STATS: '/graph-rag/stats',
    ENTITY: '/graph-rag/entity',
    PAPER: '/graph-rag/paper',
    STATUS: '/graph-rag/status'
  }
} as const;

export default config;
