import { Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';

import config from 'configs/app';
import useApiQuery from 'lib/api/useApiQuery';
import { ZERO } from 'lib/consts';
import getCurrencyValue from 'lib/getCurrencyValue';
import { currencyUnits } from 'lib/units';
import DataFetchAlert from 'ui/shared/DataFetchAlert';

import { getTokensTotalInfo } from '../utils/tokenUtils';
import useFetchTokens from '../utils/useFetchTokens';
import TokenBalancesItem from './TokenBalancesItem';
import BigNumber from 'bignumber.js';
import { useValidators } from '../../../lib/contexts/ValidatorsProvider';

const TokenBalances = () => {
  const router = useRouter();

  const hash = router.query.hash?.toString();

  const addressQuery = useApiQuery('address', {
    pathParams: { hash },
    queryOptions: { enabled: Boolean(hash), refetchOnMount: false },
  });

  const tokenQuery = useFetchTokens({ hash });

  if (addressQuery.isError || tokenQuery.isError) {
    return <DataFetchAlert/>;
  }

  const addressData = addressQuery.data;
  const { valueStr: nativeValue, usdBn: nativeUsd } = getCurrencyValue({
    value: addressData?.coin_balance || '0',
    accuracy: 8,
    accuracyUsd: 2,
    exchangeRate: addressData?.exchange_rate,
    decimals: String(config.chain.currency.decimals),
  });

  const tokensInfo = getTokensTotalInfo(tokenQuery.data);
  const prefix = tokensInfo.isOverflow ? '>' : '';
  const totalUsd = nativeUsd.plus(tokensInfo.usd);
  const tokensNumText = tokensInfo.num > 0 ?
    ` | ${ prefix }${ tokensInfo.num } ${ tokensInfo.num > 1 ? 'tokens' : 'token' }` :
    '';

  const [tokenPrices,setTokenPrices]=useState<any>({});
  const [sbchPrice,setSbchPrice]=useState(0);
  const [priceData,setPriceData]=useState<any>();
  
  const {priceInfo}= useValidators() as any;
  // useEffect(()=>{
  //   const  feth=async()=>{
  //     try {
  //       const [tokenResponse, sbchResponse, priceResponse] = await Promise.all([
  //         fetch('https://asset.benswap.cash/smartscoutprice.json'),
  //         fetch('https://api2.benswap.cash/sbchPrice'),
  //         fetch('https://subgraphs.benswap.cash/subgraphs/name/bentokenfinance/bch-exchange', {
  //           method: 'post',
  //           headers: { 'Content-Type': 'application/json' },
  //           body: JSON.stringify({
  //             query: "{ tokens(where:{derivedUSD_gt:0}) {id symbol derivedBCH derivedUSD }}" 
  //           })
  //         })
  //       ]);
    
  //       // Check if all responses are ok
  //       if (!tokenResponse.ok || !sbchResponse.ok || !priceResponse.ok) {
  //         throw new Error('Network response was not ok');
  //       }
    
  //       // Parse responses
  //       const [tokenData, sbchData, priceData]:any = await Promise.all([
  //         tokenResponse.json(),
  //         sbchResponse.json(),
  //         priceResponse.json()
  //       ]);
    
  //       // Set state with all data
  //       setTokenPrices(tokenData);
  //       setSbchPrice(sbchData.price);
  //       setPriceData(priceData);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //       // Handle error
  //     }
  //   }
  //   if(Object.keys(tokenPrices).length===0){
  //     feth();
  //   }
  // },[])
  const totalUsdPrice=useMemo(()=>{
    const SEP206='0x0000000000000000000000000000000000002711';
    let totalPrices=new BigNumber(0);
    let netWorth=new BigNumber(0);
    if(tokenQuery && tokenQuery.data["ERC-20"].items.length>0 && Object.keys(priceInfo).length>0){
      const whitelists=Object.keys(priceInfo as any);
      const commonElements = tokenQuery.data["ERC-20"].items.filter(element => whitelists.includes(element.token.address));
      const sbch = tokenQuery.data["ERC-20"].items.find(element => element.token.address===SEP206);

      for(let p of commonElements){
            const p_Balance=(new BigNumber(p.value)).div(new BigNumber(10).pow(parseInt(p.token.decimals||'0')))
            totalPrices=totalPrices.plus(p_Balance.times(new BigNumber(priceInfo[p.token.address].derivedUSD)));
            if(p.token.address!=SEP206){
               netWorth=totalPrices.plus(p_Balance.times(new BigNumber(priceInfo[p.token.address].derivedUSD)));
            }
      }
      if(addressData){
        const p_Balance=new BigNumber(addressData?.coin_balance||0).div(new BigNumber(10).pow(config.chain.currency.decimals))
        netWorth=netWorth.plus(p_Balance.times(new BigNumber(priceInfo[SEP206].derivedUSD)));
      }
    }
    return {netWorth,totalPrices};
  },[tokenQuery.data,priceInfo,addressData])
  return (
    <Flex columnGap={ 3 } rowGap={ 3 } mt={{ base: '6px', lg: 0 }} flexDirection={{ base: 'column', lg: 'row' }}>
      <TokenBalancesItem
        name="Net Worth"
        value={ totalUsdPrice.netWorth!=undefined ?  `$${totalUsdPrice.netWorth.toFormat(2)} USD`:"N/A"}
        // value={ addressData?.exchange_rate ? `${ prefix }$${ totalUsd.toFormat(2) } USD` : 'N/A' }
        isLoading={ addressQuery.isPending || tokenQuery.isPending }
      />
      <TokenBalancesItem
        name={ `${ currencyUnits.ether } Balance` }
        value={ (!nativeUsd.eq(ZERO) ? `$${ nativeUsd.toFormat(2) } USD | ` : '') + `${ nativeValue } ${ currencyUnits.ether }` }
        isLoading={ addressQuery.isPending || tokenQuery.isPending }
      />
      <TokenBalancesItem
        name="Tokens"
        value={
          `${ prefix }$${totalUsdPrice.totalPrices!=undefined ?  `${totalUsdPrice.totalPrices.toFormat(2)} USD`:"N/A"}` +
          tokensNumText
        }
        // value={
        //   `${ prefix }$${ tokensInfo.usd.toFormat(2) } USD ` +
        //   tokensNumText
        // }
        isLoading={ addressQuery.isPending || tokenQuery.isPending }
      />
    </Flex>
  );
};

export default TokenBalances;
