import React, { createContext, useContext, useState, useEffect } from 'react';

type Props = {
    children: React.ReactNode;
}
interface ValidatorsInter {
  validators:{};
  tokens:{};
  // 添加其他验证器的类型定义
}
// 创建 Context
const ValidatorsContext = createContext<ValidatorsInter>({validators:{},tokens:{}});

// 创建一个提供者组件
export function ValidatorsProvider({ children }: Props) {
  const [validators, setValidators] = useState<any>({});
  const [tokens, setTokens] = useState([]);

  
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

  const getTokens=async ()=>{
    let res:any= {};
    try {
      const response = await fetch('https://asset.benswap.cash/assets/all.json');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const ret:any= await response.json();
      for(let p of [...ret.ERC20,...ret.ERC721]){
          res[p.address]=p;
      }
      return res;
    } catch (error) {}

    return res;
  }

  

  useEffect(() => {
    const fetchValidators = async () => {
      // 这里是你的异步数据获取逻辑
      const validatorsData = await getValidators();
      const tokens = await getTokens();
      setTokens(tokens);
      setValidators(validatorsData);
    };


    fetchValidators();
  }, []);

  return (
    <ValidatorsContext.Provider value={{validators:validators,tokens:tokens}}>
      {children}
    </ValidatorsContext.Provider>
  );
}
// export const ValidatorsProvider = ({ children }:any) => {
  
// };

export function useValidators() {
     const {validators,tokens}= useContext(ValidatorsContext);
     return {validators,tokens}
}

