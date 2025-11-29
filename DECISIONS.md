# Decision Log

This document tracks key decisions made during the daemon project, including reasoning and context. Maintained for the blog post and future reference.

---

## Decision 001: Two-Tier Access Model (Public + Trusted)

**Date**: 2025-11-29

**Context**: Miessler's daemon is fully public. Need to decide access model.

**Decision**: Implement two tiers:
- **Public**: Anyone can query
- **Trusted**: Authenticated access for people I know

**Reasoning**:
- "Private" implies hidden/secret, but this tier is for known contacts, not secrets
- "Trusted" fits security background and implies a relationship/verification step
- Security-conscious from day one vs retrofitting later
- Location data specifically should not be public

**Alternatives Considered**:
- Fully public (Miessler's approach) - rejected for privacy
- Three tiers (public/known/private) - over-engineering for now
- "Friends" tier - too informal for professional context
- "Inner" tier - less intuitive naming

---

## Decision 002: Cloudflare Workers over GitHub Pages

**Date**: 2025-11-29

**Context**: Already using GitHub Pages for ajvanbeest.com. Consider hosting options.

**Decision**: Use Cloudflare Workers for daemon API

**Reasoning**:
- GitHub Pages is static-only; can't run dynamic API endpoints
- Cloudflare Workers provides:
  - Serverless execution
  - KV storage for data
  - Authentication header support
  - MCP server hosting capability
  - Free tier (100K requests/day)
- Hybrid approach: keep main site on GitHub Pages, add daemon subdomain on Workers

**Trade-offs**:
- New DNS setup required (CNAME for daemon.ajvanbeest.com)
- Learning curve for Workers
- Another platform to maintain

**Migration Path**: None needed - these are complementary

---

## Decision 003: Separate AI Experimentation from Professional Cybersecurity Identity

**Date**: 2025-11-29

**Context**: Professional tagline is "I build robots to fight cybercrime." Personal AI work is experimental, "all gas no brakes," and not always production-secure.

**Decision**: Acknowledge the intersection but don't conflate them

**Reasoning**:
- Professional cybersecurity work requires scrutiny and rigor
- Personal AI experimentation is exploratory, learning-focused
- The intersection is real and interesting (AI + SecOps)
- But presenting as "AI cybersecurity expert" would be misleading
- Nuance matters: "I exist at the intersection" vs "I am the expert"

**Implications for Daemon**:
- Bio should reflect both interests without overclaiming
- Projects list includes both domains with appropriate context
- Skills section distinguishes professional expertise from exploratory interests

**Blog Post Angle**:
- "Security professional building experimental AI infrastructure"
- Honest about the learning journey
- Share what works, acknowledge what's exploratory

---

## Decision 004: Include Media Consumption in Public Tier

**Date**: 2025-11-29

**Context**: Deciding what data belongs in which tier.

**Decision**: Movies watched and books read go in public tier

**Reasoning**:
- Non-sensitive information
- Enables discovery/connection based on shared interests
- Signals personality and values
- Part of the "who I am" picture

**Data Sources**:
- Will need to figure out where to pull this from (Letterboxd? Goodreads? Manual?)
- Could integrate with existing tracking if available

---

## Decision 005: Location in Trusted Tier Only

**Date**: 2025-11-29

**Context**: Location data is useful for serendipitous discovery but has privacy implications.

**Decision**: Location (specific) goes in trusted tier only

**Reasoning**:
- Physical location has security/privacy implications
- "Greater Chicago Area" might be okay for public, but specific location is not
- Trusted tier = people I know = lower risk of misuse

**Future Consideration**:
- Could have coarse location (city/region) in public, specific in trusted
- Defer this complexity for now

---

## Decision 006: Project Structure in ~/git/daemon/

**Date**: 2025-11-29

**Context**: Where should this project live?

**Decision**: Create as independent git repo in ~/git/daemon/

**Reasoning**:
- Will be deployed independently to Cloudflare
- Has its own lifecycle (not dependent on AI-assistant)
- Follows pattern of other MCP servers and standalone projects
- Can be added to manifest.yaml for tracking

**Structure**:
```
~/git/daemon/
├── README.md           # Project overview
├── DECISIONS.md        # This file (for blog post)
├── PRD.md              # Product requirements
├── data/               # Source data files
│   ├── schema.yaml     # Data schema definition
│   ├── public.yaml     # Public tier data
│   └── trusted.yaml    # Trusted tier data
├── worker/             # Cloudflare Worker code
│   ├── src/
│   ├── wrangler.toml
│   └── package.json
└── blog/               # Blog post drafts
```

---

## Decision 007: Skills Split - Professional vs Exploratory

**Date**: 2025-11-29

**Context**: Need to represent skills honestly without overclaiming AI expertise.

**Decision**: Split skills into two categories:
- **Professional**: Areas of established expertise (security, automation)
- **Exploratory**: Areas of active learning/experimentation (AI infrastructure)

**Reasoning**:
- Reflects the "all gas no brakes" personal AI work vs rigorous professional security work
- Includes explicit `context` field for honest framing
- Allows discovery ("interested in AI") without overclaiming ("AI security expert")
- Respects the nuance: "I exist at the intersection" not "I am the expert"

**Example**:
```yaml
exploratory:
  - domain: "AI Infrastructure"
    context: |
      Building personal AI systems with an experimental, learning-focused approach.
      Not production security consulting - this is where I tinker and explore.
```

---

## Decision 008: Separate Repo vs AI-assistant Monorepo

**Date**: 2025-11-29

**Context**: Should daemon live in ~/git/daemon/ or ~/AI-assistant/projects/daemon/?

**Decision**: Keep as separate repo in ~/git/daemon/

**Reasoning**:
- UNIX philosophy: solve one problem well, compose via interfaces
- Deployment isolation: daemon deploys to Cloudflare independently
- Failure isolation: broken AI-assistant commit doesn't break daemon
- Monolith concern: AI-assistant already has 41 root items, adding more makes it unwieldy

**Important Nuance** (for future reference):
The pattern is NOT as clean as "deployed services go in ~/git/, explorations go in ~/AI-assistant/projects/". Reality is messier:

- Some MCP servers ARE in ~/AI-assistant/engine/mcp-servers/ (e.g., chromadb-server)
- Some MCP servers ARE in ~/git/ as standalone repos (e.g., exif-mcp-server, instacart-mcp-server)
- The choice depends on: deployment needs, coupling to AI-assistant context, whether others might use it

**Why daemon specifically goes in ~/git/:**
- Deploys to Cloudflare Workers (external hosting)
- TypeScript/Bun stack (different from AI-assistant's Python)
- Could become a reference implementation others look at
- Primary discoverability URL is daemon.ajvanbeest.com anyway

**Not a universal rule** - future projects should be evaluated case-by-case.

---

## Pending Decisions

### What else goes in Trusted tier?
- Current focus (from session logs) - likely yes
- Availability/scheduling - likely yes
- Contact preferences - TBD
- Active projects with detail - TBD

### Data update mechanism
- Manual updates vs automated
- Voice note ingestion (like Miessler)
- Hook into session logging?

### Daemon registry / discovery
- How do others find your daemon?
- Is there a central registry?
- Link from website, LinkedIn, conference bios?

---

*Last Updated: 2025-11-29*
