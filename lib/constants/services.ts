export const FIXED_SERVICES = [
  "Netflix",
  "Spotify",
  "Prime Video",
  "Apple Music",
  "HBO Max",
  "Crunchyroll",
  "IPTV",
  "Disney+",
] as const;

export type FixedServiceName = (typeof FIXED_SERVICES)[number];
