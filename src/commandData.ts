// export default class CommandData{
//     templateCmdSel: string
//     userId: string
//     cmdData: object
//     appKey:string
//
//     constructor(userid: string, appKey:string, cmdSel: string) {
//         this.userId = userid
//         this.appKey = appKey
//         this.templateCmdSel = cmdSel
//         this.cmdData = {}
//     }
// }
import exp from "constants";

export interface CommandData{
    templateCmdSel: string
    userId: string
    cmdData: any
    appKey:string
}
export interface CommandSendStr{
    originMsg: string
    convertedMsg: string
}
