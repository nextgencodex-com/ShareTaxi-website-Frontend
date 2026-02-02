import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

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
  // Export static HTML for hosting on static hosts (e.g., hPanel file manager)
  // All pages must be statically renderable for this to work correctly.
  output: 'export',
}

export default withNextIntl(nextConfig);
