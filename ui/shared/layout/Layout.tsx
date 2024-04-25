import React, { useEffect } from 'react';

import type { Props } from './types';

import AppErrorBoundary from 'ui/shared/AppError/AppErrorBoundary';
import HeaderAlert from 'ui/snippets/header/HeaderAlert';
import HeaderDesktop from 'ui/snippets/header/HeaderDesktop';
import HeaderMobile from 'ui/snippets/header/HeaderMobile';

import * as Layout from './components';
import { useValidators } from '../../../lib/contexts/ValidatorsProvider';

const LayoutDefault = ({ children }: Props) => {
  const {validators,tokens}= useValidators() as any;
  // useEffect(()=>{
  //   console.log('-----validators------',tokens)
  // },[tokens])
  if(Object.keys(tokens).length>0){
    return (
      <Layout.Container>
       <Layout.TopRow/>
       <HeaderMobile/>
       <Layout.MainArea>
         <Layout.SideBar/>
         <Layout.MainColumn>
           <HeaderAlert/>
           <HeaderDesktop/>
           <AppErrorBoundary>
             <Layout.Content>
               { children }
             </Layout.Content>
           </AppErrorBoundary>
         </Layout.MainColumn>
       </Layout.MainArea>
       <Layout.Footer/>
     </Layout.Container>
   );
  }else{
    return null;
  }
  
};

export default LayoutDefault;
