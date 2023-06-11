import { Spin ,Image, Card, ImagePreview} from '@douyinfe/semi-ui';
import queryString from 'query-string';
import {useEffect, useState} from "react";
import {localStorageGet, localStorageSet} from "../util/expire-localstore";
import {useMutation} from "react-query";
import apiClient from "../util/http-common";
import { useNavigate } from 'react-router-dom';

export default function GongGao() {

    const navigate = useNavigate();


    return(
        <div >
            <h3>阿烫工具箱</h3>
            <div onClick={() => navigate(`/bilibili-audio`, {})}>
                <Card
                    shadows='always'
                    title='哔站音视频提取'
                >
                    提取哔站视频音频的基本功能，能够解析合集、分p、up首页的视频，并通过云盘分享文件。
                </Card>
            </div>
            <br/>
            <div onClick={() => navigate(`/bilibili-subscribe`, {})}>
                <Card
                    shadows='always'
                    title='哔站up主订阅'
                >
                    订阅up，当up更新视频后，会自动将视频保存到你的云盘中。
                </Card>
            </div>


        </div>
    )
}