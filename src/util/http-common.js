import axios from "axios";
import {  Notification} from '@douyinfe/semi-ui';
import {localStorageGet} from './expire-localstore'

const instance = axios.create({
    baseURL: "https://wx.peihuan.net/api",
    headers: {
        'Content-Type': 'application/json'
    }
});

instance.interceptors.request.use(
    config => {
        config.headers["Authorization"] = `Bearer ${localStorageGet("token")}`;
        return config
    }
)

instance.interceptors.response.use(
    response =>{
        if (response.data.code !== 200) {
            // 忽略认证错误
            if (response.data.code !== 702) {
                let opts = {title: '发生了一些错误', content: response.data.msg, duration: 8,};
                Notification.error({...opts, position: 'top'})
            }

            if (response.data.code === 703) {
                localStorage.removeItem("token");
                window.location.reload();
            }

        }
        return response.data.data
    },
    error => {
        // 对响应错误做些什么
        console.log(error)
        return Promise.reject(error)
    }
)


export default instance