import { Card, Stack } from "@chakra-ui/react";
import toast from "react-hot-toast";
import { CloseButton } from "~components/ui/close-button";
import { QQLLexingError, QQLParserError } from "~lib/qql";

export const notifyError = (message: string, error: Error) => {
  console.error(message, error);
  toast.error(
    (t) => {
      let subMessage = error.message;
      if (error instanceof QQLLexingError) {
        const errors: string[] = [];
        error.errors.map((e) => {
          errors.push(`${e.line}:${e.column} - ${e.message}`);
        });

        subMessage = errors.join("\n");
      } else if (error instanceof QQLParserError) {
        const errors: string[] = [];
        error.errors.map((e) => {
          errors.push(`${e.message}`);
        });

        subMessage = errors.join("\n");
      }

      return (
        <Card.Root
          pointerEvents={"all"}
          zIndex={1000}
          padding="3"
          backgroundColor={"red.600"}
        >
          <Card.Header padding={0}>
            <Stack direction="row" alignItems={"center"}>
              <Card.Title>{message}</Card.Title>
              <CloseButton
                marginLeft="auto"
                size="2xs"
                onClick={() => toast.dismiss(t.id)}
              />
            </Stack>
          </Card.Header>
          <Card.Body padding={0}>{subMessage}</Card.Body>
        </Card.Root>
      );
    },
    {
      position: "bottom-right",
      duration: 10000,
    }
  );
};
