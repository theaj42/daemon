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

// Gruvbox Material Dark color palette
const colors = {
  bg: '#1d2021',
  bg0: '#282828',
  bg1: '#3c3836',
  bg2: '#504945',
  fg: '#ebdbb2',
  fg0: '#fbf1c7',
  gray: '#928374',
  red: '#fb4934',
  green: '#b8bb26',
  yellow: '#fabd2f',
  blue: '#83a598',
  purple: '#d3869b',
  aqua: '#8ec07c',
  orange: '#fe8019',
};

// Landing page HTML
const landingPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MCP Server | Daemon</title>
  <style>
    :root {
      --bg: ${colors.bg};
      --bg0: ${colors.bg0};
      --bg1: ${colors.bg1};
      --bg2: ${colors.bg2};
      --fg: ${colors.fg};
      --fg0: ${colors.fg0};
      --gray: ${colors.gray};
      --red: ${colors.red};
      --green: ${colors.green};
      --yellow: ${colors.yellow};
      --blue: ${colors.blue};
      --purple: ${colors.purple};
      --aqua: ${colors.aqua};
      --orange: ${colors.orange};
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
      background: var(--bg);
      color: var(--fg);
      line-height: 1.6;
      min-height: 100vh;
    }

    a { color: var(--blue); text-decoration: none; }
    a:hover { color: var(--aqua); text-decoration: underline; }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: var(--bg0);
      border-bottom: 1px solid var(--bg2);
    }

    nav .logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--purple);
    }

    nav .links a {
      margin-left: 1.5rem;
      color: var(--fg);
    }

    nav .links a:hover { color: var(--aqua); }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: bold;
      text-transform: uppercase;
    }

    .badge-mcp { background: var(--purple); color: var(--bg); }
    .badge-live { background: var(--green); color: var(--bg); }

    h1 { color: var(--fg0); font-size: 2.5rem; margin-bottom: 0.5rem; }
    h2 { color: var(--yellow); font-size: 1.5rem; margin: 2rem 0 1rem; border-bottom: 1px solid var(--bg2); padding-bottom: 0.5rem; }

    .tagline { color: var(--gray); font-size: 1.1rem; margin-bottom: 1.5rem; }

    .card {
      background: var(--bg0);
      border: 1px solid var(--bg2);
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1rem 0;
    }

    pre {
      background: var(--bg0);
      border: 1px solid var(--bg2);
      border-radius: 6px;
      padding: 1rem;
      overflow-x: auto;
      font-size: 0.9rem;
    }

    code {
      background: var(--bg1);
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-size: 0.9rem;
      color: var(--aqua);
    }

    pre code { background: none; padding: 0; }

    .tool {
      display: flex;
      align-items: flex-start;
      padding: 0.75rem;
      margin: 0.5rem 0;
      background: var(--bg0);
      border-radius: 4px;
      border-left: 3px solid var(--purple);
    }

    .tool-name {
      color: var(--orange);
      font-weight: bold;
      min-width: 180px;
    }

    .tool-desc {
      color: var(--gray);
      font-size: 0.9rem;
    }

    .tools-grid {
      display: grid;
      gap: 0.5rem;
    }

    footer {
      text-align: center;
      padding: 2rem;
      color: var(--gray);
      border-top: 1px solid var(--bg2);
      margin-top: 3rem;
    }
  </style>
</head>
<body>
  <nav>
    <div class="logo">DAEMON MCP</div>
    <div class="links">
      <a href="https://daemon.ajvanbeest.com">Main Site</a>
      <a href="https://daemon.ajvanbeest.com/api">API Docs</a>
      <a href="https://github.com/theaj42/daemon">GitHub</a>
    </div>
  </nav>

  <div class="container">
    <header style="margin: 3rem 0;">
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
        <h1>MCP Server</h1>
        <span class="badge badge-mcp">MCP</span>
        <span class="badge badge-live">LIVE</span>
      </div>
      <p class="tagline">Model Context Protocol endpoint for <a href="https://daemon.ajvanbeest.com">A.J. Van Beest's daemon</a></p>
    </header>

    <section>
      <h2>Quick Start</h2>
      <p style="margin-bottom: 1rem;">Add this to your Claude Code or MCP client configuration:</p>
      <pre><code>{
  "mcpServers": {
    "daemon-aj": {
      "url": "https://mcp.daemon.ajvanbeest.com/"
    }
  }
}</code></pre>
    </section>

    <section>
      <h2>Available Tools</h2>
      <p style="color: var(--gray); margin-bottom: 1rem;">10 tools to query A.J.'s daemon API</p>
      <div class="tools-grid">
        ${TOOLS.map(t => `
          <div class="tool">
            <span class="tool-name">${t.name}</span>
            <span class="tool-desc">${t.description}</span>
          </div>
        `).join('')}
      </div>
    </section>

    <section>
      <h2>Example Queries</h2>
      <div class="card">
        <p style="color: var(--gray); margin-bottom: 0.5rem;">Ask an AI assistant with this MCP server:</p>
        <ul style="padding-left: 1.5rem; margin-top: 0.5rem;">
          <li style="margin: 0.3rem 0;"><em>"What is A.J. Van Beest working on?"</em></li>
          <li style="margin: 0.3rem 0;"><em>"What are A.J.'s sailing goals?"</em></li>
          <li style="margin: 0.3rem 0;"><em>"What skills does A.J. have?"</em></li>
          <li style="margin: 0.3rem 0;"><em>"What are A.J.'s core values and beliefs?"</em></li>
        </ul>
      </div>
    </section>

    <section>
      <h2>Technical Details</h2>
      <div class="card">
        <p><strong style="color: var(--aqua);">Protocol:</strong> MCP over HTTP (JSON-RPC 2.0)</p>
        <p style="margin-top: 0.5rem;"><strong style="color: var(--aqua);">Endpoint:</strong> <code>POST /</code></p>
        <p style="margin-top: 0.5rem;"><strong style="color: var(--aqua);">Health:</strong> <code>GET /health</code></p>
        <p style="margin-top: 0.5rem;"><strong style="color: var(--aqua);">Legacy:</strong> <code>POST /mcp</code> (still works)</p>
        <p style="margin-top: 0.5rem;"><strong style="color: var(--aqua);">REST API:</strong> <a href="https://daemon.ajvanbeest.com">daemon.ajvanbeest.com</a></p>
      </div>
    </section>
  </div>

  <footer>
    <p>Inspired by <a href="https://daemon.danielmiessler.com">Daniel Miessler's Daemon</a></p>
    <p style="margin-top: 0.5rem;">Built with Cloudflare Workers · Gruvbox Material Dark</p>
  </footer>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // MCP endpoint at root (POST) - aligned with Swift/Miessler pattern
    if (url.pathname === '/' && request.method === 'POST') {
      return handleMcpRequest(request);
    }

    // Info page at root (GET) - machine-readable like other daemons
    if (url.pathname === '/' && request.method === 'GET') {
      return jsonResponse({
        name: SERVER_INFO.name,
        version: SERVER_INFO.version,
        description: SERVER_INFO.description,
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        endpoints: { jsonrpc: 'POST /' },
        security: {
          cors: 'open',
          note: 'Data is public by design.'
        }
      });
    }

    // Legacy /mcp endpoint (backwards compatibility)
    if (url.pathname === '/mcp' && request.method === 'POST') {
      return handleMcpRequest(request);
    }

    // Landing page with docs
    if (url.pathname === '/docs' && request.method === 'GET') {
      return new Response(landingPage, {
        headers: { 'Content-Type': 'text/html', ...corsHeaders }
      });
    }

    // Health check
    if (url.pathname === '/health') {
      return jsonResponse({ status: 'ok', server: SERVER_INFO });
    }

    return jsonResponse({ error: 'Not found', endpoints: ['/', '/mcp', '/docs', '/health'] }, 404);
  }
};
