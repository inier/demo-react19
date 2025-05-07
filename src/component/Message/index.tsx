// https://blog.csdn.net/sinat_28296757/article/details/143252241
// https://github.com/ShoutongLiu/tom-react-component/blob/main/src/components/Message/index.css
import ReactDOM from 'react-dom/client';
import { useState, useEffect } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';

interface Props {
    /**
     * 提示信息
     */
    msg: string;

    /**
     * 提示类型 success 成功/error 失败/info 常规
     */
    type: 'success' | 'error' | 'info' | 'waring';

    /**
     * 提示高度
     */
    top: number;

    /**
     * 提示显示时长
     */
    duration: number;
}

let timer1: NodeJS.Timeout;

let timer2: NodeJS.Timeout;

function Message(props: Props) {
    const { msg, style, className, duration } = props;
    const _type = props.type || 'info';
    const [is_show, setIsShow] = useState(false); // 是否显示
    useEffect(() => {
        if (is_show) return;
        timer1 = setTimeout(() => {
            setIsShow(true);
        }, 10);
        timer2 = setTimeout(() => {
            setIsShow(false);
        }, duration);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    });

    const messageClass = clsx(styles.container, !is_show && styles.opacity, is_show && styles._type, className);

    return (
        <div style={{ top: props.top, ...style }} className={messageClass}>
            <span className="text">{msg}</span>
        </div>
    );
}

let count = 0; // 消息框显示数量
let _count = 0; // 当前消息框显示数量
export default function message(
    message: string,
    type: 'info' | 'waring' | 'error' | 'success' = 'info',
    duration = 3000
) {
    let timer: NodeJS.Timeout;
    const top = 42 + 58 * count;
    const el = document.createElement('div');
    document.body.appendChild(el);
    const root = ReactDOM.createRoot(el);
    root.render(<Message msg={message} top={top} type={type} duration={duration} />);
    count++;
    _count++;

    // 定义一个函数用于清除消息框
    const clearMessage = () => {
        // 减少当前显示的消息框数量
        if (_count > 0) {
            _count--;
        }
        // 如果当前没有消息框显示，则重置消息框数量
        if (_count === 0) {
            count = 0;
        }
        document.body.removeChild(el);
        clearTimeout(timer);
    };

    // duration后自动关闭，设置时间要比在Message组件的timeout时间多一点
    timer = setTimeout(clearMessage, duration + 500);

    // 返回一个清除函数供外部调用，同时清除自动关闭的定时器
    return {
        clear: clearMessage,
    };
}
