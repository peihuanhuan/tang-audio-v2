import { Spin ,Image, ImagePreview} from '@douyinfe/semi-ui';
import queryString from 'query-string';
import {useEffect, useState} from "react";
import {localStorageGet, localStorageSet} from "../util/expire-localstore";
import {useMutation} from "react-query";
import apiClient from "../util/http-common";
import { useNavigate } from 'react-router-dom';

export default function GongGao() {

    const navigate = useNavigate();


    return(
        <div style={{display: "flex", height:"300px", margin: "auto", justifyContent: "center", alignItems:"center", flexDirection: "column"}}>
            <Image style={{display: "flex"}}
                width={50}
                height={50}
                src={process.env.PUBLIC_URL + "/logo512.png"} ></Image>
            <div>
                系统正在迁移，5月22日 至 5月24日 期间系统暂停服务。更多消息关注微信粉丝群
            </div>
        </div>
    )
}