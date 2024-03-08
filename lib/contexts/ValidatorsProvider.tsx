import React, { createContext, useContext, useState, useEffect } from 'react';

type Props = {
    children: React.ReactNode;
}

// 创建 Context
const ValidatorsContext = createContext({});

// 创建一个提供者组件
export function ValidatorsProvider({ children }: Props) {
    const [validators, setValidators] = useState({});


  
  const getValidators=async ()=>{
    let res:any= {};
    try {
      const response = await fetch('https://asset.benswap.cash/validators.json');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      res = await response.json();
      return res;
    } catch (error) {}

    return res;
  }

  useEffect(() => {
    const fetchValidators = async () => {
      // 这里是你的异步数据获取逻辑
      const validatorsData = await getValidators();
      setValidators(validatorsData);
    };

    fetchValidators();
  }, []);

  return (
    <ValidatorsContext.Provider value={validators}>
      {children}
    </ValidatorsContext.Provider>
  );
}
// export const ValidatorsProvider = ({ children }:any) => {
  
// };

export function useValidators() {
    return useContext(ValidatorsContext);
}

