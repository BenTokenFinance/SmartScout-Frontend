import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import type { ResourceError, ResourceName, ResourcePayload } from './resources';
import type { Params as ApiFetchParams } from './useApiFetch';
import useApiFetch from './useApiFetch';
import { useEffect, useMemo, useState } from 'react';
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
  const validators:any = useValidators();
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
    
    return data[0];
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
      const tranResponse=hardCode(resource,response)
      return tranResponse;
    },
    select:(data)=>{
       const  newData:any=hardCode(resource,data);
       return newData;
    },
    ...queryOptions
  });
}
