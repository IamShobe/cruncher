// import toast from "react-hot-toast";
import { toaster } from "~components/ui/toaster";
import { QQLLexingError, QQLParserError } from "@cruncher/qql";

export const notifySuccess = (message: string) => {
  console.log(message);
  toaster.success({
    title: message,
    duration: 5000,
  });
};

export const notifyError = (message: string, error: Error) => {
  console.error(message, error);
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
  toaster.error({
    title: message,
    description: subMessage,
    duration: 15000,
    closable: true,
  });
};
