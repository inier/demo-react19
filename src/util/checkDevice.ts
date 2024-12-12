// 设备或系统相关方法

// 获取设备userAgent
export const UA = navigator.userAgent.toLowerCase();

// 判断是桌面端还是移动端
export const isMobile = (() => {
  const mobile = window.matchMedia('(max-width: 640px)').matches;
  const flag = navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Windows Phone)/i,
  );

  return mobile && flag;
})();
