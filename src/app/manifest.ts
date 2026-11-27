import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Girvasa — Society OS",
    short_name: "Girvasa",
    description:
      "Enterprise Housing Society Management Operating System for billing, visitor security, accounting audits, and governance.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#1E295D",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/brand/girvasa-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

