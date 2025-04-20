// lib/globalData.ts
import processFiles from '@/lib/utils/task';
import { FileBlobInfo,FileInfo } from './types';
import { ContentType } from './content';
import { fileURLToPath } from 'url';
import { fstat ,promises as fsp} from 'fs';
import { getAddFileTx } from './suiUtil';


// 定义全局数据类型
export interface GlobalData {
    lastUpdated: Date;
    blobMap : Map<string,FileBlobInfo>;
    fileMap : Map<string,FileInfo>;
    deleteFileTimeMap : Map<string,number>; //file=> time_ms
  }
  
  // 初始化全局变量（仅在服务器端运行）
  declare global {
    var globalData: GlobalData;
    var dataFetchInterval: NodeJS.Timeout | undefined;
  }
  
  // 初始化（防止重复初始化）
  if (!global.globalData) {
    global.globalData = {
      lastUpdated: new Date(0), // 初始化为很久以前
      blobMap : new Map<string,FileBlobInfo>(),
      fileMap : new Map<string,FileInfo>(),
      deleteFileTimeMap : new Map<string,number>,
    };
  }

  export function getFiles() :Array<FileInfo>{
      return Array.from(global.globalData.fileMap.values());
  }

  export function addFile(file:FileInfo){
      global.globalData.fileMap.set(file.hash,file);
  }

  export function hasFile(file:string) : boolean{
    return global.globalData.fileMap.has(file) ;
  }

  export function getFileInfo(hash:string) :FileInfo | undefined{
     return global.globalData.fileMap.get(hash)
  }


  export function registerFileBobInfo(hash : string,fbi : FileBlobInfo){
      global.globalData.blobMap.set(hash,fbi);
  }

  /**
   * 
   * @param path  filpath to delete
   * @param now   time in ms , call new Date().getTime() to get
   */
  export function registerToDelete(path : string,now : number){
    global.globalData.deleteFileTimeMap.set(path,now)
  }

  export function getContentType(hash : string) : ContentType{
    let fileInfo = global.globalData.fileMap.get(hash);
    if(!fileInfo){
      return ContentType.Unknown;
    } else{
      return fileInfo.content_type;
    }
  }
  
  /**
   * 加入队列一段时间删除
   * @param span_seconds 
   */
  export function deleteFiles(span_seconds : number){
    const span_ms = span_seconds * 1000;
    console.log("delete old file for ",span_seconds, ' secs');
    const now = new Date().getTime();
    for(let [path  , time_ms] of globalData.deleteFileTimeMap ){
      let from_add = now - time_ms ; 
      if(from_add > span_ms){
         console.log('delete file timespan seconds',from_add/1000 ,path);
         fsp.unlink(path)
       }
    }
  }
  // 模拟数据采集
  async function fetchData(): Promise<any> {
    // 这里替换成你的数据采集逻辑（API 请求、数据库查询等）
    return { value: Math.random(), timestamp: new Date() };
  }
  
  // 启动定时任务（每分钟更新一次）
  export function startDataCollection(intervalMs = 60_000) {
    if (global.dataFetchInterval) {
        return;
        //clearInterval(global.dataFetchInterval); // 避免重复启动
    }
  
    // 立即执行一次
    processFiles();
  
    // 启动定时任务
    global.dataFetchInterval = setInterval(processFiles, intervalMs) as unknown as NodeJS.Timeout;;
  }


export function getFileBlob(hash : string) 
                                : FileBlobInfo | undefined{
    return global.globalData.blobMap.get(hash);
}

  
  // 获取当前数据
  export function getGlobalData(): GlobalData {
    return global.globalData;
  }
  
  // 停止数据采集（可选）
  export function stopDataCollection() {
    if (global.dataFetchInterval) {
      clearInterval(global.dataFetchInterval);
      global.dataFetchInterval = undefined;
    }
  }