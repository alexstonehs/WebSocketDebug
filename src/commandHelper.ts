import md5 from "js-md5";
import {CommandData, CommandSendStr} from './commandData'
import {Buffer} from 'buffer'
/**
 * 获取发送数据JSON
 * @param cmdData
 */
const getSendData = (cmdData:CommandData):CommandSendStr =>{
    let commands:CommandSendStr  = {
        originMsg: '',
        convertedMsg:''
    }
    const ts = Date.now()

    let content:any = {
        userid: cmdData.userId,
        timestamp: ts,
        sign: getSign(ts, cmdData.userId, cmdData.appKey),
        funid: cmdData.templateCmdSel
    }

    let str = JSON.stringify(content)
    commands.originMsg = str
    commands.convertedMsg = str
    if(cmdData.templateCmdSel !== 'GetAllCase'){

        content.data = cmdData.cmdData
        let originCmd:string = ''
        // originCmd = JSON.stringify(content)
        // if(cmdData.templateCmdSel === 'Action'){
        //     originCmd = JSON.stringify(content).replace(/\\\\/g, '\\')
        //     //originCmd = originCmd.replace(/\\"/g, '"')
        // }else{
            originCmd = JSON.stringify(content)
        //}

        const base64Str = Buffer.from(JSON.stringify(cmdData.cmdData)).toString('base64')
        content.data = base64Str
        const convertedCmd = JSON.stringify(content)
        commands.originMsg = originCmd
        commands.convertedMsg = convertedCmd
    }
    // //jsonStr = JSON.stringify(content)
    return commands
}
const reconvertData = (originData:string) :string=>{
    let preData = JSON.parse(originData)
    preData.data = Buffer.from(JSON.stringify(preData.data)).toString('base64')
    return JSON.stringify(preData)
}
/**
 * 获取sign签名信息
 * @param timeStamp 时间戳
 * @param userId
 * @param appKey
 */
const getSign = (timeStamp:number, userId:string, appKey:string):string =>{
    const infoStr = `${userId}${timeStamp}${appKey}`
    const md5Str = md5(infoStr)
    return md5Str
}
const func = {
    getSendData,
    reconvertData
}
export default func