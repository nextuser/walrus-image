// MyContext.tsx
import React from 'react';

// 定义上下文的类型
interface MyContextType {
    data: string;
    setData: (newData: string) => void;
}

// 创建上下文对象，提供默认值
const MyContext = React.createContext<MyContextType | undefined>(undefined);

// 创建 Provider 组件
const MyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = React.useState<string>('初始数据');

    const value = {
        data,
        setData
    };

    return (
        <MyContext.Provider value={value}>
            {children}
        </MyContext.Provider>
    );
};

export { MyProvider, MyContext };