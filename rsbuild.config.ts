import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from '@rsbuild/core';
// https://rsbuild.dev/zh/plugins/list/plugin-reacts
import { pluginReact } from '@rsbuild/plugin-react';
// https://rsbuild.dev/zh/plugins/list/plugin-sass
import { pluginSass } from '@rsbuild/plugin-sass';
// https://rsbuild.dev/zh/plugins/list/plugin-babel
// import { pluginBabel } from '@rsbuild/plugin-babel';
// https://www.npmjs.com/package/rspack-plugin-mock
import { pluginMockServer } from 'rspack-plugin-mock/rsbuild';

// 开发代理
import devProxy from './proxy.config.ts';

// 基础配置
const PUBLIC_URL = '/app';

// 环境变量兼容
const { publicVars: publicEnvVars, parsed } = loadEnv({ prefixes: ['REACT_APP_'] });
const extEnvs = Object.keys(parsed).filter((key) => !publicEnvVars[`process.env.${key}`]);
extEnvs.forEach((env) => {
  publicEnvVars[`process.env.${env}`] = JSON.stringify(parsed[env]);
});
console.log('环境变量: ', extEnvs, publicEnvVars);


// 打包性能配置
const performanceConfig = (): object => {
  const config = {
    // https://rsbuild.dev/zh/config/performance/remove-console
    removeConsole: ['log', 'warn'],
  };

  // https://rsbuild.dev/zh/config/performance/bundle-analyze
  const isBundleAnalyze = process.env.BUNDLE_ANALYZE === 'true';
  if (isBundleAnalyze) {
    Object.assign(config, {
      bundleAnalyze: {
        analyzerMode: 'static', // 'server'
        openAnalyzer: true,
      },
    });
    console.log('BUNDLE_ANALYZE: ', isBundleAnalyze);
  }

  return config;
};

export default defineConfig({
  dev: {
    lazyCompilation: true,
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
      { tag: 'script', attrs: { src: 'https://unpkg.com/react-scan/dist/auto.global.js' } },
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
      '@assets': 'src/assets',
      '@components': 'src/components',
    },
    decorators: {
      version: 'legacy',
    },
    transformImport: [
      {
        libraryName: '@arco-design/mobile-react',
        libraryDirectory: 'esm',
        style: (path) => `${path}/style`,
      },
    ],
  },
  plugins: [
    pluginReact(),
    // babel
    // pluginBabel({
    //   babelLoaderOptions: (config, { addPlugins }) => {
    //     // addPlugins([]);
    //     plugins: [
    //       ['@babel/plugin-proposal-decorators', {
    //         version: 'legacy',
    //       }],
    //       ['@babel/plugin-transform-class-properties'],
    //     ]
    //   },
    // }),
    pluginSass(),
    // mock dev server
    pluginMockServer(/* pluginOptions */{
      log: "debug"
    }),
  ],
  performance: performanceConfig(), // ## Rsbuild 打包工具
});
