import type { NextConfig } from "next";






/** @type {import('next').NextConfig} */
const nextConfig : NextConfig = {
    webpack: (config, { isServer }) => {
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
    
