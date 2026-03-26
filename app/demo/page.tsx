"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Scale, 
  MessageSquare, 
  Brain, 
  Shield, 
  AlertTriangle,
  User,
  Users,
  Eye,
  Send,
  Sparkles,
  FileText,
  RefreshCw
} from "lucide-react"

// Types
type Persona = "karen" | "blake" | "bob"
type KarenStep = "setup" | "questions" | "tone-review" | "consent" | "waiting"
type BlakeStep = "notification" | "response" | "followup" | "waiting"
type BobStep = "dashboard" | "case-detail"
type AnalysisStep = "clarification-karen" | "processing" | "verdict"

interface ToneAnalysis {
  originalText: string
  refinedText: string
  flaggedPhrases: { phrase: string; issue: string; suggestion: string }[]
  overallTone: "professional" | "emotional" | "aggressive"
}

// Keyword-based dynamic questions
const keywordQuestions: Record<string, { question: string; placeholder: string }[]> = {
  "Company Expenses": [
    { question: "What specific expense or purchase is at the center of this issue?", placeholder: "Describe the expense, amount, and context..." },
    { question: "What company policy do you believe was violated or misunderstood?", placeholder: "Reference any specific guidelines or procedures..." },
    { question: "How has this affected your work or the team's budget?", placeholder: "Describe the impact..." },
  ],
  "Resource Allocation": [
    { question: "What resources are being disputed?", placeholder: "Equipment, budget, time, personnel..." },
    { question: "How were resources originally allocated or promised?", placeholder: "Describe the initial agreement or understanding..." },
    { question: "What would fair allocation look like to you?", placeholder: "Describe your ideal outcome..." },
  ],
  "Communication Issues": [
    { question: "What was communicated and when?", placeholder: "Describe the conversation or message..." },
    { question: "What information was missing or unclear?", placeholder: "What should have been said differently..." },
    { question: "How has this miscommunication affected your work?", placeholder: "Describe the consequences..." },
  ],
  "Project Ownership": [
    { question: "What project or task is being disputed?", placeholder: "Describe the project and your role..." },
    { question: "What contributions have you made?", placeholder: "List your specific work and deliverables..." },
    { question: "What recognition or credit is missing?", placeholder: "Describe what you expected vs. what happened..." },
  ],
  "Meeting Conduct": [
    { question: "What happened in the meeting?", placeholder: "Describe the specific incident..." },
    { question: "How did the behavior affect you or others?", placeholder: "Describe the impact on the team..." },
    { question: "What would professional conduct look like in this situation?", placeholder: "Describe your expectations..." },
  ],
  "Deadline Disputes": [
    { question: "What deadline was missed or is being disputed?", placeholder: "Describe the timeline and expectations..." },
    { question: "What factors contributed to the situation?", placeholder: "Dependencies, workload, communication..." },
    { question: "How has this affected the project or team?", placeholder: "Describe the consequences..." },
  ],
}

const availableKeywords = Object.keys(keywordQuestions)

// Dynamic follow-up questions for Blake based on Karen's input
const generateBlakeFollowups = (karenResponses: Record<string, string>, keywords: string[]): { question: string; placeholder: string }[] => {
  const followups: { question: string; placeholder: string }[] = []
  
  if (keywords.includes("Company Expenses")) {
    followups.push({ 
      question: "Can you provide documentation for the expense (receipts, approvals, project requirements)?", 
      placeholder: "Describe any supporting documentation you have..." 
    })
  }
  if (keywords.includes("Resource Allocation")) {
    followups.push({ 
      question: "Were there competing priorities that affected how resources were distributed?", 
      placeholder: "Explain any constraints or decisions you faced..." 
    })
  }
  
  // Always include these core follow-ups
  followups.push(
    { question: "What context might be missing from the other person's account?", placeholder: "Share important background information..." },
    { question: "What would you need to feel this is resolved fairly?", placeholder: "Describe your ideal outcome..." }
  )
  
  return followups
}

// Simulated tone analysis
const analyzeTone = (text: string): ToneAnalysis => {
  const flaggedPhrases: { phrase: string; issue: string; suggestion: string }[] = []
  let refinedText = text
  
  // Detect aggressive/emotional language patterns
  const patterns = [
    { regex: /always\s+does/gi, issue: "Absolute language", suggestion: "sometimes does" },
    { regex: /never\s+listens?/gi, issue: "Absolute language", suggestion: "sometimes doesn't listen" },
    { regex: /doesn't\s+care/gi, issue: "Assuming intent", suggestion: "may not have considered" },
    { regex: /completely\s+wrong/gi, issue: "Inflammatory language", suggestion: "may have misunderstood" },
    { regex: /ridiculous/gi, issue: "Judgmental language", suggestion: "unexpected" },
    { regex: /incompetent/gi, issue: "Personal attack", suggestion: "may need additional support" },
    { regex: /lazy/gi, issue: "Character judgment", suggestion: "may have had competing priorities" },
    { regex: /sabotag/gi, issue: "Assuming malicious intent", suggestion: "the action affected" },
    { regex: /fault/gi, issue: "Blame-focused language", suggestion: "responsibility" },
  ]
  
  patterns.forEach(({ regex, issue, suggestion }) => {
    const matches = text.match(regex)
    if (matches) {
      matches.forEach(match => {
        flaggedPhrases.push({ phrase: match, issue, suggestion })
        refinedText = refinedText.replace(regex, suggestion)
      })
    }
  })
  
  const overallTone: "professional" | "emotional" | "aggressive" = 
    flaggedPhrases.length === 0 ? "professional" : 
    flaggedPhrases.length <= 2 ? "emotional" : "aggressive"
  
  return { originalText: text, refinedText, flaggedPhrases, overallTone }
}

export default function DemoPage() {
  // Persona selection
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  
  // Karen's state
  const [karenStep, setKarenStep] = useState<KarenStep>("setup")
  const [colleagueName, setColleagueName] = useState("")
  const [colleagueEmail, setColleagueEmail] = useState("")
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [karenResponses, setKarenResponses] = useState<Record<string, string>>({})
  const [toneAnalysis, setToneAnalysis] = useState<ToneAnalysis | null>(null)
  const [consentGiven, setConsentGiven] = useState(false)
  
  // Blake's state
  const [blakeStep, setBlakeStep] = useState<BlakeStep>("notification")
  const [blakeResponses, setBlakeResponses] = useState<Record<string, string>>({})
  const [blakeFollowupResponses, setBlakeFollowupResponses] = useState<Record<string, string>>({})
  
  // Bob's state
  const [bobStep, setBobStep] = useState<BobStep>("dashboard")
  
  // Shared state
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep | null>(null)
  const [clarificationResponses, setClarificationResponses] = useState<Record<string, string>>({})
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [selectedVerdict, setSelectedVerdict] = useState<string | null>(null)

  // Get dynamic questions based on selected keywords
  const getDynamicQuestions = () => {
    const questions: { question: string; placeholder: string }[] = [
      { question: "What happened?", placeholder: "Describe the situation objectively. Focus on facts and specific events..." },
      { question: "What outcome do you want?", placeholder: "What would a good resolution look like for you?" },
      { question: "What do you think the other person misunderstood?", placeholder: "What might they have gotten wrong about your intentions or actions?" },
    ]
    
    selectedKeywords.forEach(keyword => {
      if (keywordQuestions[keyword]) {
        questions.push(...keywordQuestions[keyword])
      }
    })
    
    return questions
  }

  // Handle Karen's tone review submission
  const handleToneReview = () => {
    const allText = Object.values(karenResponses).join(" ")
    const analysis = analyzeTone(allText)
    setToneAnalysis(analysis)
    setKarenStep("tone-review")
  }

  // Handle consent and submission
  const handleConsentSubmit = () => {
    if (consentGiven) {
      setKarenStep("waiting")
    }
  }

  // Simulate analysis for verdict
  const simulateAnalysis = () => {
    setAnalysisStep("processing")
    setAnalysisProgress(0)
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setAnalysisStep("verdict"), 500)
          return 100
        }
        return prev + 2
      })
    }, 60)
  }

  // Persona selection screen
  if (!selectedPersona) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OliveBranch20H-XZyZeTyymxkNg4MhWlYH6GWCqUGqN8.png"
                alt="OliveBranch"
width={150}
              height={32}
              style={{ height: '28px', width: 'auto' }}
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

        <main className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center space-y-4 mb-12">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              Experience the Resolution Journey
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose a perspective to explore how OliveBranch works for each participant in the conflict resolution process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Karen - Initiator */}
            <button
              onClick={() => setSelectedPersona("karen")}
              className="group text-left bg-card rounded-xl border-2 border-border hover:border-primary p-6 transition-all hover:shadow-lg"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <User className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Karen</h3>
              <p className="text-sm text-muted-foreground mb-4">The Initiator</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Start a case, describe your perspective, and experience the de-escalation filter with tone detection.
              </p>
              <div className="mt-4 flex items-center text-primary text-sm font-medium">
                Start as Karen
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Blake - Responder */}
            <button
              onClick={() => setSelectedPersona("blake")}
              className="group text-left bg-card rounded-xl border-2 border-border hover:border-primary p-6 transition-all hover:shadow-lg"
            >
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <MessageSquare className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Blake</h3>
              <p className="text-sm text-muted-foreground mb-4">The Responder</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Receive a case notification, provide your perspective, and answer AI follow-up questions.
              </p>
              <div className="mt-4 flex items-center text-accent text-sm font-medium">
                Start as Blake
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Bob - HR Oversight */}
            <button
              onClick={() => setSelectedPersona("bob")}
              className="group text-left bg-card rounded-xl border-2 border-border hover:border-primary p-6 transition-all hover:shadow-lg"
            >
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-secondary/80 transition-colors">
                <Eye className="h-7 w-7 text-foreground" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Bob</h3>
              <p className="text-sm text-muted-foreground mb-4">HR Manager (Shadow Oversight)</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monitor anonymized cases in real-time and receive alerts for serious misconduct.
              </p>
              <div className="mt-4 flex items-center text-foreground text-sm font-medium">
                Start as Bob
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Karen's Journey
  if (selectedPersona === "karen") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OliveBranch20H-XZyZeTyymxkNg4MhWlYH6GWCqUGqN8.png"
                alt="OliveBranch"
width={150}
              height={32}
              style={{ height: '28px', width: 'auto' }}
              />
            </Link>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-1">
                <User className="h-3 w-3" />
                Karen (Initiator)
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPersona(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Switch Role
              </Button>
            </div>
          </div>
        </header>

        {/* Progress */}
        <div className="border-b border-border bg-secondary/30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Your Progress</span>
              <span className="text-sm text-muted-foreground">
                {karenStep === "setup" && "Step 1: Setup"}
                {karenStep === "questions" && "Step 2: Your Perspective"}
                {karenStep === "tone-review" && "Step 3: Tone Review"}
                {karenStep === "consent" && "Step 4: Review & Consent"}
                {karenStep === "waiting" && "Case Submitted"}
              </span>
            </div>
            <Progress 
              value={
                karenStep === "setup" ? 20 : 
                karenStep === "questions" ? 40 : 
                karenStep === "tone-review" ? 60 : 
                karenStep === "consent" ? 80 : 100
              } 
              className="h-2" 
            />
          </div>
        </div>

        <main className="container mx-auto px-4 py-12 max-w-3xl">
          {/* Step 1: Setup */}
          {karenStep === "setup" && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                  Start a Resolution Case
                </h2>
                <p className="text-muted-foreground">
                  Enter your colleague&apos;s information and select the topics related to your concern.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Colleague&apos;s Name</label>
                    <Input
                      placeholder="Blake Johnson"
                      value={colleagueName}
                      onChange={(e) => setColleagueName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Colleague&apos;s Email</label>
                    <Input
                      type="email"
                      placeholder="blake@company.com"
                      value={colleagueEmail}
                      onChange={(e) => setColleagueEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">
                    Select Topics (choose all that apply)
                  </label>
                  <p className="text-sm text-muted-foreground">
                    This helps us generate relevant questions for your situation.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableKeywords.map(keyword => (
                      <button
                        key={keyword}
                        onClick={() => {
                          setSelectedKeywords(prev => 
                            prev.includes(keyword) 
                              ? prev.filter(k => k !== keyword)
                              : [...prev, keyword]
                          )
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedKeywords.includes(keyword)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => setKarenStep("questions")}
                  disabled={!colleagueName || !colleagueEmail || selectedKeywords.length === 0}
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Dynamic Questions */}
          {karenStep === "questions" && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                  Share Your Perspective
                </h2>
                <p className="text-muted-foreground">
                  Answer these questions to help us understand your side of the situation with {colleagueName}.
                </p>
              </div>

              <div className="space-y-6">
                {getDynamicQuestions().map((q, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block font-medium text-foreground">{q.question}</label>
                    <Textarea
                      placeholder={q.placeholder}
                      className="min-h-[100px] resize-none bg-card"
                      value={karenResponses[q.question] || ""}
                      onChange={(e) => setKarenResponses({ ...karenResponses, [q.question]: e.target.value })}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setKarenStep("setup")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleToneReview}
                  disabled={Object.values(karenResponses).filter(Boolean).length < 3}
                >
                  Review My Tone
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Tone Review */}
          {karenStep === "tone-review" && toneAnalysis && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                  Tone Detection Results
                </h2>
                <p className="text-muted-foreground">
                  Our De-escalation Filter has analyzed your language to ensure productive communication.
                </p>
              </div>

              {/* Tone Indicator */}
              <div className={`rounded-lg border p-4 ${
                toneAnalysis.overallTone === "professional" ? "bg-primary/5 border-primary/20" :
                toneAnalysis.overallTone === "emotional" ? "bg-yellow-50 border-yellow-200" :
                "bg-red-50 border-red-200"
              }`}>
                <div className="flex items-center gap-3">
                  {toneAnalysis.overallTone === "professional" ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : toneAnalysis.overallTone === "emotional" ? (
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <h3 className="font-medium text-foreground">
                      Overall Tone: {toneAnalysis.overallTone.charAt(0).toUpperCase() + toneAnalysis.overallTone.slice(1)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {toneAnalysis.overallTone === "professional" 
                        ? "Your language is clear and constructive."
                        : `We found ${toneAnalysis.flaggedPhrases.length} phrase(s) that could be refined.`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Flagged Phrases */}
              {toneAnalysis.flaggedPhrases.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">Suggested Refinements</h3>
                  <div className="space-y-3">
                    {toneAnalysis.flaggedPhrases.map((item, index) => (
                      <div key={index} className="bg-card rounded-lg border border-border p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-yellow-700">{index + 1}</span>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="line-through text-red-600 text-sm">&quot;{item.phrase}&quot;</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className="text-primary text-sm font-medium">&quot;{item.suggestion}&quot;</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Issue: {item.issue}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Refined Summary */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Your Refined Summary</h3>
                <div className="bg-primary/5 rounded-lg border border-primary/20 p-4">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {toneAnalysis.refinedText}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  This refined version maintains your core concerns while using constructive language.
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setKarenStep("questions")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Edit Responses
                </Button>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => setKarenStep("consent")}
                >
                  Continue to Consent
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Consent */}
          {karenStep === "consent" && toneAnalysis && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                  Review & Provide Consent
                </h2>
                <p className="text-muted-foreground">
                  Please confirm that the refined summary accurately captures your intent before we send it to {colleagueName}.
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Summary to be sent
                </div>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {toneAnalysis.refinedText}
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg border border-border p-4">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="consent" 
                    checked={consentGiven}
                    onCheckedChange={(checked) => setConsentGiven(checked === true)}
                  />
                  <label htmlFor="consent" className="text-sm text-foreground leading-relaxed cursor-pointer">
                    I confirm that this AI-refined summary correctly captures my core concerns and intent. 
                    I understand this summary will be shared with {colleagueName} to initiate the resolution process.
                  </label>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setKarenStep("tone-review")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={handleConsentSubmit}
                  disabled={!consentGiven}
                >
                  Send to {colleagueName}
                  <Send className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Waiting State */}
          {karenStep === "waiting" && (
            <div className="space-y-8 text-center py-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-4">
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                  Case Submitted Successfully
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {colleagueName} has been notified. You&apos;ll receive an update once they provide their perspective.
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg border border-border p-4 max-w-md mx-auto">
                <p className="text-sm text-muted-foreground">
                  In the demo, switch to Blake&apos;s perspective to continue the journey.
                </p>
              </div>
              <Button variant="outline" onClick={() => setSelectedPersona(null)}>
                Switch Perspective
              </Button>
            </div>
          )}
        </main>
      </div>
    )
  }

  // Blake's Journey
  if (selectedPersona === "blake") {
    const blakeFollowups = generateBlakeFollowups(karenResponses, selectedKeywords.length > 0 ? selectedKeywords : ["Company Expenses"])
    
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OliveBranch20H-XZyZeTyymxkNg4MhWlYH6GWCqUGqN8.png"
                alt="OliveBranch"
width={150}
              height={32}
              style={{ height: '28px', width: 'auto' }}
              />
            </Link>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-1 border-accent text-accent">
                <MessageSquare className="h-3 w-3" />
                Blake (Responder)
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPersona(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Switch Role
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-3xl">
          {/* Notification */}
          {blakeStep === "notification" && (
            <div className="space-y-8">
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      New Resolution Request
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      A colleague has initiated a discussion about &quot;Company Credit Card&quot; usage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                  You&apos;ve Been Invited to Resolve a Workplace Concern
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  A colleague has raised a concern and would like to work toward a resolution with you. 
                  OliveBranch helps facilitate fair, private discussions without escalation to HR unless necessary.
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="font-medium text-foreground">Summary of Concern</h3>
                <p className="text-muted-foreground leading-relaxed">
                  There appears to be a misunderstanding regarding a recent company credit card purchase. 
                  The other party would like to discuss the situation and find a mutually agreeable resolution.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary">Company Expenses</Badge>
                  <Badge variant="secondary">Resource Allocation</Badge>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => setBlakeStep("response")}
              >
                Provide My Perspective
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Response */}
          {blakeStep === "response" && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                  Share Your Perspective
                </h2>
                <p className="text-muted-foreground">
                  Help us understand your side of the situation. Your responses will be kept confidential.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block font-medium text-foreground">What is your understanding of the situation?</label>
                  <Textarea
                    placeholder="Describe what happened from your perspective..."
                    className="min-h-[120px] resize-none bg-card"
                    value={blakeResponses["understanding"] || ""}
                    onChange={(e) => setBlakeResponses({ ...blakeResponses, understanding: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-foreground">Do you have any supporting evidence?</label>
                  <Textarea
                    placeholder="Receipts, emails, project requirements, approvals..."
                    className="min-h-[100px] resize-none bg-card"
                    value={blakeResponses["evidence"] || ""}
                    onChange={(e) => setBlakeResponses({ ...blakeResponses, evidence: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-foreground">What outcome would you like to see?</label>
                  <Textarea
                    placeholder="What would a fair resolution look like to you?"
                    className="min-h-[100px] resize-none bg-card"
                    value={blakeResponses["outcome"] || ""}
                    onChange={(e) => setBlakeResponses({ ...blakeResponses, outcome: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setBlakeStep("notification")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => setBlakeStep("followup")}
                  disabled={!blakeResponses.understanding}
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* AI Follow-up Questions */}
          {blakeStep === "followup" && (
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Brain className="h-5 w-5" />
                  <span className="text-sm font-medium">AI Clarification</span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                  A Few Follow-up Questions
                </h2>
                <p className="text-muted-foreground">
                  Based on your response, we have some clarifying questions to ensure we have the full picture.
                </p>
              </div>

              <div className="space-y-6">
                {blakeFollowups.map((q, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block font-medium text-foreground">{q.question}</label>
                    <Textarea
                      placeholder={q.placeholder}
                      className="min-h-[100px] resize-none bg-card"
                      value={blakeFollowupResponses[q.question] || ""}
                      onChange={(e) => setBlakeFollowupResponses({ ...blakeFollowupResponses, [q.question]: e.target.value })}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setBlakeStep("response")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => {
                    setBlakeStep("waiting")
                    setAnalysisStep("clarification-karen")
                  }}
                >
                  Submit Response
                  <Send className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Blake Waiting / Analysis Flow */}
          {blakeStep === "waiting" && (
            <>
              {/* Clarification for Karen */}
              {analysisStep === "clarification-karen" && (
                <div className="space-y-8">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <RefreshCw className="h-5 w-5" />
                      <span className="text-sm font-medium">Additional Clarification Needed</span>
                    </div>
                    <p className="text-muted-foreground">
                      Based on Blake&apos;s response, the AI is now asking Karen a final set of clarifying questions to ensure a complete picture.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                      Final Clarification (Karen&apos;s View)
                    </h2>
                    <p className="text-muted-foreground">
                      In the full product, Karen would receive these questions. For the demo, you can see the process.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block font-medium text-foreground">
                        Blake mentioned project requirements - were you aware of these before raising the concern?
                      </label>
                      <Textarea
                        placeholder="Your response..."
                        className="min-h-[100px] resize-none bg-card"
                        value={clarificationResponses["awareness"] || ""}
                        onChange={(e) => setClarificationResponses({ ...clarificationResponses, awareness: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-medium text-foreground">
                        Is there anything else the AI should know before generating resolution options?
                      </label>
                      <Textarea
                        placeholder="Any additional context..."
                        className="min-h-[100px] resize-none bg-card"
                        value={clarificationResponses["additional"] || ""}
                        onChange={(e) => setClarificationResponses({ ...clarificationResponses, additional: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={simulateAnalysis}
                  >
                    Complete & Generate Resolutions
                    <Brain className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* Processing */}
              {analysisStep === "processing" && (
                <div className="space-y-8 text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                    <Brain className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                      Generating Resolution Options
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      The Fairness Engine is analyzing both perspectives to create balanced resolution options.
                    </p>
                  </div>
                  <div className="max-w-md mx-auto space-y-6">
                    <Progress value={analysisProgress} className="h-3" />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className={`transition-opacity ${analysisProgress > 20 ? "opacity-100" : "opacity-30"}`}>
                        <CheckCircle2 className={`h-5 w-5 mx-auto mb-1 ${analysisProgress > 20 ? "text-primary" : "text-muted"}`} />
                        <span className="text-muted-foreground">Fact Extraction</span>
                      </div>
                      <div className={`transition-opacity ${analysisProgress > 50 ? "opacity-100" : "opacity-30"}`}>
                        <CheckCircle2 className={`h-5 w-5 mx-auto mb-1 ${analysisProgress > 50 ? "text-primary" : "text-muted"}`} />
                        <span className="text-muted-foreground">Logic Analysis</span>
                      </div>
                      <div className={`transition-opacity ${analysisProgress > 80 ? "opacity-100" : "opacity-30"}`}>
                        <CheckCircle2 className={`h-5 w-5 mx-auto mb-1 ${analysisProgress > 80 ? "text-primary" : "text-muted"}`} />
                        <span className="text-muted-foreground">Resolution Gen</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Triple Verdict */}
              {analysisStep === "verdict" && (
                <div className="space-y-8">
                  <div className="space-y-2 text-center">
                    <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                      The Triple Verdict Model
                    </h2>
                    <p className="text-muted-foreground">
                      Three resolution paths based on our analysis of both perspectives.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {/* Outcome A - Logic Favors Karen */}
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
                            Logic Favors Karen
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            Based on company guidelines, Karen&apos;s argument regarding the credit card policy is stronger. 
                            The purchase appears to fall outside approved categories.
                          </p>
                          <div className="text-xs text-primary font-medium">
                            Suggested: Blake to follow pre-approval process for future purchases
                          </div>
                        </div>
                        {selectedVerdict === "A" && (
                          <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                        )}
                      </div>
                    </button>

                    {/* Outcome B - Compromise */}
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
                            The Middle Ground
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            Both parties share accountability: Karen&apos;s communication could have been clearer, 
                            and Blake&apos;s purchase was technically outside standard policy but had legitimate intent.
                          </p>
                          <div className="text-xs text-primary font-medium">
                            Suggested: Establish a new pre-approval process for miscellaneous items
                          </div>
                        </div>
                        {selectedVerdict === "B" && (
                          <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                        )}
                      </div>
                    </button>

                    {/* Outcome C - Logic Favors Blake */}
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
                            Logic Favors Blake
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            The purchase was for a legitimate client event, which falls under approved business purposes. 
                            Karen may not have had full context about current team needs.
                          </p>
                          <div className="text-xs text-primary font-medium">
                            Suggested: Karen to review updated team requirements and client protocols
                          </div>
                        </div>
                        {selectedVerdict === "C" && (
                          <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Repair Package */}
                  {selectedVerdict && (
                    <div className="bg-secondary rounded-xl border border-border p-6 space-y-4">
                      <h4 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
                        <ArrowRight className="h-5 w-5 text-accent" />
                        The &quot;Repair&quot; Package
                      </h4>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="bg-card rounded-lg p-4">
                          <h5 className="font-medium text-foreground text-sm mb-2">Reasoning Breakdown</h5>
                          <p className="text-xs text-muted-foreground">
                            {selectedVerdict === "A" && "Company policy Section 4.2 specifies pre-approval for purchases over $100."}
                            {selectedVerdict === "B" && "Both parties operated under reasonable but different interpretations of guidelines."}
                            {selectedVerdict === "C" && "Client-facing expenses have broader approval under Section 4.5."}
                          </p>
                        </div>
                        <div className="bg-card rounded-lg p-4">
                          <h5 className="font-medium text-foreground text-sm mb-2">Suggested Actions</h5>
                          <p className="text-xs text-muted-foreground">
                            {selectedVerdict === "A" && "Blake submits retroactive approval; both review expense policy together."}
                            {selectedVerdict === "B" && "Schedule 30-min sync to draft new pre-approval workflow for the team."}
                            {selectedVerdict === "C" && "Karen requests a walkthrough of current client protocols from Blake."}
                          </p>
                        </div>
                        <div className="bg-card rounded-lg p-4">
                          <h5 className="font-medium text-foreground text-sm mb-2">Communication Script</h5>
                          <p className="text-xs text-muted-foreground italic">
                            &quot;I&apos;ve had a chance to reflect on our recent discussion. I think we both want what&apos;s best for the team. Would you have 15 minutes this week to talk through a path forward?&quot;
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
                      onClick={() => setSelectedPersona(null)}
                    >
                      Complete Demo
                      <CheckCircle2 className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    )
  }

  // Bob's Journey (HR Oversight)
  if (selectedPersona === "bob") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OliveBranch20H-XZyZeTyymxkNg4MhWlYH6GWCqUGqN8.png"
                alt="OliveBranch"
width={150}
              height={32}
              style={{ height: '28px', width: 'auto' }}
              />
            </Link>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-1">
                <Eye className="h-3 w-3" />
                Bob (HR Manager)
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPersona(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Switch Role
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Dashboard */}
          {bobStep === "dashboard" && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                  HR Oversight Dashboard
                </h2>
                <p className="text-muted-foreground">
                  Monitor active cases with anonymized data. You&apos;ll be alerted if serious misconduct is detected.
                </p>
              </div>

              {/* Stats */}
              <div className="grid sm:grid-cols-4 gap-4">
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="text-2xl font-bold text-foreground">3</div>
                  <div className="text-sm text-muted-foreground">Active Cases</div>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <div className="text-sm text-muted-foreground">Resolved This Month</div>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="text-2xl font-bold text-foreground">94%</div>
                  <div className="text-sm text-muted-foreground">Resolution Rate</div>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="text-2xl font-bold text-accent">0</div>
                  <div className="text-sm text-muted-foreground">Escalations Required</div>
                </div>
              </div>

              {/* Active Cases */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Active Cases</h3>
                <div className="space-y-3">
                  {/* Case 1 - Current demo case */}
                  <button 
                    onClick={() => setBobStep("case-detail")}
                    className="w-full text-left bg-card rounded-lg border border-border p-4 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Case #2024-0847</div>
                          <div className="text-sm text-muted-foreground">Department: Marketing</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Awaiting Response</Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary">Company Expenses</Badge>
                      <Badge variant="secondary">Resource Allocation</Badge>
                    </div>
                  </button>

                  {/* Case 2 */}
                  <div className="bg-card rounded-lg border border-border p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Case #2024-0845</div>
                          <div className="text-sm text-muted-foreground">Department: Engineering</div>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10">In Analysis</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary">Project Ownership</Badge>
                    </div>
                  </div>

                  {/* Case 3 */}
                  <div className="bg-card rounded-lg border border-border p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Case #2024-0842</div>
                          <div className="text-sm text-muted-foreground">Department: Sales</div>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Resolution Pending</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary">Communication Issues</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert Example */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">How Escalation Alerts Work</h4>
                    <p className="text-sm text-red-700 mt-1">
                      If the AI detects keywords associated with harassment, discrimination, or other serious misconduct, 
                      you&apos;ll receive an immediate alert to intervene as a human mediator outside of OliveBranch.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Case Detail */}
          {bobStep === "case-detail" && (
            <div className="space-y-8">
              <Button variant="ghost" onClick={() => setBobStep("dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                    Case #2024-0847
                  </h2>
                  <p className="text-muted-foreground">Marketing Department</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Awaiting Response</Badge>
              </div>

              {/* Anonymized View */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Anonymized View - Identities Protected
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Party A */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Party A (Initiator)</h4>
                    <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4 blur-sm" />
                      <div className="h-4 bg-muted rounded w-full blur-sm" />
                      <div className="h-4 bg-muted rounded w-5/6 blur-sm" />
                    </div>
                    <p className="text-xs text-muted-foreground">Raw input blurred for privacy</p>
                  </div>

                  {/* Party B */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Party B (Responder)</h4>
                    <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-center h-24">
                      <span className="text-sm text-muted-foreground">Awaiting response...</span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-foreground mb-2">AI Summary (De-escalated)</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A concern has been raised regarding a company credit card purchase. Party A believes the expense 
                    may not align with established guidelines. The case involves questions about resource allocation 
                    and expense approval processes.
                  </p>
                </div>

                {/* Tone Analysis */}
                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-foreground mb-2">Tone Analysis</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "35%" }} />
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Moderate Emotion</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    2 phrases were refined by the de-escalation filter before submission
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Case Timeline</h3>
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <div className="font-medium text-foreground text-sm">Case Initiated</div>
                      <div className="text-xs text-muted-foreground">Today, 9:42 AM</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <div className="font-medium text-foreground text-sm">Tone Analysis Complete</div>
                      <div className="text-xs text-muted-foreground">Today, 9:43 AM</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <div className="font-medium text-foreground text-sm">Party A Consent Given</div>
                      <div className="text-xs text-muted-foreground">Today, 9:45 AM</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                    <div>
                      <div className="font-medium text-foreground text-sm">Notification Sent to Party B</div>
                      <div className="text-xs text-muted-foreground">Today, 9:45 AM - Awaiting response</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }

  return null
}
