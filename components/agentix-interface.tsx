"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sparkles, Brain, Zap, Target, Users, TrendingUp } from "lucide-react"

const mockResponses = [
  { response: "Response from GPT-4" },
  { response: "Response from Gemini" },
  { response: "Response from Claude" },
  { response: "Response from Grok" },
]

const mockVotes = [
  { voter: "GPT-4", votedFor: "GPT-4", reasoning: "Best response" },
  { voter: "Gemini", votedFor: "GPT-4", reasoning: "Best response" },
  { voter: "Claude", votedFor: "GPT-4", reasoning: "Best response" },
  { voter: "Grok", votedFor: "GPT-4", reasoning: "Best response" },
]

export function AgentixInterface() {
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
  const agents = [
    { name: "GPT-4", icon: Brain, color: "from-cyan-500 to-blue-600" },
    { name: "Gemini", icon: Sparkles, color: "from-purple-500 to-pink-600" },
    { name: "Claude", icon: Zap, color: "from-orange-500 to-red-600" },
    { name: "Grok", icon: Target, color: "from-green-500 to-emerald-600" },
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
          agent: agents[i].name,
          response: mockResponses[i].response,
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
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"
        animate={{
          backgroundPosition: ["0px 0px", "50px 50px"],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 border-b border-gray-800/50 backdrop-blur-sm bg-gray-900/80"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white">Agentics</h1>
            </motion.div>
            <div className="flex items-center space-x-8">
              {["Dashboard", "Agents", "Analytics", "Settings"].map((item, idx) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium relative"
                  whileHover={{
                    scale: 1.05,
                    color: "#10b981",
                  }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  {item}
                  <motion.div
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer relative"
                whileHover={{ scale: 1.1 }}
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(168, 85, 247, 0.4)",
                    "0 0 0 10px rgba(168, 85, 247, 0)",
                    "0 0 0 0 rgba(168, 85, 247, 0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <span className="text-white font-bold text-sm">AI</span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 container mx-auto px-6 py-20 text-center"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: [0, -5, 0],
            }}
            transition={{
              delay: 0.1,
              y: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Zap className="w-4 h-4 text-green-400" />
            </motion.div>
            <span className="text-green-400 text-sm font-medium">Next-Gen Multi-Agent AI System</span>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <motion.h1
              className="text-7xl font-bold text-white leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
            >
              {"Transform Ideas Into".split(" ").map((word, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="inline-block mr-4"
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>
            <motion.h1
              className="text-7xl font-bold bg-gradient-to-r from-cyan-400 via-green-400 to-purple-500 bg-clip-text text-transparent relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <motion.span
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{
                  background: "linear-gradient(90deg, #22d3ee, #10b981, #a855f7, #22d3ee)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Intelligence
              </motion.span>
            </motion.h1>
          </motion.div>

          <motion.p
            className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Experience the future of business analysis with our revolutionary multi-agent AI collaboration system. Watch
            specialized AI agents work in perfect harmony to deliver unprecedented insights.
          </motion.p>
        </motion.div>
      </motion.section>

      <motion.section
        id="features"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="container mx-auto px-6 py-16"
      >
        <motion.h2
          className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
        >
          Advanced AI Capabilities
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Brain, title: "Multi-Agent Intelligence", desc: "Four specialized AI models working in harmony" },
            { icon: Users, title: "Collaborative Voting", desc: "Democratic decision-making through AI consensus" },
            {
              icon: TrendingUp,
              title: "Actionable Insights",
              desc: "Transform data into strategic business decisions",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.2 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="glass-card p-6 rounded-2xl neon-border hover:shadow-2xl transition-all duration-300"
            >
              <feature.icon className="w-12 h-12 text-primary mb-4 animate-float" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        id="analysis"
        className="relative z-10 container mx-auto px-6 py-16 space-y-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          animate={{
            boxShadow: [
              "0 0 20px rgba(34, 197, 94, 0.1)",
              "0 0 30px rgba(34, 197, 94, 0.2)",
              "0 0 20px rgba(34, 197, 94, 0.1)",
            ],
          }}
          transition={{
            boxShadow: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
          className="backdrop-blur-sm bg-gray-800/50 border border-gray-700/50 p-8 rounded-2xl"
        >
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              AI Text Consultant Analysis
            </CardTitle>
            <CardDescription className="text-lg text-gray-400">
              Enter the question below to witness our multi-agent AI system in action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div className="space-y-4" initial={{ scale: 0.95 }} whileInView={{ scale: 1 }}>
              <Input
                placeholder="Enter the analysis question here..."
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                disabled={isRunning}
                className="bg-gray-900/50 border-gray-600/50 text-white placeholder-gray-500 text-lg py-4 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
              />
              <p className="text-sm text-gray-500 text-center">Required question: "{targetQuestion}"</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-lg"
            >
              <Button
                onClick={handleStartAnalysis}
                disabled={isRunning || !userQuestion.trim()}
                className="w-full py-4 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                {isRunning ? "Agents Collaborating..." : "Start AI Text Consultants Analysis"}
              </Button>
            </motion.div>

            <div className="flex gap-3 flex-wrap justify-center">
              <AnimatePresence>
                {agents.map((agent, idx) => (
                  <motion.div
                    key={agent.name}
                    initial={{ scale: 0, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{
                      delay: idx * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                    whileHover={{
                      scale: 1.1,
                      y: -5,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                    }}
                  >
                    <Badge
                      className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                        currentStep > idx
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                          : currentStep === idx + 1
                            ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white animate-pulse"
                            : "bg-card text-muted-foreground border-border"
                      }`}
                    >
                      <motion.div
                        animate={currentStep === idx + 1 ? { rotate: 360 } : {}}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <agent.icon className="w-4 h-4 mr-2" />
                      </motion.div>
                      {agent.name} {currentStep > idx ? "✓" : currentStep === idx + 1 ? "🤔" : "⏳"}
                    </Badge>
                  </motion.div>
                ))}
                {votingPhase && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 animate-pulse">
                      🗳️ Voting Phase
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </motion.div>

        <AnimatePresence>
          {agentResponses.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Agent Responses
              </h3>
              {agentResponses.map((response, idx) => {
                const agent = agents.find((a) => a.name === response.agent)!
                return (
                  <motion.div
                    key={idx}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.2 }}
                    className="glass-card p-6 rounded-2xl neon-border hover:shadow-2xl transition-all duration-300"
                  >
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-r ${agent.color} flex items-center justify-center`}
                        >
                          <agent.icon className="w-5 h-5 text-white" />
                        </div>
                        {response.agent}
                        <Badge
                          className={
                            response.status === "completed"
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                              : "bg-gradient-to-r from-yellow-500 to-orange-600 text-white animate-pulse"
                          }
                        >
                          {response.status === "completed" ? "✓ Complete" : "🤔 Thinking..."}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground/90 leading-relaxed">{response.response}</p>
                    </CardContent>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {votes.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
                🗳️ Agent Voting
              </h3>
              {votes.map((vote, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.2 }}
                  className="glass-card p-6 rounded-2xl border-purple-500/30 hover:shadow-2xl transition-all duration-300"
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-purple-300">
                      {vote.voter} votes for {vote.votedFor}
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">Vote Cast</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/80 leading-relaxed italic">"{vote.reasoning}"</p>
                  </CardContent>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {votingResults && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card p-8 rounded-2xl border-yellow-500/30 neon-border"
            >
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-3xl bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  🏆 Voting Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-center text-yellow-300">
                  Winner: {votingResults.winner} ({votingResults.breakdown[votingResults.winner]} votes)
                </div>
                <div className="text-center text-muted-foreground">
                  Vote Breakdown:
                  {Object.entries(votingResults.breakdown).map(([agent, count]) => (
                    <div key={agent} className="text-lg">
                      • {agent}: {count} vote{count !== 1 ? "s" : ""}
                    </div>
                  ))}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {finalAnswer && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card p-8 rounded-2xl border-green-500/30 neon-border"
            >
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-3xl bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  🎯 Final Consensus Answer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none text-foreground/90">
                  {finalAnswer.split("\n").map((line, idx) => (
                    <p
                      key={idx}
                      className={line.startsWith("**") ? "font-bold text-green-300 text-lg" : "leading-relaxed"}
                    >
                      {line.replace(/\*\*/g, "")}
                    </p>
                  ))}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="glass-card border-t border-gray-800/50 mt-20"
      >
        <div className="container mx-auto px-6 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <motion.div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center animate-pulse-glow">
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Agentics
              </h3>
            </div>
            <p className="text-muted-foreground">Powered by advanced multi-agent AI collaboration technology</p>
            <div className="flex justify-center space-x-6 pt-4">
              {[Brain, Users, TrendingUp].map((Icon, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center cursor-pointer"
                >
                  <Icon className="w-5 h-5 text-primary" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
