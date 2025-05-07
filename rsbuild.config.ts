import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from '@rsbuild/core';
// https://rsbuild.dev/zh/plugins/list/plugin-reacts
import { pluginReact } from '@rsbuild/plugin-react';
// https://rsbuild.dev/zh/plugins/list/plugin-sass
import { pluginSass } from '@rsbuild/plugin-sass';
// https://rsbuild.dev/zh/plugins/list/plugin-less
import { pluginLess } from '@rsbuild/plugin-less';
// https://github.com/rspack-contrib/rsbuild-plugin-mdx
// https://mdxjs.com/playground/
import { pluginMdx } from '@rsbuild/plugin-mdx';
// https://rsbuild.dev/plugins/list/plugin-svgr
import { pluginSvgr } from '@rsbuild/plugin-svgr';
// https://github.com/rspack-contrib/rsbuild-plugin-image-compress
import { pluginImageCompress } from '@rsbuild/plugin-image-compress';
// https://github.com/rspack-contrib/rsbuild-plugin-eslint
import { pluginEslint } from '@rsbuild/plugin-eslint';
// https://rsbuild.dev/zh/plugins/list/plugin-babel
import { pluginBabel } from '@rsbuild/plugin-babel';
// https://github.com/zh-lx/code-inspector
import { codeInspectorPlugin } from 'code-inspector-plugin';
// https://www.npmjs.com/package/rspack-plugin-mock
import { pluginMockServer } from 'rspack-plugin-mock/rsbuild';

// 开发代理
import { devProxy } from './proxy.config.ts';

// 基础配置
const PUBLIC_URL = '/app';

// 环境变量兼容
const { publicVars: publicEnvVars, parsed } = loadEnv({
    prefixes: ['REACT_APP_'],
});
const extEnvs = Object.keys(parsed).filter((key) => !publicEnvVars[`process.env.${key}`]);
extEnvs.forEach((env) => {
    publicEnvVars[`process.env.${env}`] = JSON.stringify(parsed[env]);
});
console.log('环境变量: ', extEnvs, publicEnvVars);

// 打包性能配置
const REMOVE_CONSOLE_TYPES = ['log', 'warn'];
const BUNDLE_ANALYZE_CONFIG = {
    analyzerMode: 'static',
    openAnalyzer: true,
};

const performanceConfig = (): object => {
    const config = {
        removeConsole: REMOVE_CONSOLE_TYPES,
    };

    const isBundleAnalyze = process.env.BUNDLE_ANALYZE === 'true';
    if (isBundleAnalyze) {
        Object.assign(config, {
            bundleAnalyze: BUNDLE_ANALYZE_CONFIG,
        });
        console.log('BUNDLE_ANALYZE: ', isBundleAnalyze);
    }

    return config;
};

export default defineConfig({
    dev: {
        lazyCompilation: true,
        client: {
            overlay: false,
        },
    },
    server: {
        port: 3000,
        // 开发环境代理配置
        proxy: devProxy,
    },
    html: {
        template: './public/index.html',
        templateParameters: {
            iconfontUrl: process.env.REACT_APP_ICONFONT_URL,
            text: 'XYZ',
        },
        tags: [
            {
                tag: 'script',
                attrs: { src: 'https://unpkg.com/react-scan/dist/auto.global.js' },
            },
        ],
    },
    // 环境变量
    source: {
        define: {
            'process.env.PUBLIC_URL': JSON.stringify(PUBLIC_URL),
            ...publicEnvVars,
        },
        alias: {
            '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './src'),
            '@/assets': 'src/assets',
            '@/components': 'src/components',
        },
        // decorators: {
        //   version: 'legacy',
        // },
        transformImport: [
            {
                libraryName: '@arco-design/mobile-react',
                libraryDirectory: 'esm',
                style: true,
            },
        ],
    },
    output: {
        filename: {
            css: process.env.NODE_ENV === 'production' ? '[name].[contenthash:8].css' : '[name].css',
        },
    },
    plugins: [
        pluginReact(),
        pluginBabel({
            include: /\.(?:jsx|tsx)$/,
            babelLoaderOptions: (config, { addPlugins }) => {
                addPlugins([['@babel/plugin-transform-class-properties'], ['babel-plugin-react-compiler']]);
            },
        }),
        pluginEslint({
            enable: process.env.NODE_ENV === 'development' ? true : false,
            eslintPluginOptions: {
                configType: 'flat',
            },
        }),
        pluginSass(),
        pluginLess(),
        pluginMdx(),
        pluginSvgr(),
        pluginImageCompress(['jpeg', 'png']),
        // mock dev server
        // pluginMockServer({
        //     prefix: ['/api-dev/'],
        //     wsPrefix: ['/socket.io'],
        //     log: 'debug',
        //     build: true,
        //     reload: true,
        // }),
    ],
    tools: {
        rspack: {
            plugins: [
                codeInspectorPlugin({
                    bundler: 'rspack',
                }),
            ],
        },
    },
    performance: performanceConfig(),
});
