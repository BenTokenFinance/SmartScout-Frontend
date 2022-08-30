import { IconButton, Icon } from '@chakra-ui/react';
import React, { useCallback } from 'react';
import type { ControllerRenderProps, Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import MinusIcon from 'icons/minus.svg';
import PlusIcon from 'icons/plus.svg';
import { ADDRESS_REGEXP } from 'lib/validations/address';
import AddressInput from 'ui/shared/AddressInput';

import type { Inputs } from './PublicTagsForm';

interface Props {
  control: Control<Inputs>;
  index: number;
  fieldsLength: number;
  error?: string;
  onAddFieldClick: (e: React.SyntheticEvent) => void;
  onRemoveFieldClick: (index: number) => (e: React.SyntheticEvent) => void;
}

const MAX_INPUTS_NUM = 10;

export default function PublicTagFormAction({ control, index, fieldsLength, error, onAddFieldClick, onRemoveFieldClick }: Props) {
  const renderAddressInput = useCallback(({ field }: {field: ControllerRenderProps<Inputs, `addresses.${ number }.address`>}) => {
    return (
      <AddressInput<Inputs, `addresses.${ number }.address`>
        field={ field }
        error={ error }
        size="lg"
        placeholder="Smart contract / Address (0x...)"
      />
    );
  }, [ error ]);

  return (
    <>
      <Controller
        name={ `addresses.${ index }.address` }
        control={ control }
        render={ renderAddressInput }
        rules={{ pattern: ADDRESS_REGEXP }}
      />
      { index === fieldsLength - 1 && fieldsLength < MAX_INPUTS_NUM && (
        <IconButton
          aria-label="add"
          variant="iconBorder"
          w="30px"
          h="30px"
          onClick={ onAddFieldClick }
          icon={ <Icon as={ PlusIcon } w="20px" h="20px"/> }
          position="absolute"
          right={ index === 0 ? '-50px' : '-100px' }
          top="25px"
        />
      ) }
      { fieldsLength > 1 && (
        <IconButton
          aria-label="delete"
          variant="iconBorder"
          w="30px"
          h="30px"
          onClick={ onRemoveFieldClick(index) }
          icon={ <Icon as={ MinusIcon } w="20px" h="20px"/> }
          position="absolute"
          right="-50px"
          top="25px"
        />
      ) }</>
  );
}