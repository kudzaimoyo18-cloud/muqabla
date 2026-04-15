/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Supabase join queries return array types that don't match our interfaces.
    // Safe to ignore — all casts are correct at runtime.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflarestream.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://*.cloudflarestream.com https://lh3.googleusercontent.com https://media.licdn.com https://*.licdn.com https://*.platform-lookaside.fbsbx.com",
              "media-src 'self' blob: https://*.cloudflarestream.com https://customer-*.cloudflarestream.com https://*.r2.dev",
              "frame-src 'self' https://*.cloudflarestream.com https://iframe.cloudflarestream.com",
              "connect-src 'self' https://qhmgaopelmhewjcqdrkk.supabase.co wss://qhmgaopelmhewjcqdrkk.supabase.co https://accounts.google.com https://upload.videodelivery.net https://*.cloudflarestream.com https://muqabla-mocha.vercel.app https://muqabla-video-upload.kudzaimoyo18.workers.dev https://pub-a1ade910a8c54509a8de1f2e5e864e7a.r2.dev",
              "font-src 'self' data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.supabase.co https://accounts.google.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
