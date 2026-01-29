---
name: eventify-conference
description: Use the `chatgpt-app-builder` Skill to update this project.
---

# Eventify Conference Companion

## Value Proposition
Help conference attendees navigate and engage with your event through conversation - browse the schedule, discover speakers, explore sponsors, view event photos, and stay updated with news and guides.

## Product Context
- **Existing product**: Eventify event management platform
- **API**: REST API at adminapi.eventify.io (token-based auth, pre-configured)
- **Constraints**: Read-only access (no photo uploads), single event scope

## UX Flows

### Browse Schedule
1. View schedule by date
2. Filter by track
3. See session details (time, speakers, description)
4. Find "what's happening now" or "what's next"

### Explore Speakers
1. Browse all speakers
2. View speaker bio and photo
3. See their sessions

### View Sponsors
1. Browse sponsors by category/tier
2. View sponsor details and logo

### Event Gallery
1. Browse event photos

### Get Event News
1. View latest announcements

### Get Event Guides
1. Access event info (WiFi, parking, venue details, etc.)

## Tools and Widgets

**Widget: browse-schedule**
- **Input**: `{ date?: string, track?: string }`
- **Output**: `{ dates[], tracks[], sessions[] }`
- **Views**: date selector, track filter, session list, session detail
- **Behavior**: Navigates schedule hierarchy, shows session details with speakers

**Widget: explore-speakers**
- **Input**: `{ speakerId?: string }`
- **Output**: `{ speakers[] }`
- **Views**: speaker grid, speaker detail with sessions
- **Behavior**: Browse speakers, view bios and their talks

**Widget: view-sponsors**
- **Input**: `{ category?: string }`
- **Output**: `{ sponsors[], categories[] }`
- **Views**: sponsor grid by tier, sponsor detail
- **Behavior**: Browse sponsors, view details

**Widget: event-gallery**
- **Input**: `{}`
- **Output**: `{ images[] }`
- **Views**: photo grid, lightbox
- **Behavior**: Browse and view event photos

**Tool: get-event-news**
- **Input**: `{}`
- **Output**: `{ news[] }`
- **Behavior**: Returns news items for LLM to summarize

**Tool: get-event-guides**
- **Input**: `{ category?: string }`
- **Output**: `{ categories[], guides[] }`
- **Behavior**: Returns guide content for LLM to answer questions

## API Integration

Base URL: `https://adminapi.eventify.io`

Authentication: Pre-configured session token via environment variable `EVENTIFY_TOKEN`

Endpoints used:
- `GET /v4/api/list-of-all-sessions-in-an-event?eventid={id}` - Schedule, tracks, sessions
- `GET /v4/api/get-list-of-all-speakers?eventid={id}` - Speakers
- `GET /v4/api/list-of-all-sponsors-in-an-event?eventid={id}` - Sponsors
- `GET /v4/api/get-list-of-all-gallery-images?eventid={id}` - Gallery
- `GET /v4/api/get-list-of-news-in-an-event?eventid={id}` - News
- `GET /v4/api/get-list-of-event-guides-in-an-event?eventid={id}` - Guides
