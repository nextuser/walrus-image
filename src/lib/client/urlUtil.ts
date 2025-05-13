

export interface  UrlInfo  {
    protocol: string,
    host: string,
    port: string,
}

    
    /**
     * usage
     *   const [urlInfo, setUrlInfo] = useState<UrlInfo>();
     *   useEffect(()=>{
     *      updateUrlInfo(setUrlInfo)
     * })
     */
   
    // 在组件挂载时提取 URL 信息
export function updateUrlInfo(setUrlInfo : (urlInfo : UrlInfo|undefined)=>void){
    if (typeof window !== 'undefined') {
        const url : UrlInfo = {
            protocol: window.location.protocol, // 协议，如 "http:" 或 "https:"
            host: window.location.host,         // 主机，如 "localhost:3000" 或 "example.com"
            port: window.location.port,         // 端口，如 "3000" 或 ""（默认端口）
        }
        setUrlInfo(url);
        console.log("setUrlInfo:",url);
        console.log("location:",window.location)
        }
}

export function getSiteUrl(urlInfo : UrlInfo | undefined, path? : string) : string{
    
    let url = urlInfo ?  `${urlInfo.protocol}//${urlInfo.host}` : ''
    return path ? url + "/" + path  : url
}