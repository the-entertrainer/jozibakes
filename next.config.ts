import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  transpilePackages: ['@splinetool/r3f-spline'],
  webpack: (config) => {
    // @splinetool/loader imports the pre-r153 `mergeBufferGeometries`;
    // route it through a shim that maps it to today's `mergeGeometries`.
    config.resolve.alias = {
      ...config.resolve.alias,
      'three/examples/jsm/utils/BufferGeometryUtils.js$': path.resolve(
        __dirname,
        'lib/BufferGeometryUtils-compat.js',
      ),
    };
    return config;
  },
};

export default nextConfig;
