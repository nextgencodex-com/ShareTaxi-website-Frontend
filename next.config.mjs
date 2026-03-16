import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Static export + basePath only for production builds.
  // In dev mode these are omitted so the dev server works correctly
  // (middleware, getMessages(), and dynamic routing all require a server runtime).
  ...(isProd && {
    output: 'export',
    basePath: '/sharetaxi',
    assetPrefix: '/sharetaxi/',
  }),
};

export default withNextIntl(nextConfig);