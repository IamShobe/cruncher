import React, { ReactNode } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Code,
  Collapsible,
  Badge,
  Separator,
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { token } from "~components/ui/system";
import { notifyError } from "~core/notifyError";
import { QQLLexingError, QQLParserError } from "@cruncher/qql";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: {
    componentStack: string;
  } | null;
}

const ErrorContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${token("spacing.8")};
  background-color: ${token("colors.bg")};
`;

const ErrorCard = styled.div`
  width: 100%;
  max-width: 50rem;
  padding: ${token("spacing.8")};
  background-color: ${token("colors.bg")};
  border-radius: ${token("radii.lg")};
  border: 1px solid ${token("colors.border")};
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
`;

const ErrorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${token("spacing.3")};
  margin-bottom: ${token("spacing.6")};
`;

const ErrorMessage = styled(Code)`
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.875rem;
  padding: ${token("spacing.3")};
  border-radius: ${token("radii.md")};
  font-weight: 500;
  background-color: ${token("colors.bg.muted")};
`;

const DebugCode = styled(Code)`
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.75rem;
  padding: ${token("spacing.4")};
  border-radius: ${token("radii.md")};
  width: 100%;
  max-height: 300px;
  overflow: auto;
  background-color: ${token("colors.bg.muted")};
  margin-top: ${token("spacing.2")};
`;

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    this.setState({ errorInfo });
    notifyError("An error occurred", error);
    console.error("Error Boundary caught:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const error = this.state.error;
      const isQQLError =
        error instanceof QQLParserError || error instanceof QQLLexingError;
      const isDev = process.env.NODE_ENV === "development";
      const isParserError = error instanceof QQLParserError;
      const isLexingError = error instanceof QQLLexingError;

      return (
        <ErrorContainer>
          <ErrorCard>
            {/* Header */}
            <VStack gap={4} width="full" align="start" mb={6}>
              <HStack gap={4} width="full" align="flex-start">
                <Box fontSize="4xl" flexShrink={0}>
                  ⚠️
                </Box>
                <VStack gap={2} align="start" flex={1}>
                  <Heading size="lg">Something went wrong</Heading>
                  <Text fontSize="sm" color="fg.muted">
                    An unexpected error occurred while rendering this view
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            <Separator my={4} />

            {/* Error Details */}
            <ErrorSection>
              <HStack justify="space-between" width="full">
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="fg.muted"
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                >
                  Error Details
                </Text>
                <HStack gap={2}>
                  {isParserError && <Badge>QQL Parser</Badge>}
                  {isLexingError && <Badge>QQL Lexer</Badge>}
                  {!isQQLError && <Badge>{error.name}</Badge>}
                </HStack>
              </HStack>

              <Box
                p={4}
                borderRadius="lg"
                borderLeft="3px solid"
                borderColor="red.500"
                bg="bg.muted"
              >
                <VStack gap={3} align="start" width="full">
                  <Box width="full">
                    <HStack justify="space-between" mb={2} width="full">
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="fg.muted"
                        textTransform="uppercase"
                        letterSpacing="0.5px"
                      >
                        Message
                      </Text>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => this.copyToClipboard(error.message)}
                      >
                        📋 Copy
                      </Button>
                    </HStack>
                    <ErrorMessage>{error.message}</ErrorMessage>
                  </Box>
                </VStack>
              </Box>
            </ErrorSection>

            {/* Parser Errors */}
            {isParserError &&
              error instanceof QQLParserError &&
              error.errors.length > 0 && (
                <ErrorSection>
                  <HStack justify="space-between" width="full">
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      color="fg.muted"
                      textTransform="uppercase"
                      letterSpacing="0.5px"
                    >
                      Parsing Issues ({error.errors.length})
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() =>
                        this.copyToClipboard(
                          error.errors.map((e: any) => e.message).join("\n")
                        )
                      }
                    >
                      📋 Copy All
                    </Button>
                  </HStack>
                  <VStack gap={2} width="full">
                    {error.errors.map((e: any, idx: number) => (
                      <HStack
                        key={idx}
                        p={3}
                        borderRadius="lg"
                        borderLeft="3px solid"
                        borderColor="orange.500"
                        width="full"
                        bg="bg.muted"
                        justify="space-between"
                      >
                        <Text fontSize="sm" flex={1}>
                          {e.message}
                        </Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => this.copyToClipboard(e.message)}
                          flexShrink={0}
                        >
                          📋
                        </Button>
                      </HStack>
                    ))}
                  </VStack>
                </ErrorSection>
              )}

            {/* Lexing Errors */}
            {isLexingError &&
              error instanceof QQLLexingError &&
              error.errors.length > 0 && (
                <ErrorSection>
                  <HStack justify="space-between" width="full">
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      color="fg.muted"
                      textTransform="uppercase"
                      letterSpacing="0.5px"
                    >
                      Lexing Issues ({error.errors.length})
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() =>
                        this.copyToClipboard(
                          error.errors
                            .map((e: any) => `${e.line}:${e.column} - ${e.message}`)
                            .join("\n")
                        )
                      }
                    >
                      📋 Copy All
                    </Button>
                  </HStack>
                  <VStack gap={2} width="full">
                    {error.errors.map((e: any, idx: number) => (
                      <HStack
                        key={idx}
                        p={3}
                        borderRadius="lg"
                        borderLeft="3px solid"
                        borderColor="blue.500"
                        width="full"
                        bg="bg.muted"
                        justify="space-between"
                      >
                        <HStack gap={2} flex={1}>
                          <Text fontSize="sm">{e.message}</Text>
                          <Badge size="sm">
                            {e.line}:{e.column}
                          </Badge>
                        </HStack>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() =>
                            this.copyToClipboard(
                              `${e.line}:${e.column} - ${e.message}`
                            )
                          }
                          flexShrink={0}
                        >
                          📋
                        </Button>
                      </HStack>
                    ))}
                  </VStack>
                </ErrorSection>
              )}

            {/* Debug Info */}
            {isDev && (
              <VStack gap={2} width="full" mb={6}>
                <Separator my={2} />

                {error.stack && (
                  <Collapsible.Root width="full">
                    <Collapsible.Trigger asChild>
                      <HStack width="full" justify="space-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          flex={1}
                          justifyContent="flex-start"
                          fontWeight="bold"
                          fontSize="xs"
                          color="fg.muted"
                        >
                          📋 Stack Trace
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.copyToClipboard(error.stack || "");
                          }}
                        >
                          📋 Copy
                        </Button>
                      </HStack>
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                      <DebugCode>{error.stack}</DebugCode>
                    </Collapsible.Content>
                  </Collapsible.Root>
                )}

                {this.state.errorInfo?.componentStack && (
                  <Collapsible.Root width="full">
                    <Collapsible.Trigger asChild>
                      <HStack width="full" justify="space-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          flex={1}
                          justifyContent="flex-start"
                          fontWeight="bold"
                          fontSize="xs"
                          color="fg.muted"
                        >
                          🏗️ Component Stack
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.copyToClipboard(
                              this.state.errorInfo?.componentStack || ""
                            );
                          }}
                        >
                          📋 Copy
                        </Button>
                      </HStack>
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                      <DebugCode>
                        {this.state.errorInfo.componentStack}
                      </DebugCode>
                    </Collapsible.Content>
                  </Collapsible.Root>
                )}
              </VStack>
            )}

            <Separator my={4} />

            {/* Actions */}
            <HStack width="full" gap={3}>
              <Button
                onClick={this.resetError}
                variant="solid"
                colorPalette="blue"
                flex={1}
                size="lg"
                fontWeight="bold"
              >
                🔄 Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                fontWeight="bold"
              >
                🔃 Reload
              </Button>
            </HStack>
          </ErrorCard>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}
