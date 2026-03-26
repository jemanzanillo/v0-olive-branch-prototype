import { CheckCircle2, Scale, ArrowRight } from "lucide-react"

export function TripleVerdict() {
  return (
    <section className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
            The Triple Verdict Model
          </h2>
          <p className="text-lg text-muted-foreground">
            Every resolution presents three structured options, ensuring fairness and 
            giving both parties clear paths forward.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Outcome A */}
          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="font-serif font-bold text-primary">A</span>
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Outcome A
            </h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Logic favors the first party based on company policy and presented evidence.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Policy-backed reasoning
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Evidence-based conclusion
              </li>
            </ul>
          </div>

          {/* Outcome B - Middle Ground */}
          <div className="bg-card rounded-xl border-2 border-primary p-6 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full">
              Recommended
            </div>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mb-4">
              <Scale className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Middle Ground
            </h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              A compromise solution focusing on balanced accountability and mutual repair.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Shared responsibility
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Relationship preservation
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Future prevention focus
              </li>
            </ul>
          </div>

          {/* Outcome C */}
          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="font-serif font-bold text-primary">C</span>
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Outcome C
            </h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Logic favors the second party based on company policy and presented evidence.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Policy-backed reasoning
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Evidence-based conclusion
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 max-w-3xl mx-auto bg-card rounded-xl border border-border p-6">
          <h4 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-accent" />
            The Repair Package
          </h4>
          <p className="text-muted-foreground mb-4">
            Regardless of which outcome is chosen, both parties receive:
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-secondary rounded-lg p-4">
              <h5 className="font-medium text-foreground text-sm mb-1">Reasoning Breakdown</h5>
              <p className="text-xs text-muted-foreground">A logical explanation of why this decision was reached</p>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <h5 className="font-medium text-foreground text-sm mb-1">Suggested Actions</h5>
              <p className="text-xs text-muted-foreground">Clear next steps to close the case professionally</p>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <h5 className="font-medium text-foreground text-sm mb-1">Communication Script</h5>
              <p className="text-xs text-muted-foreground">A neutral message to help break the ice</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
