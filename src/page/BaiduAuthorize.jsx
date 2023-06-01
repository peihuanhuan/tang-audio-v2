import { Spin ,Image, ImagePreview} from '@douyinfe/semi-ui';
import queryString from 'query-string';
import {useEffect, useState} from "react";
import {localStorageGet, localStorageSet} from "../util/expire-localstore";
import {useMutation} from "react-query";
import apiClient from "../util/http-common";
import {useNavigate, useSearchParams} from 'react-router-dom';

export default function BaiduAuthorize() {

    const navigate = useNavigate();

    const [params] = useSearchParams()
    const backUrl = params.getAll('backUrl')[0];
    // state 里存的是  backUrl
    const state = params.getAll('state')[0];

    console.log("=== baidu redirectUrl ", backUrl, params)
    const [msg, setMsg] = useState("跳转中，请稍后...")

    const {mutate: jumpToBaiduAuthorizationUrl} = useMutation(
        () => {
            // baidu redirectUri 上貌似不允许有参数。

            return apiClient.get(`baidu/authorizationUrl?redirectUri=${window.location.href.split('?')[0]}&scope=1&state=${backUrl}`);
        },
        {
            onSuccess: (data) => {
                if (!data) {
                    return
                }
                window.location.href = data
            },
        }
    );

    const { isLoading: _, mutate: baiduAuth } = useMutation(
        code => {
            //  redirectUri 不能带参数，必须和配置里的一模一样
            return apiClient.post(`baidu/code?code=${code}&redirectUri=${window.location.href.split('?')[0]}`);
        },
        {
            onSuccess: (data) => {
                if (!data) { return }
                setMsg("授权成功")
                window.location.href = state
            },
        }
    );

    useEffect(() => {
        console.log("只会第一次render 出现")
        let code = queryString.parse(window.location.search)["code"]
        if (code != null) {
            baiduAuth(code)
        } else {
            jumpToBaiduAuthorizationUrl()
        }
    }, [])

    return(
        <div style={{display: "flex", height:"300px", margin: "auto", justifyContent: "center", alignItems:"center", flexDirection: "column"}}>
            <Image style={{display: "flex"}}
                width={50}
                height={50}
                src={process.env.PUBLIC_URL + "/logo512.png"} ></Image>
            <div>{msg}</div>
        </div>
    )
}