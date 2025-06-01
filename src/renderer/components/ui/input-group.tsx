import type { BoxProps, InputElementProps } from "@chakra-ui/react";
import { Group, InputElement } from "@chakra-ui/react";
import * as React from "react";

export interface InputGroupProps extends BoxProps {
  startElementProps?: InputElementProps;
  endElementProps?: InputElementProps;
  startElement?: React.ReactNode;
  endElement?: React.ReactNode;
  children: React.ReactElement;
  startOffset?: InputElementProps["paddingStart"];
  endOffset?: InputElementProps["paddingEnd"];
}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup(props, ref) {
    const {
      startElement,
      startElementProps,
      endElement,
      endElementProps,
      children,
      startOffset = "6px",
      endOffset = "6px",
      ...rest
    } = props;

    return (
      // @ts-expect-error - lib component
      <Group ref={ref} {...rest}>
        {startElement && (
          // @ts-expect-error - lib component
          <InputElement pointerEvents="none" {...startElementProps}>         
            {startElement}
          </InputElement>
        )}
        {React.cloneElement(children, {
          ...(startElement && {
            ps: `calc(var(--input-height) - ${startOffset})`,
          }),
          ...(endElement && { pe: `calc(var(--input-height) - ${endOffset})` }),
          ...children.props,
        })}
        {endElement && (
          // @ts-expect-error - lib component
          <InputElement placement="end" {...endElementProps}>
            {endElement}
          </InputElement>
        )}
      </Group>
    );
  },
);
