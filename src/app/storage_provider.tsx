// MyContext.tsx
import React, { useContext, useEffect } from 'react';
import { StorageType } from '@/lib/utils/suiParser';
import { createContext } from "react";
import { useConnectWallet, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { suiClient } from '@/contracts';
import { getStorage } from '@/lib/utils/suiUtil';

const StorageContext = createContext<StorageType | undefined>(undefined)
// 创建 Provider 组件
const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [storage, setStorage] = React.useState<StorageType>();
    const sc = useSuiClient();
    useEffect(()=>{
        getStorage(sc).then((s) =>{
            setStorage(s);
        })
    },[sc])

    return (
        <StorageContext.Provider value={storage}>
            {children}
        </StorageContext.Provider>
    );
};

const useStorage = ()=>{
    return  useContext(StorageContext)
}

export { StorageProvider, StorageContext,useStorage };