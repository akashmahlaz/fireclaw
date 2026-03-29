import { ArrowRight } from "lucide-react";

import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import SignIn from "@/components/auth/sign-in";

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-6 py-16">
      <AnimatedGridPattern
        numSquares={40}
        maxOpacity={0.25}
        duration={5}
        repeatDelay={0.8}
        className="text-foreground/20"

      />
      <SignIn/>

      <BlurFade
        inView
        className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-6"
      >
        <Card className="border-border/70 bg-card/90 shadow-2xl backdrop-blur">
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">shadcn/ui</Badge>
              <Badge variant="outline">Magic UI</Badge>
              <Badge>Both MCP servers ready</Badge>
            </div>
            <CardTitle className="text-3xl">MCP + Components Installed</CardTitle>
            <CardDescription className="text-base">
              This page uses shadcn/ui primitives and Magic UI effects from your
              local component source files.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <Separator />

            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton>
                Add More Magic UI
                <ArrowRight className="size-4" />
              </ShimmerButton>
            </div>

            <p className="text-sm text-muted-foreground">
              Try asking Copilot: add a pricing section with @magicui components
              and shadcn cards.
            </p>
          </CardContent>
        </Card>
      </BlurFade>
    </main>
  );
}
