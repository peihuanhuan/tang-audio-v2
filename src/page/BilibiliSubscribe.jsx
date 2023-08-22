import {Component, useEffect, useState, useRef} from "react";

import {
    Form,
    Image, Notification
} from '@douyinfe/semi-ui';
import apiClient from "../util/http-common";
import {useQuery, useMutation,} from 'react-query'
import queryString from 'query-string';

import { List, Modal, Descriptions, Rating, Button, ButtonGroup } from '@douyinfe/semi-ui';
import moment from "moment";



import {localStorageGet, localStorageSet} from '../util/expire-localstore'


import {useSearchParams, useNavigate} from 'react-router-dom';
import {douyinAnalyticalTypeHints} from "../desc";

let DATA_LOCAL_STORAGE_KEY = "subscribe_data";



export default function WeixinLogin() {

    const navigate = useNavigate();

    const [subscribes, setSubscribes] = useState()

    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deletingId, setDeleteId] = useState(null);


    const {isLoading: fetching, refetch: fetchSubscribes} = useQuery('subscribes',
        code => {
            return apiClient.get(`bilibili/subscribe/list`);
        },
        {
            onSuccess: (data) => {
                if (!data) {
                    return
                }
                console.log(data)
                setSubscribes(data)
            },
        }
    );

    useEffect(() => {
        if (!localStorageGet("token")) {
            navigate(`/weixin-authorization?redirectUrl=${window.location.href}`, {});
            return
        }

        fetchSubscribes()
    }, [])


    // todo 加载中，不要展示 暂无数据


    // todo  加个弹窗 确认
    const {isLoading: isDeleting, mutate: deleteSubscribe} = useMutation(
        () => {
            return apiClient.delete(`/bilibili/subscribe/${deletingId}`,);
        },
        {
            onSuccess: (data) => {
                setDeleteVisible(false)
                fetchSubscribes()
            },
        }
    );




    return(
        <div >
            <div style={{padding: 20 , display: "flex"}}>
                <div style={{textAlign: "center"}}>我的订阅</div>
                <div  style={{ marginRight: 8, marginLeft: "auto" }}>
                    <Button theme='solid' type='primary' onClick={() =>             navigate(`/add-subscribe`, {})}>添加订阅</Button>
                </div>
            </div>
            <hr style={{marginLeft: 20 , marginRight: 20}}/>
            {
                fetching ? <div style={{textAlign: "center"}}>加载数据中。。。</div> :
                <List
                dataSource={subscribes}
                renderItem={item => (
                    <List.Item
                        main={

                            <div>
                                <span style={{ color: 'var(--semi-color-text-0)', fontWeight: 500 }}>{item.title}</span>

                                {item.lastVideo &&
                                    <p style={{ color: 'var(--semi-color-text-2)', margin: '4px 0', }}>
                                        <strong>最新视频：</strong>{item.lastVideo}
                                    </p>
                                }
                                {
                                    item.lastVideoTime && <p style={{ color: 'var(--semi-color-text-2)', margin: '4px 0', }}>
                                        <strong >更新时间：</strong>{moment(item.lastVideoTime).format("YYYY-MM-DD HH:mm")}
                                    </p>
                                }
                                {
                                    item.lastCid == null && <p style={{ color: 'red', margin: '4px 0', }}>
                                        将于凌晨开始保存历史视频
                                    </p>
                                }
                                {
                                    <p style={{ color: 'var(--semi-color-text-2)', margin: '4px 0', }}>
                                        <strong >已保存：</strong>{item.count} 个
                                    </p>
                                }
                            </div>
                        }
                        extra={
                            <ButtonGroup theme="borderless">
                                <Button onClick={() => {
                                    setDeleteVisible(true)
                                    setDeleteId(item.id)
                                }}>删除</Button>
                            </ButtonGroup>
                        }
                    />
                )}
            />
            }

            <Modal
                title="删除该订阅"
                    visible={deleteVisible}
                    size="big"
                onOk={deleteSubscribe}
                onCancel={() => setDeleteVisible(false) }
                closeOnEsc={true}
            >
                真的吗？
            </Modal>
        </div>
    )
}