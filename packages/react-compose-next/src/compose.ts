import * as React from 'react';
import { ComposedComponent, ComposeOptions, ComposePreparedOptions } from './types';

const defaultComposeOptions: ComposePreparedOptions = {
  className: process.env.NODE_ENV === 'production' ? '' : 'no-classname-🙉',
  displayNames: [],

  mapPropsToStylesChain: [],

  handledProps: [],
  overrideStyles: false
};

function computeDisplayNames(
  options: ComposeOptions<any, any, any>,
  inputDisplayName?: string,
  inputOptions?: ComposePreparedOptions<any, any, any, any>
): string[] {
  if (options.overrideStyles) {
    return [options.displayName || inputDisplayName].filter(Boolean) as string[];
  }

  // To support styles composition we need to properly pick up display names
  if (inputOptions) {
    return options.displayName ? inputOptions.displayNames.concat(options.displayName) : inputOptions.displayNames;
  }

  return [inputDisplayName, options.displayName].filter(Boolean) as string[];
}

function compose<
  InputProps extends Record<string, any>,
  InputStylesProps extends Record<string, any>,
  ParentProps extends Record<string, any>,
  ParentStylesProps extends Record<string, any>
>(
  InputComponent: React.FunctionComponent<ParentProps>,
  composeOptions: ComposeOptions<InputProps, InputStylesProps, ParentStylesProps> = {}
): ComposedComponent<InputProps, InputStylesProps, ParentProps, ParentStylesProps> {
  const Component = InputComponent.bind(null) as ComposedComponent<InputProps, InputStylesProps, ParentProps, ParentStylesProps>;

  const { handledProps = [], mapPropsToStyles } = composeOptions;
  const inputOptions: ComposePreparedOptions<InputProps, InputStylesProps, ParentProps, ParentStylesProps> =
    (InputComponent as any).fluentComposeConfig || defaultComposeOptions;

  Component.displayName = composeOptions.displayName || InputComponent.displayName;
  Component.fluentComposeConfig = {
    className: composeOptions.className || inputOptions.className,
    displayNames: computeDisplayNames(composeOptions, InputComponent.displayName, inputOptions),

    mapPropsToStylesChain: mapPropsToStyles
      ? inputOptions.mapPropsToStylesChain.concat(mapPropsToStyles)
      : inputOptions.mapPropsToStylesChain,

    handledProps: [...inputOptions.handledProps, ...handledProps],
    overrideStyles: composeOptions.overrideStyles || false
  };

  return Component;
}

export default compose;
