import React, { useEffect } from 'react';

import type { Props } from './types';

import AppErrorBoundary from 'ui/shared/AppError/AppErrorBoundary';
import HeaderAlert from 'ui/snippets/header/HeaderAlert';
import HeaderDesktop from 'ui/snippets/header/HeaderDesktop';
import HeaderMobile from 'ui/snippets/header/HeaderMobile';

import * as Layout from './components';
import { useValidators } from '../../../lib/contexts/ValidatorsProvider';

const LayoutDefault = ({ children }: Props) => {
  const validators = useValidators();
  useEffect(()=>{
    console.log('-----validators------',validators)
  },[validators])
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
};

export default LayoutDefault;
