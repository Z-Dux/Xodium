import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
	swcMinify: true,
	images: {
		unoptimized: true
	},
  output: `export`
};

const withPWA = require('next-pwa')({
  dest: 'public',
  // Enable caching strategies, optional
  // register: true,
  // scope: '/',
  // sw: 'sw.js',
});

export default withPWA(nextConfig);
//export default nextConfig;
