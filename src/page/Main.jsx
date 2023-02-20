import {Component, useEffect, useState, useRef} from "react";

import {
    Descriptions,
    Form,
    Tooltip,
    Modal,
    Banner,
    Divider,
    Button,
    Toast,
    Notification,
    Popconfirm
} from '@douyinfe/semi-ui';
import Icon, {IconHelpCircle} from '@douyinfe/semi-icons';

import {bilibiliAnalyticalTypeHints, shareTypeHints} from '../desc'
import apiClient from "../util/http-common";
import {useQuery, useMutation,} from 'react-query'
import queryString from 'query-string';
import {useNavigate} from 'react-router-dom';

import {localStorageGet, localStorageSet} from '../util/expire-localstore'


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
let LAST_SUCCESS_TASK_ID = "lastSuccessTaskId"

const DEFAULT_STATUS = "DEFAULT"
const FAIL_STATUS = "FAIL"
const SUCCESS_STATUS = "SUCCESS"

const shareRadioDesc = () => {
    return (
        <Tooltip position="right" content={'阿里分享失败后自动使用百度云盘重试'}>
            <div style={{display: "flex", width: "fit-content"}}>
                <div style={{height: "16px", lineHeight: "16px", padding: "0 4px 0 0"}}>分享方式</div>
                <IconHelpCircle/>
            </div>
        </Tooltip>
    )
}


export default function Main() {


    const defaultShareType = localStorage.getItem(SHARE_TYPE_LOCAL_STORAGE_KEY) || "1"


    const [analyticalTypeHint, setAnalyticalTypeHint] = useState(bilibiliAnalyticalTypeHints[1])
    const [shareTypeHint, setShareTypeHint] = useState(shareTypeHints[defaultShareType])
    const [successTask, setSuccessTask] = useState("loading...")
    const [totalDuration, setTotalDuration] = useState("loading...")
    const [tasksAheadCount, setTasksAheadCount] = useState(0)

    const [enableSubmit, setEnableSubmit] = useState(false)
    const [buttonLoading, setButtonLoading] = useState(false)
    const [buttonText, setButtonText] = useState("提交")

    const [subscribeStatus, setSubscribeStatus] = useState("OFF")

    const [retryVisible, setRetryVisible] = useState(false);
    const [lastTaskId, setLastTaskId] = useState(0);
    const [cancelRetry, setCancelRetry] = useState(false);

    const [baiduAuthModalVisible, setBaiduAuthModalVisible] = useState(false)
    const [hasBaiduAuthorization, setHasBaiduAuthorization] = useState(false)


    console.log("render...", buttonText)


    const data = [
        {key: '已完成任务数量', value: successTask},
        {key: '总时长(分钟)', value: totalDuration},
    ];

    const {mutate: getBaiduAuthorizationUrl} = useMutation(
        () => {
            return apiClient.get(`baidu/authorizationUrl?redirectUri=http://wx.peihuan.net/baidu-authorization&scope=1`);
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

    const navigate = useNavigate();


    useEffect(() => {
        document.title = '阿烫b站视频提取'
    }, [])


    useEffect(() => {
        let token = localStorageGet("token")
        if (!token) {
            navigate(`/weixin-authorization?redirectUrl=${window.location.href}`, {});
        }
    }, [])


    const {refetch: fetchStatus} = useQuery('status',
        code => {
            return apiClient.get(`bilibili/audio/status`);
        },
        {
            onSuccess: (data) => {
                if (!data) {
                    return
                }
                setSuccessTask(data.successSubTaskCnt.toLocaleString())
                setTotalDuration(Math.round((data.successSubTaskDuration / 60)).toLocaleString())
                setTasksAheadCount(data.tasksAhead)
                setLastTaskId(data.task?.id)
                const taskStatus = data.task?.status ?? ""
                if (taskStatus === FAIL_STATUS || taskStatus === SUCCESS_STATUS) {
                    setButtonLoading(false)
                    if (subscribeStatus === "ON") {
                        setButtonText("提交")
                    }


                    if (taskStatus === SUCCESS_STATUS) {
                        const last = localStorage.getItem(LAST_SUCCESS_TASK_ID)

                        if (parseInt(last) !== data.task?.id) {
                            localStorage.setItem(LAST_SUCCESS_TASK_ID, data.task?.id)
                            Notification.success({
                                title: data.task.name,
                                content: `任务已完成，进入公众号回复【音频】获得结果`,
                                duration: 5,
                            })
                        }
                    }
                    if (taskStatus === FAIL_STATUS) {
                        setRetryVisible(true)
                    }

                } else if (taskStatus === DEFAULT_STATUS) {
                    setButtonLoading(true)
                    setButtonText(`上个任务转换中: ${data.task?.successSubTaskCount ?? 0}/${data.task?.subTaskSize ?? 0}`)
                }


            },
        }
    );

    useEffect(() => {
        console.log("只会第一次render 出现")
        const interval = setInterval(() => {
            if (localStorageGet("token")) {
                console.log("定时请求 fetchStatus")
                fetchStatus()
            }
        }, 15000);

        return () => clearInterval(interval);
    }, []);


    const {refetch: fetchSubscribeStatus} = useQuery('subscribeStatus',
        code => {
            return apiClient.get(`wx/wx32b8546599fad714/user`);
        },
        {
            // 仅请求一次， 永不过期
            staleTime: Infinity,
            cacheTime: Infinity,
            onSuccess: (data) => {
                if (!data) {
                    return
                }
                setSubscribeStatus(data.subscribeStatus)
                setHasBaiduAuthorization(data.baiduAuthorization)
                setButtonLoading(false)
                setEnableSubmit(true)
                if (data["subscribeStatus"] !== "ON") {
                    setButtonText("正在跳转老版本")
                    window.location = `http://wx.peihuan.net/bilibili-audio-old?token=${window.btoa(localStorageGet("token"))}`
                } else {
                    setButtonText("提交")
                }
            },
        }
    );

    useEffect(() => {
        if (!localStorageGet("token")) {
            return
        }
        console.log("fetchSubscribeStatus 出现")
        setButtonLoading(true)
        setEnableSubmit(false)
        setButtonText("正在前置检查")
        fetchSubscribeStatus()
    }, []);


    function shareTypeChange(x) {
        let value = x.target.value;
        setShareTypeHint(shareTypeHints[value])
        localStorage.setItem(SHARE_TYPE_LOCAL_STORAGE_KEY, value);
        if (value === "3" && !hasBaiduAuthorization) {
            setBaiduAuthModalVisible(true)
        }
    }


    const {isLoading: submitting, mutate: submit} = useMutation(
        values => {
            return apiClient.post(`/bilibili/audio`, JSON.stringify(values),);
        },
        {
            onSuccess: (data) => {
                if (!data) {
                    setButtonLoading(false)
                    setButtonText("提交")
                    return
                }
                const countRegexp = /[0-9]+/g;
                Notification.success({title: 'Hi, 亲爱的哔友', content: data, duration: 5,})
                localStorage.removeItem(DATA_LOCAL_STORAGE_KEY)
                api.current.setValue("data", "") // 清空
                setButtonText(`上个任务转换中: 0/${data.match(countRegexp)}`)

            },
        }
    );

    const {mutate: retry} = useMutation(
        () => {
            return apiClient.post(`/bilibili/audio/retry`, JSON.stringify({"taskId": lastTaskId}),);
        },
        {
            onSuccess: (data) => {
                if (!data) {
                    return
                }
                Toast.success('重试成功')
                setRetryVisible(false)
                setButtonLoading(true)
                setButtonText(`上个任务重试中: ${data.success}/${data.total}`)
            },
        }
    );


    const defaultData = localStorage.getItem(DATA_LOCAL_STORAGE_KEY) || ""

    const {TextArea, RadioGroup, Radio} = Form;
    const api = useRef();

    return (
        <div>

            <Descriptions data={data} row/>
            {(tasksAheadCount > 0) ? <BusyBanner before={tasksAheadCount}/> : null}
            <Divider margin={4}/>
            <Modal
                title="是否重试？"
                visible={retryVisible && !cancelRetry}
                width="80%"
                onOk={() => {
                    retry()
                    setCancelRetry(false)
                }}
                onCancel={() => setCancelRetry(true)}
                closeOnEsc={true}
            >
                上个任务失败，多次尝试仍失败，大概率因为文件名包含敏感词无法分享。
                <br/><br/>使用【百度免分享】方式可解决此问题
            </Modal>
            <Form getFormApi={formApi => api.current = formApi}
                  onSubmit={values => {
                      if (subscribeStatus === "OFF") {
                          return
                      }
                      if (values.shareType === "3" && !hasBaiduAuthorization) {
                          setBaiduAuthModalVisible(true)
                          return;
                      }
                      // 避免重复提交
                      if (!submitting) {
                          setButtonLoading(true)
                          setButtonText(`解析中...`)
                          submit(values)
                      }
                  }}
            >

                <RadioGroup field='outputType' label="是否提取视频" initValue={"0"}>
                    <Radio value="0">仅提取音频</Radio>
                    <Radio value="1">完整视频</Radio>
                </RadioGroup>

                <RadioGroup field="type" label='解析模式' onChange={(x) => {
                    setAnalyticalTypeHint(bilibiliAnalyticalTypeHints[x.target.value])
                }}
                            initValue={"1"}>
                    <Radio value="1">默认</Radio>
                    <Radio value="2">分p稿件</Radio>
                    <Radio value="4">合集</Radio>
                    <Radio value="3">Up主</Radio>
                </RadioGroup>

                <TextArea rules={[{required: true, message: '请填写视频链接'},]} field='data' label={"视频链接"}
                          style={{background: 'var( --semi-color-tertiary-light-default)',}}
                          onChange={(data) => localStorage.setItem(DATA_LOCAL_STORAGE_KEY, data)}
                          initValue={defaultData}
                          autosize rows={8} placeholder={analyticalTypeHint}/>

                <RadioGroup field='shareType' label={shareRadioDesc()} onChange={shareTypeChange}
                            initValue={defaultShareType}>
                    <Radio value="3">百度免分享</Radio>
                    <Radio value="1">百度云盘</Radio>
                    <Radio value="2" disabled={true}>阿里云盘</Radio>
                </RadioGroup>
                <div style={{color: 'var(--semi-color-text-2)', fontSize: '14px'}}>{shareTypeHint}</div>
                <Button onClick={() => {
                    if (subscribeStatus === "OFF") {
                        window.location = "https://mp.weixin.qq.com/s/GTQTcUzQ8tcWNlubEC1D3A"
                    }
                }} disabled={!enableSubmit} htmlType='submit' loading={buttonLoading} theme="solid"
                        style={{width: "100%", height: "50px", margin: "12px 0 0px 0"}}>{buttonText}</Button>

            </Form>
            <Modal
                title="授权百度网盘"
                visible={baiduAuthModalVisible}
                width="80%"
                onOk={getBaiduAuthorizationUrl}
                onCancel={() => setBaiduAuthModalVisible(false)}
                closeOnEsc={true}
            >
                授权之后阿烫才能将文件上传至你的网盘 "/我的应用数据/阿烫/" 目录下
                <br/>
            </Modal>
        </div>
    )
}