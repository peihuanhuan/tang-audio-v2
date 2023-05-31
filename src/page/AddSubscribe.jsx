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
// import Icon, {IconHelpCircle} from '@douyinfe/semi-icons';

import {bilibiliAnalyticalTypeHints, shareTypeHints} from '../desc'
import apiClient from "../util/http-common";
import {useQuery, useMutation,} from 'react-query'
import queryString from 'query-string';
import {useNavigate} from 'react-router-dom';

import {localStorageGet, localStorageSet} from '../util/expire-localstore'


let defaultText = `当前任务正在排队中`;

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

let DATA_LOCAL_STORAGE_KEY = "subscribe_data";
let SHARE_TYPE_LOCAL_STORAGE_KEY = "shareType";
let LAST_SUCCESS_TASK_ID = "lastSuccessTaskId"

const DEFAULT_STATUS = "DEFAULT"
const PROCESS_STATUS = "PROCESS"
const FAIL_STATUS = "FAIL"
const SUCCESS_STATUS = "SUCCESS"

let jiexiIng = `解析中...`;



export default function AddSubscribe() {


    const [enableSubmit, setEnableSubmit] = useState(false)
    const [buttonLoading, setButtonLoading] = useState(false)
    const [buttonText, setButtonText] = useState("提交")

    const [subscribeStatus, setSubscribeStatus] = useState("OFF")


    const [baiduAuthModalVisible, setBaiduAuthModalVisible] = useState(false)
    const [hasBaiduAuthorization, setHasBaiduAuthorization] = useState(false)


    console.log("render...", buttonText)



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




    const {isLoading: submitting, mutate: submit} = useMutation(
        values => {
            return apiClient.post(`/bilibili/subscribe/up`, JSON.stringify(values),);
        },
        {
            onSuccess: (data) => {
                if (!data) {
                    console.log("data.....", data)
                    setButtonLoading(false)
                    setButtonText("提交")
                    return
                }
                // 不修改 setButtonLoading 是因为一直为 true，因为正在处理中
                const countRegexp = /[0-9]+/g;
                Notification.success({title: 'Hi, 亲爱的哔友', content: `开始处理最新的 ${data} 的个视频`, duration: 5,})
                localStorage.removeItem(DATA_LOCAL_STORAGE_KEY)
                api.current.setValue("data", "") // 清空
                setButtonText(defaultText)
                navigate(`/bilibili-subscribe`, {})

            },
        }
    );




    const defaultData = localStorage.getItem(DATA_LOCAL_STORAGE_KEY) || ""

    const {TextArea, RadioGroup, Radio} = Form;
    const api = useRef();

    // return (<h1>原公众号被举报永久封禁，新公众号配置中，2.25前恢复</h1>)

    return (
        <div>

            <Divider margin={4}/>
            <Form getFormApi={formApi => api.current = formApi}
                  onSubmit={values => {
                      if (subscribeStatus === "OFF") {
                          return
                      }
                      if (!hasBaiduAuthorization) {
                          setBaiduAuthModalVisible(true)
                          return;
                      }
                      // 避免重复提交
                      if (!submitting) {
                          setButtonLoading(true)
                          setButtonText(jiexiIng)
                          submit(values)
                      }
                  }}
            >

                <RadioGroup field='outputType' label="订阅音频or视频" initValue={"0"}>
                    <Radio value="0">仅订阅音频</Radio>
                    <Radio value="1">订阅完整视频</Radio>
                </RadioGroup>



                <TextArea rules={[{required: true, message: '请填写up首页链接'},]} field='data' label={"Up 主首页链接"}
                          style={{background: 'var( --semi-color-tertiary-light-default)',}}
                          onChange={(data) => localStorage.setItem(DATA_LOCAL_STORAGE_KEY, data)}
                          initValue={defaultData}
                          autosize rows={5} placeholder="每隔几分钟自动获取最新视频"/>


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