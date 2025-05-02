import { Volume, createFsFromVolume,IFs } from 'memfs';
import fs from 'fs'
// 创建虚拟文件系统
const volume = new Volume()
//const fs: IFs = createFsFromVolume(volume);

export default fs 