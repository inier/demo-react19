import apiUrls from '@/api/apiUrls';
import responseCode from '@/api/responseCode';

import { alovaInstance } from './alova';

// 导出alova实例，原request方法由alova的useRequest替代
export { apiUrls, responseCode, alovaInstance as request };
