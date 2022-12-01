import React, {useEffect, useState} from "react";
import {Col, Row, Button, Input, Select, Space, InputNumber, Radio, message} from 'antd';
//import type { RadioChangeEvent } from 'antd'
import sd from "silly-datetime"
import './wsClient.css'
const {TextArea} = Input


const WebSocketClient:React.FC = () =>{
    const [wsMsg, setwsMsg] = useState('')
    const [sendMsgContent, setSendMsgContent] = useState<string>('')
    const [wSocket, setwSocket] = useState<WebSocket | undefined>(undefined)
    const [wsAddress, setwsAddress] = useState<string>('0.0.0.0')
    const [wsPort, setwsPort] = useState<number>(18181)
    const [sendType, setSendType] = useState<number>(1)
    const [cmdTemplateSel, setcmdTemplateSel] = useState<string>('cmd0')
    const cmdTypes: object[] = [
        {value:'getAllCase', label:'用例目录查询'},
        {value:'action', label:'用例执行'},
        {value:'actionState', label:'运行状态查询'},
        {value:'actionControl', label:'运行状态变更'},
        {value:'entityLog', label:'运行日志回调'},
    ]
    const [messageApi, contextHolder] = message.useMessage();
    //let wSocket:WebSocket
    /**
     * 连接WebSocket
     */
    const webSocketInit = () =>{
        const connAddress = `ws://${wsAddress}:${wsPort}`
        let ws = new WebSocket(connAddress)
        ws.onopen = () =>{
            console.log('websocket connected')
            messageApi.info(`[${wsAddress}:${wsPort}] 已连接`).then((res:boolean)=>{
                console.log(`connectedPrompt: ${res}`)
            })
        }
        ws.onmessage = function(e){
            handleReceiveMsg(e)
        }
        ws.onerror = function (e){
            messageApi.error('连接失败').then((res:boolean)=>{
                console.log(`connectedPrompt: ${res}`)
            })
        }
        setwSocket(ws)
    }
    /**
     * 接收数据
     * @param event
     */
    const handleReceiveMsg = (event: MessageEvent) =>{
        //const msgList = wsMsg + '\n'+ event.data
        setwsMsg(wsMsg=> wsMsg + '\n'+ event.data)
        scrollTextAreaToBottom()
    }
    /**
     * 发数据
     */
    const sendMsg = () =>{
        if(wSocket !== undefined){
            wSocket.send(sendMsgContent)
        }else{
            messageApi.warning(`[${wsAddress}:${wsPort}] 未连接，无法发送`)
        }
    }
    /**
     * 连接按钮
     */
    const connect = () =>{
        if(wSocket !== undefined){
            if((wSocket as WebSocket).readyState === 1){
                messageApi.warning('WebSocket已经连接')
                return
            }
            // messageApi.warning('WebSocket已经连接')
            // return
        }
        // else if(wSocket === WebSocket) {
        //     if((wSocket as WebSocket).readyState === 1){
        //         messageApi.warning('WebSocket已经连接')
        //         return
        //     }
        // }
        webSocketInit()
    }
    const clearSend = () =>{
        setSendMsgContent('')
    }
    const getTimeStr = ():string =>{
        return sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
    }
    const scrollTextAreaToBottom = () =>{
        let textArea = document.getElementById('textAreaMsg')
        if(textArea == null)
            return
        if(textArea.scrollHeight > textArea.clientHeight){
            textArea.scrollTop = textArea.scrollHeight
        }
    }
    const getDiv = () =>{
        return <div>abc</div>
    }
    /**
     * 地址变更事件
     * @param e
     */
    const wsAddressChange = (e:React.ChangeEvent<HTMLInputElement>) =>{
        const newAddr = e.target.value
        setwsAddress(newAddr)
    }
    /**
     * 端口变更事件
     * @param v
     */
    const wsPortChange = (v:number|null) =>{
        if(v !== null)
            setwsPort(v)
    }
    /**
     * 指令选择事件
     * @param value
     */
    const handleCmdSel = (value:string) =>{
        console.log(`已选择 ${value}`)
        setcmdTemplateSel(value)
    }
    const updateSendData = () =>{
        switch(cmdTemplateSel){
            case 'getAllCase':
                const content0 = {
                    userid: 'ZQY01xjeea8DWpcc',
                    timestamp: Date.now(),
                    sign: '',
                    funid: 'GetAllCase'
                }
                setSendMsgContent(JSON.stringify(content0))
                break
            case 'cmd1':
                const content1 = {
                    funcIndex:1,
                    operation: 'execute'
                }
                setSendMsgContent(JSON.stringify(content1))
                break
            case 'cmd2':
                const content2 = {
                    funcIndex:2,
                    operation: 'cancel'
                }
                setSendMsgContent(JSON.stringify(content2))
                break
        }
    }
    const handleSendMsgChange = (e:React.ChangeEvent<HTMLTextAreaElement>) =>{
        setSendMsgContent(e.target.value)
    }
    // const sendTypeRadioChange = (e:RadioChangeEvent) =>{
    //     setSendType(e.target.value)
    // }
    useEffect(()=>{
        updateSendData()
        //webSocketInit()
        return()=>{
            if(wSocket !== undefined){
                wSocket.close()
            }
        }
    }, [])
    useEffect(()=>{
        updateSendData()
    }, [cmdTemplateSel])


    return(
        <>
            {contextHolder}
            <Row>
                <Col span={8} offset={1}>
                    <h1>WebSocket通讯</h1>
                </Col>
            </Row>
            <Row>
                <Col offset={1} span={9}>
                    <Space>
                        地址：
                        <Input id="inputAddr" placeholder="地址" value={wsAddress} style={{width:200}} onChange={wsAddressChange}></Input>
                        端口：
                        <InputNumber id="inputPort" placeholder="端口" value={wsPort} style={{width:100}} onChange={wsPortChange}></InputNumber>
                        <Button onClick={connect}>连接</Button>
                    </Space>
                </Col>

            </Row>
            <Row className="contentStyle">
                <Col span={10} offset={1}>
                    <Space>
                        选取预设指令：
                        <Select defaultValue='getAllCase' style={{width: 180}} onChange={handleCmdSel} options={cmdTypes} />
                        <Button onClick={clearSend}>清空</Button>

                        <Button type="primary" onClick={sendMsg}>发送</Button>
                    </Space>
                </Col>
            </Row>
            <Row className="contentStyle">
                <Col span={2} offset={1}>
                    <span>待发送数据：</span>
                </Col>
                <Col span={2} offset={9}>
                    <span>接收数据：</span>
                </Col>
            </Row>
            <Row>
                <Col span={10} offset={1}>
                    <TextArea id='textAreaSend' rows={15} value={sendMsgContent} onChange={handleSendMsgChange}/>
                </Col>
                <Col span={10} offset={1}>
                    <TextArea id='textAreaMsg' rows={15} value={wsMsg}/>
                </Col>
            </Row>
        </>
    )


}
export default WebSocketClient