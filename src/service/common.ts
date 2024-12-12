import { apiUrls, request } from '@/api';

export function getPicCode(timestamp) {
  return request.get(`${apiUrls.GET_PIC_CODE}?timestamp=${timestamp}`);
  // return `${apiUrls.GET_PIC_CODE}?timestamp=${timestamp}&username=${username}`;
}
