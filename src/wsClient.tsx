import React, {useEffect, useState} from "react";
import {Col, Row, Button, Input, Select, Space, InputNumber, message, Tag} from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import {Buffer} from 'buffer'
//import type { RadioChangeEvent } from 'antd'
import sd from "silly-datetime"
import cmdHelper from './commandHelper'
import {CommandData} from './commandData'
import './wsClient.css'
const {TextArea} = Input


const WebSocketClient:React.FC = () =>{
    const [wsMsg, setwsMsg] = useState<string>('')
    const [convertedMsg, setConvertedMsg] = useState<string>('')
    const [displayMsgContent, setDisplayMsgContent] = useState<string>('')
    const [sendMsgContent, setSendMsgContent] = useState<string>('')
    const [wSocket, setwSocket] = useState<WebSocket | undefined>(undefined)
    const [wsAddress, setwsAddress] = useState<string>('127.0.0.1')
    const [wsPort, setwsPort] = useState<number>(18181)
    const [userId, setUserId] = useState<string>('ZQY01xjeea8DWpcc')
    const [appKey, setAppKey] = useState<string>('QWCabin2022')
    const [connStat, setConnStat] = useState<boolean>(false)
    const [cmdTemplateSel, setcmdTemplateSel] = useState<string>('GetAllCase')
    const cmdTypes: object[] = [
        {value:'GetAllCase', label:'用例目录查询'},
        {value:'Action', label:'用例执行'},
        {value:'ActionState', label:'运行状态查询'},
        {value:'ActionControl', label:'运行状态变更'},
        {value:'EntityLog', label:'运行日志回调'},
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
            setConnStat(true)
            messageApi.info(`[${wsAddress}:${wsPort}] 已连接`).then((res:boolean)=>{
                console.log(`connectedPrompt: ${res}`)
            })
            ws.onclose = function (e) {
                console.log('websocket disconnected')
                setConnStat(false)
                messageApi.info('WebSocket已断开').then((res: boolean) => {
                    console.log(`connectedPrompt: ${res}`)
                })
            }
        }
        ws.onmessage = function(e){
            handleReceiveMsg(e)
        }
        // ws.onclose = function (e) {
        //     console.log('websocket disconnected')
        //     setConnStat(false)
        //     messageApi.info('WebSocket已断开').then((res: boolean) => {
        //         console.log(`connectedPrompt: ${res}`)
        //     })
        // }
        ws.onerror = function (e){
            setConnStat(false)
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
        convertReceivedMsg(event.data)
        scrollTextAreaToBottom()
    }
    const convertReceivedMsg = (msg:string) =>{
        const data = JSON.parse(msg)
        if(data.code === "1"){
            //const cData = atob(data.data)
            const cData = Buffer.from(data.data, 'base64').toString()
            const convertedObj = {
                code: data.code,
                msg: data.msg,
                data: JSON.parse(cData)
            }
            setConvertedMsg(convertedMsg => convertedMsg + '\n'+ JSON.stringify(convertedObj))
        }
    }
    /**
     * 发数据
     */
    const sendMsg = () =>{
        if(connStat && wSocket !== undefined){
            wSocket.send(sendMsgContent)
        }else{
            messageApi.warning(`[${wsAddress}:${wsPort}] 未连接，无法发送`).then((res)=>{
                console.log(`connectedPrompt: ${res}`)
            })
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
        }
        webSocketInit()
    }
    const clearSend = () =>{
        setSendMsgContent('')
        setDisplayMsgContent('')
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
    const getStatusSign = () =>{
        if(connStat){
            return <Tag icon={<CheckCircleOutlined />} color="success">已连接</Tag>
        }
        else{
            return <Tag icon={<ClockCircleOutlined />} color="default">未连接</Tag>
        }
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
     * AppKey变更事件
     * @param e
     */
    const appKeyChange = (e:React.ChangeEvent<HTMLInputElement>) =>{
        const newAppKey = e.target.value
        setAppKey(newAppKey)
    }
    /**
     * User ID 变更事件
     * @param e
     */
    const userIdChange = (e:React.ChangeEvent<HTMLInputElement>) =>{
        const newId = e.target.value
        setUserId(newId)
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
    /**
     * 更新待发指令内容
     */
    const updateSendData = () =>{
        //let curData:cmdData = new CommandData(userId, appKey, cmdTemplateSel)
        let curData:CommandData = {
            userId:userId,
            appKey:appKey,
            templateCmdSel:cmdTemplateSel,
            cmdData: null
            }
        switch(cmdTemplateSel){
            case 'Action':
                curData.cmdData = {
                    id: 'eb86c061-8a32-4ed9-9f61-f71a06f6e1bb\\04cfb11b-de5e-44ea-9f6e-6c623fe99fde\\f0660625-4a5b-4511-95a5-ec16092ae3b',
                    isrecording: 'true'
                }
                break
            case 'ActionState':
                curData.cmdData = {
                    taskId: '04cfb11b4ed9'
                }
                break;
            case 'ActionControl':
                curData.cmdData = {
                    taskId: '04cfb11b4ed9',
                    operation: 'pause'
                }
                break
            case 'EntityLog':
                curData.cmdData = {
                    entityId: 'eb86c061-8a32-4ed9-9f61-f71a06f6e1bb',
                    timestamp: '',
                    name: '拖动图标',
                    msg: '拖动图标到[X:50,y:100]',
                    result: '0'
                }
                break
        }

        let sendCmd = cmdHelper.getSendData(curData)

        setSendMsgContent(sendCmd.convertedMsg)
        setDisplayMsgContent(sendCmd.originMsg)
    }
    const handleSendMsgChange = (e:React.ChangeEvent<HTMLTextAreaElement>) =>{
        setSendMsgContent(e.target.value)
    }
    /**
     * 发送数据编辑 - 文字变更
     * @param e input组件
     */
    const handleDisplayMsgChange = (e:React.ChangeEvent<HTMLTextAreaElement>) =>{
        setDisplayMsgContent(e.target.value)
        const base64Str = cmdHelper.reconvertData(e.target.value)
        setSendMsgContent(base64Str)
    }
    // const sendTypeRadioChange = (e:RadioChangeEvent) =>{
    //     setSendType(e.target.value)
    // }
    useEffect(()=>{
        document.title = '调试页'
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
                    <h1>远程控制调试</h1>
                </Col>
            </Row>
            <Row>
                <Col offset={1} span={9}>
                    <Row>
                        <Space>
                            WebSocket地址：
                            <Input id="inputAddr" placeholder="地址" value={wsAddress} style={{width:200}} onChange={wsAddressChange}></Input>
                            端口：
                            <InputNumber id="inputPort" placeholder="端口" value={wsPort} style={{width:100}} onChange={wsPortChange}></InputNumber>
                            <Button onClick={connect}>连接</Button>

                        </Space>
                    </Row>
                    <Row className='contentStyle'>
                        <Space>
                            UserID:
                            <Input id='inputUserId' placeholder='User ID' value={userId} className='inputWidth' onChange={userIdChange}></Input>
                            AppKey:
                            <Input id='inputAppKey' placeholder='App Key' value={appKey} className='inputWidth' onChange={appKeyChange}></Input>
                            <Button danger onClick={updateSendData}>更新数据</Button>
                        </Space>
                    </Row>
                    <Row className='contentStyle'>
                        <Space>
                            选取预设指令：
                            <Select defaultValue='GetAllCase' style={{width: 180}} onChange={handleCmdSel} options={cmdTypes} />
                            <Button onClick={clearSend}>清空</Button>
                            <Button type="primary" onClick={sendMsg}>发送</Button>
                            {getStatusSign()}
                        </Space>
                    </Row>
                    <Row className='contentStyle'>
                        <span>待发送数据：</span>
                    </Row>
                    <Row>
                        <TextArea id='textAreaSend' rows={15} value={displayMsgContent} onChange={handleDisplayMsgChange}/>
                    </Row>
                    <Row className='contentStyle'>
                        <span>实际发送数据（Base64转换后）：</span>
                    </Row>
                    <Row >
                        <TextArea id='textAreaSendConv' rows={6} value={sendMsgContent}/>
                    </Row>
                </Col>
                <Col offset={2} span={9}>
                    <Row>
                        接收数据:
                        <TextArea id='textAreaMsg' rows={15} value={wsMsg}/>
                    </Row>
                    <Row className='contentStyle'>
                        Base64转换后：
                        <TextArea id='textAreaConverted' rows={15} value={convertedMsg}/>
                    </Row>
                </Col>
            </Row>
        </>
    )


}
export default WebSocketClient