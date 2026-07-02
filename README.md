# Daemon

A personal API that exposes structured, machine-readable data about me to the world.

## What Is This?

Daemon is a public API endpoint that describes who I am and what I'm working on. Inspired by [Daniel Miessler's Daemon project](https://github.com/danielmiessler/Daemon), it implements a two-tier access model:

- **Public Tier**: Professional identity, projects, skills, interests, media consumption
- **Trusted Tier**: Current focus, location, availability (for people I know)

## Why?

The vision: every entity should have a daemon - an API to the world that other systems can understand. This enables:

- Discovery by others with aligned interests
- AI assistants querying your daemon for context
- Serendipitous connections based on shared focus areas

## Architecture

```
daemon.ajvanbeest.com (Cloudflare Workers)
├── /about          → Professional identity
├── /projects       → What I'm building
├── /skills         → What I can help with
├── /interests      → Topics I care about
├── /looking_for    → Collaboration opportunities
├── /media          → Books, movies, current consumption
└── /all            → Everything (public tier)

Trusted Tier (authenticated):
├── /current_focus  → Live from session logs
├── /location       → Where I am
└── /availability   → Open to calls, timezone, etc.
```

## Tech Stack

- **Runtime**: Cloudflare Workers (serverless)
- **Storage**: Cloudflare KV
- **Protocol**: MCP (Model Context Protocol) compatible
- **Auth**: API key for trusted tier

## Trusted Tier Data

Trusted tier data is intentionally not committed to this public repository.
Use `data/trusted.example.yaml` as the shape reference, then provide the deployed
payload through a Cloudflare secret named `TRUSTED_DATA_JSON`.

```bash
wrangler secret put TRUSTED_DATA_JSON
```

## Status

🚧 **In Development** - Building the foundation

## Related

- [Blog Post: Building My Daemon](#) (coming soon)
- [ajvanbeest.com](https://ajvanbeest.com) - Personal website
- [AI-assistant](https://github.com/theaj42/AI-assistant) - Personal AI infrastructure

## Credits

Inspired by [Daniel Miessler's Daemon](https://github.com/danielmiessler/Daemon) and [Personal AI Infrastructure](https://github.com/danielmiessler/PAI).
