import { BlurFade } from "@/components/ui/blur-fade";

const steps = [
  {
    step: "01",
    title: "Sign up & pick a plan",
    description: "Create your account with Google or email. Choose Personal, Business, or Agency.",
  },
  {
    step: "02",
    title: "Deploy your agent",
    description: "Pick a template or start blank. Name it, configure its persona, and click Deploy.",
  },
  {
    step: "03",
    title: "Connect & go live",
    description: "Scan a QR code for WhatsApp, link Telegram, or embed web chat. Your agent is live in under 60 seconds.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full bg-muted/40 px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <BlurFade inView>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Live in 3 steps
            </h2>
            <p className="mt-3 text-muted-foreground">
              No servers to manage. No Docker to configure. Just deploy.
            </p>
          </div>
        </BlurFade>

        <div className="flex flex-col gap-8">
          {steps.map((s, i) => (
            <BlurFade key={s.step} inView delay={i * 0.1}>
              <div className="flex gap-6">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-lg font-bold text-primary-foreground">
                  {s.step}
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <h3 className="font-heading text-lg font-semibold">{s.title}</h3>
                  <p className="text-muted-foreground">{s.description}</p>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
