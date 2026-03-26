import { Shield, Brain, MessageSquare, Users, Lock, Zap } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Tone Detection",
    description: "AI identifies aggression, defensiveness, or manipulation in real-time to guide constructive dialogue."
  },
  {
    icon: MessageSquare,
    title: "De-escalation Filter",
    description: "Transforms heated input into productive language—preserving facts while removing personal attacks."
  },
  {
    icon: Shield,
    title: "Fairness Engine",
    description: "Analyzes consistency and evidence objectively, comparing facts vs. opinions without emotional bias."
  },
  {
    icon: Lock,
    title: "Complete Privacy",
    description: "Resolve conflicts without immediate HR involvement. Your discussions remain confidential."
  },
  {
    icon: Zap,
    title: "Fast Resolution",
    description: "Get structured resolutions in hours, not weeks. No waiting for meetings or availability."
  },
  {
    icon: Users,
    title: "HR Integration",
    description: "Anonymized monitoring for HR with automatic alerts only for serious misconduct."
  }
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
            AI-Powered Conflict Resolution
          </h2>
          <p className="text-lg text-muted-foreground">
            Our intelligent system combines advanced NLP with workplace psychology to 
            deliver fair, unbiased, and constructive resolutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
