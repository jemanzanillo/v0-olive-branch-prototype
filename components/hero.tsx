import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Clock, Scale } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Shield className="h-4 w-4" />
              Private & Confidential Resolution
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-foreground text-balance">
              Resolve Workplace Conflicts{" "}
              <span className="text-primary">Before They Escalate</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
              OliveBranch.ai is your AI-powered digital mediator. De-escalate tension 
              privately and fairly—without immediate HR or management involvement.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-base px-8" asChild>
                <Link href="/demo">
                  Start Resolving
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base border-primary text-primary hover:bg-primary/5" asChild>
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold text-lg">24h</span>
                </div>
                <p className="text-sm text-muted-foreground">Average Resolution</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Shield className="h-5 w-5" />
                  <span className="font-semibold text-lg">100%</span>
                </div>
                <p className="text-sm text-muted-foreground">Private & Secure</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Scale className="h-5 w-5" />
                  <span className="font-semibold text-lg">Fair</span>
                </div>
                <p className="text-sm text-muted-foreground">Unbiased Analysis</p>
              </div>
            </div>
          </div>

          <div className="relative lg:pl-8">
            <div className="relative rounded-2xl bg-card border border-border shadow-xl p-8">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
              
              <div className="relative space-y-6">
                <div className="flex items-center justify-center mb-6">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OliveBranch%20V-owonKlkd0Bg22zaQgg3X2wx3mlGnSb.png"
                    alt="OliveBranch"
                    width={120}
                    height={120}
                    className="opacity-20"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="bg-secondary rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Tone Detection</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-primary rounded-full" />
                      </div>
                      <span className="text-xs text-primary font-medium">Calm</span>
                    </div>
                  </div>
                  
                  <div className="bg-secondary rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">De-escalation Filter</p>
                    <p className="text-sm text-foreground">Converting emotional language to productive discourse...</p>
                  </div>
                  
                  <div className="bg-secondary rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Fairness Engine</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">Analyzing evidence...</span>
                      <span className="text-primary font-medium">92%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
