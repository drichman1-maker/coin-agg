/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.apmex.com',
            },
            {
                protocol: 'https',
                hostname: '**.jmbullion.com',
            },
            {
                protocol: 'https',
                hostname: '**.ngccoin.com',
            },
            {
                protocol: 'https',
                hostname: '**.pcgs.com',
            },
        ],
    },
};

module.exports = nextConfig;
