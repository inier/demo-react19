import React, { Component } from "react";

// 圖片資源引入
import BG_1 from "./img/bc-1.png";
import BG_2 from "./img/bc-2.png";
import styles from "./index.module.scss";

class ErrorBoundary extends Component {
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      err: null,
      info: null,
    };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    this.logErrorToMyService(error, info);
  }

  goHome = () => {
    window.location.replace(window.location.origin + process.env.PUBLIC_URL);
  };

  refresh = () => {
    window.location.reload();
  };

  logErrorToMyService = (err, info) => {
    this.setState({
      err,
      info,
    });
  };
  render() {
    const { hasError, err, info } = this.state;

    if (hasError) {
      return (
        <div className={styles.content}>
          <img className={styles.BG_1} src={BG_1} alt="err bg" />
          <img className={styles.BG_2} src={BG_2} alt="err bg" />
          <div className={styles.tips}>
            <div className={styles.left}> 可能的原因:&nbsp; </div>
            <div className={styles.right}>
              <div>·&nbsp; 网络信号弱 </div>
              <div>·&nbsp; 找不到请求网页 </div>
              <div>·&nbsp; 输入的网址不正确 </div>
            </div>
          </div>
          <div className={styles.buttons}>
            <div
              className={`${styles.refresh} ${styles.btn}`}
              onClick={this.refresh}
            >
              刷新本页
            </div>

            <div
              className={`${styles.home} ${styles.btn}`}
              onClick={this.goHome}
            >
              回到首页
            </div>
          </div>
          <h2> 错误详情 </h2>
          <div className={styles.box}>
          <div> err: {JSON.stringify(err)} </div>
          <div> info: {JSON.stringify(info)} </div>
          <div> {err && JSON.stringify(err.stack)}</div>
          </div>          
        </div>
      );
    }

    return this.props?.children;
  }
}

export default ErrorBoundary;
