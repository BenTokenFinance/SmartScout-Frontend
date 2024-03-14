// AppLayout.js 或 AppLayout.tsx
import React, { useEffect } from 'react';
import { useValidators } from '../lib/contexts/ValidatorsProvider';
type Props = {
    children: React.ReactNode;
}
const CustomChild = ({ children }: Props) => {
  const validators = useValidators(); // 现在这里是安全的，因为它位于 ValidatorsProvider 内部

  // 这里你可以基于 validators 数据做进一步逻辑处理
  // 例如，将 validators 传递给需要它的子组件

  // useEffect(()=>{  console.log("-----------validators",validators)},[validators])
  return (
    <>
       {Object.keys(validators).length>0&&children}
    </>
  );
};

export default CustomChild;
