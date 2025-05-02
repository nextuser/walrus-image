import fs from 'fs';
import path from  'path'
import { getSuiConfig  } from './env_config';

const suiConfig = getSuiConfig();
// 定义要保存的 JSON 文件路径
const outputPath = path.join(process.cwd(),  './config.json');

// 将环境变量保存为 JSON 文件
fs.writeFile(outputPath, JSON.stringify(suiConfig,null,4), (err:any) => {
  if (err) {
    console.error('保存环境变量到 JSON 文件时出错:', err);
  } else {
    console.log('环境变量已成功保存到 JSON 文件:', outputPath);
  }
});