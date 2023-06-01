import {Component, useEffect, useState, useRef} from "react";

import {
    Image
} from '@douyinfe/semi-ui';
import apiClient from "../util/http-common";
import {useQuery, useMutation,} from 'react-query'
import queryString from 'query-string';

import {localStorageGet, localStorageSet} from '../util/expire-localstore'


import {useSearchParams, useNavigate} from 'react-router-dom';


export default function WeixinLogin() {

    const [params] = useSearchParams()
    const redirectUrl = params.getAll('redirectUrl')[0];
    console.log("=== weichat redirectUrl ", redirectUrl, params)

    const { mutate: getAuthorizationUrl } = useMutation(
        ()=> {return apiClient.get(`wx/wx1e172dfca3c637d5/user/authorizationUrl?scope=snsapi_userinfo&redirectUri=${window.location.href}`);},
        {
            onSuccess: (data) => {
                if (!data) { return }
                window.location.href = data
            },
        }
    );

    const navigate = useNavigate();

    const { isLoading: _, mutate: login } = useMutation(
        code => {
            return apiClient.post(`wx/wx1e172dfca3c637d5/user/login?code=${code}`);
        },
        {
            onSuccess: (data) => {
                if (!data) { return }
                localStorageSet("token", data, 7)
                window.location.href = redirectUrl
            },
        }
    );

    useEffect(() =>{
        let code = queryString.parse(window.location.search)["code"]
        if (code) {
            login(code)
        } else {
            getAuthorizationUrl()
        }
    },[])

    // return (<h1>原公众号被举报永久封禁，新公众号配置中，2.25前恢复</h1>)


    return(
        <div style={{display: "flex", height:"300px", margin: "auto", justifyContent: "center", alignItems:"center", flexDirection: "column"}}>
            <Image style={{display: "flex"}}
                   width={50}
                   height={50}
                   src={process.env.PUBLIC_URL + "/logo512.png"} ></Image>
            <div>微信登录中，请稍后...</div>
        </div>
    )
}