import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-primary p-8 md:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(254,251,246,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(203,104,67,0.2),transparent_50%)]" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-primary-foreground mb-4">
              Ready to Transform Workplace Relationships?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 leading-relaxed">
              Join forward-thinking organizations using AI to create healthier, more 
              productive work environments. Start resolving conflicts today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-base px-8"
                asChild
              >
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base"
                asChild
              >
                <Link href="#contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
