import type { StyleProps } from '@chakra-ui/react';
import { Box, Image, useColorModeValue, Skeleton, chakra } from '@chakra-ui/react';
import React from 'react';

import { route } from 'nextjs-routes';

import config from 'configs/app';
import IconSvg from 'ui/shared/IconSvg';

interface Props {
  isCollapsed?: boolean;
  onClick?: (event: React.SyntheticEvent) => void;
  imageProps?: StyleProps;
}

import type { HTMLChakraProps } from '@chakra-ui/react';
import { type IconName } from 'public/icons/name';

export const href = '/icons/sprite.svg';

export { IconName };

interface Props extends HTMLChakraProps<'div'> {
  name: IconName;
  isLoading?: boolean;
}

const IconSvgs = ({ name, isLoading, ...props }: Props, ref: React.ForwardedRef<HTMLDivElement>) => {
  return (
    <Skeleton isLoaded={ !isLoading } display="inline-block" { ...props } ref={ ref }>
      <chakra.svg w="100%" h="100%">
        <use href={ `/static/og_placeholder.png` }/>
      </chakra.svg>
    </Skeleton>
  );
};


const LogoFallback = ({ isCollapsed, isSmall, imageProps }: { isCollapsed?: boolean; isSmall?: boolean; imageProps?: StyleProps }) => {
  const field = isSmall ? 'icon' : 'logo';
  const logoColor = useColorModeValue('blue.600', 'white');

  const display = isSmall ? {
    base: 'none',
    lg: isCollapsed === false ? 'none' : 'block',
    xl: isCollapsed ? 'block' : 'none',
  } : {
    base: 'block',
    lg: isCollapsed === false ? 'block' : 'none',
    xl: isCollapsed ? 'none' : 'block',
  };

  if (config.UI.sidebar[field].default) {
    return <Skeleton w="100%" borderRadius="sm" display={ display }/>;
  }

  return (
    isCollapsed ? <Image  mr={2} src={`/static/${logoColor}_small.png`} alt={'icon'} />
     :
    <Image  mr={2} src={`/static/${logoColor}.png`} alt={'icon'} />
  );

    // <IconSvgs
    //   name={ isSmall ? 'networks/icon-placeholder' : 'networks/logo-placeholder' }
    //   width="auto"
    //   height="100%"
    //   color={ logoColor }
    //   display={ display }
    //   { ...imageProps }
    // />
  
};





const NetworkLogo = ({ isCollapsed, onClick, imageProps }: Props) => {

  const logoSrc = useColorModeValue(config.UI.sidebar.logo.default, config.UI.sidebar.logo.dark || config.UI.sidebar.logo.default);
  const iconSrc = useColorModeValue(config.UI.sidebar.icon.default, config.UI.sidebar.icon.dark || config.UI.sidebar.icon.default);
  const darkModeFilter = { filter: 'brightness(0) invert(1)' };
  const logoStyle = useColorModeValue({}, !config.UI.sidebar.logo.dark ? darkModeFilter : {});
  const iconStyle = useColorModeValue({}, !config.UI.sidebar.icon.dark ? darkModeFilter : {});

  return (
    <Box
      as="a"
      href={ route({ pathname: '/' }) }
      width={{ base: '120px', lg: isCollapsed === false ? '120px' : '30px', xl: isCollapsed ? '30px' : '120px' }}
      height={{ base: '24px', lg: isCollapsed === false ? '24px' : '30px', xl: isCollapsed ? '30px' : '24px' }}
      display="inline-flex"
      overflow="hidden"
      onClick={ onClick }
      flexShrink={ 0 }
      aria-label="Link to main page"
    >
      { /* big logo */ }
      <Image
        w="auto"
        h="100%"
        src={ logoSrc }
        alt={ `${ config.chain.name } network logo` }
        fallback={ <LogoFallback isCollapsed={ isCollapsed } imageProps={ imageProps }/> }
        display={{ base: 'block', lg: isCollapsed === false ? 'block' : 'none', xl: isCollapsed ? 'none' : 'block' }}
        style={ logoStyle }
        { ...imageProps }
      />
      { /* small logo */ }
      <Image
        w="auto"
        h="100%"
        src={ iconSrc }
        alt={ `${ config.chain.name } network logo` }
        fallback={ <LogoFallback isCollapsed={ isCollapsed } imageProps={ imageProps } isSmall/> }
        display={{ base: 'none', lg: isCollapsed === false ? 'none' : 'block', xl: isCollapsed ? 'block' : 'none' }}
        style={ iconStyle }
        { ...imageProps }
      />
    </Box>
  );
};

export default React.memo(NetworkLogo);
