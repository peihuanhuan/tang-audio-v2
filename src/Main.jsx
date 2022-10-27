import {Component, useEffect, useState} from "react";

import {  Descriptions, Form, Tooltip, Banner, Divider, Button, Toast, Notification} from '@douyinfe/semi-ui';
import Icon, { IconHelpCircle } from '@douyinfe/semi-icons';

import {analyticalTypeHints, shareTypeHints} from './desc'
import apiClient from "./http-common";
import {useQuery, useMutation,} from 'react-query'
import queryString from 'query-string';

import {localStorageGet, localStorageSet} from './expire-localstore'


function BusyBanner(props) {
    const before = props.before
    return <div style={{margin: "12px -16px 4px"}}>
        <Banner
            closeIcon={null}
            type="danger"
            description={
                <div style={{height: "72px", verticalAlign: "middle", display: "table-cell"}}>
                    当前服务器拥挤，前方 {before} 个任务，请耐心排队静候。
                </div>
            }
        />
    </div>;
}

let DATA_LOCAL_STORAGE_KEY = "data";
let SHARE_TYPE_LOCAL_STORAGE_KEY = "shareType";



const shareRadioDesc = () => {
    return (
        <Tooltip position="right" content={'阿里分享失败后自动使用百度云盘重试'}>
            <div style={{display: "flex", width: "fit-content"}}>
                <div style={{height: "16px", lineHeight: "16px", padding: "0 4px 0 0"}}>分享方式</div>
                <IconHelpCircle />
            </div>
        </Tooltip>
    )
}



export default function Main() {

    console.log("render...")

    const [analyticalTypeHint, setAnalyticalTypeHint] = useState(analyticalTypeHints[1])
    const [shareTypeHint, setShareTypeHint] = useState(shareTypeHints[1])
    const [successTask, setSuccessTask] = useState("loading...")
    const [totalDuration, setTotalDuration] = useState("loading...")
    const [tasksAheadCount, setTasksAheadCount] = useState(0)

    const [enableSubmit, setEnableSubmit] = useState(false)
    const [buttonLoading, setButtonLoading] = useState(false)
    const [buttonText, setButtonText] = useState("提交")

    const data = [
        { key: '已完成任务数量', value: successTask },
        { key: '总时长(分钟)', value: totalDuration },
    ];


    const { mutate: getAuthorizationUrl } = useMutation(
        ()=> {return apiClient.get(`wx/wx32b8546599fad714/user/authorizationUrl?scope=snsapi_userinfo&redirectUri=${window.location.href}`);},
        {
            onSuccess: (data) => {
                if (!data) {
                    return
                }
                window.location.href = data
            },
        }
    );

    const { isLoading: _, mutate: login } = useMutation(
        code => {
            return apiClient.post(`wx/wx32b8546599fad714/user/login?code=${code}`);
        },
        {
            onSuccess: (data) => {
                if (!data) {
                    return
                }
                localStorageSet("token", data, 7)
            },
        }
    );

    useEffect(() =>{
        let token = localStorageGet("token")
        if (!token) {
            let code = queryString.parse(window.location.search)["code"]
            if (code) {
                login(code)
            } else {
                getAuthorizationUrl()
            }
        }
    },[])

    const { refetch: fetchStatus } = useQuery('status',
        code => {
            return apiClient.get(`bilibili/audio/status`);
        },
        {
            onSuccess: (data) => {
                setSuccessTask(data.successSubTaskCnt.toLocaleString())
                setTotalDuration(Math.round((data.successSubTaskDuration / 60 )).toLocaleString())
                setTasksAheadCount(data.tasksAhead)
            },
        }
    );

    useEffect(() => {
        console.log("只会第一次render 出现")
        const interval = setInterval(() => {
            fetchStatus()
        }, 15000);

        return () => clearInterval(interval);
    }, []);


    const { refetch: fetchSubscribeStatus } = useQuery('subscribeStatus',
        code => {
            return apiClient.get(`wx/wx32b8546599fad714/user`);
        },
        {
            onSuccess: (data) => {
                setButtonLoading(false)
                if (data["subscribeStatus"] !== "ON") {
                    setButtonText("需要关注公众号以接收消息通知...")
                } else {
                    setButtonText("提交")
                    setEnableSubmit(true)
                }
            },
        }
    );

    useEffect(() => {
        console.log("只会第一次render 出现")
        setButtonLoading(true)
        setEnableSubmit(false)
        setButtonText("正在检查是否关注公众号")
        fetchSubscribeStatus()
    }, []);


    function shareTypeChange(x) {
        let value = x.target.value;
        setShareTypeHint(shareTypeHints[value])
        localStorage.setItem(SHARE_TYPE_LOCAL_STORAGE_KEY, value);
    }


    const { isLoading: submitting, mutate: submit } = useMutation(
        values=> {
            return apiClient.post(`/bilibili/audio`, JSON.stringify(values), );
        },
        {
            onSuccess: (data) => {
                if (!data) {
                    return
                }
                let opts = {
                    title: 'Hi, 亲爱的哔友',
                    content: data,
                    duration: 5,
                };
                Notification.success(opts)
                localStorage.removeItem(DATA_LOCAL_STORAGE_KEY)
            },
        }
    );

    useEffect(() => {
        setButtonLoading(submitting)
    }, [submitting]);


    const defaultShareType = localStorage.getItem(SHARE_TYPE_LOCAL_STORAGE_KEY) || "1"
    const defaultData = localStorage.getItem(DATA_LOCAL_STORAGE_KEY) || ""

    const {TextArea, RadioGroup, Radio } = Form;

    return(
        <div>
            <div style={{color: 'var(--semi-color-primary)', fontSize: "18px", fontWeight: 700, lineHeight: "24px"}}>阿烫哔站音视频提取</div>
            <Divider margin={4}/>
            <Descriptions data={data} row/>
            {(tasksAheadCount > 0) ? <BusyBanner before={tasksAheadCount} />: null}

            <Form
                onSubmit={values=> {
                    submit(values)
                }}
            >

                <RadioGroup field='isAudio' label="是否提取音频" initValue={"0"}>
                    <Radio value="0">仅提取音频</Radio>
                    <Radio value="1">完整视频</Radio>
                </RadioGroup>

                <RadioGroup field="type" label='解析模式' onChange={(x) => {setAnalyticalTypeHint(analyticalTypeHints[x.target.value])}}
                            initValue={"1"}>
                    <Radio value="1">自由</Radio>
                    <Radio value="2">分p稿件</Radio>
                    <Radio value="3">Up主</Radio>
                </RadioGroup>

                <TextArea  rules={[{ required: true, message: '请填写视频链接' },]}  field='data' label={"视频链接"} style={{background: 'var( --semi-color-tertiary-light-default)',}}
                           onChange={(data) => localStorage.setItem(DATA_LOCAL_STORAGE_KEY, data)}
                           initValue={defaultData}
                          autosize rows={8} placeholder={analyticalTypeHint}/>

                <RadioGroup field='shareType' label={shareRadioDesc()} onChange={shareTypeChange} initValue={defaultShareType}>
                    <Radio value="1">百度云盘</Radio>
                    <Radio value="2">阿里云盘</Radio>
                </RadioGroup>
                <div style={{color: 'var(--semi-color-text-2)', fontSize: '14px'}}>{shareTypeHint}</div>

                <Button disabled={!enableSubmit}  htmlType='submit' loading={buttonLoading} theme="solid" style={{width: "100%", height:"50px", margin: "12px 0 0px 0"}}>{buttonText}</Button>

            </Form>
        </div>
    )
}