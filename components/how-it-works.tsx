import { MessageCircle, Brain, FileText, Handshake } from "lucide-react"

const steps = [
  {
    icon: MessageCircle,
    step: "01",
    title: "Share Your Perspective",
    description: "Answer guided prompts about what happened, what outcome you want, and what was misunderstood. No open-ended rants—just focused dialogue."
  },
  {
    icon: Brain,
    step: "02",
    title: "AI Analysis",
    description: "Our Fairness Engine analyzes both perspectives, detecting tone, identifying facts vs. opinions, and finding common ground."
  },
  {
    icon: FileText,
    step: "03",
    title: "Triple Verdict",
    description: "Receive three structured resolution options: one favoring each party, plus a balanced middle-ground compromise."
  },
  {
    icon: Handshake,
    step: "04",
    title: "Repair & Resolve",
    description: "Get a complete repair package with reasoning breakdown, action steps, and communication scripts to restore the relationship."
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
            How OliveBranch Works
          </h2>
          <p className="text-lg text-muted-foreground">
            A guided process designed to de-escalate tension and find fair resolutions 
            for all parties involved.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-border" />
              )}
              
              <div className="relative bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-4xl font-serif font-bold text-primary/20">{item.step}</span>
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
