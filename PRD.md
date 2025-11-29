# Daemon - Product Requirements Document

## Overview

Daemon is a personal API that exposes structured, machine-readable data about A.J. Van Beest to the world. It enables discovery by others with aligned interests and provides context to AI assistants.

## Problem Statement

1. **Discovery is hard**: Finding people with aligned interests requires manual searching or serendipity
2. **AI context is fragmented**: AI assistants can't easily learn about you from a single authoritative source
3. **Professional identity is scattered**: Information about who you are lives across multiple platforms (LinkedIn, GitHub, personal site) with no unified API

## Solution

A public API endpoint that serves structured data about:
- Who I am (identity, bio, links)
- What I'm building (projects, skills)
- What I care about (interests, media consumption)
- What I'm looking for (collaboration opportunities)

With authenticated access for:
- Current focus and work-in-progress
- Location and availability
- More detailed project information

## User Stories

### As a potential collaborator
- I want to query someone's daemon to understand their interests
- So I can determine if there's alignment for collaboration

### As an AI assistant
- I want to fetch structured context about a person
- So I can provide more relevant, personalized assistance

### As a conference organizer
- I want to see what topics someone is working on
- So I can evaluate them as a potential speaker

### As A.J. (the owner)
- I want to maintain a single source of truth about my professional identity
- So I don't have to repeat myself across platforms

## Requirements

### Functional Requirements

#### Public Tier Endpoints
| Endpoint | Description | Data |
|----------|-------------|------|
| `/about` | Professional identity | Name, bio, tagline, links |
| `/projects` | What I'm building | Name, status, description, tags |
| `/skills` | What I can help with | Categories, proficiency |
| `/interests` | Topics I care about | Tags, descriptions |
| `/looking_for` | Collaboration opportunities | Types, context |
| `/media` | Cultural consumption | Books, movies, currently reading/watching |
| `/all` | Everything public | Combined payload |

#### Trusted Tier Endpoints (authenticated)
| Endpoint | Description | Data |
|----------|-------------|------|
| `/current_focus` | Live work context | Active projects, current session |
| `/location` | Where I am | City, timezone, travel status |
| `/availability` | Scheduling info | Open to calls, preferred contact |
| `/projects/detailed` | Full project info | Including WIP, blockers |

### Non-Functional Requirements

- **Latency**: < 100ms response time (edge deployment)
- **Availability**: 99.9% uptime (Cloudflare's SLA)
- **Security**: API key authentication for trusted tier
- **Privacy**: No PII in public tier beyond professional identity
- **MCP Compatible**: Usable as MCP server for AI assistants

## Technical Architecture

### Infrastructure
- **Platform**: Cloudflare Workers
- **Storage**: Cloudflare KV for data
- **Domain**: daemon.ajvanbeest.com
- **Auth**: Bearer token in Authorization header

### Data Flow
```
Source Data (YAML files)
    ↓
Build Process (compile to KV)
    ↓
Cloudflare KV Storage
    ↓
Worker (serves requests)
    ↓
Client (browser, AI assistant, MCP client)
```

### Update Mechanism
- **Phase 1**: Manual YAML edits, deploy via wrangler
- **Phase 2**: Hook into session logging for current_focus
- **Phase 3**: Voice note updates (stretch goal)

## Success Metrics

1. **Daemon is live**: Accessible at daemon.ajvanbeest.com
2. **Data is accurate**: Reflects current state
3. **Blog post published**: Documents the build
4. **Discovery enabled**: Listed/findable by others building daemons

## Timeline

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 1 | Data schema design | ✅ Complete (2025-11-29) |
| 2 | Cloudflare setup | Next |
| 3 | Worker implementation | Pending |
| 4 | Data population (fill TODOs) | Pending |
| 5 | Blog post | Pending |

## Out of Scope (for now)

- Real-time location tracking
- Automated social media integration
- Daemon-to-daemon communication protocol
- Central daemon registry
- Mobile app for updates

## Open Questions

1. How to handle data freshness (staleness warnings)?
2. Should there be rate limiting on public endpoints?
3. How to announce/publicize the daemon for discovery?
4. Where to pull media data from (books/movies)?

## Resolved Questions

- **Trusted tier contents**: current_focus, location, availability, projects_detailed
- **Access model**: Two-tier (public + trusted) with API key auth
- **Hosting**: Cloudflare Workers (not GitHub Pages)
- **Repo location**: Separate ~/git/daemon repo (UNIX philosophy)

---

*Created: 2025-11-29*
*Last Updated: 2025-11-29*
