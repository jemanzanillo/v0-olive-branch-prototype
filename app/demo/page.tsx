"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle2, Scale, MessageSquare, Brain, Shield } from "lucide-react"

type Step = "intro" | "perspective1" | "perspective2" | "analysis" | "verdict"

interface FormData {
  whatHappened: string
  desiredOutcome: string
  whatWasMisunderstood: string
  otherPerspective: string
}

const prompts = [
  { key: "whatHappened", label: "What happened?", placeholder: "Describe the situation objectively. Focus on facts and specific events..." },
  { key: "desiredOutcome", label: "What outcome do you want?", placeholder: "What would a good resolution look like for you?" },
  { key: "whatWasMisunderstood", label: "What was misunderstood?", placeholder: "What do you think the other person got wrong or didn't understand?" },
]

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState<Step>("intro")
  const [formData, setFormData] = useState<FormData>({
    whatHappened: "",
    desiredOutcome: "",
    whatWasMisunderstood: "",
    otherPerspective: ""
  })
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [selectedVerdict, setSelectedVerdict] = useState<string | null>(null)

  const handleNext = () => {
    if (currentStep === "intro") setCurrentStep("perspective1")
    else if (currentStep === "perspective1") setCurrentStep("perspective2")
    else if (currentStep === "perspective2") {
      setCurrentStep("analysis")
      simulateAnalysis()
    }
  }

  const simulateAnalysis = () => {
    setAnalysisProgress(0)
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setCurrentStep("verdict"), 500)
          return 100
        }
        return prev + 2
      })
    }, 60)
  }

  const getProgress = () => {
    switch (currentStep) {
      case "intro": return 0
      case "perspective1": return 25
      case "perspective2": return 50
      case "analysis": return 75
      case "verdict": return 100
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OliveBranch20H-XZyZeTyymxkNg4MhWlYH6GWCqUGqN8.png"
              alt="OliveBranch"
              width={150}
              height={32}
              className="h-7 w-auto"
            />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Resolution Progress</span>
            <span className="text-sm text-muted-foreground">{getProgress()}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Intro Step */}
        {currentStep === "intro" && (
          <div className="space-y-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-4">
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                Welcome to the Resolution Process
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                This guided process will help you articulate your perspective and work toward 
                a fair resolution. Everything you share is private and confidential.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-card rounded-lg border border-border p-4">
                <MessageSquare className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-medium text-foreground text-sm">Guided Prompts</h3>
                <p className="text-xs text-muted-foreground mt-1">Answer structured questions for clarity</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <Brain className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-medium text-foreground text-sm">AI Analysis</h3>
                <p className="text-xs text-muted-foreground mt-1">Unbiased evaluation of perspectives</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <Scale className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-medium text-foreground text-sm">Fair Resolution</h3>
                <p className="text-xs text-muted-foreground mt-1">Three options for moving forward</p>
              </div>
            </div>
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleNext}
            >
              Begin Resolution Process
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Perspective 1 */}
        {currentStep === "perspective1" && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                Share Your Perspective
              </h2>
              <p className="text-muted-foreground">
                Answer the following prompts to help us understand your side of the situation.
              </p>
            </div>
            <div className="space-y-6">
              {prompts.map((prompt) => (
                <div key={prompt.key} className="space-y-2">
                  <label className="block font-medium text-foreground">{prompt.label}</label>
                  <Textarea
                    placeholder={prompt.placeholder}
                    className="min-h-[100px] resize-none bg-card"
                    value={formData[prompt.key as keyof FormData]}
                    onChange={(e) => setFormData({ ...formData, [prompt.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleNext}
                disabled={!formData.whatHappened || !formData.desiredOutcome}
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Perspective 2 (Other Party Simulation) */}
        {currentStep === "perspective2" && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                Consider the Other Perspective
              </h2>
              <p className="text-muted-foreground">
                In a real case, the other party would provide their perspective. For this demo, 
                share what you think they might say.
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg border border-border p-4 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                In production, each party submits their perspective independently and privately.
              </p>
            </div>
            <div className="space-y-2">
              <label className="block font-medium text-foreground">
                What might the other person say happened?
              </label>
              <Textarea
                placeholder="Try to articulate their likely perspective..."
                className="min-h-[150px] resize-none bg-card"
                value={formData.otherPerspective}
                onChange={(e) => setFormData({ ...formData, otherPerspective: e.target.value })}
              />
            </div>
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep("perspective1")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={handleNext}
              >
                Analyze Perspectives
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Analysis Step */}
        {currentStep === "analysis" && (
          <div className="space-y-8 text-center py-12">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
              <Brain className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-4">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                Analyzing Perspectives
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Our Fairness Engine is processing both perspectives to generate balanced resolutions.
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-6">
              <Progress value={analysisProgress} className="h-3" />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className={`transition-opacity ${analysisProgress > 20 ? "opacity-100" : "opacity-30"}`}>
                  <CheckCircle2 className={`h-5 w-5 mx-auto mb-1 ${analysisProgress > 20 ? "text-primary" : "text-muted"}`} />
                  <span className="text-muted-foreground">Tone Analysis</span>
                </div>
                <div className={`transition-opacity ${analysisProgress > 50 ? "opacity-100" : "opacity-30"}`}>
                  <CheckCircle2 className={`h-5 w-5 mx-auto mb-1 ${analysisProgress > 50 ? "text-primary" : "text-muted"}`} />
                  <span className="text-muted-foreground">Fact Extraction</span>
                </div>
                <div className={`transition-opacity ${analysisProgress > 80 ? "opacity-100" : "opacity-30"}`}>
                  <CheckCircle2 className={`h-5 w-5 mx-auto mb-1 ${analysisProgress > 80 ? "text-primary" : "text-muted"}`} />
                  <span className="text-muted-foreground">Resolution Gen</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verdict Step */}
        {currentStep === "verdict" && (
          <div className="space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                Resolution Options
              </h2>
              <p className="text-muted-foreground">
                Based on our analysis, here are three possible paths forward.
              </p>
            </div>

            <div className="grid gap-4">
              {/* Outcome A */}
              <button
                onClick={() => setSelectedVerdict("A")}
                className={`text-left bg-card rounded-xl border-2 p-6 transition-all ${
                  selectedVerdict === "A" ? "border-primary shadow-lg" : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="font-serif font-bold text-primary">A</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                      Acknowledge Communication Gap
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Analysis suggests the initial party&apos;s concerns about unclear expectations 
                      are supported by the evidence. Recommended action: establish clearer communication protocols.
                    </p>
                  </div>
                  {selectedVerdict === "A" && (
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                  )}
                </div>
              </button>

              {/* Outcome B */}
              <button
                onClick={() => setSelectedVerdict("B")}
                className={`text-left bg-card rounded-xl border-2 p-6 transition-all relative ${
                  selectedVerdict === "B" ? "border-primary shadow-lg" : "border-border hover:border-primary/30"
                }`}
              >
                <div className="absolute -top-3 left-6 bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Recommended
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Scale className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                      Mutual Understanding Path
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Both perspectives contain valid points. A facilitated conversation to clarify 
                      intentions and establish shared expectations would benefit both parties.
                    </p>
                  </div>
                  {selectedVerdict === "B" && (
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                  )}
                </div>
              </button>

              {/* Outcome C */}
              <button
                onClick={() => setSelectedVerdict("C")}
                className={`text-left bg-card rounded-xl border-2 p-6 transition-all ${
                  selectedVerdict === "C" ? "border-primary shadow-lg" : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="font-serif font-bold text-primary">C</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                      Process Improvement Focus
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      The other party&apos;s perspective highlights systemic issues that contributed to 
                      the conflict. Recommended action: review and improve existing processes.
                    </p>
                  </div>
                  {selectedVerdict === "C" && (
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                  )}
                </div>
              </button>
            </div>

            {selectedVerdict && (
              <div className="bg-secondary rounded-xl border border-border p-6 space-y-4">
                <h4 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-accent" />
                  Your Repair Package
                </h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-card rounded-lg p-4">
                    <h5 className="font-medium text-foreground text-sm mb-2">Reasoning</h5>
                    <p className="text-xs text-muted-foreground">
                      This resolution balances the need for accountability with relationship preservation.
                    </p>
                  </div>
                  <div className="bg-card rounded-lg p-4">
                    <h5 className="font-medium text-foreground text-sm mb-2">Next Steps</h5>
                    <p className="text-xs text-muted-foreground">
                      Schedule a brief sync within 48 hours to discuss the resolution together.
                    </p>
                  </div>
                  <div className="bg-card rounded-lg p-4">
                    <h5 className="font-medium text-foreground text-sm mb-2">Ice Breaker</h5>
                    <p className="text-xs text-muted-foreground italic">
                      &quot;I&apos;ve been reflecting on our situation and would value the chance to discuss it...&quot;
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={!selectedVerdict}
                asChild
              >
                <Link href="/">
                  Complete Demo
                  <CheckCircle2 className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
