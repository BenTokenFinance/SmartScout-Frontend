import React, { createContext, useContext, useState, useEffect } from 'react';

type Props = {
    children: React.ReactNode;
}
interface ValidatorsInter {
  validators:{};
  tokens:{};
  priceInfo:{}
  // 添加其他验证器的类型定义
}
// 创建 Context
const ValidatorsContext = createContext<ValidatorsInter>({validators:{},tokens:{},priceInfo:{}});

// 创建一个提供者组件
export function ValidatorsProvider({ children }: Props) {
  const [validators, setValidators] = useState<any>({});
  const [tokens, setTokens] = useState([]);
  const [priceInfo, setPriceInfo] = useState({});
  
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
      for(let p of [...ret.SEP206,...ret.ERC20,...ret.ERC721]){
          res[p.address]=p;
      }
      return res;
    } catch (error) {}

    return res;
  }

  const getPriceInfo=async ()=>{
    try {
      const [tokenResponse, sbchResponse, priceResponse] = await Promise.all([
        fetch('https://asset.benswap.cash/smartscoutprice.json'),
        fetch('https://api2.benswap.cash/sbchPrice'),
        fetch('https://subgraphs.benswap.cash/subgraphs/name/bentokenfinance/bch-exchange', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: "{ tokens(where:{derivedUSD_gt:0}) {id symbol derivedBCH derivedUSD }}" 
          })
        })
      ]);
  
      // Check if all responses are ok
      if (!tokenResponse.ok || !sbchResponse.ok || !priceResponse.ok) {
        throw new Error('Network response was not ok');
      }
  
      // Parse responses
      const [tokenData, sbchData, priceData]:any = await Promise.all([
        tokenResponse.json(),
        sbchResponse.json(),
        priceResponse.json()
      ]);

      let res:any={};
      for(let p in tokenData.whitelist){
         if(tokenData.whitelist[p]===1){
           res[p]={id:p,derivedUSD:sbchData.price}
         }
         if(tokenData.whitelist[p]===2){
           const item=priceData.data.tokens.find((t:any)=>t.id.toUpperCase()==p.toUpperCase());
           res[p]=item;
         }
         if(tokenData.whitelist[p]===3){
           res[p]={id:p,derivedUSD:"1"};
         }
         
      }
      res['0x0000000000000000000000000000000000002711']={id:'0x0000000000000000000000000000000000002711',derivedUSD:sbchData.price};

      return res;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    return [];
  }

  useEffect(() => {
    const fetchValidators = async () => {
      // console.log("数据更新")
      // 这里是你的异步数据获取逻辑
      const validatorsData = await getValidators();
      const tokens = await getTokens();
      const priceInfo = await getPriceInfo();
      setTokens(tokens);
      setValidators(validatorsData);
      setPriceInfo(priceInfo);
    };


    fetchValidators();
    const intervalId = setInterval(fetchValidators, 10000); // 每 60000 毫秒（1 分钟）刷新一次
    return () => {
      clearInterval(intervalId); // 在组件卸载时清除定时器
    };
  }, []);

  return (
    <ValidatorsContext.Provider value={{validators:validators,tokens:tokens,priceInfo:priceInfo}}>
      {children}
    </ValidatorsContext.Provider>
  );
}
// export const ValidatorsProvider = ({ children }:any) => {
  
// };

export function useValidators() {
     const {validators,tokens,priceInfo}= useContext(ValidatorsContext);
     return {validators,tokens,priceInfo}
}

