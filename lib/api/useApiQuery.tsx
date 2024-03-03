import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import type { ResourceError, ResourceName, ResourcePayload } from './resources';
import type { Params as ApiFetchParams } from './useApiFetch';
import useApiFetch from './useApiFetch';

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
  //add hard Code
  const hardCode=(resource:any,response:any)=>{
    const data=[response];
    const handName="Wrapped SBCH"
    const fixName="Wrapped BCH"
    // resource=='token'
    if(response.name && response.name==fixName){
      data[0].name=handName
    }

    if(response.token.name && response.token.name==fixName){
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
    ...queryOptions,
  });
}
