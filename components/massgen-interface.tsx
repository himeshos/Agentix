"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export function MassGenInterface() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [agentResponses, setAgentResponses] = useState<Array<{ agent: string; response: string; status: string }>>([])
  const [votingPhase, setVotingPhase] = useState(false)
  const [votes, setVotes] = useState<Array<{ voter: string; votedFor: string; reasoning: string }>>([])
  const [votingResults, setVotingResults] = useState<{
    winner: string
    totalVotes: number
    breakdown: Record<string, number>
  } | null>(null)
  const [finalAnswer, setFinalAnswer] = useState("")
  const [userQuestion, setUserQuestion] = useState("")

  const targetQuestion = "How can AI Text Consultants generate actionable insights from customer reviews and surveys?"
  const agents = ["GPT-4", "Gemini", "Claude", "Grok"]

  const mockResponses = [
    {
      agent: "GPT-4",
      response:
        "AI Text Consultants can generate actionable insights through: 1) Sentiment Analysis - categorizing feedback as positive, negative, or neutral with confidence scores. 2) Topic Modeling - identifying key themes using techniques like LDA or BERT embeddings. 3) Entity Recognition - extracting specific products, features, or pain points mentioned. 4) Trend Analysis - tracking sentiment changes over time and identifying emerging issues. 5) Automated Reporting - creating executive dashboards with prioritized recommendations and ROI impact estimates.",
      status: "completed",
    },
    {
      agent: "Gemini",
      response:
        "AI Text Consultants leverage NLP to transform unstructured feedback into strategic insights: • Advanced preprocessing (cleaning, normalization, tokenization) • Multi-dimensional analysis (emotion detection, urgency scoring, customer journey mapping) • Pattern recognition for recurring complaints or praise • Competitive benchmarking through comparative sentiment analysis • Predictive modeling to forecast customer churn or satisfaction trends • Integration with CRM systems for personalized follow-up actions.",
      status: "completed",
    },
    {
      agent: "Claude",
      response:
        "Effective AI Text Consultant strategies include: **Data Processing**: Text cleaning, language detection, and spam filtering. **Semantic Analysis**: Understanding context, sarcasm, and implicit feedback using transformer models. **Insight Generation**: Creating actionable recommendations like product improvements, service gaps, and customer segmentation. **Visualization**: Heat maps of sentiment by product line, word clouds of frequent issues, and timeline analysis. **Integration**: Connecting insights to business metrics and KPIs for measurable impact.",
      status: "completed",
    },
    {
      agent: "Grok",
      response:
        "AI Text Consultants are like digital detectives for customer feedback! They use: 🔍 Smart parsing to find hidden gems in messy text data 📊 Sentiment scoring that goes beyond simple positive/negative (detecting frustration, excitement, confusion) 🎯 Root cause analysis linking complaints to specific business processes 🚀 Real-time alerts for urgent issues or viral complaints 💡 Recommendation engines suggesting specific actions with priority scores. The key is turning 'customers are unhappy' into 'fix checkout process - 23% conversion boost expected'!",
      status: "completed",
    },
  ]

  const mockVotes = [
    {
      voter: "GPT-4",
      votedFor: "Claude",
      reasoning:
        "Claude provided the most structured and comprehensive framework with clear categorization of analysis types and business integration focus.",
    },
    {
      voter: "Gemini",
      votedFor: "Claude",
      reasoning:
        "Claude's answer effectively balanced technical depth with practical business applications, making it highly actionable for consultants.",
    },
    {
      voter: "Claude",
      votedFor: "Gemini",
      reasoning:
        "Gemini offered excellent technical depth with advanced NLP concepts and strong emphasis on predictive capabilities and system integration.",
    },
    {
      voter: "Grok",
      votedFor: "Claude",
      reasoning:
        "While I love my creative analogies, Claude delivered the most professional and implementable strategy for AI Text Consultants.",
    },
  ]

  const handleStartAnalysis = async () => {
    if (userQuestion.trim() !== targetQuestion) {
      alert(`Please enter the exact question: "${targetQuestion}"`)
      return
    }

    setIsRunning(true)
    setCurrentStep(0)
    setAgentResponses([])
    setVotingPhase(false)
    setVotes([])
    setVotingResults(null)
    setFinalAnswer("")

    for (let i = 0; i < agents.length; i++) {
      setCurrentStep(i + 1)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setAgentResponses((prev) => [
        ...prev,
        {
          ...mockResponses[i],
          status: "thinking",
        },
      ])

      await new Promise((resolve) => setTimeout(resolve, 1500))

      setAgentResponses((prev) => prev.map((resp, idx) => (idx === i ? { ...resp, status: "completed" } : resp)))
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
    setVotingPhase(true)

    for (let i = 0; i < agents.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setVotes((prev) => [...prev, mockVotes[i]])
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
    const voteCount: Record<string, number> = {}
    mockVotes.forEach((vote) => {
      voteCount[vote.votedFor] = (voteCount[vote.votedFor] || 0) + 1
    })

    const winner = Object.entries(voteCount).reduce((a, b) => (voteCount[a[0]] > voteCount[b[0]] ? a : b))[0]
    setVotingResults({
      winner,
      totalVotes: mockVotes.length,
      breakdown: voteCount,
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
    setFinalAnswer(`**CONSENSUS ANSWER (Winner: ${winner}):**

AI Text Consultants can generate actionable insights from customer reviews and surveys through a comprehensive multi-stage approach:

**1. Data Processing & Preparation:**
- Text cleaning, normalization, and spam filtering
- Language detection and preprocessing
- Structured data extraction from unstructured feedback

**2. Advanced NLP Analysis:**
- Sentiment analysis with confidence scoring and emotion detection
- Topic modeling using LDA or transformer-based approaches
- Named entity recognition for products, features, and pain points
- Context understanding including sarcasm and implicit feedback

**3. Insight Generation:**
- Pattern recognition for recurring themes and issues
- Trend analysis tracking sentiment changes over time
- Root cause analysis linking feedback to business processes
- Competitive benchmarking and comparative analysis

**4. Actionable Recommendations:**
- Prioritized improvement suggestions with ROI estimates
- Customer segmentation based on feedback patterns
- Predictive modeling for churn risk and satisfaction trends
- Real-time alerts for urgent issues requiring immediate attention

**5. Business Integration:**
- Executive dashboards with KPI connections
- CRM integration for personalized follow-up actions
- Automated reporting with measurable impact metrics
- Visualization tools including heat maps and timeline analysis

**Key Success Factor:** Transform vague feedback like 'customers are unhappy' into specific, measurable actions like 'optimize checkout process for 23% conversion improvement.'

All agents reached consensus on this comprehensive framework, with ${winner} receiving the most votes for the best explanation.`)

    setVotingPhase(false)
    setIsRunning(false)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">🚀 MassGen</h1>
        <p className="text-muted-foreground">Multi-Agent AI Collaboration with Voting - AI Text Consultants Analysis</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Analysis Question</CardTitle>
          <CardDescription>
            Enter this exact question to see 4 AI agents collaborate: "{targetQuestion}"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter the analysis question here..."
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              disabled={isRunning}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleStartAnalysis} disabled={isRunning || !userQuestion.trim()} className="flex-1">
              {isRunning ? "Agents Collaborating..." : "Start AI Text Consultants Analysis"}
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {agents.map((agent, idx) => (
              <Badge
                key={agent}
                variant={currentStep > idx ? "default" : currentStep === idx + 1 ? "secondary" : "outline"}
              >
                {agent} {currentStep > idx ? "✓" : currentStep === idx + 1 ? "🤔" : "⏳"}
              </Badge>
            ))}
            {votingPhase && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                🗳️ Voting Phase
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h3 className="text-xl font-semibold">Agent Responses</h3>
        {agentResponses.map((response, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {response.agent}
                <Badge variant={response.status === "completed" ? "default" : "secondary"}>
                  {response.status === "completed" ? "✓ Complete" : "🤔 Thinking..."}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{response.response}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {votes.length > 0 && (
        <div className="grid gap-4">
          <h3 className="text-xl font-semibold">🗳️ Agent Voting</h3>
          {votes.map((vote, idx) => (
            <Card key={idx} className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {vote.voter} votes for {vote.votedFor}
                  <Badge variant="outline" className="bg-blue-50">
                    Vote Cast
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed italic">"{vote.reasoning}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {votingResults && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-800">🏆 Voting Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-lg font-semibold text-purple-900">
                Winner: {votingResults.winner} ({votingResults.breakdown[votingResults.winner]} votes)
              </div>
              <div className="text-sm text-purple-700">
                Vote Breakdown:
                {Object.entries(votingResults.breakdown).map(([agent, count]) => (
                  <div key={agent} className="ml-4">
                    • {agent}: {count} vote{count !== 1 ? "s" : ""}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {finalAnswer && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">🎯 Final Consensus Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {finalAnswer.split("\n").map((line, idx) => (
                <p key={idx} className={line.startsWith("**") ? "font-semibold text-green-900" : "text-green-800"}>
                  {line.replace(/\*\*/g, "")}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
