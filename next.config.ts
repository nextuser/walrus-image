import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig : NextConfig = {
    experimental: {
      nodeMiddleware: true,
    },
    turbopack: {
       resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    },
    
    images: {
        remotePatterns: [
          {
            protocol: 'http',
            hostname: 'localhost',
            port: '3001', // 你的后端服务器端口
            pathname: '/image/**', // 图片路径
          },
          {
            protocol: 'http',
            hostname: '127.0.0.1',
            port: '3001', // 兼容 IP 地址
            pathname: '/image/**',
          },
          // 可选：生产环境域名
          {
            protocol: 'https',
            hostname: '**.example.com', // 替换为你的生产域名
            pathname: '/image/**',
          },
        ],
      },
    webpack: (config, { isServer}) => {
        // 排除默认的 .wasm 文件处理规则
        config.module.rules.forEach((rule :any) => {
            (rule.oneOf || []).forEach((oneOf :any) => {
                if (oneOf.type === 'asset/resource') {
                    oneOf.exclude.push(/\.wasm$/);
                }
            });
        });



        // 添加新的 .wasm 文件处理规则
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'asset/resource',
        });

        

        // 如果是服务器端渲染，启用 topLevelAwait 实验性功能
        if (isServer) {
            config.experiments = {
                ...config.experiments,
                topLevelAwait: true,
            };
        }

        return config;
    },
};

export default nextConfig;
    
