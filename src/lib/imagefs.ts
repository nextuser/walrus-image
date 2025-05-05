import { Volume, createFsFromVolume,IFs } from 'memfs';

// class FsUtil{
//     ifs : IFs ;
//     i : number;
//     private static inst : FsUtil | null = null;
//     constructor(){
//         this.i = 0;
//         const volume = new Volume()
//         this.ifs = createFsFromVolume(volume);
//     }

//     static getInstance() : FsUtil{
//         if(FsUtil.inst ){
//             return FsUtil.inst
//         } else{
//             FsUtil.inst = new FsUtil();
//             console.log('create FsUtil ',  'process', process.pid,process.ppid);
//             return FsUtil.inst
//         }
//     }

//     get fs() : IFs {
//         console.log('call fs()', this.i ++);
//         return this.ifs;
//     }
// }
import fs  from  'fs';
//todo export type ImageFs2 = IFs;
export type ImageFs = typeof fs;

function getSharedFs(){
    return SharedInstance.getInstance().getFs()
}


// sharedInstance.ts
class SharedInstance {
    private static _instance: SharedInstance;
    ifs : IFs ;
    static i : number = 0;
    constructor(){
        SharedInstance.i ++;
        const volume = new Volume()
        this.ifs = createFsFromVolume(volume);
    }

    public static getInstance(): SharedInstance {
        if (!this._instance) {
            this._instance = new SharedInstance();
        }
        return this._instance;
    }

    public getFs() {
        console.log("call getFs", SharedInstance.i );
        //return this.ifs; todo use fs
        return fs;
    }
}

const sharedInstance = SharedInstance.getInstance();
    
export default getSharedFs;