/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow ngrok and tunnel domains for Next.js dev server cross-origin requests
  allowedDevOrigins: [
    "twister-dimmed-tiny.ngrok-free.dev",
    "*.ngrok-free.dev",
    "*.ngrok.dev",
    "*.ngrok-free.app",
    "*.ngrok.app",
    "*.ngrok.io",
    "*.loca.lt",
  ],
  experimental: {
    // Allow Server Actions from ngrok and tunnel domains
    serverActions: {
      allowedOrigins: [
        "twister-dimmed-tiny.ngrok-free.dev",
        "*.ngrok-free.dev",
        "*.ngrok.dev",
        "*.ngrok-free.app",
        "*.ngrok.app",
        "*.ngrok.io",
        "*.loca.lt",
      ],
    },
  },
};

export default nextConfig;
