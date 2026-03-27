"use client"

import { useState, useRef } from "react"
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
  Leaf,
  Globe,
  Upload,
  X,
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
  "Promotion Eligibility": [
    { question: "What promotion or title decision is at the center of this issue?", placeholder: "Describe the role decision, timeline, and who was selected..." },
    { question: "What criteria do you believe were applied, and where do you see gaps?", placeholder: "Reference metrics, expectations, or stated promotion requirements..." },
    { question: "How has this decision affected your motivation, trust, or career path?", placeholder: "Describe the professional impact..." },
  ],
  "Salary Alignment": [
    { question: "What salary concern is connected to this dispute?", placeholder: "Describe the pay difference, raise decision, or compensation concern..." },
    { question: "How does your workload compare to your current compensation?", placeholder: "Share concrete examples of scope, output, and responsibilities..." },
    { question: "What compensation outcome would feel fair and sustainable?", placeholder: "Describe the adjustment, timing, or review process you are seeking..." },
  ],
  "Resource Allocation": [
    { question: "What opportunities or responsibilities are being unevenly allocated?", placeholder: "Courses, committees, mentoring, visibility, funding, etc..." },
    { question: "How were those responsibilities originally assigned or promised?", placeholder: "Describe the initial understanding or process..." },
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
  "Performance Feedback": [
    { question: "What feedback or review is at the center of this issue?", placeholder: "Describe the review, rating, or comment in question..." },
    { question: "Why do you feel this feedback was unfair or inaccurate?", placeholder: "Describe what was overlooked or misrepresented..." },
    { question: "What outcome are you hoping for?", placeholder: "Revised review, documented context, a conversation..." },
  ],
  "Workplace Behavior": [
    { question: "What behavior occurred and when?", placeholder: "Describe the incident as specifically as possible..." },
    { question: "How did this behavior affect you or your ability to work?", placeholder: "Describe the impact on your wellbeing or productivity..." },
    { question: "Has this happened before or is this part of a pattern?", placeholder: "Note any prior incidents or witnesses..." },
  ],
  "Credit & Recognition": [
    { question: "What work or contribution was not recognized?", placeholder: "Describe what you did and when..." },
    { question: "How was the credit attributed instead?", placeholder: "Who received recognition, and in what context..." },
    { question: "What would appropriate recognition look like?", placeholder: "An acknowledgment, updated record, promotion consideration..." },
  ],
  "Work Distribution": [
    { question: "How is the workload currently distributed on your team?", placeholder: "Describe who is doing what and how tasks are assigned..." },
    { question: "What makes the current distribution feel unequal or unfair?", placeholder: "Volume, complexity, visibility of tasks..." },
    { question: "What changes would create a more balanced arrangement?", placeholder: "Describe your ideal distribution or process..." },
  ],
}

const availableKeywords = Object.keys(keywordQuestions).sort()

// Dynamic follow-up questions for Blake based on Karen's input
const generateBlakeFollowups = (karenResponses: Record<string, string>, keywords: string[]): { question: string; placeholder: string }[] => {
  const followups: { question: string; placeholder: string }[] = []
  
  if (keywords.includes("Promotion Eligibility")) {
    followups.push({ 
      question: "Can you summarize the milestones, outcomes, or institutional contributions that support the current promotion decision?", 
      placeholder: "Share key achievements, tenure context, and criteria used..." 
    })
  }
  if (keywords.includes("Salary Alignment")) {
    followups.push({ 
      question: "How do you view the relationship between current compensation and responsibilities across the team?", 
      placeholder: "Explain any compensation constraints, benchmarks, or role differences..." 
    })
  }
  if (keywords.includes("Work Distribution")) {
    followups.push({
      question: "Were there constraints that affected how teaching, admin, or leadership tasks were distributed?",
      placeholder: "Explain any operational realities that shaped workload distribution..."
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
  const [currentQuestionPage, setCurrentQuestionPage] = useState(0)
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

  // New state from feedback improvements
  const [colleagueEmailValid, setColleagueEmailValid] = useState(true)
  const [toneVersion, setToneVersion] = useState(0)
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  const [evidenceFileError, setEvidenceFileError] = useState("")
  const [verdictSelections, setVerdictSelections] = useState<{ karen: string | null; blake: string | null }>({ karen: null, blake: null })
  const [postVerdictState, setPostVerdictState] = useState<"selecting" | "consensus" | "deadlock" | "regenerating" | "escalated">("selecting")
  const [companyPolicy, setCompanyPolicy] = useState("")
  const [policyFile, setPolicyFile] = useState<File | null>(null)
  const [policySaved, setPolicySaved] = useState(false)
  const [bobView, setBobView] = useState<"anonymized" | "full-disclosure">("anonymized")
  const [karenEvidenceFile, setKarenEvidenceFile] = useState<File | null>(null)
  const [karenEvidenceFileError, setKarenEvidenceFileError] = useState("")
  const evidenceFileRef = useRef<HTMLInputElement>(null)
  const karenEvidenceFileRef = useRef<HTMLInputElement>(null)
  const policyFileRef = useRef<HTMLInputElement>(null)

  // Get question pages grouped by topic
  const getQuestionPages = () => {
    const pages: { title: string; questions: { question: string; placeholder: string }[] }[] = [
      {
        title: "Your Situation",
        questions: [
          { question: "What happened?", placeholder: "Describe the situation objectively. Focus on facts and specific events..." },
          { question: "What outcome do you want?", placeholder: "What would a good resolution look like for you?" },
          { question: "What do you think the other person misunderstood?", placeholder: "What might they have gotten wrong about your intentions or actions?" },
        ],
      },
    ]
    selectedKeywords.forEach(keyword => {
      if (keywordQuestions[keyword]) {
        pages.push({ title: keyword, questions: keywordQuestions[keyword] })
      }
    })
    return pages
  }

  // Keep getDynamicQuestions for tone analysis (needs all questions flat)
  const getDynamicQuestions = () => getQuestionPages().flatMap(p => p.questions)

  // Handle Karen's tone review submission
  const handleToneReview = () => {
    const allText = Object.values(karenResponses).join(" ")
    const analysis = analyzeTone(allText)
    setToneAnalysis(analysis)
    setToneVersion(0)
    setKarenStep("tone-review")
  }

  // Generate another de-escalated version (demo variation)
  const handleRegenerateTone = () => {
    if (!toneAnalysis) return
    const variants = [
      " I believe a constructive conversation would help both parties reach a fair understanding.",
      " I am confident we can resolve this professionally with open dialogue.",
      " Finding a mutually agreeable path forward is the goal here.",
    ]
    const next = (toneVersion + 1) % variants.length
    setToneVersion(next)
    setToneAnalysis({
      ...toneAnalysis,
      refinedText: toneAnalysis.refinedText.replace(/ I believe.*|I am confident.*|Finding a mutually.*/, "").trimEnd() + variants[next],
    })
  }

  // Handle evidence file selection (10 MB limit)
  const handleEvidenceFile = (file: File | null) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setEvidenceFileError("File exceeds 10 MB limit. Please choose a smaller file.")
      setEvidenceFile(null)
      return
    }
    setEvidenceFileError("")
    setEvidenceFile(file)
  }

  const handleKarenEvidenceFile = (file: File | null) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setKarenEvidenceFileError("File exceeds 10 MB limit. Please choose a smaller file.")
      setKarenEvidenceFile(null)
      return
    }
    setKarenEvidenceFileError("")
    setKarenEvidenceFile(file)
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
            {/* Jaythan - Initiator */}
            <button
              onClick={() => setSelectedPersona("karen")}
              className="group text-left bg-card rounded-xl border-2 border-border hover:border-primary p-6 transition-all hover:shadow-lg"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <User className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Jaythan</h3>
              <p className="text-sm text-muted-foreground mb-4">The Initiator</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Start a case, describe your perspective, and experience the de-escalation filter with tone detection.
              </p>
              <div className="mt-4 flex items-center text-primary text-sm font-medium">
                Start as Jaythan
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Joe - Responder */}
            <button
              onClick={() => setSelectedPersona("blake")}
              className="group text-left bg-card rounded-xl border-2 border-border hover:border-primary p-6 transition-all hover:shadow-lg"
            >
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <MessageSquare className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Joe</h3>
              <p className="text-sm text-muted-foreground mb-4">The Responder</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Receive a case notification, provide your perspective, and answer AI follow-up questions.
              </p>
              <div className="mt-4 flex items-center text-accent text-sm font-medium">
                Start as Joe
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Mindy - Program Oversight */}
            <button
              onClick={() => setSelectedPersona("bob")}
              className="group text-left bg-card rounded-xl border-2 border-border hover:border-primary p-6 transition-all hover:shadow-lg"
            >
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-secondary/80 transition-colors">
                <Eye className="h-7 w-7 text-foreground" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Mindy</h3>
              <p className="text-sm text-muted-foreground mb-4">Program Leader (Shadow Oversight)</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monitor anonymized cases in real-time and receive alerts for serious misconduct.
              </p>
              <div className="mt-4 flex items-center text-foreground text-sm font-medium">
                Start as Mindy
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
                Jaythan (Initiator)
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPersona(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Switch Role
              </Button>
            </div>
          </div>
        </header>

        {/* Progress - sticky so it stays visible while scrolling */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
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
                <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Important:</span> Enter your <span className="font-medium text-foreground">colleague&apos;s</span> details below — not your own.
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">Colleague&apos;s Name</label>
                    <Input
                      placeholder="e.g. Joe Ramirez"
                      value={colleagueName}
                      onChange={(e) => setColleagueName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">The person your concern is about</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">Colleague&apos;s Email</label>
                    <Input
                      type="email"
                      placeholder="e.g. joe@company.com"
                      value={colleagueEmail}
                      onChange={(e) => {
                        setColleagueEmail(e.target.value)
                        setColleagueEmailValid(true)
                      }}
                      onBlur={() => {
                        if (colleagueEmail) {
                          setColleagueEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(colleagueEmail))
                        }
                      }}
                      className={!colleagueEmailValid ? "border-red-400 focus-visible:ring-red-400" : ""}
                    />
                    {!colleagueEmailValid && (
                      <p className="text-xs text-red-500">Please enter a valid email address.</p>
                    )}
                    {colleagueEmailValid && <p className="text-xs text-muted-foreground">So we can notify them securely</p>}
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
                  onClick={() => { setCurrentQuestionPage(0); setKarenStep("questions") }}
                  disabled={!colleagueName || !colleagueEmail || !colleagueEmailValid || selectedKeywords.length === 0}
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Dynamic Questions (paginated by topic) */}
          {karenStep === "questions" && (() => {
            const pages = getQuestionPages()
            const page = pages[currentQuestionPage]
            const isFirst = currentQuestionPage === 0
            const isLast = currentQuestionPage === pages.length - 1
            // Page 0: both "What happened?" and "What outcome do you want?" are mandatory
            const pageAnswered = currentQuestionPage === 0
              ? !!(karenResponses["What happened?"]?.trim() && karenResponses["What outcome do you want?"]?.trim())
              : page.questions.some(q => karenResponses[q.question]?.trim())
            return (
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                      Share Your Perspective
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {currentQuestionPage + 1} of {pages.length}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Answer these questions to help us understand your side of the situation with {colleagueName}.
                  </p>
                </div>

                {/* Page indicator dots */}
                <div className="flex gap-2">
                  {pages.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentQuestionPage
                          ? "w-6 bg-primary"
                          : i < currentQuestionPage
                          ? "w-2 bg-primary/40"
                          : "w-2 bg-secondary"
                      }`}
                    />
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {page.title}
                  </p>
                  <div className="space-y-6">
                    {page.questions.map((q, index) => {
                      const isMandatory = currentQuestionPage === 0 && (q.question === "What happened?" || q.question === "What outcome do you want?")
                      return (
                      <div key={index} className="space-y-2">
                        <label className="block font-medium text-foreground">
                          {q.question}
                          {isMandatory && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <Textarea
                          placeholder={q.placeholder}
                          className="min-h-[100px] resize-none bg-card"
                          value={karenResponses[q.question] || ""}
                          onChange={(e) => setKarenResponses({ ...karenResponses, [q.question]: e.target.value })}
                        />
                      </div>
                      )
                    })}

                    {/* Evidence upload on page 0 only */}
                    {currentQuestionPage === 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <label className="block font-medium text-foreground">Supporting Evidence</label>
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Optional</span>
                        </div>
                        <input
                          ref={karenEvidenceFileRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => handleKarenEvidenceFile(e.target.files?.[0] ?? null)}
                        />
                        {karenEvidenceFile ? (
                          <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                            <FileText className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-sm text-foreground flex-1 truncate">{karenEvidenceFile.name}</span>
                            <button
                              onClick={() => { setKarenEvidenceFile(null); if (karenEvidenceFileRef.current) karenEvidenceFileRef.current.value = "" }}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => karenEvidenceFileRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg px-4 py-3 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
                          >
                            <Upload className="h-4 w-4" />
                            Attach supporting evidence (PDF, Word, image — max 10 MB)
                          </button>
                        )}
                        {karenEvidenceFileError && <p className="text-xs text-red-500">{karenEvidenceFileError}</p>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => isFirst ? setKarenStep("setup") : setCurrentQuestionPage(p => p - 1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  {isLast ? (
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={handleToneReview}
                      disabled={!pageAnswered}
                    >
                      Review My Tone
                      <Sparkles className="ml-2 h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => setCurrentQuestionPage(p => p + 1)}
                      disabled={!pageAnswered}
                    >
                      Next
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })()}

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

              {/* Original → Refined comparison */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Your Original Message</h3>
                <div className="bg-secondary/60 rounded-lg border border-border p-4">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">
                    {toneAnalysis.originalText}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex-1 h-px bg-border" />
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  De-escalated by OliveBranch Filter
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Flagged Phrases */}
              {toneAnalysis.flaggedPhrases.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground text-sm">Refinements Applied</h3>
                  <div className="space-y-2">
                    {toneAnalysis.flaggedPhrases.map((item, index) => (
                      <div key={index} className="bg-card rounded-lg border border-border px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="line-through text-red-500 text-sm">&quot;{item.phrase}&quot;</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-primary text-sm font-medium">&quot;{item.suggestion}&quot;</span>
                          <span className="text-xs text-muted-foreground ml-auto">{item.issue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Refined Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Refined Version</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs"
                    onClick={handleRegenerateTone}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Generate Another Version
                  </Button>
                </div>
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
                <Button variant="outline" onClick={() => { setCurrentQuestionPage(getQuestionPages().length - 1); setKarenStep("questions") }}>
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

          {/* Waiting State — two modes depending on whether Blake has responded */}
          {karenStep === "waiting" && (
            <>
              {/* Final clarification: shown after Blake responds and switches back to Karen */}
              {analysisStep === "clarification-karen" && (
                <div className="space-y-8">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                      <RefreshCw className="h-5 w-5" />
                      <span className="text-sm font-medium">Additional Clarification Needed</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Based on {colleagueName}&apos;s response, the AI has a few follow-up questions for you to ensure a complete and fair picture.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                      Final Clarification
                    </h2>
                    <p className="text-muted-foreground">
                      These answers help the AI generate balanced resolution options for both sides.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block font-medium text-foreground">
                        {colleagueName} mentioned project requirements — were you aware of these before raising the concern?
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
                    onClick={() => { setSelectedPersona("blake"); simulateAnalysis() }}
                  >
                    Complete & Generate Resolutions
                    <Brain className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* Default waiting: Blake hasn't responded yet */}
              {analysisStep !== "clarification-karen" && (
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
                      In the demo, switch to {colleagueName}&apos;s perspective to continue the journey.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setSelectedPersona("blake")}
                  >
                    Switch to {colleagueName}&apos;s Perspective
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    )
  }

  // Blake's Journey
  if (selectedPersona === "blake") {
    const blakeFollowups = generateBlakeFollowups(karenResponses, selectedKeywords.length > 0 ? selectedKeywords : ["Promotion Eligibility"])
    
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
                <Leaf className="h-3 w-3" />
                Joe (Responder)
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
            <div className="space-y-6">
              {/* Demo context note */}
              <div className="bg-secondary/50 border border-border rounded-lg px-4 py-2 text-xs text-muted-foreground text-center">
                📧 <span className="font-medium">Demo context:</span> This is what Joe sees in their email inbox.
              </div>

              {/* Email chrome wrapper */}
              <div className="rounded-xl border-2 border-border overflow-hidden shadow-sm">
                {/* Email header */}
                <div className="bg-secondary/40 border-b border-border px-6 py-4 space-y-1 font-mono text-sm">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-16 shrink-0">From:</span>
                    <span className="text-foreground">noreply@olivebranch.ai</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-16 shrink-0">To:</span>
                    <span className="text-foreground">joe@company.com</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-16 shrink-0">Subject:</span>
                    <span className="text-foreground font-semibold font-sans">Someone has extended an olive branch to you 🌿</span>
                  </div>
                </div>

                {/* Email body */}
                <div className="bg-card px-6 py-8 space-y-6">
                  {/* Notification card */}
                  <div className="bg-accent/10 border border-accent/20 rounded-xl p-5 space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <Leaf className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-lg font-semibold text-foreground">
                          Someone extended an olive branch to you
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          A colleague has reached out through OliveBranch to resolve a workplace concern together.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      A Colleague Has Extended an Olive Branch to You
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      A colleague would like to work through a concern with you privately using OliveBranch —
                      a neutral platform for fair, confidential workplace resolutions without immediate HR escalation.
                    </p>
                  </div>

                  <div className="bg-secondary/50 rounded-xl border border-border p-5 space-y-3">
                    <h3 className="font-medium text-foreground">Summary of Concern</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      There is an open concern regarding promotion readiness and salary alignment in the department.
                      The other party would like to discuss the current role structure and find a fair path forward.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge variant="secondary">Promotion Eligibility</Badge>
                      <Badge variant="secondary">Salary Alignment</Badge>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                    onClick={() => setBlakeStep("response")}
                  >
                    <Globe className="h-5 w-5" />
                    Open in OliveBranch
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
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

              {/* Summary of Concern panel (E1) */}
              <details className="group bg-secondary/40 rounded-xl border border-border overflow-hidden" open>
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">What your colleague shared</span>
                    <Badge variant="secondary" className="text-xs">Context</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground group-open:hidden">Show</span>
                  <span className="text-xs text-muted-foreground hidden group-open:inline">Hide</span>
                </summary>
                <div className="px-5 pb-5 space-y-3 border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    There is an open concern regarding promotion readiness and salary alignment in the department.
                    The other party would like to discuss the current role structure and find a fair path forward.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Promotion Eligibility</Badge>
                    <Badge variant="secondary">Salary Alignment</Badge>
                  </div>
                </div>
              </details>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block font-medium text-foreground">
                    What is your understanding of the situation?
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Textarea
                    placeholder="Describe what happened from your perspective..."
                    className="min-h-[120px] resize-none bg-card"
                    value={blakeResponses["understanding"] || ""}
                    onChange={(e) => setBlakeResponses({ ...blakeResponses, understanding: e.target.value })}
                  />
                </div>

                {/* Evidence field with file upload (E2) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="block font-medium text-foreground">Supporting Evidence</label>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Optional</span>
                  </div>
                  <Textarea
                    placeholder="Describe any supporting evidence: reviews, milestones, workload records, department criteria..."
                    className="min-h-[80px] resize-none bg-card"
                    value={blakeResponses["evidence"] || ""}
                    onChange={(e) => setBlakeResponses({ ...blakeResponses, evidence: e.target.value })}
                  />
                  {/* File upload area */}
                  <div>
                    <input
                      ref={evidenceFileRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => handleEvidenceFile(e.target.files?.[0] ?? null)}
                    />
                    {evidenceFile ? (
                      <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm text-foreground flex-1 truncate">{evidenceFile.name}</span>
                        <button
                          onClick={() => { setEvidenceFile(null); if (evidenceFileRef.current) evidenceFileRef.current.value = "" }}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => evidenceFileRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg px-4 py-3 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
                      >
                        <Upload className="h-4 w-4" />
                        Attach a document (PDF, Word, image — max 10 MB)
                      </button>
                    )}
                    {evidenceFileError && <p className="text-xs text-red-500 mt-1">{evidenceFileError}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-foreground">
                    What outcome would you like to see?
                    <span className="text-red-500 ml-1">*</span>
                  </label>
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
                  disabled={!blakeResponses.understanding || !blakeResponses.outcome}
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

          {/* Blake Waiting — prompt to switch to Karen for final clarification */}
          {blakeStep === "waiting" && analysisStep === "clarification-karen" && (
            <div className="space-y-8 text-center py-12">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <div className="space-y-3">
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                  Response Submitted
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Thanks, Joe. The AI has reviewed your response and has a few follow-up questions for Jaythan to complete the picture.
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm font-medium">Final Clarification Needed</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Switch to Jaythan&apos;s perspective so he can answer a couple of final questions before resolutions are generated.
                </p>
              </div>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setSelectedPersona("karen")}
              >
                Switch to Jaythan&apos;s Perspective
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Blake Waiting / Analysis Flow (processing + verdict) */}
          {blakeStep === "waiting" && analysisStep !== "clarification-karen" && (
            <>
              {/* Clarification for Karen — kept here for legacy, but now lives in Karen's view */}
              {analysisStep === "clarification-karen" && (
                <div className="space-y-8">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <RefreshCw className="h-5 w-5" />
                      <span className="text-sm font-medium">Additional Clarification Needed</span>
                    </div>
                    <p className="text-muted-foreground">
                      Based on Joe&apos;s response, the AI is now asking Jaythan a final set of clarifying questions to ensure a complete picture.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                      Final Clarification (Jaythan&apos;s View)
                    </h2>
                    <p className="text-muted-foreground">
                      In the full product, Jaythan would receive these questions. For the demo, you can see the process.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block font-medium text-foreground">
                        Joe mentioned tenure and program leadership milestones - were you aware of these before raising the concern?
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

                  {/* ── Consensus reached ── */}
                  {postVerdictState === "consensus" && selectedVerdict && (
                    <div className="space-y-6">
                      <div className="bg-primary/5 border border-primary/30 rounded-xl p-6 text-center space-y-2">
                        <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
                        <h3 className="font-serif text-xl font-semibold text-foreground">Case Resolved ✓</h3>
                        <p className="text-muted-foreground text-sm">Both parties accepted <strong>Outcome {selectedVerdict}</strong>. The case is now closed.</p>
                      </div>
                      <div className="bg-secondary rounded-xl border border-border p-6 space-y-4">
                        <h4 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
                          <Leaf className="h-5 w-5 text-primary" />
                          The &quot;Repair&quot; Package
                        </h4>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div className="bg-card rounded-lg p-4">
                            <h5 className="font-medium text-foreground text-sm mb-2">Reasoning Breakdown</h5>
                            <p className="text-xs text-muted-foreground">
                              {selectedVerdict === "A" && "Current workload data indicates Jaythan is performing duties typically assigned to the Associate track."}
                              {selectedVerdict === "B" && "Joe brings tenure and institutional continuity, while Jaythan has strong current output momentum."}
                              {selectedVerdict === "C" && "Joe's role includes critical administrative and historical responsibilities that are less visible day-to-day."}
                            </p>
                          </div>
                          <div className="bg-card rounded-lg p-4">
                            <h5 className="font-medium text-foreground text-sm mb-2">Suggested Actions</h5>
                            <p className="text-xs text-muted-foreground">
                              {selectedVerdict === "A" && "Mindy initiates a compensation review and outlines a bridge path toward the next Associate opening."}
                              {selectedVerdict === "B" && "Create a shared department initiative where Joe mentors Jaythan on promotion criteria for the next cycle."}
                              {selectedVerdict === "C" && "Joe retains the role while Mindy provides Jaythan a transparent promotion roadmap with measurable milestones."}
                            </p>
                          </div>
                          <div className="bg-card rounded-lg p-4">
                            <h5 className="font-medium text-foreground text-sm mb-2">Communication Script</h5>
                            <p className="text-xs text-muted-foreground italic">
                              &quot;Joe, I value our work in Mindy&apos;s department. I&apos;ve been feeling frustrated about my growth path, and I&apos;d like to talk through the Middle Ground suggestion so we can both succeed.&quot;
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setSelectedPersona(null)}>
                          Complete Demo
                          <CheckCircle2 className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* ── Deadlock ── */}
                  {postVerdictState === "deadlock" && (
                    <div className="space-y-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center space-y-2">
                        <AlertTriangle className="h-10 w-10 text-yellow-600 mx-auto" />
                        <h3 className="font-serif text-xl font-semibold text-foreground">Deadlock Reached</h3>
                        <p className="text-muted-foreground text-sm">Neither party accepted a shared outcome. Choose how to proceed.</p>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => { setPostVerdictState("regenerating"); setSelectedVerdict(null); simulateAnalysis() }}
                          className="bg-card rounded-xl border-2 border-border hover:border-primary/40 p-6 text-left transition-all space-y-2"
                        >
                          <RefreshCw className="h-6 w-6 text-primary" />
                          <h4 className="font-medium text-foreground">Regenerate Solutions</h4>
                          <p className="text-sm text-muted-foreground">Ask the AI to produce a new set of resolution options based on the full context.</p>
                        </button>
                        <button
                          onClick={() => { setPostVerdictState("escalated"); setBobView("full-disclosure") }}
                          className="bg-card rounded-xl border-2 border-border hover:border-red-300 p-6 text-left transition-all space-y-2"
                        >
                          <AlertTriangle className="h-6 w-6 text-red-500" />
                          <h4 className="font-medium text-foreground">Escalate to HR</h4>
                          <p className="text-sm text-muted-foreground">Initiate the Mindy Protocol — program leadership receives full disclosure to mediate directly.</p>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Escalated / Mindy Protocol ── */}
                  {postVerdictState === "escalated" && (
                    <div className="space-y-6">
                      <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-3">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="font-semibold">Mindy Protocol Initiated</span>
                        </div>
                        <p className="text-sm text-red-700">
                          The case has been escalated to program leadership. Mindy now has <strong>Full Disclosure</strong> access — all identities and responses are visible to facilitate direct mediation.
                        </p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg border border-border p-4 text-sm text-muted-foreground">
                        Switch to <strong>Mindy (Program Leader)</strong> in the demo to see the Full Disclosure view.
                      </div>
                      <div className="flex justify-center">
                        <Button variant="outline" onClick={() => setSelectedPersona(null)}>
                          Switch to Mindy&apos;s View
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* ── Card selection (default + after regenerate) ── */}
                  {(postVerdictState === "selecting" || postVerdictState === "regenerating") && (
                    <>
                      {postVerdictState === "regenerating" && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 text-sm text-muted-foreground text-center">
                          <RefreshCw className="h-4 w-4 inline mr-1" />
                          New solution set generated based on full context.
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground text-center">
                        <span className="font-medium text-foreground">Demo:</span> You are in Jaythan&apos;s view. Accept an outcome — Joe&apos;s response will be simulated.
                      </p>

                      {/* G1: 3-column grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {/* Outcome A */}
                        <div className={`relative bg-card rounded-xl border-2 p-5 transition-all flex flex-col gap-4 ${
                          verdictSelections.karen === "A" ? "border-primary shadow-lg" : "border-border"
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="font-serif font-bold text-primary text-sm">A</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-serif text-base font-semibold text-foreground mb-1">Logic Favors Jaythan</h3>
                              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                                Workload and impact records suggest Jaythan is already operating at an Associate level while still on an adjunct contract.
                              </p>
                              <div className="text-xs text-primary font-medium">Suggested: salary adjustment and bridge role toward Associate</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className={verdictSelections.karen === "A" ? "bg-primary text-primary-foreground w-full" : "w-full"}
                            variant={verdictSelections.karen === "A" ? "default" : "outline"}
                            onClick={() => {
                              setVerdictSelections({ karen: "A", blake: "B" })
                              setSelectedVerdict("A")
                              setTimeout(() => setPostVerdictState("deadlock"), 1200)
                            }}
                            disabled={!!verdictSelections.karen}
                          >
                            {verdictSelections.karen === "A" ? <><CheckCircle2 className="h-4 w-4 mr-1" />Accepted</> : "Accept Outcome A"}
                          </Button>
                        </div>

                        {/* Outcome B */}
                        <div className={`relative bg-card rounded-xl border-2 p-5 transition-all flex flex-col gap-4 ${
                          verdictSelections.karen === "B" ? "border-primary shadow-lg" : "border-border"
                        }`}>
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                            Recommended
                          </div>
                          <div className="flex items-start gap-3 mt-1">
                            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                              <Scale className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-serif text-base font-semibold text-foreground mb-1">The Middle Ground</h3>
                              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                                Both professors are key to the degree program: Joe contributes tenure-based stability while Jaythan drives current output momentum.
                              </p>
                              <div className="text-xs text-primary font-medium">Suggested: shared initiative + mentorship toward next promotion cycle</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className={verdictSelections.karen === "B" ? "bg-primary text-primary-foreground w-full" : "w-full"}
                            variant={verdictSelections.karen === "B" ? "default" : "outline"}
                            onClick={() => {
                              setVerdictSelections({ karen: "B", blake: "B" })
                              setSelectedVerdict("B")
                              setTimeout(() => setPostVerdictState("consensus"), 1200)
                            }}
                            disabled={!!verdictSelections.karen}
                          >
                            {verdictSelections.karen === "B" ? <><CheckCircle2 className="h-4 w-4 mr-1" />Accepted</> : "Accept Outcome B"}
                          </Button>
                        </div>

                        {/* Outcome C */}
                        <div className={`relative bg-card rounded-xl border-2 p-5 transition-all flex flex-col gap-4 ${
                          verdictSelections.karen === "C" ? "border-primary shadow-lg" : "border-border"
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="font-serif font-bold text-primary text-sm">C</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-serif text-base font-semibold text-foreground mb-1">Logic Favors Joe</h3>
                              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                                Joe&apos;s tenure-linked responsibilities and institutional tasks justify the current role decision under existing program criteria.
                              </p>
                              <div className="text-xs text-primary font-medium">Suggested: transparent promotion metrics for Jaythan</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className={verdictSelections.karen === "C" ? "bg-primary text-primary-foreground w-full" : "w-full"}
                            variant={verdictSelections.karen === "C" ? "default" : "outline"}
                            onClick={() => {
                              setVerdictSelections({ karen: "C", blake: "B" })
                              setSelectedVerdict("C")
                              setTimeout(() => setPostVerdictState("deadlock"), 1200)
                            }}
                            disabled={!!verdictSelections.karen}
                          >
                            {verdictSelections.karen === "C" ? <><CheckCircle2 className="h-4 w-4 mr-1" />Accepted</> : "Accept Outcome C"}
                          </Button>
                        </div>
                      </div>

                      {/* Reject All → Deadlock */}
                      {!verdictSelections.karen && (
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => setPostVerdictState("deadlock")}
                          >
                            Reject All Options
                          </Button>
                        </div>
                      )}

                      {/* Waiting for Blake simulation */}
                      {verdictSelections.karen && postVerdictState === "selecting" && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-pulse">
                          <RefreshCw className="h-4 w-4" />
                          Waiting for Joe&apos;s response…
                        </div>
                      )}
                    </>
                  )}
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
                Mindy (Program Leader)
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
                  Program Oversight Dashboard
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
                      <Badge variant="secondary">Promotion Eligibility</Badge>
                      <Badge variant="secondary">Salary Alignment</Badge>
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

              {/* H1: Company Policies */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-medium text-foreground">Company Policies</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      These policies are used by the AI when generating resolutions to ensure they align with your organisation&apos;s guidelines.
                    </p>
                  </div>
                  {policySaved && (
                    <span className="text-xs text-primary font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Saved
                    </span>
                  )}
                </div>

                <Textarea
                  placeholder="Paste your company policies here — promotion criteria, compensation guidelines, and escalation procedures…"
                  className="min-h-[120px] resize-none bg-background"
                  value={companyPolicy}
                  onChange={(e) => { setCompanyPolicy(e.target.value); setPolicySaved(false) }}
                />

                {/* Policy file upload */}
                <input
                  ref={policyFileRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) { setPolicyFile(f); setPolicySaved(false) }
                  }}
                />
                {policyFile ? (
                  <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm text-foreground flex-1 truncate">{policyFile.name}</span>
                    <button
                      onClick={() => { setPolicyFile(null); if (policyFileRef.current) policyFileRef.current.value = "" }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => policyFileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg px-4 py-3 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
                  >
                    <Upload className="h-4 w-4" />
                    Upload a policy document (PDF or Word — optional)
                  </button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPolicySaved(true)}
                  disabled={!companyPolicy && !policyFile}
                >
                  Save Policies
                </Button>
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

              {/* J1: Full Disclosure banner when Mindy Protocol is active */}
              {bobView === "full-disclosure" && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">Full Disclosure Mode — Mindy Protocol Active</p>
                    <p className="text-sm text-red-700 mt-0.5">All identities and responses are now visible to facilitate direct HR mediation.</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                    Case #2024-0847
                  </h2>
                  <p className="text-muted-foreground">Marketing Department</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Awaiting Response</Badge>
              </div>

              {/* I1: Timeline at first fold */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="font-medium text-foreground">Case Timeline</h3>
                <div className="space-y-4">
                  {[
                    { label: "Case Initiated", time: "Today, 9:42 AM", color: "bg-primary", done: true },
                    { label: "Tone Analysis Complete", time: "Today, 9:43 AM", color: "bg-primary", done: true },
                    { label: "Party A Consent Given", time: "Today, 9:45 AM", color: "bg-primary", done: true },
                    { label: "Notification Sent to Party B", time: "Today, 9:45 AM — Awaiting response", color: "bg-yellow-500", done: false },
                  ].map((event, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${event.color} shrink-0 mt-0.5`} />
                        {i < 3 && <div className="w-px flex-1 bg-border mt-1 mb-0 h-6" />}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${event.done ? "text-foreground" : "text-muted-foreground"}`}>{event.label}</div>
                        <div className="text-xs text-muted-foreground">{event.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Summary */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h4 className="font-medium text-foreground">AI Summary (De-escalated)</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A concern has been raised regarding promotion eligibility and salary alignment. Party A believes
                  current workload and contribution levels are not reflected in title or compensation. The case
                  involves questions about role criteria, work distribution, and growth pathways.
                </p>
                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-foreground mb-2 text-sm">Tone Analysis</h4>
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

              {/* I2: Anonymized view at bottom / J1: Full Disclosure replaces it */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  {bobView === "full-disclosure"
                    ? <span className="text-red-600">Full Disclosure — Mindy Protocol Active</span>
                    : <span className="text-muted-foreground">Anonymized View — Identities Protected</span>
                  }
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Party A */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">
                      {bobView === "full-disclosure" ? "Jaythan (Initiator)" : "Party A (Initiator)"}
                    </h4>
                    {bobView === "full-disclosure" ? (
                      <div className="bg-secondary/50 rounded-lg p-4 space-y-1">
                        <p className="text-sm text-foreground leading-relaxed">
                          I believe my current workload and outcomes align with Associate expectations, but my title and salary do not reflect that level of contribution.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4 blur-sm" />
                          <div className="h-4 bg-muted rounded w-full blur-sm" />
                          <div className="h-4 bg-muted rounded w-5/6 blur-sm" />
                        </div>
                        <p className="text-xs text-muted-foreground">Raw input blurred for privacy</p>
                      </>
                    )}
                  </div>

                  {/* Party B */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">
                      {bobView === "full-disclosure" ? "Joe (Responder)" : "Party B (Responder)"}
                    </h4>
                    {bobView === "full-disclosure" ? (
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <p className="text-sm text-foreground leading-relaxed">
                          I understand the frustration, but my role reflects years of tenure and department leadership responsibilities that are not always visible in day-to-day teaching output.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-center h-24">
                        <span className="text-sm text-muted-foreground">Awaiting response...</span>
                      </div>
                    )}
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
