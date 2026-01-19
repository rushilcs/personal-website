export const workLedgerData = [
  {
    id: "bill",
    companyName: "BILL",
    orgTag: "BILL",
    roleTitle: "ML Engineering Intern",
    systems: [
      {
        id: "codegen",
        title: "AI-Driven Code Generation Framework",
        problemClass: "Generating production-ready code from natural-language specs",
        modelCardAnchor: "#modelcard-codegen",
        modelCardId: 1,
        workBullets: [
          "Designed an AI-driven code-generation framework",
          "Reverse-engineered existing ERP handlers (NetSuite, QuickBooks, Xero, Intacct, Sage, etc.) to derive invariant sync patterns and construct generalized, model-ready templates for automatic generation",
          "Built a multi-model prompt-engineering pipeline using Claude Sonnet 4, GitHub Copilot, and Claude Code to generate entity-level handler scaffolds with clear boundaries between reusable sync logic and ERP-specific implementation requirements"
        ]
      },
      {
        id: "errorclustering",
        title: "Error Message Clustering System",
        problemClass: "Unsupervised taxonomy discovery for LLM failures",
        modelCardAnchor: "#modelcard-errorclustering",
        modelCardId: 2,
        workBullets: [
          "Built a custom clustering system to automatically group millions of historical ERP-BILL sync error messages",
          "Analyzed years of production error logs using SQL and benchmarked multiple unsupervised approaches (dendrogram-based clustering, GPT/LLM semantic grouping) before designing a bespoke, scalable clustering algorithm",
          "Developed a boosted cosine similarity scoring method that incorporates token-level similarity with start/end-match boosts and domain-specific heuristics",
          "Implemented a continuous-update pipeline where new, unseen errors are automatically flagged for PM review and seamlessly integrated into the global cluster set",
          "Deployed the system as a real-time inference service on AWS EC2/ECS"
        ]
      },
      {
        id: "evalpipeline",
        title: "Model Evaluation & Feedback Pipeline",
        problemClass: "Measuring LLM quality at scale in production",
        modelCardAnchor: null,
        modelCardId: null,
        workBullets: [
          "Created a novel ML-driven code-evaluation metric using GumTree AST-edit diffs, action-weighted structural scoring, and cosine-similarity boosts to assess functional and structural similarity between AI-generated and production code"
        ]
      }
    ],
    deliverables: [
      "Reduced ERP integration build time by 45-55% (approx. 6 months faster)",
      "CLI automation generates integration skeletons in under 2 hours",
      "99%+ classification accuracy with 50% cost reduction (error clustering)",
      "30% higher clustering efficiency vs. baseline"
    ],
    impactBullets: [
      "Framework accelerated BILL's ERP expansion roadmap and serves as a long-term ML assistive system for engineering velocity",
      "Failures became classifiable instead of anecdotal",
      "Iteration speed increased because evaluation became automatic"
    ],
    environment: [
      "Production ML system",
      "Large-scale internal engineering users",
      "High sensitivity to reliability and latency"
    ],
    impactSummary: "Built ML infrastructure that turned LLM outputs into measurable, production-ready systems."
  },
  {
    id: "seelab",
    companyName: "Systems Energy and Efficiency Lab (SEELab)",
    orgTag: "SEELab UCSD",
    roleTitle: "Research Intern",
    systems: [
      {
        id: "wearable-sensor-llms",
        title: "Wearable-Sensor LLMs",
        problemClass: "Multimodal temporal reasoning for sensor understanding",
        modelCardAnchor: "#modelcard-wearable-sensor",
        modelCardId: 3,
        workBullets: [
          "Reproduced baseline benchmarks across multiple LLMs to validate the performance gains achieved by Compositional Attention models on temporal-reasoning and sensor-understanding tasks",
          "Cleaned, organized, and standardized a large QA dataset collected via Amazon Mechanical Turk, preparing it for model training, profiling, and publication",
          "Conducted extensive dataset analysis using BERT embeddings to identify latent structure across question types, sensor modalities, and user behaviors",
          "Leveraged RAG with OpenAI GPT to generate candidate answers and ground-truth references"
        ]
      }
    ],
    deliverables: [
      {
        text: "Published research: 'SensorChat: Answering qualitative and quantitative questions during long-term multimodal sensor interactions' (ACM IMWUT, 2025)",
        url: "https://arxiv.org/abs/2502.02883"
      },
      {
        text: "Published research: 'SensorQA: A question answering benchmark for daily-life monitoring' (ACM SenSys, 2025)",
        url: "https://arxiv.org/abs/2501.04974"
      },
      "Large QA dataset collected via Amazon Mechanical Turk, standardized and prepared for publication",
      "Benchmark validation across multiple LLMs demonstrating performance gains"
    ],
    impactBullets: [
      "Validated performance gains of Compositional Attention models on temporal-reasoning tasks",
      "Created standardized QA dataset enabling rigorous model evaluation with exact-match accuracy metrics",
      "Contributed to two published research papers on wearable-sensor LLMs"
    ],
    environment: [
      "Research environment",
      "PyTorch, HuggingFace",
      "Dataset curation via Amazon Mechanical Turk",
      "Multi-LLM benchmark validation"
    ],
    impactSummary: {
      text: "Contributed to peer-reviewed, published research (ACM SenSys, ACM IMWUT) on wearable-sensor LLMs.",
      links: [
        { text: "ACM SenSys", url: "https://arxiv.org/abs/2501.04974" },
        { text: "ACM IMWUT", url: "https://arxiv.org/abs/2502.02883" }
      ]
    }
  },
  {
    id: "promodrone",
    companyName: "PromoDrone",
    orgTag: "PromoDrone",
    roleTitle: "Data Science Consultant",
    systems: [
      {
        id: "cv-demographics",
        title: "Computer Vision for Demographics",
        problemClass: "Real-time video analysis for demographic inference",
        modelCardAnchor: "#modelcard-cv-demographics",
        modelCardId: 4,
        workBullets: [
          "Developed and trained a Convolutional Neural Network for gender and demographic data collection from drone video",
          "Integrated emotion and demographic data collection into algorithm pipeline via Google Cloud using Vision API and Vertex AI",
          "Deployed extraction model to PromoDrone's backend infrastructure"
        ]
      }
    ],
    deliverables: [
      "Commercially deployed computer vision system",
      "System available in the product as of 2025"
    ],
    impactBullets: [
      "Enabled real-time demographic analysis from drone video"
    ],
    environment: [
      "Commercial deployment",
      "Google Cloud Platform (Vertex AI, Vision API)",
      "Real-time video processing pipeline"
    ],
    impactSummary: "Deployed computer vision system for demographic inference from drone video, commercially available in production."
  },
  {
    id: "ucsd-capstone",
    companyName: "Independent Research",
    orgTag: "UCSD",
    roleTitle: "ML Researcher",
    systems: [
      {
        id: "in-context-learning",
        title: "In-Context Learning Study",
        problemClass: "Understanding transformer in-context learning mechanisms",
        modelCardAnchor: "#modelcard-in-context-learning",
        modelCardId: 5,
        workBullets: [
          "Designed and implemented a custom single-layer transformer to study in-context learning (ICL) mechanisms under controlled conditions",
          "Conducted systematic architectural ablation studies to understand how transformer depth, width, and attention mechanisms affect ICL emergence",
          "Analyzed ICL performance across different task distributions and context window lengths to identify failure modes and limitations",
          "Investigated the relationship between implicit gradient descent during forward pass and in-context adaptation behavior"
        ]
      }
    ],
    deliverables: [
      "Custom transformer implementation for controlled ICL analysis",
      "Architectural ablation studies demonstrating ICL behavior patterns",
      "Research findings on ICL limitations and failure modes"
    ],
    impactBullets: [
      "Provided insights into transformer in-context learning mechanisms through controlled experimentation",
      "Identified key architectural factors affecting ICL emergence and performance",
      "Documented failure modes and limitations of in-context learning across different task distributions"
    ],
    environment: [
      "Research environment",
      "PyTorch",
      "Custom transformer implementation",
      "Experimental framework"
    ],
    impactSummary: "Conducted systematic research on transformer in-context learning mechanisms, providing insights into how transformers adapt to new tasks without parameter updates."
  }
];
