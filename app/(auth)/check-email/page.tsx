"use client";

/**
 * CheckEmailPage Component
 * 
 * A specialized instructional view rendered immediately after a manual 
 * email/password signup.
 * 
 * Purpose:
 * 1. User Guidance: Informs the user that their account creation is pending 
 *    until they follow the link sent to their inbox.
 * 2. Security Context: Emphasizes that login is restricted until verification 
 *    is completed to prevent spam and ensure valid contact data.
 */

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

export default function CheckEmailPage() {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="text-center space-y-1">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3 animate-pulse">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-black tracking-tight uppercase">
          Verify Inbox
        </CardTitle>
        <CardDescription className="text-base text-balance font-medium">
          We've dispatched a secure verification link to your email address.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Follow the instructions in the email to activate your Axis account.
          <br />
          <strong className="text-foreground font-black">
            Access to persistent graphing and 3D workspaces is locked 
            until your identity is confirmed.
          </strong>
        </p>
        <Button asChild className="w-full h-11 font-bold shadow-xl shadow-primary/20">
          <a
            href="https://gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            Launch Gmail <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="w-full h-10 font-bold text-muted-foreground hover:text-primary">
          <Link href="/sign-in" className="flex items-center justify-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Login
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
