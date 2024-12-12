import { lazy } from "../LazyLoader";
import DYLoading from "./Loading";

// 页面导入组件
const pageLoader = (importFunction) => {
  return lazy(importFunction, { spinner: <DYLoading />, pastDelay:0 });
};

export default pageLoader;
export { DYLoading };
