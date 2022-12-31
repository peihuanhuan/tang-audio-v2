import { Spin ,Image, ImagePreview} from '@douyinfe/semi-ui';
import queryString from 'query-string';
import {useEffect, useState} from "react";
import {localStorageGet, localStorageSet} from "../util/expire-localstore";
import {useMutation} from "react-query";
import apiClient from "../util/http-common";
import { useNavigate } from 'react-router-dom';

export default function BaiduAuthorize() {

    const navigate = useNavigate();

    const [msg, setMsg] = useState("跳转中，请稍后...")

    const { isLoading: _, mutate: baiduAuth } = useMutation(
        code => {
            return apiClient.post(`baidu/code?code=${code}&redirectUri=${window.location.href}`);
        },
        {
            onSuccess: (data) => {
                if (!data) { return }
                setMsg("授权成功")
                navigate('/bilibili-audio', {});
            },
        }
    );

    useEffect(() => {
        console.log("只会第一次render 出现")
        let code = queryString.parse(window.location.search)["code"]
        if (code != null) {
            baiduAuth(code)
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