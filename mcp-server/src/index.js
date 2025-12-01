/**
 * Daemon MCP Server
 *
 * Exposes daemon personal API as MCP tools for AI assistants.
 * Protocol: MCP over HTTP (JSON-RPC style)
 */

const DAEMON_API = 'https://daemon.ajvanbeest.com';

// Tool definitions
const TOOLS = [
  {
    name: 'get_about',
    description: 'Get information about A.J. Van Beest - bio, tagline, links, certifications',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'get_identity',
    description: 'Get A.J.\'s core identity - missions, values, beliefs, and what drives him',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'get_adventures',
    description: 'Get A.J.\'s adventure pursuits - sailing dreams (Watertribe, R2AK), music (sax), exploration goals',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'get_projects',
    description: 'Get list of public projects A.J. is working on',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'get_skills',
    description: 'Get professional, exploratory, and personal skills (including sailing, music, craftsmanship)',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'get_interests',
    description: 'Get topics and interests A.J. cares about',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'get_looking_for',
    description: 'Get what A.J. is looking for - kindred spirits, collaboration, speaking opportunities, sailing community',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'get_media',
    description: 'Get current reading and watching - books, movies, shows',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'get_current_focus',
    description: 'Get what A.J. is currently working on - today, this week, and active projects',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'get_all',
    description: 'Get all public daemon data in one call',
    inputSchema: { type: 'object', properties: {}, required: [] }
  }
];

// Server info
const SERVER_INFO = {
  name: 'daemon-mcp',
  version: '1.0.0',
  description: 'MCP server for A.J. Van Beest daemon personal API'
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// JSON response helper
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

// Fetch from daemon API
async function fetchDaemon(endpoint) {
  const response = await fetch(`${DAEMON_API}${endpoint}`);
  return response.json();
}

// Handle tool calls
async function handleToolCall(toolName) {
  const endpointMap = {
    'get_about': '/about',
    'get_identity': '/identity',
    'get_adventures': '/adventures',
    'get_projects': '/projects',
    'get_skills': '/skills',
    'get_interests': '/interests',
    'get_looking_for': '/looking_for',
    'get_media': '/media',
    'get_current_focus': '/current_focus',
    'get_all': '/all'
  };

  const endpoint = endpointMap[toolName];
  if (!endpoint) {
    return { error: `Unknown tool: ${toolName}` };
  }

  return fetchDaemon(endpoint);
}

// MCP JSON-RPC handler
async function handleMcpRequest(request) {
  const body = await request.json();
  const { jsonrpc, id, method, params } = body;

  // Validate JSON-RPC
  if (jsonrpc !== '2.0') {
    return jsonResponse({ jsonrpc: '2.0', id, error: { code: -32600, message: 'Invalid Request' } }, 400);
  }

  let result;

  switch (method) {
    case 'initialize':
      result = {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO
      };
      break;

    case 'tools/list':
      result = { tools: TOOLS };
      break;

    case 'tools/call':
      const toolName = params?.name;
      if (!toolName) {
        return jsonResponse({ jsonrpc: '2.0', id, error: { code: -32602, message: 'Missing tool name' } }, 400);
      }
      const toolResult = await handleToolCall(toolName);
      result = {
        content: [{ type: 'text', text: JSON.stringify(toolResult, null, 2) }]
      };
      break;

    case 'notifications/initialized':
      // Client notification, no response needed
      return jsonResponse({ jsonrpc: '2.0', id, result: {} });

    default:
      return jsonResponse({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } }, 404);
  }

  return jsonResponse({ jsonrpc: '2.0', id, result });
}

// Landing page HTML
const landingPage = `<!DOCTYPE html>
<html>
<head>
  <title>Daemon MCP Server</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
    h1 { color: #333; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .tool { margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 5px; }
    .tool-name { font-weight: bold; color: #0066cc; }
  </style>
</head>
<body>
  <h1>🤖 Daemon MCP Server</h1>
  <p>MCP endpoint for <a href="https://daemon.ajvanbeest.com">A.J. Van Beest's daemon</a>.</p>

  <h2>Usage</h2>
  <p>Add this to your Claude Code or MCP client configuration:</p>
  <pre>{
  "mcpServers": {
    "daemon-aj": {
      "url": "https://mcp.daemon.ajvanbeest.com/mcp"
    }
  }
}</pre>

  <h2>Available Tools</h2>
  ${TOOLS.map(t => `<div class="tool"><span class="tool-name">${t.name}</span><br>${t.description}</div>`).join('')}

  <h2>Direct API</h2>
  <p>The underlying REST API is at <a href="https://daemon.ajvanbeest.com">daemon.ajvanbeest.com</a></p>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Landing page
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(landingPage, {
        headers: { 'Content-Type': 'text/html', ...corsHeaders }
      });
    }

    // MCP endpoint
    if (url.pathname === '/mcp' && request.method === 'POST') {
      return handleMcpRequest(request);
    }

    // Health check
    if (url.pathname === '/health') {
      return jsonResponse({ status: 'ok', server: SERVER_INFO });
    }

    return jsonResponse({ error: 'Not found', endpoints: ['/', '/mcp', '/health'] }, 404);
  }
};
