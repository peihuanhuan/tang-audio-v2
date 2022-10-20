import {Component} from "react";

import {  Descriptions, Form, Tooltip, Banner, Divider} from '@douyinfe/semi-ui';
import Icon, { IconHelpCircle } from '@douyinfe/semi-icons';

import {analyticalTypeHints, shareTypeHints} from './desc'


function BusyBanner() {
    return <div style={{margin: "12px -36px 4px"}}>
        <Banner
            closeIcon={null} type="warning"
            description={
                <div style={{height: "72px", verticalAlign: "middle", display: "table-cell"}}>
                    当前服务器拥挤，前方 120 个任务，请耐心静候。当前服务器拥挤，前方 120 个任务，请耐心静候。
                </div>
            }
        />
    </div>;
}

export default class Main extends Component{

    constructor(props) {
        super(props);
        this.state = {
            analyticalTypeHint: analyticalTypeHints[1],
            shareTypeHint: shareTypeHints[1]
        };
    }

    analyticalTypeChange(x) {
        this.setState({
            analyticalTypeHint: analyticalTypeHints[x.target.value]
        })
    }

    shareTypeChange(x) {
        this.setState({
            shareTypeHint: shareTypeHints[x.target.value]
        })
    }

    render() {

        const {TextArea, RadioGroup, Radio } = Form;

        const data = [
            { key: '已完成任务数量', value: '148,000' },
            { key: '总时长', value: '1,3231小时' },
        ];

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

        return(
            <div>

                <div style={{color: 'var(--semi-color-primary)', fontSize: "18px", fontWeight: 700, lineHeight: "24px"}}>阿烫哔站音视频提取</div>

                <Divider margin={8}/>
                <Descriptions data={data} row/>
                {true ? <BusyBanner />: null}

                <Form>
                    <RadioGroup field="" label='解析模式' onChange={this.analyticalTypeChange.bind(this)}
                                initValue={"1"}>
                        <Radio value="1">自由</Radio>
                        <Radio value="2">多p稿件</Radio>
                        <Radio value="3">Up主</Radio>
                    </RadioGroup>

                    <RadioGroup field='isAudio' label="是否提取音频" initValue={"0"}>
                        <Radio value="0">仅提取音频</Radio>
                        <Radio value="1">完整视频</Radio>
                    </RadioGroup>


                    <TextArea field='data' label={"视频链接"} style={{background: 'var( --semi-color-tertiary-light-default)',}}
                              autosize rows={10} placeholder={this.state.analyticalTypeHint}/>

                    <RadioGroup field='isAudio' label={shareRadioDesc()} onChange={this.shareTypeChange.bind(this)} initValue={"1"}>
                        <Radio value="1">百度云盘</Radio>
                        <Radio value="2">阿里云盘</Radio>
                    </RadioGroup>
                    <div style={{color: 'var(--semi-color-text-2)', fontSize: '14px'}}>{this.state.shareTypeHint}</div>

                </Form>
            </div>
        )
    }
}