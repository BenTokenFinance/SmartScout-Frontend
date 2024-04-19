import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import type { ResourceError, ResourceName, ResourcePayload } from './resources';
import type { Params as ApiFetchParams } from './useApiFetch';
import useApiFetch from './useApiFetch';
import { useValidators } from '../contexts/ValidatorsProvider';

export interface Params<R extends ResourceName, E = unknown> extends ApiFetchParams<R> {
  queryOptions?: Omit<UseQueryOptions<ResourcePayload<R>, ResourceError<E>, ResourcePayload<R>>, 'queryKey' | 'queryFn'>;
}

export function getResourceKey<R extends ResourceName>(resource: R, { pathParams, queryParams }: Params<R> = {}) {
  if (pathParams || queryParams) {
    return [ resource, { ...pathParams, ...queryParams } ];
  }

  return [ resource ];
}

export default function useApiQuery<R extends ResourceName, E = unknown>(
  resource: R,
  { queryOptions, pathParams, queryParams, fetchParams }: Params<R, E> = {},
) {
  const apiFetch = useApiFetch();
  const {validators,tokens}= useValidators() as any;
  // 使用 validators 数据

  //add hard Code
  const hardCode=(resource:any,response:any)=>{
    const data=[response];
    const handName="Wrapped SBCH"
    const fixName="Wrapped BCH"
    // resource=='token'
    if(response.name && response.name==fixName){
      data[0].name=handName
    }

    if(response?.token?.name && response.token.name==fixName){
      data[0].token.name=handName
    }
    
    if(resource=='tokens' && response.items){
      for(let p of data[0].items){
        if(p.name==fixName){
           p.name=handName
           break;
        }
     }
    }
    if(resource=='block' && response.miner){
      data[0]=addAddressName(response);
    }
    if(resource=='blocks' && response.items){
      data[0]=addAddressNameList(response);
    }
    if(resource=='homepage_blocks' && response.length>0){
      data[0]=addAddressNameLast(response);
    }


    if(resource=='address_tokens'){
      data[0]=address_tokens(response);
    }
    if(resource=='quick_search'){
      data[0]=quick_search(response);
    }
    if(resource=='address_token_transfers'){
      data[0]=address_tokens(response);
    }
    
    if(resource=='tx'){
      console.log("tx",response)
      tran_tx(response);
    }
    
    return data[0];
  }

  const tran_tx=(response:any)=>{
    const data:any=JSON.parse(JSON.stringify(response))
    if(Object.keys(tokens).length>0){
      for(let p of data.token_transfers){
        const token=p.token;
        if(tokens[p.token.address]){
          token.name= tokens[token.address].name;
          token.symbol= tokens[token.address].symbol;
          token.icon_url=`https://asset.benswap.cash/assets/${token.address}/logo.png`;
        }
      }
    }
    return data;
  }
  //address_tokens
  const address_tokens=(response:any)=>{
      const data=[response];
      if(Object.keys(tokens).length>0){
        for(let p of data[0].items){
          if(tokens[p.token.address]){
            p.token.name= tokens[p.token.address].name;
            p.token.symbol= tokens[p.token.address].symbol;
            p.token.icon_url=`https://asset.benswap.cash/assets/${p.token.address}/logo.png`;
          }
        }
      }
      return data[0];
  }
  const quick_search=(response:any)=>{
    const data:any=JSON.parse(JSON.stringify(response))
    for(let p of data){
      if(tokens[p.address]){
        p.name= tokens[p.address].name;
        p.symbol= tokens[p.address].symbol;
        p.icon_url=`https://asset.benswap.cash/assets/${p.address}/logo.png`;
      }
    }
    return data;
  }


  //add ens name
  const addAddressName=(response:any)=>{
      const data=[response];
      data[0].miner.name=validators[data[0].miner.hash];
      return data[0]
  }
  //add ens name list 
  const addAddressNameList=(response:any)=>{
      const data=[response];
      data[0].items=data[0].items.map((t:any,i:any)=>{
            t.miner.name=validators[t.miner.hash];
            return t;
     })
     return data[0]
  }
  //add ens name list 
  const addAddressNameLast=(response:any)=>{
      const data=[response];
      data[0]=data[0].map((t:any,i:any)=>{
            t.miner.name=validators[t.miner.hash];
            return t;
      })
    
  
      return data[0]
  }


  //token tarn Code
  const specialConversion=async(resource:any,response:any)=>{
      const data=[response];
      //token name  transition
      if(resource=='tokens' && response.items){
        for(let p of data[0].items){
          if(tokens[p.address]){
            p.name= tokens[p.address].name;
            p.symbol= tokens[p.address].symbol;
            p.icon_url=`https://asset.benswap.cash/assets/${p.address}/logo.png`;
          }
        }
  
        // // 使用Promise.all来同时发送所有请求，并等待它们全部完成
        // const results = await Promise.all(urls.map(url =>
        //   fetch(url)
        //   .then(res => res.json())
        //   .catch(error => {
        //     console.error("Error fetching from:", url, error);
        //     return null; // 对于失败的请求，返回null或者其他特定的值
        //   })
        // ));
        // for(const [i, value] of results.entries()){
        //   if(value){
        //     data[0].items[i].name=(value as any).name;
        //     data[0].items[i].symbol=(value as any).symbol;
        //   }
        // }
      }

      if(resource=='token'){
        try {
          // 发起fetch请求
          const ret = await fetch(`https://asset.benswap.cash/assets/${data[0].address}/info.json`);
          // 等待并解析JSON响应
          const res_data = await ret.json();
          // 使用获取到的数据
          console.log(res_data);
          data[0].name=(res_data as any).name;
          data[0].symbol=(res_data as any).symbol;
          data[0].icon_url=`https://asset.benswap.cash/assets/${data[0].address}/logo.png`;
        } catch (error) {
          // 处理请求或解析过程中的错误
          console.error("Error fetching data: ", error);
        }
      }

      //blocks name transition
      if(resource=='stats' && data[0].total_blocks){
        try {
          // 发起fetch请求
          const ret = await fetch(`https://api2.benswap.cash/sbchPrice`);
          // 等待并解析JSON响应
          const res_data:any = await ret.json();
          // 使用获取到的数据
          console.log(res_data.price);
          data[0].coin_price=res_data.price;
          data[0].market_cap=`${parseFloat(res_data.price)*68313.420483}`;
        } catch (error) {
          // 处理请求或解析过程中的错误
          console.error("Error fetching data: ", error);
        }
      }

    
      // home chart  transition 
      if(resource=='stats_charts_market'){
        try {

          const response:any = await apiFetch('homepage_blocks', {});
          const height=response[0].height;
          const blockNumbers=calculateBlockNumbersForLast10Days8AM(height);
          // console.log("height",height);
          // console.log("calculateBlockNumbersForLast10Days8AM",calculateBlockNumbersForLast10Days8AM(height)) ;
          const date_data:any={};
          
          // set history data
          for(const [index,value] of blockNumbers.entries()){
              // 使用时间戳创建一个新的Date对象
              const date = new Date(value.date);
              // 注意月份是从0开始的，所以需要+1来获取正确的月份
              const formattedDate = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
              date_data[`block${index}`]={
                date:formattedDate,
                closing_price:null,
                market_cap:null
              };
          }

          // add filter 
          const blocksQueryParts = blockNumbers.map((blockNumber, index) => {
            return `
              block${index}: bundles(block: {number: ${blockNumber.block}}) {
                bchPrice
              }
            `;
          }).join('\n');

          // 定义GraphQL查询
          const graphqlQuery = {
            query: `
              {
                ${blocksQueryParts}
              }
            `,
            variables: {} // 如果你的查询中没有使用变量，这里可以保留空对象或根据需要传递变量
          };
          // get price
          const requestBody = JSON.stringify(graphqlQuery);
          const ret = await fetch(`https://subgraphs.benswap.cash/subgraphs/name/bentokenfinance/bch-exchange`,
            {
              method: 'post',
              headers: { 'Content-Type': 'application/json' },
              body: requestBody
            }
          );
          const res_data:any = await ret.json();
          // 使用获取到的数据
          console.log("使用获取到的数据",res_data.price);
          for (const i in res_data.data) {
            date_data[i].closing_price=res_data.data[i][0]['bchPrice'];
            date_data[i].market_cap=`${parseFloat(res_data.data[i][0]['bchPrice'])*68313.420483}`
          }
          data[0].chart_data=Object.keys(date_data).map((t,i)=>{
            return date_data[t];
          })

        } catch (error) {
          // 处理请求或解析过程中的错误
          console.error("Error fetching data: ", error);
        }
      }

      
      return data[0];
  }

  // 计算给定日期的8点对应的区块号
    const calculateBlockNumberFor8AM=(daysAgo:any, currentBlockNumber:any, currentDate:any)=>{
      const millisecondsPerBlock = 6000;
      const now = currentDate; // 获取当前时间
      const todayAt8AM = new Date(now.getFullYear(), now.getMonth(), now.getDate()-daysAgo, 8, 0, 0); // 设置为今天的8点
      const timeDifference = currentDate.getTime() -  todayAt8AM.getTime(); // 时间差（毫秒）
      const blocksAgo = timeDifference / millisecondsPerBlock;
      return {date:todayAt8AM.getTime(),block:Math.floor(currentBlockNumber - blocksAgo)};
    }

    // 计算包括今天在内的前10天每天8点的区块号
    const calculateBlockNumbersForLast10Days8AM=(currentBlockNumber:any)=>{
      const currentDate = new Date(); // 当前日期和时间
      const blockNumbers = [];

      for (let daysAgo = 0; daysAgo <= 10; daysAgo++) {
        const blockNumberForDay = calculateBlockNumberFor8AM(daysAgo, currentBlockNumber, currentDate);
        blockNumbers.push(blockNumberForDay);
      }

      return blockNumbers;
    }




  return useQuery<ResourcePayload<R>, ResourceError<E>, ResourcePayload<R>>({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: getResourceKey(resource, { pathParams, queryParams }),
    // queryFn: async() => {
    //   // all errors and error typing is handled by react-query
    //   // so error response will never go to the data
    //   // that's why we are safe here to do type conversion "as Promise<ResourcePayload<R>>"
    //   return apiFetch(resource, { pathParams, queryParams, fetchParams }) as Promise<ResourcePayload<R>>;
    // },

    queryFn:async() => {
      const response:any = await apiFetch(resource, { pathParams, queryParams, fetchParams });
      const res=await specialConversion(resource,response);
      const tranResponse=hardCode(resource,res);
      return tranResponse;
    },
    select:(data)=>{
       const  newData:any=hardCode(resource,data);
       return newData;
    },
    ...queryOptions
  });
}
