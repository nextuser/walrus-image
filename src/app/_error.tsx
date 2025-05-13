import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { headers } from "next/headers";
import React from 'react';

const ErrorPage: NextPage<{ statusCode?: number }> = async ({ statusCode }) => {
    const router = useRouter();
   const headersList = await headers();
   const host = headersList.get("host")!; // "www.s.com:8080"
   const protocol = headersList.get("protocol") || "http";
   console.log("protocol host:" ,protocol,host);
    // React.useEffect(() => {
    //     if (statusCode === 404) {
    //         const path = router.asPath;
    //         const key = '/uploads/'
    //         if (path.startsWith(key)) {
    //             let fileName = path.substring(path.indexOf(key) + key.length)
    //             let hash = getHash(fileName);
    //             let fbi = getFileBlob(hash);
    //             if(fbi == undefined){
    //                 console.log('not found fbi for ',fileName, ',hash', hash);
    //                 return;
    //             }
    //             let url = getBlobTarUrl(host,protocol,fbi);
    //             console.log(`uploads/${fileName} not found, redirect ${url}`);
    //             router.replace(url);
    //         }
    //     }
    // }, [statusCode, router]);

    return (
        <div>
            {statusCode === 404 ? (
                <p>正在尝试重定向...</p>
            ) : (
                <p>发生了错误: {statusCode}</p>
            )}
        </div>
    );
};

export default ErrorPage;
    