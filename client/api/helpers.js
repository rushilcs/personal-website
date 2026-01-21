// Helper functions for company analysis (shared between Vercel serverless function and dev server)
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function scrapeJobDescription(url) {
  try {
    console.log('[scrapeJobDescription] Fetching URL:', url);
    
    // Fetch the URL with realistic browser headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      },
      redirect: 'follow',
    });
    
    if (!response.ok) {
      // If we get a 400/403, the site likely blocks scraping
      if (response.status === 400 || response.status === 403 || response.status === 401) {
        throw new Error('Automated access is blocked on this site. Please copy and paste the job description text directly.');
      }
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log('[scrapeJobDescription] Fetched HTML, length:', html.length);
    
    // Use LLM to extract job description from HTML
    const llmApiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    
    if (llmApiKey && process.env.OPENAI_API_KEY) {
      try {
        // Remove script and style tags, extract text content
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 15000); // Limit to avoid token limits
        
        const extractionPrompt = `Extract the job description from the following scraped webpage content. Return ONLY the job description text, without any HTML tags or extra formatting. Focus on:
- Job title and role
- Responsibilities and requirements
- Required skills and qualifications
- Preferred qualifications
- Company information relevant to the role

If you cannot find a job description, return "No job description found."

Webpage content:
${textContent}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are a tool that extracts job descriptions from web pages. Return only the clean job description text, nothing else.',
              },
              {
                role: 'user',
                content: extractionPrompt,
              },
            ],
            temperature: 0.3,
            max_tokens: 2000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const extracted = data.choices[0].message.content.trim();
          
          if (extracted && !extracted.toLowerCase().includes('no job description found')) {
            console.log('[scrapeJobDescription] Extracted job description, length:', extracted.length);
            return extracted;
          }
        }
      } catch (error) {
        console.error('[scrapeJobDescription] LLM extraction error:', error);
      }
    } else if (llmApiKey && process.env.ANTHROPIC_API_KEY) {
      try {
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 15000);

        const extractionPrompt = `Extract the job description from the following scraped webpage content. Return ONLY the job description text, without any HTML tags or extra formatting. Focus on:
- Job title and role
- Responsibilities and requirements
- Required skills and qualifications
- Preferred qualifications
- Company information relevant to the role

If you cannot find a job description, return "No job description found."

Webpage content:
${textContent}`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            temperature: 0.3,
            system: 'You are a tool that extracts job descriptions from web pages. Return only the clean job description text, nothing else.',
            messages: [
              {
                role: 'user',
                content: extractionPrompt,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const extracted = data.content[0].text.trim();
          
          if (extracted && !extracted.toLowerCase().includes('no job description found')) {
            console.log('[scrapeJobDescription] Extracted job description, length:', extracted.length);
            return extracted;
          }
        }
      } catch (error) {
        console.error('[scrapeJobDescription] LLM extraction error:', error);
      }
    }
    
    // Fallback: basic text extraction
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return textContent.substring(0, 5000); // Return first 5000 chars as fallback
  } catch (error) {
    console.error('[scrapeJobDescription] Error:', error);
    throw error;
  }
}

export function extractTechStack(text) {
  const techKeywords = [
    'pytorch', 'tensorflow', 'keras', 'jax', 'scikit-learn',
    'kubernetes', 'docker', 'terraform', 'aws', 'gcp', 'azure',
    'spark', 'flink', 'kafka', 'redis', 'postgres', 'mongodb',
    'mlflow', 'wandb', 'kubeflow', 'sagemaker', 'vertex ai',
    'react', 'node', 'python', 'java', 'go', 'rust',
    'graphql', 'rest', 'grpc'
  ];
  
  const found = [];
  const lowerText = text.toLowerCase();
  
  techKeywords.forEach(tech => {
    if (lowerText.includes(tech)) {
      found.push(tech);
    }
  });
  
  return found;
}

export async function collectWeakSignals(companyName, jobDescription) {
  const signals = [];
  const jobText = jobDescription.toLowerCase();
  
  // ML Maturity Signals
  const maturitySignals = [
    { keywords: ['production', 'scaling', 'infrastructure'], message: 'Mentions of production systems suggests operational ML maturity' },
    { keywords: ['experimentation', 'mlflow', 'wandb', 'neptune', 'weights & biases'], message: 'MLOps tooling mentioned indicates structured experimentation workflow' },
    { keywords: ['ci/cd', 'continuous integration', 'deployment pipeline'], message: 'CI/CD mentioned suggests automated ML deployment practices' },
    { keywords: ['research', 'paper', 'publish', 'arxiv'], message: 'Research focus suggests academic/research-oriented ML team' },
    { keywords: ['startup', 'early stage', 'founding'], message: 'Early-stage company suggests building ML infrastructure from scratch' },
    { keywords: ['enterprise', 'fortune 500', 'large scale'], message: 'Enterprise context suggests complex legacy systems and scale challenges' },
  ];
  
  maturitySignals.forEach(({ keywords, message }) => {
    if (keywords.some(keyword => jobText.includes(keyword))) {
      signals.push(message);
    }
  });
  
  // Infrastructure Signals
  const infraSignals = [
    { keywords: ['real-time', 'streaming', 'latency', 'milliseconds'], message: 'Real-time requirements suggest online inference infrastructure' },
    { keywords: ['distributed', 'kubernetes', 'spark', 'dask'], message: 'Distributed systems mentioned indicates scale requirements' },
    { keywords: ['aws', 'gcp', 'azure', 'cloud'], message: 'Cloud platform mentioned suggests cloud-native ML infrastructure' },
    { keywords: ['terraform', 'infrastructure as code', 'iac'], message: 'IaC tools suggest infrastructure automation and maturity' },
    { keywords: ['docker', 'containerization'], message: 'Containerization suggests modern deployment practices' },
    { keywords: ['microservices', 'service-oriented'], message: 'Microservices architecture suggests distributed ML systems' },
  ];
  
  infraSignals.forEach(({ keywords, message }) => {
    if (keywords.some(keyword => jobText.includes(keyword))) {
      signals.push(message);
    }
  });
  
  // Evaluation & Monitoring Signals
  const evalSignals = [
    { keywords: ['evaluation', 'monitoring', 'observability', 'ml monitoring'], message: 'Focus on evaluation suggests production ML experience' },
    { keywords: ['a/b testing', 'experimentation', 'ab test'], message: 'A/B testing mentioned suggests data-driven decision making' },
    { keywords: ['model drift', 'data drift', 'concept drift'], message: 'Drift detection mentioned suggests mature ML monitoring' },
    { keywords: ['grafana', 'prometheus', 'datadog', 'new relic'], message: 'Monitoring tools mentioned suggests operational visibility' },
  ];
  
  evalSignals.forEach(({ keywords, message }) => {
    if (keywords.some(keyword => jobText.includes(keyword))) {
      signals.push(message);
    }
  });
  
  // Problem Domain Signals
  const domainSignals = [
    { keywords: ['recommendation', 'recommender'], message: 'Recommendation systems suggest personalization/product ML' },
    { keywords: ['nlp', 'natural language', 'llm', 'transformer'], message: 'NLP/LLM mentioned suggests language model work' },
    { keywords: ['computer vision', 'cv', 'image', 'video'], message: 'Computer vision suggests perception ML problems' },
    { keywords: ['fraud', 'anomaly detection', 'security'], message: 'Fraud/anomaly detection suggests risk ML applications' },
    { keywords: ['forecasting', 'time series', 'prediction'], message: 'Forecasting suggests temporal modeling problems' },
  ];
  
  domainSignals.forEach(({ keywords, message }) => {
    if (keywords.some(keyword => jobText.includes(keyword))) {
      signals.push(message);
    }
  });
  
  // Tech Stack Signals
  const techStack = extractTechStack(jobDescription);
  if (techStack.length > 0) {
    const mlFrameworks = techStack.filter(tech => 
      ['pytorch', 'tensorflow', 'keras', 'jax', 'scikit-learn', 'xgboost'].includes(tech)
    );
    const infraTools = techStack.filter(tech => 
      ['kubernetes', 'docker', 'terraform', 'spark', 'kafka'].includes(tech)
    );
    
    if (mlFrameworks.length > 0) {
      signals.push(`ML frameworks mentioned: ${mlFrameworks.join(', ')}`);
    }
    if (infraTools.length > 0) {
      signals.push(`Infrastructure tools: ${infraTools.join(', ')}`);
    }
  }

  return signals.length > 0 ? signals : [
    'Limited public signals found. Analysis based on job description patterns.',
  ];
}

export async function inferMLContext(companyName, jobDescription, weakSignals) {
  const analysisPrompt = `Based on the following information about ${companyName}, analyze their ML maturity level, infrastructure complexity, and likely challenges:

Company: ${companyName}
Job Description: ${jobDescription.substring(0, 1000)}...
Weak Signals Found: ${weakSignals.join('; ')}

Provide a brief analysis of:
1. ML Maturity Level (Early/Intermediate/Advanced)
2. Infrastructure Complexity (Low/Medium/High)
3. Likely Challenges

Format as JSON with keys: mlMaturity, infraComplexity, likelyChallenges`;

  const llmApiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  
  if (llmApiKey && process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert ML engineer analyzing companies for ML maturity. Respond only with valid JSON.',
            },
            {
              role: 'user',
              content: analysisPrompt,
            },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        return {
          mlMaturity: content.mlMaturity || 'Intermediate',
          infraComplexity: content.infraComplexity || 'Medium',
          likelyChallenges: content.likelyChallenges || 'Balancing model development velocity with production reliability.',
        };
      }
    } catch (error) {
      console.error('LLM API error, falling back to heuristics:', error);
    }
  } else if (llmApiKey && process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: analysisPrompt + '\n\nRespond only with valid JSON.',
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(data.content[0].text);
        return {
          mlMaturity: content.mlMaturity || 'Intermediate',
          infraComplexity: content.infraComplexity || 'Medium',
          likelyChallenges: content.likelyChallenges || 'Balancing model development velocity with production reliability.',
        };
      }
    } catch (error) {
      console.error('LLM API error, falling back to heuristics:', error);
    }
  }
  
  // Fallback to intelligent heuristics
  const jobText = jobDescription.toLowerCase();
  
  let mlMaturity = 'Intermediate';
  let infraComplexity = 'Medium';
  let likelyChallenges = 'Balancing model development velocity with production reliability.';

  if (weakSignals.some(s => s.includes('production') || s.includes('operational'))) {
    mlMaturity = 'Advanced';
  } else if (weakSignals.some(s => s.includes('research'))) {
    mlMaturity = 'Early';
    likelyChallenges = 'Moving research models to production. Establishing MLOps practices.';
  }

  if (weakSignals.some(s => s.includes('distributed') || s.includes('kubernetes'))) {
    infraComplexity = 'High';
  } else if (weakSignals.some(s => s.includes('real-time'))) {
    infraComplexity = 'Medium-High';
  }

  if (jobText.includes('startup') || jobText.includes('early stage')) {
    likelyChallenges = 'Building ML infrastructure from scratch. Prioritizing which problems to solve first.';
  } else if (jobText.includes('scale') || jobText.includes('enterprise')) {
    likelyChallenges = 'Managing technical debt. Improving model performance at scale. Ensuring model reliability.';
  }

  return {
    mlMaturity,
    infraComplexity,
    likelyChallenges,
  };
}

export async function generate90DayPlan(companyName, jobDescription) {
  const startTime = Date.now();
  // Full CV content - let LLM find all connections
  const rushilCV = `RUSHIL CHANDRUPATLA - COMPLETE CV

EDUCATION:
University of California San Diego, B.S. Data Science | GPA: 3.9/4.0 (Major), 3.87/4.0 (Cumulative)
Sept 2022 - March 2026 [Expected]
Courses: Data Structures, Algorithms, Deep Learning, ML: Learning Algorithms, Trustworthy Machine Learning, Data Management, Data Science Principles, Probabilistic Modeling and Machine Learning, Theoretical Foundations of Data Science, Linear Algebra

EXPERIENCE:

BILL | Machine Learning Engineer Intern (June 2025 - September 2025, San Jose, CA)
- BILL is a leading fintech platform providing intelligent, automated payment solutions for millions of small and mid-sized businesses
- Designed an AI-driven code-generation framework that reduced new ERP integration build time by 45-55% (approx. 6 months), enabling BILL to expand its Sync Platform to new accounting systems significantly faster
- Reverse-engineered existing ERP handlers (NetSuite, QuickBooks, Xero, Intacct, Sage, etc.) to derive invariant sync patterns and construct generalized, model-ready templates for automatic generation
- Built a multi-model prompt-engineering pipeline using Claude Sonnet 4, GitHub Copilot, and Claude Code to generate entity-level handler scaffolds with clear boundaries between reusable sync logic and ERP-specific implementation requirements
- Developed CLI automation that leverages Claude Code to generate full integration skeletons in under 2 hours, enabling engineers to generate new ERP scaffolds with a single command, directly contributing to BILL completing the new Acumatica integration in a record 5 months
- Created a novel ML-driven code-evaluation metric using GumTree AST-edit diffs, action-weighted structural scoring, and cosine-similarity boosts to assess functional and structural similarity between AI-generated and production code
- Shipped a reusable generation + evaluation framework now adopted by the Sync team, accelerating BILL's ERP expansion roadmap and serving as a long-term ML assistive system for engineering velocity

BILL | Machine Learning Engineer Intern (July 2024 - September 2024, San Jose, CA)
- Built a custom clustering system to automatically group millions of historical ERP-BILL sync error messages, enabling standardized error codes and improving the end-to-end debugging experience for customers and support teams
- Analyzed years of production error logs using SQL and benchmarked multiple unsupervised approaches (dendrogram-based clustering, GPT/LLM semantic grouping) before designing a bespoke, scalable clustering algorithm
- Developed a boosted cosine similarity scoring method that incorporates token-level similarity with start/end-match boosts and domain-specific heuristics, resulting in a 30% higher clustering efficiency compared to the prior implementation
- Implemented a continuous-update pipeline where new, unseen errors are automatically flagged for PM review and seamlessly integrated into the global cluster set, ensuring long-term adaptability with no system downtime
- Deployed the system as a real-time inference service on AWS EC2/ECS, achieving 99%+ classification accuracy while cutting operational costs by 50% versus the previous LLM-heavy approach
- Delivered a production ML system that standardized error semantics across BILL's Sync Platform, giving teams visibility into top issues and enabling faster diagnosis of sync failures for tens of thousands of customers

SEELab UCSD | Research Intern (Feb - August 2024, San Diego, CA)
Publications: https://arxiv.org/abs/2502.02883, https://arxiv.org/abs/2501.04974
- Contributed to two research projects on wearable-sensor LLMs and QA dataset benchmarking
- Reproduced baseline benchmarks across multiple LLMs to validate the performance gains achieved by Compositional Attention models on temporal-reasoning and sensor-understanding tasks
- Cleaned, organized, and standardized a large QA dataset collected via Amazon Mechanical Turk, preparing it for model training, profiling, and publication
- Conducted extensive dataset analysis using BERT embeddings to identify latent structure across question types, sensor modalities, and user behaviors—discovering more reliable clusters than GPT-based alternatives
- Leveraged RAG with OpenAI GPT to generate candidate answers and ground-truth references, enabling the use of exact-match accuracy metrics for rigorous model evaluation
- Published research: "SensorChat: Answering qualitative and quantitative questions during long-term multimodal sensor interactions" (ACM IMWUT, 2025)
- Published research: "SensorQA: A question answering benchmark for daily-life monitoring" (ACM SenSys, 2025)

PromoDrone | Data Science Consultant (April 2024 - July 2024, San Diego, CA)
- PromoDrone is a drone-based ad-tech platform that displays digital ads from the air and uses onboard vision systems to analyze viewer engagement and demographics
- Developed and trained a Convolutional Neural Network for gender and demographic data collection from drone video
- Integrated emotion and demographic data collection into algorithm pipeline via Google Cloud using Vision API and Vertex AI
- Deployed extraction model to PromoDrone's backend infrastructure, and is commercially available in the product as of 2025

Data Science Student Society | Consulting Director (October 2024 - June 2025, San Diego, CA)
- Secured 6 industry-facing projects across 3 San Diego startups through targeted outreach and relationship building
- Led selection process for 30+ students from a 200-applicant pool by designing applications and conducting interviews
- Oversaw project execution and provided technical + strategic support to ensure successful outcomes and student growth
- Directed final client presentations to company executives, with deliverables informing business decisions or product development

UCSD Research Group | Undergraduate Student Researcher (May 2023 - September 2023, San Diego, CA)
- Developed an algorithm that recursively searches for open data lakes to augment unit tables with external data, giving insight into why two variables may be correlated
- Used Postgres and SQL to work with data tables and altered similarly developed tools including JOSIE and MATE

TECHNICAL SKILLS:
Languages & Tools: Python, Java, SQL, PostgreSQL, Bash, Git, Docker, Kubernetes, Amazon Web Services (EC2, ECS, S3, Lambda), Google Cloud Platform (Vertex AI, Vision API), Linux, PyCharm, VSCode, Jupyter, Agile/Scrum
Technical Skills: Deep Learning, LLMs, In-Context Learning (ICL), RAG Systems, Prompt Engineering, Computer Vision, Unsupervised Learning, Clustering Algorithms, Transformer Models, Model Evaluation & Benchmarking, MLOps, API Integration
Libraries: PyTorch, TensorFlow, Keras, Scikit-learn, NumPy, Pandas, Matplotlib, OpenCV, LangChain, OpenAI API, Claude API, HuggingFace, Flask, FastAPI, NLTK, BERT, Google Vision AI

PROJECTS:
In-Context Learning in Transformers Case Study (UCSD Capstone, Sept 2025 - Present)
- Built an ICL classification pipeline using a single-layer transformer from scratch in PyTorch, implementing custom forward passes, attention mechanisms, and task formatting to evaluate ICL behavior under controlled conditions
- Analyzing how different transformer architectures (depth, width, attention variants) acquire in-context learning capabilities

Seizure Detection Predictor (UCSD Data Science Student Society, Feb 2023 - June 2023)
- Conducted end-to-end data science project implementing ML models (Naive Bayes, Decision Tree, SVM, k-Means) on 5000 EKG samples
- Found SVM model using Radial Basis Function was most effective, performing at 98% accuracy`;

  // Check if this is a company Rushil has worked at before
  const previousCompanies = ['BILL', 'Bill', 'bill'];
  const isPreviousCompany = previousCompanies.some(prev => companyName.toLowerCase().includes(prev.toLowerCase()));
  
  const planPrompt = `You are creating a strategic 90-day plan for Rushil Chandrupatla joining ${companyName}.
${isPreviousCompany ? `\nIMPORTANT: Rushil has previously worked at ${companyName}. In your plan, acknowledge this prior experience and mention that he understands the company's policies, culture, systems, and workflows due to his prior work there. Reference specific systems or projects he worked on at ${companyName} when relevant.` : ''}

STEP 1 - COMPANY RESEARCH (USE YOUR KNOWLEDGE):
Using your training data and knowledge, research ${companyName}:
- What does ${companyName} do? What is their business model?
- What products or services do they offer?
- What is their technology stack? (if known)
- What are typical ML use cases in their industry?
- What challenges do companies like ${companyName} typically face?
- What is their scale? (startup, mid-size, enterprise?)
- What is their ML maturity level? (Early/Intermediate/Advanced)
- What is their infrastructure complexity? (Low/Medium/High)
- What are likely challenges they face?
- Reference specific details about ${companyName} in your plan

STEP 2 - JOB DESCRIPTION ANALYSIS:
Analyze the following job description thoroughly:
${jobDescription}

From this job description, identify:
- Key technical requirements and skills needed
- ML/engineering challenges mentioned or implied
- Infrastructure and deployment needs
- Team structure and collaboration requirements
- Business objectives and success metrics

YOUR TASK:
First, provide a brief research summary with 3-5 bullet points about ${companyName} and the inferred team/context based on the job description. Then create a strategic 90-day plan.

OUTPUT FORMAT:
1. Start with "## Research & Context" section with 3-5 bullet points covering:
   - Company business model, products, or key characteristics
   - Inferred team structure, size, or ML maturity based on job description
   - Technology stack or infrastructure hints from the job description
   - Key challenges or opportunities specific to this role/company
   - Any other relevant context that informs the plan

2. Then provide "## First 90 Days Plan" with sections for Days 1-30, Days 31-60, and Days 61-90.

3. For EACH item in the plan, use this structured format:
   **Title:** [Brief, action-oriented title]
   **Objective:** [What this accomplishes and why it matters]
   **Experience:** [Include in MOST items (about 70%): Specific, detailed reference to Rushil's past experience/skills that directly connects to the action]
   **Action:** [Specific steps or approach to achieve the objective, clearly connected to the experience mentioned]

CRITICAL: Experience references must be SPECIFIC and DETAILED:
- Don't just say "I worked on LLMs" - explain WHAT you did: "At SEELab, I built RAG systems using OpenAI GPT to generate candidate answers, cleaned and standardized large QA datasets from Mechanical Turk, and conducted extensive dataset analysis using BERT embeddings to identify latent structure. This taught me how to evaluate model performance rigorously and handle multimodal sensor data."
- Don't just say "I deployed systems" - explain HOW: "At BILL, I deployed a real-time inference service on AWS EC2/ECS, achieving 99%+ classification accuracy while cutting operational costs by 50%. I implemented a continuous-update pipeline with automatic error flagging and seamless cluster integration, ensuring long-term adaptability with no system downtime."
- Connect experience to action explicitly: Show HOW the specific skills/learnings from past work apply to the current action
- You can infer related work: If the CV mentions working with LLMs, you can reference related activities like prompt engineering, model evaluation, data preprocessing, etc. even if not explicitly listed

Example format (GOOD - specific and connected):
**Title:** Build RAG System for Internal Documentation
**Objective:** Enable developers to quickly find relevant code examples and documentation patterns, reducing onboarding time and improving code quality.
**Experience:** At SEELab, I built RAG systems using OpenAI GPT to generate candidate answers and ground-truth references for sensor QA datasets. I cleaned and standardized large datasets collected via Mechanical Turk, conducted dataset analysis using BERT embeddings to identify latent structure, and implemented exact-match accuracy metrics for rigorous model evaluation. This experience taught me how to structure retrieval pipelines, handle noisy data, and evaluate RAG performance systematically.
**Action:** I'll apply similar techniques: set up a vector database for code embeddings, implement semantic search over documentation, create evaluation metrics to measure retrieval quality, and iterate based on developer feedback - just like I did when building the SensorQA benchmark system.

Example format (BAD - too vague):
**Title:** Build RAG System
**Objective:** Help developers find documentation.
**Experience:** Leveraging my work at SEELab where I contributed to developing LLMs, I'll apply similar techniques.
**Action:** Build a RAG system.

PLAN REQUIREMENTS:
1. Is SPECIFIC to ${companyName} - reference their business, products, or known challenges based on your research
2. Demonstrates strategic thinking about what ${companyName} needs based on the job description and your knowledge of the company
3. References Rushil's background in MOST items (about 70%) - be specific and detailed about what was done and how it connects

CONNECTION REQUIREMENTS (APPLY TO MOST ITEMS - ~70%):
- Include Experience field in about 70% of plan items
- Be SPECIFIC: Mention concrete projects, technologies, methodologies, and outcomes from Rushil's CV
- Show the CONNECTION: Explain how the specific experience directly applies to the action
- Go DEEPER: Don't just mention the role - explain what was done, what was learned, what tools were used
- Infer related work: If CV mentions a technology or approach, you can reference related activities (e.g., if CV mentions PyTorch, you can reference model training, debugging, optimization even if not explicitly listed)

Write in first person. Most items should be strategic and company-specific. Only reference Rushil's background occasionally (about 1 in every 3-4 bullets) when it adds meaningful value.`;

  const llmApiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  
  if (llmApiKey && process.env.OPENAI_API_KEY) {
    try {
      // Log what we're sending (for debugging)
      console.log('[generate90DayPlan] Using OpenAI API');
      console.log('[generate90DayPlan] Model: gpt-4o');
      console.log('[generate90DayPlan] Company:', companyName);
      console.log('[generate90DayPlan] Job description length:', jobDescription.length);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `${rushilCV}\n\nYou are Rushil Chandrupatla creating a strategic 90-day plan. You have the complete CV above with all experiences, skills, and projects. 

IMPORTANT CONTEXT:
- Rushil has experience in mentoring (as Consulting Director at Data Science Student Society, he led selection processes, oversaw project execution, and provided technical + strategic support to students)
- Rushil has experience in AI development and agent development (built AI-driven code-generation frameworks, worked with LLMs, RAG systems, prompt engineering, and agent-like systems at BILL and SEELab)
${isPreviousCompany ? `- Rushil has previously worked at ${companyName}, so he understands their policies, culture, systems, and workflows. Reference this when relevant.` : ''}

CRITICAL: Every single item in your plan MUST reference a specific experience, project, or skill from the CV. Find creative connections - even if the domain is different, explain how the methodology, skills, or learnings apply. Use phrases like "Building on my experience at BILL where I..." or "Leveraging my work at SEELab where I...". Write in first person.`,
            },
            {
              role: 'user',
              content: planPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const plan = data.choices[0].message.content.trim();
        const elapsedTime = Date.now() - startTime;
        
        // Calculate cost based on token usage (GPT-4o pricing as of 2024)
        const usage = data.usage || {};
        const inputTokens = usage.prompt_tokens || 0;
        const outputTokens = usage.completion_tokens || 0;
        // GPT-4o: $2.50 per 1M input tokens, $10 per 1M output tokens
        const cost = (inputTokens / 1000000 * 2.50) + (outputTokens / 1000000 * 10.00);
        
        // Log response for debugging
        console.log('[generate90DayPlan] Response received, length:', plan.length);
        const hasBillRef = plan.toLowerCase().includes('bill');
        const hasSeelabRef = plan.toLowerCase().includes('seelab');
        console.log('[generate90DayPlan] References found - BILL:', hasBillRef, 'SEELab:', hasSeelabRef);
        
        return {
          plan,
          metadata: {
            latency: elapsedTime,
            model: 'gpt-4o',
            architecture: 'Direct LLM',
            cost: cost,
            tokens: {
              input: inputTokens,
              output: outputTokens,
              total: usage.total_tokens || (inputTokens + outputTokens)
            }
          }
        };
      } else {
        const errorText = await response.text();
        console.error('[generate90DayPlan] API response not OK:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('[generate90DayPlan] LLM API error, falling back to template:', error.message);
      console.error('[generate90DayPlan] Full error:', error);
    }
  } else if (llmApiKey && process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          temperature: 0.7,
          system: `${rushilCV}\n\nYou are Rushil Chandrupatla creating a strategic 90-day plan. You have the complete CV above with all experiences, skills, and projects. 

IMPORTANT CONTEXT:
- Rushil has experience in mentoring (as Consulting Director at Data Science Student Society, he led selection processes, oversaw project execution, and provided technical + strategic support to students)
- Rushil has experience in AI development and agent development (built AI-driven code-generation frameworks, worked with LLMs, RAG systems, prompt engineering, and agent-like systems at BILL and SEELab)
${isPreviousCompany ? `- Rushil has previously worked at ${companyName}, so he understands their policies, culture, systems, and workflows. Reference this when relevant.` : ''}

CRITICAL: Every single item in your plan MUST reference a specific experience, project, or skill from the CV. Find creative connections - even if the domain is different, explain how the methodology, skills, or learnings apply. Use phrases like "Building on my experience at BILL where I..." or "Leveraging my work at SEELab where I...". Write in first person.`,
          messages: [
            {
              role: 'user',
              content: planPrompt,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.content[0].text.trim();
      }
    } catch (error) {
      console.error('LLM API error, falling back to template:', error);
    }
  }
  
  // Fallback template (should rarely be used if LLM is working)
  const elapsedTime = Date.now() - startTime;
  const days30 = [
    'Map the ML infrastructure: understand data pipelines, model serving architecture, and monitoring systems. Building on my experience deploying production ML systems at BILL on AWS ECS, I\'ll focus on identifying the deployment patterns and MLOps workflows in place.',
    'Identify the highest-leverage problems: speak with stakeholders, review existing models, prioritize based on business impact. Similar to my work at BILL where I analyzed production error logs to identify clustering opportunities, I\'ll look for systematic patterns in current ML workflows.',
    'Establish baseline metrics: understand current model performance, evaluation frameworks, and success criteria. Leveraging my experience with model evaluation and benchmarking from research work at SEELab, I\'ll assess how evaluation practices align with production needs.',
  ];
  
  const days60 = [
    'Ship first improvement: fix a high-impact model issue or improve an evaluation metric. Applying my experience with production ML systems and MLOps from BILL, I\'ll prioritize improvements that have clear operational impact.',
    'Build relationships: work with data engineers, product managers, and other ML engineers to understand pain points. Drawing on my consulting experience at PromoDrone and SEELab, I\'ll synthesize technical requirements with business needs.',
    'Propose a strategic initiative: based on findings, suggest a concrete improvement (e.g., better experimentation framework, model monitoring). Building on my work creating reusable frameworks at BILL, I\'ll design solutions that can scale across the organization.',
  ];
  
  const days90 = [
    'Execute on strategic initiative: begin implementing the proposed improvement. Using my experience with PyTorch, TensorFlow, and production deployment tools (AWS, Docker, Kubernetes), I\'ll build robust, maintainable solutions.',
    'Establish patterns: document learnings, create templates or frameworks for future ML work. Similar to the code generation framework I built at BILL, I\'ll create reusable patterns that accelerate future ML development.',
    'Plan next quarter: define clear goals based on understanding gained in first 90 days. Leveraging my experience with strategic planning from consulting roles, I\'ll align technical initiatives with business objectives.',
  ];

  const fallbackPlan = `## First 30 Days: Understanding and Mapping

${days30.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}

## Days 31-60: Delivering Value and Building Relationships

${days60.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}

## Days 61-90: Strategic Execution and Establishing Patterns

${days90.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}

---
*This plan is tailored to your company's context based on public signals and job description analysis, and incorporates my background in production ML systems, MLOps, and research.*`;

  return {
    plan: fallbackPlan,
    metadata: {
      latency: elapsedTime,
      model: 'fallback',
      architecture: 'Template',
      cost: 0,
      tokens: { input: 0, output: 0, total: 0 }
    }
  };
}

export async function analyzeJobFit(companyName, jobDescription) {
  // Full CV content
  const rushilCV = `RUSHIL CHANDRUPATLA - COMPLETE CV

EDUCATION:
University of California San Diego, B.S. Data Science | GPA: 3.9/4.0 (Major), 3.87/4.0 (Cumulative)
Sept 2022 - March 2026 [Expected]
Courses: Data Structures, Algorithms, Deep Learning, ML: Learning Algorithms, Trustworthy Machine Learning, Data Management, Data Science Principles, Probabilistic Modeling and Machine Learning, Theoretical Foundations of Data Science, Linear Algebra

EXPERIENCE:

BILL | Machine Learning Engineer Intern (June 2025 - September 2025, San Jose, CA)
- BILL is a leading fintech platform providing intelligent, automated payment solutions for millions of small and mid-sized businesses
- Designed an AI-driven code-generation framework that reduced new ERP integration build time by 45-55% (approx. 6 months), enabling BILL to expand its Sync Platform to new accounting systems significantly faster
- Reverse-engineered existing ERP handlers (NetSuite, QuickBooks, Xero, Intacct, Sage, etc.) to derive invariant sync patterns and construct generalized, model-ready templates for automatic generation
- Built a multi-model prompt-engineering pipeline using Claude Sonnet 4, GitHub Copilot, and Claude Code to generate entity-level handler scaffolds with clear boundaries between reusable sync logic and ERP-specific implementation requirements
- Developed CLI automation that leverages Claude Code to generate full integration skeletons in under 2 hours, enabling engineers to generate new ERP scaffolds with a single command, directly contributing to BILL completing the new Acumatica integration in a record 5 months
- Created a novel ML-driven code-evaluation metric using GumTree AST-edit diffs, action-weighted structural scoring, and cosine-similarity boosts to assess functional and structural similarity between AI-generated and production code
- Shipped a reusable generation + evaluation framework now adopted by the Sync team, accelerating BILL's ERP expansion roadmap and serving as a long-term ML assistive system for engineering velocity

BILL | Machine Learning Engineer Intern (July 2024 - September 2024, San Jose, CA)
- Built a custom clustering system to automatically group millions of historical ERP-BILL sync error messages, enabling standardized error codes and improving the end-to-end debugging experience for customers and support teams
- Analyzed years of production error logs using SQL and benchmarked multiple unsupervised approaches (dendrogram-based clustering, GPT/LLM semantic grouping) before designing a bespoke, scalable clustering algorithm
- Developed a boosted cosine similarity scoring method that incorporates token-level similarity with start/end-match boosts and domain-specific heuristics, resulting in a 30% higher clustering efficiency compared to the prior implementation
- Implemented a continuous-update pipeline where new, unseen errors are automatically flagged for PM review and seamlessly integrated into the global cluster set, ensuring long-term adaptability with no system downtime
- Deployed the system as a real-time inference service on AWS EC2/ECS, achieving 99%+ classification accuracy while cutting operational costs by 50% versus the previous LLM-heavy approach
- Delivered a production ML system that standardized error semantics across BILL's Sync Platform, giving teams visibility into top issues and enabling faster diagnosis of sync failures for tens of thousands of customers

SEELab UCSD | Research Intern (Feb - August 2024, San Diego, CA)
Publications: https://arxiv.org/abs/2502.02883, https://arxiv.org/abs/2501.04974
- Contributed to two research projects on wearable-sensor LLMs and QA dataset benchmarking
- Reproduced baseline benchmarks across multiple LLMs to validate the performance gains achieved by Compositional Attention models on temporal-reasoning and sensor-understanding tasks
- Cleaned, organized, and standardized a large QA dataset collected via Amazon Mechanical Turk, preparing it for model training, profiling, and publication
- Conducted extensive dataset analysis using BERT embeddings to identify latent structure across question types, sensor modalities, and user behaviors—discovering more reliable clusters than GPT-based alternatives
- Leveraged RAG with OpenAI GPT to generate candidate answers and ground-truth references, enabling the use of exact-match accuracy metrics for rigorous model evaluation
- Published research: "SensorChat: Answering qualitative and quantitative questions during long-term multimodal sensor interactions" (ACM IMWUT, 2025)
- Published research: "SensorQA: A question answering benchmark for daily-life monitoring" (ACM SenSys, 2025)

PromoDrone | Data Science Consultant (April 2024 - July 2024, San Diego, CA)
- PromoDrone is a drone-based ad-tech platform that displays digital ads from the air and uses onboard vision systems to analyze viewer engagement and demographics
- Developed and trained a Convolutional Neural Network for gender and demographic data collection from drone video
- Integrated emotion and demographic data collection into algorithm pipeline via Google Cloud using Vision API and Vertex AI
- Deployed extraction model to PromoDrone's backend infrastructure, and is commercially available in the product as of 2025

Data Science Student Society | Consulting Director (October 2024 - June 2025, San Diego, CA)
- Secured 6 industry-facing projects across 3 San Diego startups through targeted outreach and relationship building
- Led selection process for 30+ students from a 200-applicant pool by designing applications and conducting interviews
- Oversaw project execution and provided technical + strategic support to ensure successful outcomes and student growth
- Directed final client presentations to company executives, with deliverables informing business decisions or product development

UCSD Research Group | Undergraduate Student Researcher (May 2023 - September 2023, San Diego, CA)
- Developed an algorithm that recursively searches for open data lakes to augment unit tables with external data, giving insight into why two variables may be correlated
- Used Postgres and SQL to work with data tables and altered similarly developed tools including JOSIE and MATE

TECHNICAL SKILLS:
Languages & Tools: Python, Java, SQL, PostgreSQL, Bash, Git, Docker, Kubernetes, Amazon Web Services (EC2, ECS, S3, Lambda), Google Cloud Platform (Vertex AI, Vision API), Linux, PyCharm, VSCode, Jupyter, Agile/Scrum
Technical Skills: Deep Learning, LLMs, In-Context Learning (ICL), RAG Systems, Prompt Engineering, Computer Vision, Unsupervised Learning, Clustering Algorithms, Transformer Models, Model Evaluation & Benchmarking, MLOps, API Integration
Libraries: PyTorch, TensorFlow, Keras, Scikit-learn, NumPy, Pandas, Matplotlib, OpenCV, LangChain, OpenAI API, Claude API, HuggingFace, Flask, FastAPI, NLTK, BERT, Google Vision AI

PROJECTS:
In-Context Learning in Transformers Case Study (UCSD Capstone, Sept 2025 - Present)
- Built an ICL classification pipeline using a single-layer transformer from scratch in PyTorch, implementing custom forward passes, attention mechanisms, and task formatting to evaluate ICL behavior under controlled conditions
- Analyzing how different transformer architectures (depth, width, attention variants) acquire in-context learning capabilities

Seizure Detection Predictor (UCSD Data Science Student Society, Feb 2023 - June 2023)
- Conducted end-to-end data science project implementing ML models (Naive Bayes, Decision Tree, SVM, k-Means) on 5000 EKG samples
- Found SVM model using Radial Basis Function was most effective, performing at 98% accuracy`;

  const fitPrompt = `You are analyzing job requirements for ${companyName} and evaluating how well Rushil Chandrupatla's experience and skills match.

JOB DESCRIPTION:
${jobDescription}

YOUR TASK:
1. Extract or infer key job requirements from the job description. If explicit requirements are listed, use those. If not, infer requirements based on:
   - Technical skills mentioned (programming languages, frameworks, tools, platforms)
   - Domain knowledge mentioned (ML, computer vision, NLP, etc.)
   - Experience level expectations
   - Responsibilities mentioned that imply certain skills
   - Company tech stack (if mentioned or inferable)

2. For EACH requirement, evaluate if Rushil has relevant experience or skills based on his CV above. Be GENEROUS and ACCEPTING of broader concepts:
   - Check a requirement if there is ANY reasonable connection to Rushil's experience, even if indirect
   - Consider related skills (e.g., if job requires TensorFlow and Rushil has PyTorch experience, still check it - both are deep learning frameworks)
   - Consider transferable skills and methodologies
   - ACCEPT BROADER CONCEPTS: For example, if a job requires "Vision Transformers" and Rushil has computer vision experience (PromoDrone CNN project) AND transformer experience (ICL transformer project, LLM work), CHECK IT - these are related concepts even if not the exact same technology
   - If a requirement mentions a specific technology but Rushil has experience in the broader domain (e.g., Vision Transformers → Computer Vision + Transformers), CHECK IT
   - Be generous in connecting related technologies, methodologies, or domains
   - Do NOT check if there is genuinely NO correlation
   - IMPORTANT: Don't be overly decisive - if there's any reasonable connection through broader concepts, check the requirement

3. Output as JSON with this exact format:
{
  "requirements": [
    {
      "requirement": "Python programming",
      "matches": true,
      "evidence": "Strong Python experience across all roles - used at BILL, SEELab, PromoDrone, and in projects. Proficient with PyTorch, TensorFlow, and various ML libraries."
    },
    {
      "requirement": "Production ML systems",
      "matches": true,
      "evidence": "Built and deployed production ML systems at BILL, including real-time inference services on AWS ECS with 99%+ accuracy."
    },
    {
      "requirement": "Kubernetes",
      "matches": false,
      "evidence": "I have closely related experience in Docker and AWS ECS container orchestration and Kubernetes demonstrates the same underlying skills of container management and orchestration. The primary risk is lack of direct Kubernetes experience, which is mitigated by my demonstrated ability to quickly learn new technologies (e.g., learning Claude Code, GumTree AST analysis)."
    }
  ]
}

CRITICAL FORMAT FOR UNMATCHED REQUIREMENTS (matches: false):
If a requirement does NOT match, the evidence MUST follow this exact format:
"I have closely related experience in X and Y demonstrates the same underlying skills [describe the skills]. The primary risk is R [describe the risk], which is mitigated by M [describe the mitigation]."

IMPORTANT:
- Include 8-15 requirements (mix of technical skills, tools, methodologies, domain knowledge)
- Be generous - if there's a reasonable connection, check it
- Provide specific evidence from the CV for each match
- For unmatched requirements, use the exact format specified above
- Focus on the most important requirements for the role
- Sort requirements by importance to the role (most important first)`;

  const llmApiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  
  if (llmApiKey && process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `${rushilCV}\n\nYou are evaluating job fit. Be GENEROUS and ACCEPTING of broader concepts - check requirements if there's any reasonable connection through related technologies, methodologies, or domains. For example, if a job requires "Vision Transformers" and the candidate has computer vision experience AND transformer experience, check it even if not the exact same technology. Don't be overly decisive - accept broader conceptual matches.`,
            },
            {
              role: 'user',
              content: fitPrompt,
            },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        return content.requirements || [];
      }
    } catch (error) {
      console.error('[analyzeJobFit] LLM API error:', error);
    }
  } else if (llmApiKey && process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          temperature: 0.7,
          system: `${rushilCV}\n\nYou are evaluating job fit. Be GENEROUS and ACCEPTING of broader concepts - check requirements if there's any reasonable connection through related technologies, methodologies, or domains. For example, if a job requires "Vision Transformers" and the candidate has computer vision experience AND transformer experience, check it even if not the exact same technology. Don't be overly decisive - accept broader conceptual matches.`,
          messages: [
            {
              role: 'user',
              content: fitPrompt,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(data.content[0].text);
        return content.requirements || [];
      }
    } catch (error) {
      console.error('[analyzeJobFit] LLM API error:', error);
    }
  }
  
  // Fallback - return empty array
  return [];
}

// Load supplemental PDF text (cached)
let supplementalTextCache = null;

async function loadSupplementalText() {
  if (supplementalTextCache) {
    return supplementalTextCache;
  }

  try {
    // Try to load PDF using pdf-parse, but handle errors gracefully
    // First, try the ESM-compatible version, then fallback to CommonJS
    let pdf;
    try {
      // Try ESM-compatible version first
      const pdfModule = await import('@cedrugs/pdf-parse');
      pdf = pdfModule.default || pdfModule;
    } catch (importError1) {
      try {
        // Fallback to CommonJS version using createRequire
        const { createRequire } = await import('module');
        const require = createRequire(import.meta.url);
        pdf = require('pdf-parse');
      } catch (importError2) {
        console.warn('[chatWithRushil] Could not load pdf-parse module:', importError2.message);
        // Try to load as a text file instead if PDF parsing fails
        try {
          const textPath = join(__dirname, '../../supplementals/Supplemental Interview.txt');
          supplementalTextCache = readFileSync(textPath, 'utf-8');
          console.log('[chatWithRushil] Loaded supplemental text file, length:', supplementalTextCache.length);
          return supplementalTextCache;
        } catch (textError) {
          console.error('[chatWithRushil] Could not load supplemental text file:', textError.message);
          supplementalTextCache = '';
          console.warn('[chatWithRushil] Using CV information only - supplemental info unavailable');
          return supplementalTextCache;
        }
      }
    }
    
    // Path to supplemental PDF (relative to helpers.js location in client/api/)
    // Go up to root, then into supplementals folder
    const supplementalPath = join(__dirname, '../../supplementals/Supplemental Interview.pdf');
    const pdfBuffer = readFileSync(supplementalPath);
    const data = await pdf(pdfBuffer);
    supplementalTextCache = data.text;
    console.log('[chatWithRushil] Loaded supplemental PDF, length:', supplementalTextCache.length);
    return supplementalTextCache;
  } catch (error) {
    console.error('[chatWithRushil] Error loading supplemental PDF:', error.message);
    // Try to load as text file as fallback
    try {
      const textPath = join(__dirname, '../../supplementals/Supplemental Interview.txt');
      supplementalTextCache = readFileSync(textPath, 'utf-8');
      console.log('[chatWithRushil] Loaded supplemental text file as fallback, length:', supplementalTextCache.length);
      return supplementalTextCache;
    } catch (textError) {
      // Final fallback: Return empty string so chatbot still works with CV
      supplementalTextCache = '';
      console.warn('[chatWithRushil] Using CV information only - supplemental info unavailable');
      return supplementalTextCache;
    }
  }
}

export async function chatWithRushil(message, conversationHistory = []) {
  // Full CV content
  const rushilCV = `RUSHIL CHANDRUPATLA - COMPLETE CV

EDUCATION:
University of California San Diego, B.S. Data Science | GPA: 3.9/4.0 (Major), 3.87/4.0 (Cumulative)
Sept 2022 - March 2026 [Expected]
Courses: Data Structures, Algorithms, Deep Learning, ML: Learning Algorithms, Trustworthy Machine Learning, Data Management, Data Science Principles, Probabilistic Modeling and Machine Learning, Theoretical Foundations of Data Science, Linear Algebra

EXPERIENCE:

BILL | Machine Learning Engineer Intern (June 2025 - September 2025, San Jose, CA)
- BILL is a leading fintech platform providing intelligent, automated payment solutions for millions of small and mid-sized businesses
- Designed an AI-driven code-generation framework that reduced new ERP integration build time by 45-55% (approx. 6 months), enabling BILL to expand its Sync Platform to new accounting systems significantly faster
- Reverse-engineered existing ERP handlers (NetSuite, QuickBooks, Xero, Intacct, Sage, etc.) to derive invariant sync patterns and construct generalized, model-ready templates for automatic generation
- Built a multi-model prompt-engineering pipeline using Claude Sonnet 4, GitHub Copilot, and Claude Code to generate entity-level handler scaffolds with clear boundaries between reusable sync logic and ERP-specific implementation requirements
- Developed CLI automation that leverages Claude Code to generate full integration skeletons in under 2 hours, enabling engineers to generate new ERP scaffolds with a single command, directly contributing to BILL completing the new Acumatica integration in a record 5 months
- Created a novel ML-driven code-evaluation metric using GumTree AST-edit diffs, action-weighted structural scoring, and cosine-similarity boosts to assess functional and structural similarity between AI-generated and production code
- Shipped a reusable generation + evaluation framework now adopted by the Sync team, accelerating BILL's ERP expansion roadmap and serving as a long-term ML assistive system for engineering velocity

BILL | Machine Learning Engineer Intern (July 2024 - September 2024, San Jose, CA)
- Built a custom clustering system to automatically group millions of historical ERP-BILL sync error messages, enabling standardized error codes and improving the end-to-end debugging experience for customers and support teams
- Analyzed years of production error logs using SQL and benchmarked multiple unsupervised approaches (dendrogram-based clustering, GPT/LLM semantic grouping) before designing a bespoke, scalable clustering algorithm
- Developed a boosted cosine similarity scoring method that incorporates token-level similarity with start/end-match boosts and domain-specific heuristics, resulting in a 30% higher clustering efficiency compared to the prior implementation
- Implemented a continuous-update pipeline where new, unseen errors are automatically flagged for PM review and seamlessly integrated into the global cluster set, ensuring long-term adaptability with no system downtime
- Deployed the system as a real-time inference service on AWS EC2/ECS, achieving 99%+ classification accuracy while cutting operational costs by 50% versus the previous LLM-heavy approach
- Delivered a production ML system that standardized error semantics across BILL's Sync Platform, giving teams visibility into top issues and enabling faster diagnosis of sync failures for tens of thousands of customers

SEELab UCSD | Research Intern (Feb - August 2024, San Diego, CA)
Publications: https://arxiv.org/abs/2502.02883, https://arxiv.org/abs/2501.04974
- Contributed to two research projects on wearable-sensor LLMs and QA dataset benchmarking
- Reproduced baseline benchmarks across multiple LLMs to validate the performance gains achieved by Compositional Attention models on temporal-reasoning and sensor-understanding tasks
- Cleaned, organized, and standardized a large QA dataset collected via Amazon Mechanical Turk, preparing it for model training, profiling, and publication
- Conducted extensive dataset analysis using BERT embeddings to identify latent structure across question types, sensor modalities, and user behaviors—discovering more reliable clusters than GPT-based alternatives
- Leveraged RAG with OpenAI GPT to generate candidate answers and ground-truth references, enabling the use of exact-match accuracy metrics for rigorous model evaluation
- Published research: "SensorChat: Answering qualitative and quantitative questions during long-term multimodal sensor interactions" (ACM IMWUT, 2025)
- Published research: "SensorQA: A question answering benchmark for daily-life monitoring" (ACM SenSys, 2025)

PromoDrone | Data Science Consultant (April 2024 - July 2024, San Diego, CA)
- PromoDrone is a drone-based ad-tech platform that displays digital ads from the air and uses onboard vision systems to analyze viewer engagement and demographics
- Developed and trained a Convolutional Neural Network for gender and demographic data collection from drone video
- Integrated emotion and demographic data collection into algorithm pipeline via Google Cloud using Vision API and Vertex AI
- Deployed extraction model to PromoDrone's backend infrastructure, and is commercially available in the product as of 2025

Data Science Student Society | Consulting Director (October 2024 - June 2025, San Diego, CA)
- Secured 6 industry-facing projects across 3 San Diego startups through targeted outreach and relationship building
- Led selection process for 30+ students from a 200-applicant pool by designing applications and conducting interviews
- Oversaw project execution and provided technical + strategic support to ensure successful outcomes and student growth
- Directed final client presentations to company executives, with deliverables informing business decisions or product development

UCSD Research Group | Undergraduate Student Researcher (May 2023 - September 2023, San Diego, CA)
- Developed an algorithm that recursively searches for open data lakes to augment unit tables with external data, giving insight into why two variables may be correlated
- Used Postgres and SQL to work with data tables and altered similarly developed tools including JOSIE and MATE

TECHNICAL SKILLS:
Languages & Tools: Python, Java, SQL, PostgreSQL, Bash, Git, Docker, Kubernetes, Amazon Web Services (EC2, ECS, S3, Lambda), Google Cloud Platform (Vertex AI, Vision API), Linux, PyCharm, VSCode, Jupyter, Agile/Scrum
Technical Skills: Deep Learning, LLMs, In-Context Learning (ICL), RAG Systems, Prompt Engineering, Computer Vision, Unsupervised Learning, Clustering Algorithms, Transformer Models, Model Evaluation & Benchmarking, MLOps, API Integration
Libraries: PyTorch, TensorFlow, Keras, Scikit-learn, NumPy, Pandas, Matplotlib, OpenCV, LangChain, OpenAI API, Claude API, HuggingFace, Flask, FastAPI, NLTK, BERT, Google Vision AI

PROJECTS:
In-Context Learning in Transformers Case Study (UCSD Capstone, Sept 2025 - Present)
- Built an ICL classification pipeline using a single-layer transformer from scratch in PyTorch, implementing custom forward passes, attention mechanisms, and task formatting to evaluate ICL behavior under controlled conditions
- Analyzing how different transformer architectures (depth, width, attention variants) acquire in-context learning capabilities

Seizure Detection Predictor (UCSD Data Science Student Society, Feb 2023 - June 2023)
- Conducted end-to-end data science project implementing ML models (Naive Bayes, Decision Tree, SVM, k-Means) on 5000 EKG samples
- Found SVM model using Radial Basis Function was most effective, performing at 98% accuracy`;

  // Load supplemental text
  const supplementalText = await loadSupplementalText();

  // Filter out ALL joke-related messages from conversation history to prevent LLM from seeing old joke patterns
  const filteredHistory = conversationHistory.filter(msg => {
    const content = msg.content?.toLowerCase() || '';
    // Remove any messages containing joke-related content (old or new format)
    const isJokeRelated = 
      content.includes('knock knock') ||
      content.includes('not rushil') ||
      content.includes('knott rushil') ||
      content.includes('knott who') ||
      content.includes('who\'s there') ||
      content.includes('whos there') ||
      content.includes('hope you liked the joke') ||
      content.includes('hope you enjoyed the joke') ||
      content.includes('hope u liked the joke') ||
      content.includes('hope u enjoyed the joke') ||
      (content.includes('joke') && (content.includes('l.a.m') || content.includes('lam')));
    return !isJokeRelated;
  });

  // Build conversation context
  const systemPrompt = `You are a helpful assistant representing Rushil Chandrupatla to recruiters and hiring managers. Your PRIMARY role is to answer questions about Rushil's experience, skills, and background in a way that best represents him to prospective employers.

KNOCK-KNOCK JOKE INSTRUCTION (ONLY WHEN USER SPECIFICALLY ASKS FOR A KNOCK-KNOCK JOKE):
If and ONLY if the user specifically asks for a knock-knock joke, you MUST follow this EXACT sequence - this is the ONLY knock-knock joke you should ever tell:
1. When user asks for a knock-knock joke: respond with EXACTLY "Knock knock!" (nothing else)
2. When user responds with "whos there" (or variations like "who's there", "who is there"): respond with EXACTLY "Knott" (nothing else)
3. When user responds with "knott who" (or variations like "knott who's there"): respond with EXACTLY "Knott Rushil! I hope you enjoyed the joke L.A.M" (nothing else)

CRITICAL: This is the ONLY knock-knock joke format you should use. Do NOT use any other format. Do NOT use "not rushil" or "hope u liked" - use the EXACT format above.

IMPORTANT RESTRICTIONS:
- Do NOT tell any other types of jokes (no other knock-knock jokes, no puns, no other humor)
- Do NOT initiate jokes or humor unless specifically asked for a knock-knock joke
- For ALL other interactions, focus ONLY on answering questions about Rushil's career, experience, skills, and background
- If asked for any other type of joke or humor, politely decline and redirect to career-related questions

PRIMARY INSTRUCTIONS (FOR ALL NON-JOKE INTERACTIONS):
1. Base your answers ONLY on the information provided in Rushil's CV and supplemental materials below
2. If you're unsure about something or don't have the information, be honest and say so, but still try to provide relevant information from what you do know
3. Always represent Rushil in the best possible light while being truthful and accurate
4. Be specific and detailed when discussing his experience - mention specific projects, technologies, outcomes, and impact
5. Connect his experiences to show growth, versatility, and depth of expertise
6. If asked about something not explicitly mentioned, infer reasonable connections from related experiences
7. Be professional, enthusiastic, and highlight his strengths
8. Focus on career-related topics: experience, skills, projects, education, and professional background

RUSHIL'S CV:
${rushilCV}

SUPPLEMENTAL INFORMATION:
${supplementalText}

Remember: Your role is to help recruiters understand Rushil's value and fit for their roles. Be helpful, accurate, and represent him well.`;

  // Build messages array with filtered conversation history (old joke responses removed)
  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...filteredHistory.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    {
      role: 'user',
      content: message,
    },
  ];

  const llmApiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (llmApiKey && process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content.trim();
      }
    } catch (error) {
      console.error('[chatWithRushil] OpenAI API error:', error);
    }
  } else if (llmApiKey && process.env.ANTHROPIC_API_KEY) {
    try {
      // For Anthropic, we need to exclude the system message from messages array
      const anthropicMessages = messages.filter(msg => msg.role !== 'system');
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          temperature: 0.7,
          system: systemPrompt,
          messages: anthropicMessages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.content[0].text.trim();
      }
    } catch (error) {
      console.error('[chatWithRushil] Anthropic API error:', error);
    }
  }

  // Fallback response
  return "I'm sorry, I'm having trouble processing your question right now. Please try again later.";
}
