import { lazy } from 'react';

import testRoutesConfig from './routeTabsTest';
import { ICustomRouterConfig } from '@/routes/typing';
import { isDev } from '@/utils';

const routesConfig: ICustomRouterConfig[] = isDev()
    ? [
          {
              path: '/demo',
              pageConfig: {
                  icon: 'attachment',
                  title: '示例',
              },
              children: [
                  {
                      path: 'demos',
                      exact: true,
                      component: lazy(() => import('@/pages/Demo')),
                      pageConfig: {
                          icon: 'attachment',
                          title: '综合示例',
                          keepAlive: true,
                      },
                  },
                  ...testRoutesConfig,
              ],
          },
      ]
    : [];

export default routesConfig;
