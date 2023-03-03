import {Component, useEffect, useState, useRef} from "react";

import {
    Button,
    Form,
    Input,
    Image
} from '@douyinfe/semi-ui';
import apiClient from "../util/http-common";
import {useQuery, useMutation,} from 'react-query'
import queryString from 'query-string';

import {localStorageGet, localStorageSet} from '../util/expire-localstore'


export default function UserLogin() {

    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const x = "100s后重试"

    const {mutate: sendEmail} = useMutation(
        () => {
            return apiClient.post(`user/email/send?email=${email}`);
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


    const {isLoading: _, mutate: login} = useMutation(
        () => {
            return apiClient.post(`user/login?email=${email}&&code=${code}`);
        },
        {
            onSuccess: (data) => {
                if (!data) {
                    return
                }
                localStorageSet("token", data, 90)
            },
        }
    );

    // const {Input} = Form;
    const api = useRef();

    return (
        <div style={{display: "flex", height:"500px", margin: "auto", justifyContent: "center", alignItems:"center", flexDirection: "column"}}>
            <h3>一个敷衍的登录页面</h3>

            <Input prefix={"邮箱"} className={} onChange={
                (value) => {
                    setEmail(value)
                }
            }>
            </Input>
            <Input prefix={"验证码"} onChange={
                (value) => {
                    setCode(value)
                }
            } suffix={
                <Button onClick={sendEmail}>发送验证码</Button>
            }>
            </Input>
            <Button onClick={() => {
            }} htmlType='submit' theme="solid"
                    style={{width: "100%", height: "50px", margin: "12px 0 0px 0"}}>登录</Button>
        </div>
    )
}