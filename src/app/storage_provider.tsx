// MyContext.tsx
import React, { useContext, useEffect } from 'react';
import { StorageType } from '@/lib/utils/suiParser';
import { createContext } from "react";
import { useConnectWallet, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { getStorage } from '@/lib/utils/suiUtil';
import {  SuiClient } from "@mysten/sui/client";

interface StorageInterface  {
    storage: StorageType , 
    refresh : ()=>Promise<void> 
}
  
const StorageContext = createContext<StorageInterface| undefined>(undefined)
// 创建 Provider 组件
const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [storageIntf, setStorageIntf] = React.useState< StorageInterface>();
    const sc = useSuiClient();

    const refresh = () => {
        return getStorage(sc).then((s) =>{
            if(!s){
                console.error('StorageProvider:get storage fail s is null');
                return;
            }
            const si :StorageInterface = {
                storage : s,
                refresh
            }
            setStorageIntf(si);
        })
    }
    useEffect(()=>{
        if(!sc) {
            console.error("StorageProvider sc invalid",sc);
            return;
        }
        refresh();

    },[sc])

    return (
        <StorageContext.Provider value={storageIntf}>
            {children}
        </StorageContext.Provider>
    );
};


const useStorage = ()=>{
    return  useContext(StorageContext)
}

export { StorageProvider, StorageContext,useStorage };