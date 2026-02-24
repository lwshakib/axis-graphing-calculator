"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function CheckEmailPage() {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="text-center space-y-1">
        <div className="flex justify-center mb-4">
          <Logo className="h-10 w-10" showText={false} />
        </div>
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Check your email
        </CardTitle>
        <CardDescription className="text-base text-balance">
          We've sent a verification link to your email address. 
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Please click the link in the email to verify your account.
          <br />
          <strong className="text-foreground">
            Note: If you don't verify your email, you will not be able to log in.
          </strong>
        </p>
        <Button asChild className="w-full">
          <a
            href="https://gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            Go to Gmail <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/sign-in" className="flex items-center justify-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
