import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface AuthEmailTemplateProps {
  type: "forgot-password" | "email-verification";
  url: string;
}

export function AuthEmailTemplate({ type, url }: AuthEmailTemplateProps) {
  const isForgotPassword = type === "forgot-password";
  const previewText = isForgotPassword
    ? "Reset your password"
    : "Verify your email address";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-5 px-5 max-w-[600px]">
            <Section className="mt-8">
              <Heading className="text-2xl font-bold text-gray-900 mb-4">
                {isForgotPassword ? "Reset your password" : "Verify your email"}
              </Heading>
              <Text className="text-base leading-6 text-gray-700 mb-6">
                {isForgotPassword
                  ? "We received a request to reset your password. Click the button below to proceed."
                  : "Welcome to Axis! Please click the button below to verify your email address."}
              </Text>
              <Button
                className="bg-black rounded text-white text-base font-semibold no-underline text-center px-6 py-3"
                href={url}
              >
                {isForgotPassword ? "Reset Password" : "Verify Email"}
              </Button>
            </Section>
            <Section className="mt-8 pt-8 border-t border-gray-200">
              <Text className="text-sm text-gray-500 mb-2">
                If the button doesn't work, you can copy and paste this link
                into your browser:
              </Text>
              <Link href={url} className="text-xs text-blue-600 break-all">
                {url}
              </Link>
            </Section>
            <Section className="mt-8">
              <Text className="text-xs text-gray-400">
                Axis - Your ultimate graphing toolkit.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
