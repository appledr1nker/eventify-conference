# Eventify Conference Companion

A ChatGPT app for conference attendees to explore schedules, speakers, sponsors, photos, and event information through natural conversation.

## Features

- **Browse Schedule** - View sessions by date and track, see session details with speakers
- **Explore Speakers** - Browse speaker profiles, bios, and their sessions
- **View Sponsors** - Browse sponsors by category/tier with logos and details
- **Event Gallery** - View event photos in a gallery with lightbox
- **Event News** - Get the latest announcements (via conversation)
- **Event Guides** - Access helpful info like WiFi, parking, venue details (via conversation)

## Setup

### 1. Get Your Eventify Credentials

1. Log into your Eventify admin panel
2. Get your **Session Token** from the API settings
3. Note your **Event ID**

### 2. Configure Environment

Copy the example environment file and add your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
EVENTIFY_TOKEN=your_session_token_here
EVENTIFY_EVENT_ID=your_event_id_here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

The server will start at `http://localhost:3000`.

- **MCP endpoint**: `http://localhost:3000/mcp`
- **Devtools**: `http://localhost:3000/devtools`

## Connect to ChatGPT

### 1. Expose Local Server

Use ngrok to expose your local server:

```bash
ngrok http 3000
```

Copy the forwarding URL (e.g., `https://abc123.ngrok.io`).

### 2. Create the App in ChatGPT

1. Go to **Settings → Apps → Advanced Settings**
2. Enable **Developer mode** if not already enabled
3. Click **Create App**
4. Enter:
   - **Name**: Your conference name (e.g., "TechConf 2025")
   - **Description**: Conference companion app
   - **URL**: `{ngrok-url}/mcp` (e.g., `https://abc123.ngrok.io/mcp`)
   - **Authentication**: No Authentication
5. Click **Create**

### 3. Test

In any ChatGPT chat, type `@YourAppName` followed by a request:
- "Show me today's schedule"
- "Who are the speakers?"
- "Show me the platinum sponsors"
- "What's the WiFi password?"

## Available Tools & Widgets

| Name | Type | Description |
|------|------|-------------|
| `browse-schedule` | Widget | Interactive schedule with date/track filtering |
| `explore-speakers` | Widget | Speaker grid with bios and sessions |
| `view-sponsors` | Widget | Sponsor grid by category |
| `event-gallery` | Widget | Photo gallery with lightbox |
| `get-event-news` | Tool | Returns news for ChatGPT to summarize |
| `get-event-guides` | Tool | Returns guides for ChatGPT to answer questions |

## Deployment

When ready for production:

```bash
npm run build
npm start
```

Use [Alpic](https://alpic.ai/) to deploy your app. See [deploy docs](https://docs.alpic.ai/) for details.

## Requirements

- Node.js >= 24.13.0
- ChatGPT Plus, Pro, Business, or Enterprise/Edu plan (for app creation)

## Resources

- [Apps SDK Documentation](https://developers.openai.com/apps-sdk)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Skybridge Documentation](https://docs.skybridge.tech)
