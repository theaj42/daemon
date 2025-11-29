/**
 * Daemon - Personal API Worker
 *
 * Two-tier access model:
 * - Public: /about, /projects, /skills, /interests, /looking_for, /media, /all
 * - Trusted: /current_focus, /location, /availability, /projects_detailed (requires API key)
 */

import { publicData, trustedData } from './data.js';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

// JSON response helper
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Check trusted tier authentication
function isAuthenticated(request, env) {
  const apiKey = request.headers.get('X-API-Key') ||
                 request.headers.get('Authorization')?.replace('Bearer ', '');
  return apiKey && apiKey === env.TRUSTED_API_KEY;
}

// Route handlers
const publicRoutes = {
  '/': () => ({
    name: 'daemon',
    version: '1.0.0',
    description: 'Personal API for A.J. Van Beest',
    endpoints: {
      public: ['/about', '/projects', '/skills', '/interests', '/looking_for', '/media', '/all'],
      trusted: ['/current_focus', '/location', '/availability', '/projects_detailed'],
    },
    docs: 'https://github.com/theaj42/daemon',
  }),

  '/about': () => publicData.about,
  '/projects': () => publicData.projects,
  '/skills': () => publicData.skills,
  '/interests': () => publicData.interests,
  '/looking_for': () => publicData.looking_for,
  '/media': () => publicData.media,

  '/all': () => ({
    ...publicData,
    _meta: {
      tier: 'public',
      generated: new Date().toISOString(),
    },
  }),
};

const trustedRoutes = {
  '/current_focus': () => trustedData.current_focus,
  '/location': () => trustedData.location,
  '/availability': () => trustedData.availability,
  '/projects_detailed': () => trustedData.projects_detailed,

  '/trusted/all': () => ({
    public: publicData,
    trusted: trustedData,
    _meta: {
      tier: 'trusted',
      generated: new Date().toISOString(),
    },
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

    // Check public routes first
    if (publicRoutes[path]) {
      return jsonResponse(publicRoutes[path]());
    }

    // Check trusted routes (require authentication)
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
        public: Object.keys(publicRoutes),
        trusted: Object.keys(trustedRoutes),
      },
    }, 404);
  },
};
