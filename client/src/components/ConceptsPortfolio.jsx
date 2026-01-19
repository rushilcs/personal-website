import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Users, Code, AlertTriangle, TrendingUp, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { fastScrollTo } from '../lib/utils';

// ML Projects as Model Cards
const mlProjects = [
  {
    id: 1,
    title: "AI-Driven Code Generation Framework",
    company: "BILL",
    problemClass: "Code generation and evaluation at scale",
    concepts: ["Prompt Engineering", "AST Analysis", "Code Evaluation Metrics", "Multi-model Pipeline"],
    tradeoffs: {
      pm: "Balanced development speed (45-55% faster) with code quality. Trade-off between fully automated generation and human review cycles.",
      ml: "Speed vs. correctness: used GumTree AST-edit diffs + cosine similarity for evaluation, but structural similarity doesn't guarantee functional correctness. Multi-model ensemble increases latency but improves scaffold quality."
    },
    failureCases: {
      pm: "Generated code may miss edge cases specific to certain ERP systems. Requires domain expert review for complex integrations.",
      ml: "Novel ERP patterns not seen in training fail. AST-based evaluation misses semantic correctness issues. Long-tail ERP variants produce low-confidence scaffolds requiring manual intervention."
    },
    scaleChanges: {
      pm: "Add feedback loops from production deployments. Build a confidence scoring system to prioritize human review. Integrate unit test generation to catch functional issues early.",
      ml: "Implement retrieval-augmented generation (RAG) over ERP-specific documentation. Add fine-tuning data from production failures. Replace AST metrics with learned code embeddings (CodeBERT). Add active learning loop for continuous improvement."
    },
    infra: ["AWS ECS", "CLI Automation", "CI/CD Integration"],
    evaluation: "AST-edit diffs, action-weighted structural scoring, cosine-similarity boosts"
  },
  {
    id: 2,
    title: "Error Message Clustering System",
    company: "BILL",
    problemClass: "Unsupervised clustering for error taxonomy construction",
    concepts: ["Unsupervised Learning", "Semantic Similarity", "Continuous Learning", "Production ML Systems"],
    tradeoffs: {
      pm: "Achieved 99%+ accuracy with 50% cost reduction, but initial clustering requires domain expert validation. Balance between automated grouping and semantic correctness.",
      ml: "Boosted cosine similarity with heuristics beats pure LLM-based clustering (30% efficiency gain), but hybrid approach is more complex. Continuous update pipeline prevents staleness but introduces latency in error taxonomy updates."
    },
    failureCases: {
      pm: "Edge cases with ambiguous error messages may be misclassified. New error patterns need time to be recognized.",
      ml: "Sparse error messages with few tokens get low similarity scores. Domain-specific jargon doesn't align with generic embeddings. Concept drift in error patterns over time requires periodic retraining."
    },
    scaleChanges: {
      pm: "Add feedback mechanisms for users to flag misclassifications. Build a dashboard for monitoring cluster quality over time. Create alerts for novel error patterns.",
      ml: "Fine-tune embeddings on error message domain. Implement hierarchical clustering for multi-level taxonomy. Add concept drift detection and automatic retraining triggers. Use active learning to prioritize human labeling effort."
    },
    infra: ["AWS EC2/ECS", "Real-time Inference", "SQL Analytics"],
    evaluation: "99%+ classification accuracy, 30% higher clustering efficiency vs. baseline, 50% cost reduction"
  },
  {
    id: 3,
    title: "Wearable-Sensor LLMs",
    company: "Systems Energy and Efficiency Lab (SEELab)",
    problemClass: "Multimodal temporal reasoning for sensor understanding",
    concepts: ["Compositional Attention", "Temporal Modeling", "RAG Systems", "Dataset Curation"],
    tradeoffs: {
      pm: "Research demonstrates improved temporal reasoning, but model complexity increases computational requirements. Trade-off between accuracy and inference cost.",
      ml: "Compositional Attention improves temporal reasoning vs. standard transformers, but increases model size and training time. RAG for answer generation improves coverage but introduces retrieval latency. BERT embeddings for clustering more reliable than GPT, but less semantically rich."
    },
    failureCases: {
      pm: "Models may struggle with rare sensor combinations or unusual user behaviors. Dataset bias toward common patterns.",
      ml: "Long-range temporal dependencies degrade performance. Sensor noise and missing modalities break assumptions. Compositional Attention fails on sequences with irregular sampling rates. RAG retrieval misses relevant context for rare query types."
    },
    scaleChanges: {
      pm: "Expand dataset diversity for edge cases. Build robust fallback mechanisms for rare scenarios. Create user feedback loops for model improvement.",
      ml: "Implement hierarchical attention for multi-scale temporal patterns. Add modality-specific encoders with learned fusion. Use contrastive learning for better sensor representations. Replace RAG with fine-tuned instruction-following models for lower latency."
    },
    infra: ["PyTorch", "HuggingFace", "Amazon Mechanical Turk"],
    evaluation: "Benchmark validation across multiple LLMs, exact-match accuracy metrics, latent structure analysis"
  },
  {
    id: 4,
    title: "Computer Vision for Demographics",
    company: "PromoDrone",
    problemClass: "Real-time video analysis for demographic inference",
    concepts: ["Computer Vision", "CNN Architecture", "Cloud ML Services", "Production Deployment"],
    tradeoffs: {
      pm: "Commercially deployed system balances accuracy with privacy concerns. Trade-off between demographic granularity and inference speed for real-time drone applications.",
      ml: "Custom CNN trained from scratch provides control but requires large labeled dataset. Cloud Vision API integration adds latency but improves accuracy. Onboard inference vs. cloud processing trade-off for drone constraints."
    },
    failureCases: {
      pm: "Poor lighting conditions and unusual angles reduce accuracy. Privacy regulations limit data collection for model improvement.",
      ml: "Domain shift between training data and drone-captured video. Limited diversity in training set biases predictions. Real-time inference constraints limit model complexity. Edge cases (partial occlusions, distance) cause failures."
    },
    scaleChanges: {
      pm: "Implement privacy-preserving data collection. Add confidence thresholds to flag uncertain predictions. Build feedback mechanisms from user interactions.",
      ml: "Fine-tune on drone-specific video data. Implement test-time augmentation for robustness. Use ensemble of specialized models (close-range vs. long-range). Add temporal smoothing across video frames. Deploy edge-optimized models (TensorFlow Lite) for onboard inference."
    },
    infra: ["Google Cloud (Vertex AI, Vision API)", "Production Backend", "Real-time Pipeline"],
    evaluation: "Commercial deployment metrics, model accuracy validation"
  },
  {
    id: 5,
    title: "In-Context Learning Study",
    company: "UCSD Capstone",
    problemClass: "Understanding transformer in-context learning mechanisms",
    concepts: ["In-Context Learning", "Transformer Architecture", "Attention Mechanisms", "Ablation Studies"],
    tradeoffs: {
      pm: "Research provides insights into transformer capabilities, but findings are preliminary. Balance between controlled experiments and real-world applicability.",
      ml: "Single-layer transformer allows controlled analysis but may not capture full ICL mechanisms. Custom implementation enables architectural ablation but lacks production optimizations. Controlled task formatting enables systematic study but may not generalize to natural language tasks."
    },
    failureCases: {
      pm: "Research findings may not directly translate to production models. Limited scope of study may miss important factors.",
      ml: "ICL performance degrades with longer context windows. Task distribution shift breaks in-context adaptation. Architectural variants (depth, width) show inconsistent ICL emergence. Gradient descent during forward pass (implicit) may not explain all ICL behavior."
    },
    scaleChanges: {
      pm: "Validate findings on larger, more diverse datasets. Test implications for production model design.",
      ml: "Scale to multi-layer transformers with pre-training. Study ICL in vision and multimodal transformers. Investigate connection between ICL and meta-learning. Add theoretical analysis of ICL generalization bounds."
    },
    infra: ["PyTorch", "Custom Transformer Implementation", "Experimental Framework"],
    evaluation: "Architectural ablation studies, ICL behavior under controlled conditions"
  }
];

export const ConceptsPortfolio = () => {
  const [audience, setAudience] = useState('ml'); // 'pm' or 'ml'
  const [expandedCard, setExpandedCard] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevAudienceRef = useRef(audience);

  const toggleCard = (id) => {
    const wasExpanded = expandedCard === id;
    setExpandedCard(wasExpanded ? null : id);
    
    // If expanding (not collapsing), scroll to the card after expansion animation completes
    if (!wasExpanded) {
      setTimeout(() => {
        const anchorIdMap = {
          1: 'modelcard-codegen',
          2: 'modelcard-errorclustering',
          3: 'modelcard-wearable-sensor',
          4: 'modelcard-cv-demographics',
          5: 'modelcard-in-context-learning'
        };
        const anchorId = anchorIdMap[id];
        if (anchorId) {
          const element = document.querySelector(`#${anchorId}`);
          if (element) {
            // Account for navbar height (80px) plus some padding (20px)
            // We want the top border of the card to be visible right after the navbar
            const navbarHeight = 80;
            const padding = 20;
            const targetOffset = navbarHeight + padding;
            
            // Get the absolute position of the element
            const rect = element.getBoundingClientRect();
            const absoluteTop = rect.top + window.pageYOffset;
            
            // Calculate scroll position so card top is at targetOffset from viewport top
            const scrollY = absoluteTop - targetOffset;
            fastScrollTo(scrollY, 200); // Fast scroll with 200ms duration
          }
        }
      }, 300); // Wait for expansion animation to complete (300ms animation + small buffer)
    }
  };

  // Map model card IDs to work ledger company IDs
  const modelCardToWorkLedger = {
    1: 'bill', // Code Generation -> BILL
    2: 'bill', // Error Clustering -> BILL
    3: 'seelab', // Wearable Sensor -> SEELab
    4: 'promodrone', // CV Demographics -> PromoDrone
    5: 'ucsd-capstone' // In-Context Learning Study -> UCSD Capstone
  };

  const scrollToWorkLedger = (companyId) => {
    // Immediately stop any ongoing scrolls and calculate position
    const companyElement = document.querySelector(`#work-ledger-company-${companyId}`);
    if (!companyElement) return;
    
    // Calculate position immediately while element is stable
    const rect = companyElement.getBoundingClientRect();
    const absoluteTop = rect.top + (window.scrollY || window.pageYOffset);
    const yOffset = 100; // Navbar (80px) + padding (20px)
    const scrollY = absoluteTop - yOffset;
    
    // Start scroll immediately
    fastScrollTo(scrollY, 200);
    
    // Dispatch event to expand the company card with skipAutoScroll flag
    // This prevents the duplicate scroll from the expansion handler
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('expandWorkLedgerCompany', { 
        detail: { companyId, skipAutoScroll: true } 
      }));
    }, 250);
  };

  // Handle audience change animation
  useEffect(() => {
    if (prevAudienceRef.current !== audience) {
      // Only animate if all cards are closed
      if (expandedCard === null) {
        setIsAnimating(true);
        // Reset animation state after animation completes
        setTimeout(() => {
          setIsAnimating(false);
        }, 600); // 300ms fade out + 300ms fade in
      }
      prevAudienceRef.current = audience;
    }
  }, [audience, expandedCard]);

  useEffect(() => {
    const handleExpandCard = (event) => {
      const { cardId, skipAutoScroll } = event.detail;
      if (cardId) {
        setExpandedCard(cardId);
        
        // Only auto-scroll if the card was opened directly (not programmatically)
        // This prevents duplicate scrolls when opened via "View Design Choices" button
        if (!skipAutoScroll) {
          setTimeout(() => {
            const anchorIdMap = {
              1: 'modelcard-codegen',
              2: 'modelcard-errorclustering',
              3: 'modelcard-wearable-sensor',
              4: 'modelcard-cv-demographics',
              5: 'modelcard-in-context-learning'
            };
            const anchorId = anchorIdMap[cardId];
            if (anchorId) {
              const element = document.querySelector(`#${anchorId}`);
              if (element) {
                // Account for navbar height (80px) plus some padding (20px)
                // We want the top border of the card to be visible right after the navbar
                const navbarHeight = 80;
                const padding = 20;
                const targetOffset = navbarHeight + padding;
                
                // Get the absolute position of the element
                const rect = element.getBoundingClientRect();
                const absoluteTop = rect.top + window.pageYOffset;
                
                // Calculate scroll position so card top is at targetOffset from viewport top
                const scrollY = absoluteTop - targetOffset;
                fastScrollTo(scrollY, 200); // Fast scroll with 200ms duration
              }
            }
          }, 300); // Wait for expansion animation to complete (300ms animation + small buffer)
        }
      }
    };

    window.addEventListener('expandModelCard', handleExpandCard);
    return () => {
      window.removeEventListener('expandModelCard', handleExpandCard);
    };
  }, []);

  return (
    <section id="concepts-portfolio" className="min-h-screen px-4 sm:px-6 lg:px-8 py-20 sm:py-28 scroll-mt-20 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 text-foreground leading-tight">
            How I Design ML Systems
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg sm:text-xl text-foreground/80 mb-4">
              This format mirrors design docs and production ML reviews. Each project answers:
            </p>
            <div className="border border-border/50 bg-card/30 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-lg sm:text-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <span>(1) What problem class is this?</span>
                <span>(2) What concepts does it rely on?</span>
                <span>(3) What tradeoffs were unavoidable?</span>
                <span>(4) Where does it break?</span>
              </div>
            </div>
          </div>

          {/* ML Concepts Demonstrated */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 mt-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              My Priorities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { concept: "Concept Bottleneck Modeling", description: "Explicit concept-driven design" },
                { concept: "Audience-Conditioned Explanations", description: "Adaptive communication" },
                { concept: "Systems Trade-offs", description: "Infrastructure and model decisions" },
                { concept: "Failure Mode Analysis", description: "Where systems break" },
                { concept: "Evaluation at Scale", description: "Production metrics and offline validation" },
                { concept: "Continuous Learning", description: "Adaptive systems over time" }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 flex flex-col items-center justify-center text-center"
                >
                  <h3 className="font-semibold text-foreground mb-1">{item.concept}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Audience Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-4 mb-12 mt-8"
          >
            <span className="text-sm font-medium text-muted-foreground">Explain to:</span>
            <div className="flex gap-2 bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setAudience('ml')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
                  audience === 'ml'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:scale-105 transform'
                }`}
              >
                <Code className="w-4 h-4 inline mr-2" />
                ML Engineer
              </button>
              <button
                onClick={() => setAudience('pm')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
                  audience === 'pm'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:scale-105 transform'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Product Manager
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Model Cards */}
        <div className="space-y-6">
          {mlProjects.map((project, idx) => {
            // Map project IDs to anchor IDs
            const anchorIdMap = {
              1: 'modelcard-codegen',
              2: 'modelcard-errorclustering',
              3: 'modelcard-wearable-sensor',
              4: 'modelcard-cv-demographics',
              5: 'modelcard-in-context-learning'
            };
            const anchorId = anchorIdMap[project.id];
            
            return (
            <motion.div
              key={`${project.id}-${audience}`}
              id={anchorId}
              initial={{ opacity: 0, y: 30 }}
              animate={isAnimating && expandedCard === null ? { opacity: [1, 0, 1] } : { opacity: 1, y: 0 }}
              whileInView={!isAnimating || expandedCard !== null ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: !isAnimating || expandedCard !== null }}
              transition={isAnimating && expandedCard === null ? { duration: 0.6, times: [0, 0.5, 1], delay: idx * 0.05 } : { duration: 0.6, delay: idx * 0.1 }}
            >
              <div
                className={`rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300 ${
                  expandedCard === project.id 
                    ? 'border-primary/60 shadow-xl dark:shadow-[0_10px_50px_rgba(59,130,246,0.4)] dark:border-primary/80 dark:ring-2 dark:ring-primary/30' 
                    : 'border-border shadow-md hover:shadow-lg hover:-translate-y-1 dark:shadow-[0_4px_20px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_8px_30px_rgba(59,130,246,0.25)]'
                }`}
              >
                {/* Card Header */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => toggleCard(project.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                          {project.title}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
                          {project.company}
                        </span>
                      </div>
                      <p className="text-base text-muted-foreground mb-4">
                        <strong>Problem Class:</strong> {project.problemClass}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.concepts.map((concept, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 text-sm font-medium rounded-full bg-muted text-foreground"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedCard === project.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedCard === project.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-6 border-t border-border pt-6">
                        {/* Work Info Link */}
                        {modelCardToWorkLedger[project.id] && (
                          <div className="mb-4">
                            <button
                              onClick={() => scrollToWorkLedger(modelCardToWorkLedger[project.id])}
                              className="inline-flex items-center gap-2 text-base text-primary hover:text-primary/80 transition-colors"
                            >
                              See Work Info
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Trade-offs */}
                        <div>
                          <h4 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-primary" />
                            Trade-offs
                          </h4>
                          <p className="text-base text-foreground/80 leading-relaxed">
                            {project.tradeoffs[audience]}
                          </p>
                        </div>

                        {/* Failure Cases */}
                        <div>
                          <h4 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Failure Cases
                          </h4>
                          <p className="text-base text-foreground/80 leading-relaxed">
                            {project.failureCases[audience]}
                          </p>
                        </div>

                        {/* At Scale */}
                        <div>
                          <h4 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            What I'd Change at Scale
                          </h4>
                          <p className="text-base text-foreground/80 leading-relaxed">
                            {project.scaleChanges[audience]}
                          </p>
                        </div>

                        {/* Infrastructure */}
                        {project.infra && (
                          <div>
                            <h4 className="text-base font-semibold text-foreground mb-2">Infrastructure</h4>
                            <div className="flex flex-wrap gap-2">
                              {project.infra.map((item, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 text-sm font-medium rounded bg-muted/50 text-foreground"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Evaluation */}
                        {project.evaluation && (
                          <div>
                            <h4 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              Evaluation
                            </h4>
                            <p className="text-base text-foreground/80">{project.evaluation}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
