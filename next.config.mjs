/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    distDir: 'build',
    async redirects() {
        return [
            {
              source: '/',
              destination: '/ledger',
              permanent: true,
            },
          ]
    }
};

export default nextConfig;
