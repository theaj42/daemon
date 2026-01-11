/**
 * Daemon - Personal API Worker
 *
 * Two-tier access model:
 * - Public: /about, /identity, /adventures, /projects, /skills, /interests, /looking_for, /media, /current_focus, /all
 * - Trusted: /location, /availability, /projects_detailed (requires API key)
 *
 * HTML Pages:
 * - / → Landing page (Gruvbox Material Dark theme)
 * - /api → API documentation
 */

import { publicData, trustedData } from './data.js';

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

// Shared CSS for Gruvbox theme
const gruvboxCSS = `
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
    color: var(--orange);
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

  .badge-live { background: var(--green); color: var(--bg); }
  .badge-mcp { background: var(--purple); color: var(--bg); }
  .badge-public { background: var(--blue); color: var(--bg); }

  h1 { color: var(--fg0); font-size: 2.5rem; margin-bottom: 0.5rem; }
  h2 { color: var(--yellow); font-size: 1.5rem; margin: 2rem 0 1rem; border-bottom: 1px solid var(--bg2); padding-bottom: 0.5rem; }
  h3 { color: var(--aqua); font-size: 1.1rem; margin: 1.5rem 0 0.5rem; }

  .tagline { color: var(--gray); font-size: 1.1rem; margin-bottom: 1.5rem; }

  .card {
    background: var(--bg0);
    border: 1px solid var(--bg2);
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1rem 0;
  }

  .card-title { color: var(--orange); font-weight: bold; margin-bottom: 0.5rem; }

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
  }

  pre code { background: none; padding: 0; }

  .endpoint {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    margin: 0.5rem 0;
    background: var(--bg0);
    border-radius: 4px;
    border-left: 3px solid var(--green);
  }

  .endpoint.trusted { border-left-color: var(--yellow); }

  .endpoint-method {
    background: var(--green);
    color: var(--bg);
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
    font-size: 0.75rem;
    font-weight: bold;
    margin-right: 1rem;
  }

  .endpoint.trusted .endpoint-method { background: var(--yellow); }

  .endpoint-path { color: var(--fg0); font-weight: bold; }
  .endpoint-desc { color: var(--gray); margin-left: auto; font-size: 0.9rem; }

  .section-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }

  .stat { text-align: center; padding: 1.5rem; }
  .stat-value { font-size: 2rem; color: var(--orange); font-weight: bold; }
  .stat-label { color: var(--gray); font-size: 0.9rem; }

  footer {
    text-align: center;
    padding: 2rem;
    color: var(--gray);
    border-top: 1px solid var(--bg2);
    margin-top: 3rem;
  }

  .loading { color: var(--gray); font-style: italic; }

  #live-data .project-tag {
    display: inline-block;
    background: var(--bg2);
    color: var(--aqua);
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
    font-size: 0.75rem;
    margin: 0.1rem;
  }
`;

// Landing page HTML
const landingPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daemon | A.J. Van Beest</title>
  <style>${gruvboxCSS}</style>
</head>
<body>
  <nav>
    <a href="https://github.com/danielmiessler/Daemon" class="logo">DAEMON</a>
    <div class="links">
      <a href="/api">API Docs</a>
      <a href="https://mcp.daemon.ajvanbeest.com">MCP Endpoint</a>
      <a href="https://github.com/theaj42/daemon">GitHub</a>
      <a href="https://ajvanbeest.com">Blog</a>
    </div>
  </nav>

  <div class="container">
    <header style="margin: 3rem 0;">
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
        <h1>DAEMON</h1>
        <span class="badge badge-live">LIVE</span>
      </div>
      <p class="tagline">Personal MCP API for <a href="https://ajvanbeest.com">A.J. Van Beest</a></p>
      <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
        <span class="badge badge-mcp">MCP</span>
        <span class="badge badge-public">Public</span>
      </div>
    </header>

    <section id="live-data">
      <h2>About</h2>
      <div class="card" id="about-card">
        <p class="loading">Loading...</p>
      </div>

      <h2>Identity</h2>
      <div id="identity-section">
        <p class="loading">Loading...</p>
      </div>

      <h2>Adventures</h2>
      <div id="adventures-section">
        <p class="loading">Loading...</p>
      </div>

      <h2>Current Projects</h2>
      <div id="projects-list">
        <p class="loading">Loading...</p>
      </div>

      <h2>Skills</h2>
      <div class="section-grid" id="skills-grid">
        <p class="loading">Loading...</p>
      </div>

      <h2>Interests</h2>
      <div id="interests-list">
        <p class="loading">Loading...</p>
      </div>

      <h2>Looking For</h2>
      <div id="looking-for-list">
        <p class="loading">Loading...</p>
      </div>

      <h2>Current Focus</h2>
      <div id="current-focus">
        <p class="loading">Loading...</p>
      </div>
    </section>

    <section>
      <h2>Connect</h2>
      <div class="card">
        <p>This daemon exposes machine-readable data about me for AI assistants and curious humans.</p>
        <p style="margin-top: 1rem;">
          <strong>MCP Endpoint:</strong> <code>https://mcp.daemon.ajvanbeest.com/</code>
        </p>
        <p style="margin-top: 0.5rem;">
          <strong>REST API:</strong> <code>https://daemon.ajvanbeest.com/all</code>
        </p>
      </div>
    </section>
  </div>

  <footer>
    <p>Inspired by <a href="https://daemon.danielmiessler.com">Daniel Miessler's Daemon</a></p>
    <p style="margin-top: 0.5rem;">Built with Cloudflare Workers · Gruvbox Material Dark</p>
  </footer>

  <script>
    async function loadData() {
      try {
        const [about, identity, adventures, projects, skills, interests, lookingFor, currentFocus] = await Promise.all([
          fetch('/about').then(r => r.json()),
          fetch('/identity').then(r => r.json()),
          fetch('/adventures').then(r => r.json()),
          fetch('/projects').then(r => r.json()),
          fetch('/skills').then(r => r.json()),
          fetch('/interests').then(r => r.json()),
          fetch('/looking_for').then(r => r.json()),
          fetch('/current_focus').then(r => r.json())
        ]);

        // About
        document.getElementById('about-card').innerHTML = \`
          <div class="card-title">\${about.tagline}</div>
          <p style="white-space: pre-line; margin: 1rem 0;">\${about.bio}</p>
          <div style="margin-top: 1rem;">
            \${about.certifications.map(c => \`<span class="project-tag">\${c}</span>\`).join(' ')}
          </div>
          <div style="margin-top: 1rem;">
            <a href="\${about.links.github}">GitHub</a> ·
            <a href="\${about.links.linkedin}">LinkedIn</a> ·
            <a href="\${about.links.website}">Website</a>
          </div>
        \`;

        // Identity
        document.getElementById('identity-section').innerHTML = \`
          <div class="card">
            <div class="card-title">Core Statement</div>
            <p style="white-space: pre-line; font-style: italic;">\${identity.core_statement}</p>
          </div>
          <h3>Missions</h3>
          <ul style="padding-left: 1.5rem; margin: 0.5rem 0;">
            \${identity.missions.map(m => \`<li style="color: var(--fg); margin: 0.3rem 0;">\${m}</li>\`).join('')}
          </ul>
          <h3>Values</h3>
          <div style="margin: 0.5rem 0;">
            \${identity.values.map(v => \`<span class="project-tag" style="background: var(--purple); color: var(--bg);">\${v}</span>\`).join(' ')}
          </div>
          <h3>Beliefs</h3>
          <ul style="padding-left: 1.5rem; margin: 0.5rem 0;">
            \${identity.beliefs.map(b => \`<li style="color: var(--gray); margin: 0.3rem 0; font-size: 0.9rem;">\${b}</li>\`).join('')}
          </ul>
        \`;

        // Adventures
        document.getElementById('adventures-section').innerHTML = \`
          <div class="card">
            <div class="card-title">Sailing: \${adventures.sailing.current_boat}</div>
            <p style="color: var(--aqua);">\${adventures.sailing.status}</p>
            <p style="white-space: pre-line; margin-top: 0.5rem; font-style: italic; color: var(--gray);">\${adventures.sailing.philosophy}</p>
            <h4 style="color: var(--yellow); margin-top: 1rem;">Dreams</h4>
            <ul style="padding-left: 1.2rem;">
              \${adventures.sailing.dreams.map(d => \`<li style="color: var(--fg);">\${d.goal} <span style="color: var(--orange);">(\${d.target})</span></li>\`).join('')}
            </ul>
          </div>
          <div class="section-grid">
            <div class="card">
              <div class="card-title">Music</div>
              <p>\${adventures.music.instrument}</p>
              <p style="color: var(--gray); margin-top: 0.5rem;">\${adventures.music.status}</p>
            </div>
            <div class="card">
              <div class="card-title">Exploration</div>
              <ul style="padding-left: 1.2rem;">
                \${adventures.exploration.map(e => \`<li style="color: var(--fg);">\${e}</li>\`).join('')}
              </ul>
            </div>
          </div>
        \`;

        // Projects
        document.getElementById('projects-list').innerHTML = projects.map(p => \`
          <div class="card">
            <div class="card-title">\${p.name} <span class="badge" style="background: var(--\${p.status === 'active' ? 'green' : 'gray'}); color: var(--bg); font-size: 0.7rem;">\${p.status}</span></div>
            <p>\${p.description}</p>
            <div style="margin-top: 0.5rem;">
              \${p.tags.map(t => \`<span class="project-tag">\${t}</span>\`).join(' ')}
            </div>
            \${p.url ? \`<a href="\${p.url}" style="display: block; margin-top: 0.5rem; font-size: 0.9rem;">View on GitHub →</a>\` : ''}
          </div>
        \`).join('');

        // Skills (now includes personal skills)
        const allSkills = [...skills.professional, ...skills.exploratory, ...(skills.personal || [])];
        document.getElementById('skills-grid').innerHTML = allSkills.map(s => \`
          <div class="card">
            <div class="card-title">\${s.domain}</div>
            <ul style="margin-top: 0.5rem; padding-left: 1.2rem;">
              \${s.specifics.map(sp => \`<li style="color: var(--gray);">\${sp}</li>\`).join('')}
            </ul>
            \${s.proficiency ? \`<div style="margin-top: 0.5rem; color: var(--green); font-size: 0.8rem;">■ \${s.proficiency}</div>\` : ''}
            \${s.context ? \`<p style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--gray); font-style: italic;">\${s.context}</p>\` : ''}
          </div>
        \`).join('');

        // Interests
        document.getElementById('interests-list').innerHTML = interests.map(i => \`
          <div class="card">
            <div class="card-title">\${i.topic}</div>
            <p style="color: var(--gray);">\${i.why}</p>
          </div>
        \`).join('');

        // Looking For
        document.getElementById('looking-for-list').innerHTML = lookingFor.map(l => \`
          <div class="card">
            <div class="card-title">\${l.type}</div>
            <p>\${l.description}</p>
            <p style="color: var(--gray); font-size: 0.9rem; margin-top: 0.5rem;">\${l.context}</p>
          </div>
        \`).join('');

        // Current Focus
        document.getElementById('current-focus').innerHTML = \`
          <div class="card">
            <div class="card-title">Today</div>
            <p style="white-space: pre-line;">\${currentFocus.today}</p>
          </div>
          <h3>This Week</h3>
          <ul style="padding-left: 1.5rem; margin: 0.5rem 0;">
            \${currentFocus.this_week.map(item => \`<li style="color: var(--fg); margin: 0.3rem 0;">\${item}</li>\`).join('')}
          </ul>
          <h3>Active Projects</h3>
          \${currentFocus.active_projects.map(p => \`
            <div class="card" style="margin: 0.5rem 0;">
              <div class="card-title">\${p.name}</div>
              <p style="color: var(--gray);">\${p.status}</p>
              \${p.next_steps ? \`<ul style="padding-left: 1.2rem; margin-top: 0.5rem;">\${p.next_steps.map(s => \`<li style="color: var(--fg); font-size: 0.9rem;">\${s}</li>\`).join('')}</ul>\` : ''}
            </div>
          \`).join('')}
          <p style="color: var(--gray); font-size: 0.8rem; margin-top: 1rem;">Last updated: \${currentFocus.last_updated}</p>
        \`;

      } catch (err) {
        console.error('Failed to load data:', err);
      }
    }

    loadData();
  </script>
</body>
</html>`;

// API Documentation page
const apiDocsPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Docs | Daemon</title>
  <style>${gruvboxCSS}</style>
</head>
<body>
  <nav>
    <a href="https://github.com/danielmiessler/Daemon" class="logo">DAEMON</a>
    <div class="links">
      <a href="/api">API Docs</a>
      <a href="https://mcp.daemon.ajvanbeest.com">MCP Endpoint</a>
      <a href="https://github.com/theaj42/daemon">GitHub</a>
      <a href="https://ajvanbeest.com">Blog</a>
    </div>
  </nav>

  <div class="container">
    <header style="margin: 3rem 0;">
      <h1>API Documentation</h1>
      <p class="tagline">JSON-RPC 2.0 over HTTPS · Model Context Protocol · Two-tier access</p>
    </header>

    <section>
      <h2>Base URL</h2>
      <pre><code>https://daemon.ajvanbeest.com</code></pre>
    </section>

    <section>
      <h2>Public Endpoints</h2>
      <p style="color: var(--gray); margin-bottom: 1rem;">Available to anyone, no authentication required.</p>

      <div class="endpoint">
        <span class="endpoint-method">GET</span>
        <span class="endpoint-path">/about</span>
        <span class="endpoint-desc">Bio, tagline, links, certifications</span>
      </div>

      <div class="endpoint">
        <span class="endpoint-method">GET</span>
        <span class="endpoint-path">/identity</span>
        <span class="endpoint-desc">Core identity, missions, values, beliefs</span>
      </div>

      <div class="endpoint">
        <span class="endpoint-method">GET</span>
        <span class="endpoint-path">/adventures</span>
        <span class="endpoint-desc">Sailing, music, exploration goals</span>
      </div>

      <div class="endpoint">
        <span class="endpoint-method">GET</span>
        <span class="endpoint-path">/projects</span>
        <span class="endpoint-desc">Public projects list</span>
      </div>

      <div class="endpoint">
        <span class="endpoint-method">GET</span>
        <span class="endpoint-path">/skills</span>
        <span class="endpoint-desc">Professional, exploratory, and personal skills</span>
      </div>

      <div class="endpoint">
        <span class="endpoint-method">GET</span>
        <span class="endpoint-path">/interests</span>
        <span class="endpoint-desc">Topics and interests</span>
      </div>

      <div class="endpoint">
        <span class="endpoint-method">GET</span>
        <span class="endpoint-path">/looking_for</span>
        <span class="endpoint-desc">Collaboration opportunities</span>
      </div>

      <div class="endpoint">
        <span class="endpoint-method">GET</span>
        <span class="endpoint-path">/media</span>
        <span class="endpoint-desc">Books, movies, current consumption</span>
      </div>

      <div class="endpoint">
        <span class="endpoint-method">GET</span>
        <span class="endpoint-path">/current_focus</span>
        <span class="endpoint-desc">What I'm working on now</span>
      </div>

      <div class="endpoint">
        <span class="endpoint-method">GET</span>
        <span class="endpoint-path">/all</span>
        <span class="endpoint-desc">All public data in one call</span>
      </div>
    </section>

    <section>
      <h2>Trusted Endpoints</h2>
      <p style="color: var(--gray); margin-bottom: 1rem;">Requires <code>X-API-Key</code> header for authentication.</p>

      <div class="endpoint trusted">
        <span class="endpoint-method">GET</span>
        <span class="endpoint-path">/location</span>
        <span class="endpoint-desc">Current location and timezone</span>
      </div>

      <div class="endpoint trusted">
        <span class="endpoint-method">GET</span>
        <span class="endpoint-path">/availability</span>
        <span class="endpoint-desc">Contact preferences and availability</span>
      </div>

      <div class="endpoint trusted">
        <span class="endpoint-method">GET</span>
        <span class="endpoint-path">/projects_detailed</span>
        <span class="endpoint-desc">Detailed project status with blockers</span>
      </div>
    </section>

    <section>
      <h2>Example Usage</h2>

      <h3>curl</h3>
      <pre><code># Public endpoint
curl https://daemon.ajvanbeest.com/about

# Trusted endpoint (requires API key)
curl -H "X-API-Key: YOUR_KEY" https://daemon.ajvanbeest.com/current_focus</code></pre>

      <h3>JavaScript</h3>
      <pre><code>// Fetch public data
const about = await fetch('https://daemon.ajvanbeest.com/about')
  .then(res => res.json());

console.log(about.tagline);
// → "Builder. Explorer. Improver of things."</code></pre>
    </section>

    <section>
      <h2>MCP Integration</h2>
      <p>For AI assistants, use the MCP server endpoint:</p>
      <pre><code>{
  "mcpServers": {
    "daemon-aj": {
      "url": "https://mcp.daemon.ajvanbeest.com/"
    }
  }
}</code></pre>
      <p style="margin-top: 1rem;">This enables natural language queries like <em>"What is A.J. Van Beest working on?"</em></p>
    </section>

    <section>
      <h2>Response Format</h2>
      <p>All endpoints return JSON. Example response from <code>/about</code>:</p>
      <pre><code>{
  "name": "A.J. Van Beest",
  "tagline": "Builder. Explorer. Improver of things.",
  "bio": "I'm someone who improves things—not out of perfectionism...",
  "links": {
    "website": "https://ajvanbeest.com",
    "github": "https://github.com/theaj42",
    "linkedin": "https://linkedin.com/in/ajvanbeest"
  },
  "certifications": ["CISSP", "GWAPT", "GPEN", "GSEC"]
}</code></pre>
    </section>
  </div>

  <footer>
    <p>Inspired by <a href="https://daemon.danielmiessler.com">Daniel Miessler's Daemon</a></p>
  </footer>
</body>
</html>`;

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

// Response helpers
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html', ...corsHeaders },
  });
}

// Check trusted tier authentication
function isAuthenticated(request, env) {
  const apiKey = request.headers.get('X-API-Key') ||
                 request.headers.get('Authorization')?.replace('Bearer ', '');
  return apiKey && apiKey === env.TRUSTED_API_KEY;
}

// Route handlers for JSON endpoints
const jsonRoutes = {
  '/about': () => publicData.about,
  '/identity': () => publicData.identity,
  '/adventures': () => publicData.adventures,
  '/projects': () => publicData.projects,
  '/skills': () => publicData.skills,
  '/interests': () => publicData.interests,
  '/looking_for': () => publicData.looking_for,
  '/media': () => publicData.media,
  '/current_focus': () => publicData.current_focus,
  '/all': () => ({
    ...publicData,
    _meta: { tier: 'public', generated: new Date().toISOString() },
  }),
};

const trustedRoutes = {
  '/location': () => trustedData.location,
  '/availability': () => trustedData.availability,
  '/projects_detailed': () => trustedData.projects_detailed,
  '/trusted/all': () => ({
    public: publicData,
    trusted: trustedData,
    _meta: { tier: 'trusted', generated: new Date().toISOString() },
  }),
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Daemon.md for registry verification
    if (path === '/daemon.md') {
      const daemonMd = `# DAEMON DATA FILE

This file contains the public information for A.J. Van Beest's Daemon personal API.

---

[ABOUT]

${publicData.about.bio}

[TAGLINE]

${publicData.about.tagline}

[LINKS]

- Website: ${publicData.about.links.website}
- GitHub: ${publicData.about.links.github}
- LinkedIn: ${publicData.about.links.linkedin}
- Daemon: ${publicData.about.links.daemon}

[MCP_ENDPOINT]

https://mcp.daemon.ajvanbeest.com/

[PROTOCOL]

mcp-rpc (JSON-RPC 2.0 over HTTPS)
`;
      return new Response(daemonMd, {
        headers: { 'Content-Type': 'text/markdown', ...corsHeaders }
      });
    }

    // HTML pages
    if (path === '/') {
      return htmlResponse(landingPage);
    }

    if (path === '/api') {
      return htmlResponse(apiDocsPage);
    }

    // JSON endpoints
    if (jsonRoutes[path]) {
      return jsonResponse(jsonRoutes[path]());
    }

    // Trusted routes (require authentication)
    if (trustedRoutes[path]) {
      if (!isAuthenticated(request, env)) {
        return jsonResponse({
          error: 'Unauthorized',
          message: 'This endpoint requires authentication. Include X-API-Key header.',
          tier: 'trusted',
        }, 401);
      }
      return jsonResponse(trustedRoutes[path]());
    }

    // 404 for unknown routes
    return jsonResponse({
      error: 'Not found',
      available_endpoints: {
        html: ['/', '/api'],
        public: Object.keys(jsonRoutes),
        trusted: Object.keys(trustedRoutes),
      },
    }, 404);
  },
};
