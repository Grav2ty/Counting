/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer'

const withAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

// When deploying to GitHub Pages for a project site, we need a basePath and assetPrefix
// Example: repo "Counting" => basePath "/Counting"
const deploymentBasePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
    optimizePackageImports: ["lucide-react"],
  },
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  // Only set basePath/assetPrefix if provided via env (local dev remains root)
  ...(deploymentBasePath
    ? {
        basePath: deploymentBasePath,
        assetPrefix: deploymentBasePath,
      }
    : {}),
}

export default withAnalyzer(nextConfig)


