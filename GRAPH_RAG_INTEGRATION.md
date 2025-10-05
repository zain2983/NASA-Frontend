# Graph RAG Integration

This document describes the Graph RAG integration implemented in the NASA Research Chat frontend.

## Overview

The Graph RAG integration connects the Next.js frontend with the backend Graph RAG API to provide intelligent chat functionality with knowledge graph visualization.

## Features

- **Graph RAG Chat**: Chat interface that uses the knowledge graph to provide contextual responses
- **Entity Visualization**: Shows entities extracted from each response
- **Graph Visualization**: Displays papers and their connected entities
- **Real-time Updates**: Graph visualization updates with each chat response

## Configuration

Set the following environment variable in your `.env.local` file:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## API Endpoints Used

- `GET /graph-rag/chat?query={query}&limit={limit}` - Chat with Graph RAG
- `GET /graph-rag/search?query={query}&limit={limit}` - Search knowledge graph
- `GET /graph-rag/stats` - Get knowledge graph statistics

## Components

### ChatPanel
- Handles user input and chat functionality
- Calls Graph RAG chat endpoint
- Extracts entities and graph results from responses
- Passes graph results to parent component

### GraphPanel
- Displays three modes: Stats, Search, and Visualization
- Shows knowledge graph statistics
- Provides search functionality
- Visualizes graph results from chat responses

### GraphChatClient
- Main component that connects ChatPanel and GraphPanel
- Manages graph results state
- Handles communication between components

## Response Structure

The Graph RAG chat endpoint returns:

```json
{
  "query": "user query",
  "response": "AI response text",
  "graph_results": [
    {
      "pub_id": 123,
      "title": "Paper Title",
      "mentioned_entities": ["Entity1", "Entity2"],
      "sections": [...],
      "entity_similarity_scores": {...}
    }
  ],
  "context_papers": [...],
  "method": "graph_rag_chat"
}
```

## Usage

1. Start the backend server on port 8000
2. Set the `NEXT_PUBLIC_API_BASE_URL` environment variable
3. Start the Next.js frontend
4. Navigate to `/graph-chat`
5. Ask questions in the chat panel
6. View graph visualization in the graph panel

## Testing

Test the integration with queries like:
- "epinephrine surgery"
- "otolaryngology procedures"
- "surgical field clarity"
