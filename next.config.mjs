import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "service-worker/index.js",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [
    { url: "/offline", revision: String(Date.now()) },
  ],
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withSerwist(nextConfig);
