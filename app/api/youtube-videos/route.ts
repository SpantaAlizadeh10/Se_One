import { NextResponse } from "next/server";

export const revalidate = 3600;

const CHANNEL_ID = "UCbE2jzkIoA_mv86JP4UsSuw";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

function decodeXml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function getTag(entry: string, tag: string) {
  const match = entry.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? decodeXml(match[1].trim()) : "";
}

export async function GET() {
  try {
    const response = await fetch(FEED_URL, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "SE-ONE-Website/1.0" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { videos: [], error: "YouTube feed is unavailable" },
        { status: 502 },
      );
    }

    const xml = await response.text();
    const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
      .map(([, entry]) => ({
        videoId: getTag(entry, "yt:videoId"),
        title: getTag(entry, "title"),
        publishedAt: getTag(entry, "published"),
      }))
      .filter((video) => /^[\w-]{11}$/.test(video.videoId))
      .slice(0, 3);

    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json(
      { videos: [], error: "YouTube feed is unavailable" },
      { status: 502 },
    );
  }
}
