import { Volume, createFsFromVolume,IFs } from 'memfs';
//import fs from 'fs'
// 创建虚拟文件系统


class Fs{
    static ifs : IFs | undefined;
    constructor(){

    }

    static getFs() : IFs {
        if(typeof(Fs.ifs) != 'undefined'){
            return Fs.ifs;
        }
        const volume = new Volume()
        Fs.ifs = createFsFromVolume(volume);
        return Fs.ifs
    }
}
const  imagefs = Fs.getFs() 
export default imagefs;