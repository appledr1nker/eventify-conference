import { McpServer } from "skybridge/server";

// Environment configuration
const EVENTIFY_TOKEN = process.env.EVENTIFY_TOKEN || "";
const EVENTIFY_BASE_URL = "https://adminapi.eventify.io/v4";

// Helper to call Eventify API
async function eventifyFetch<T>(endpoint: string): Promise<T> {
  const url = `${EVENTIFY_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}session_token=${EVENTIFY_TOKEN}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Eventify API error: ${response.status}`);
  }
  return response.json();
}

// Type definitions for Eventify API responses
interface Session {
  sessionid: number;
  title: string;
  description?: string;
  starttime: string;
  endtime: string;
  scheduletrackid: number;
  scheduledateid: number;
  location?: string;
}

interface Track {
  scheduletrackid: number;
  trackname: string;
  scheduledateid: number;
}

interface ScheduleDate {
  scheduledateid: number;
  scheduledate: string;
  isactive: number;
}

interface Speaker {
  speakerid: number;
  firstname: string;
  lastname: string;
  email?: string;
  bio?: string;
  description?: string;
  profileimage?: string;
  company?: string;
  position?: string;
  designation?: string;
}

interface SessionSpeaker {
  sessionid: number;
  speakerid: number;
}

interface Sponsor {
  sponsorid: number;
  name: string;
  description?: string;
  logoimage?: string;
  website?: string;
  categoryid: number;
  categoryname?: string;
  sponsorship_title?: {
    membershiptitle: string;
    bgcolor: string;
    textcolor: string;
  };
}

interface BasicSponsor {
  sponsorid: number;
  name: string;
  categoryid: number;
  category_details?: {
    membershiptitle: string;
    bgcolor: string;
    textcolor: string;
  };
}

interface GalleryImage {
  galleryimageid: number;
  galleryimage: string;
  caption?: string;
  displayorder?: number;
}

interface NewsItem {
  newsid: number;
  newstitle: string;
  newscontent: string;
  newsimage?: string;
}

// Create server
const server = new McpServer(
  {
    name: "eventify-conference",
    version: "0.0.1",
  },
  { capabilities: {} }
)
  // Widget: Browse Schedule
  .registerWidget(
    "browse-schedule",
    {
      description: "Browse the conference schedule",
    },
    {
      description:
        "View the conference schedule. Shows sessions with times, descriptions, and speakers. Users can filter by date and track in the UI.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async () => {
      try {
        const data = await eventifyFetch<{
          scheduledates: ScheduleDate[];
          tracks: Track[];
          sessions: Session[];
          session_speakers: SessionSpeaker[];
          speakers: { speakerid: number; firstname: string; lastname: string }[];
        }>("/sessions");

        const sessions = data.sessions || [];
        const sessionSpeakers = data.session_speakers || [];
        const basicSpeakers = data.speakers || [];

        // Fetch full speaker details (with photos) for all speakers
        const speakerDetails = await Promise.all(
          basicSpeakers.map(s =>
            eventifyFetch<Speaker>(`/speakers/${s.speakerid}`).catch(() => null)
          )
        );

        // Create a map of speakerid to full speaker details
        const speakerMap = new Map(
          speakerDetails
            .filter((s): s is Speaker => s !== null)
            .map(s => [s.speakerid, s])
        );

        // Map sessions to output format with speakers
        const enrichedSessions = sessions.map((session) => {
          // Find speakers for this session
          const speakerIds = sessionSpeakers
            .filter(ss => ss.sessionid === session.sessionid)
            .map(ss => ss.speakerid);

          const sessionSpeakerList = speakerIds
            .map(id => speakerMap.get(id))
            .filter((s): s is Speaker => s !== undefined)
            .map(s => ({
              id: s.speakerid,
              name: `${s.firstname} ${s.lastname}`,
              photo: s.profileimage || "",
            }));

          return {
            id: session.sessionid,
            name: session.title,
            description: session.description,
            startTime: session.starttime,
            endTime: session.endtime,
            location: session.location,
            speakers: sessionSpeakerList,
          };
        });

        // Sort by start time
        enrichedSessions.sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        const structuredContent = {
          sessions: enrichedSessions,
        };

        return {
          structuredContent,
          content: [
            {
              type: "text",
              text: `Found ${enrichedSessions.length} sessions.`,
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error fetching schedule: ${error}` }],
          isError: true,
        };
      }
    }
  )

  // Widget: Explore Speakers
  .registerWidget(
    "explore-speakers",
    {
      description: "Explore conference speakers",
    },
    {
      description:
        "Browse all conference speakers, view their bios, photos, and sessions they're presenting.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async () => {
      try {
        const speakersData = await eventifyFetch<{
          resource: Speaker[];
        }>("/speakers");

        const speakers = speakersData.resource || [];

        const enrichedSpeakers = speakers.map((speaker) => ({
          id: speaker.speakerid,
          name: `${speaker.firstname} ${speaker.lastname}`,
          bio: speaker.bio,
          company: speaker.company,
          title: speaker.designation,
          sessions: [],
        }));

        const _meta = {
          photos: speakers.map((s) => s.speakerimage || ""),
        };

        const structuredContent = {
          speakers: enrichedSpeakers,
        };

        return {
          structuredContent,
          _meta,
          content: [
            {
              type: "text",
              text: `Found ${enrichedSpeakers.length} speakers at this conference.`,
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error fetching speakers: ${error}` }],
          isError: true,
        };
      }
    }
  )

  // Widget: View Sponsors
  .registerWidget(
    "view-sponsors",
    {
      description: "View conference sponsors",
    },
    {
      description:
        "Browse conference sponsors by category/tier, view their details and logos.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async () => {
      try {
        // Get basic sponsor list from sessions endpoint
        const sessionsData = await eventifyFetch<{
          sponsors: BasicSponsor[];
        }>("/sessions");

        const basicSponsors = sessionsData.sponsors || [];

        // Fetch full sponsor details (with logos) for all sponsors
        const sponsorDetails = await Promise.all(
          basicSponsors.map(s =>
            eventifyFetch<Sponsor>(`/sponsors/${s.sponsorid}`).catch(() => null)
          )
        );

        const sponsors = sponsorDetails.filter((s): s is Sponsor => s !== null);

        // Group by category
        const categories = [
          ...new Map(
            sponsors.map((s) => [
              s.categoryid,
              {
                id: s.categoryid,
                name: s.sponsorship_title?.membershiptitle || "General",
                bgcolor: s.sponsorship_title?.bgcolor,
                textcolor: s.sponsorship_title?.textcolor,
              },
            ])
          ).values(),
        ];

        const structuredContent = {
          categories,
          sponsors: sponsors.map((s) => ({
            id: s.sponsorid,
            name: s.name,
            description: s.description,
            logo: s.logoimage || "",
            website: s.website,
            categoryId: s.categoryid,
            categoryName: s.sponsorship_title?.membershiptitle,
          })),
        };

        return {
          structuredContent,
          content: [
            {
              type: "text",
              text: `Found ${sponsors.length} sponsors.`,
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error fetching sponsors: ${error}` }],
          isError: true,
        };
      }
    }
  )

  // Widget: Event Gallery
  .registerWidget(
    "event-gallery",
    {
      description: "View event photos",
    },
    {
      description: "Browse photos from the conference event gallery.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async () => {
      try {
        const data = await eventifyFetch<{
          resource: GalleryImage[];
        }>("/gallery");

        const images = data.resource || [];

        // Sort by display order if available
        images.sort((a, b) => (a.displayorder || 0) - (b.displayorder || 0));

        const structuredContent = {
          images: images.map((img) => ({
            id: img.galleryimageid,
            caption: img.caption,
          })),
          totalCount: images.length,
        };

        const _meta = {
          imageUrls: images.map((img) => img.galleryimage),
        };

        return {
          structuredContent,
          _meta,
          content: [
            {
              type: "text",
              text: `Found ${images.length} photos in the event gallery.`,
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error fetching gallery: ${error}` }],
          isError: true,
        };
      }
    }
  )

  // Tool: Get Event News
  .registerTool(
    "get-event-news",
    {
      description:
        "Get the latest news and announcements for the conference. Returns news items that can be summarized for attendees.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async () => {
      try {
        const data = await eventifyFetch<{
          resource: NewsItem[];
        }>("/news");

        const news = data.resource || [];

        const structuredContent = {
          news: news.map((n) => ({
            id: n.newsid,
            title: n.newstitle,
            content: n.newscontent,
            image: n.newsimage,
          })),
        };

        return {
          structuredContent,
          content: [
            {
              type: "text",
              text:
                news.length > 0
                  ? `Latest news:\n${news.map((n) => `- ${n.newstitle}: ${n.newscontent}`).join("\n\n")}`
                  : "No news items available.",
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error fetching news: ${error}` }],
          isError: true,
        };
      }
    }
  );

export default server;
export type AppType = typeof server;
