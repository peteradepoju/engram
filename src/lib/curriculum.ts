import weeksData from "./weeks.json";

export type WeekKind = "teach" | "rest" | "project" | "exam" | "research" | "career";

export type Week = { n: number; kind: WeekKind; title: string };

export type Part = {
  n: number;
  title: string;
  short: string;
  weeks: [number, number];
  summary: string;
  project: string;
};

export const WEEKS = weeksData as Week[];

export const PARTS: Part[] = [
  { n: 0, title: "Orientation", short: "Orientation", weeks: [1, 1],
    summary: "What NeuroAI is, how researchers study, and your tools.",
    project: "A personal research map and your first journal entries" },
  { n: 1, title: "Maths and scientific computing", short: "Maths", weeks: [2, 27],
    summary: "Scientific Python, linear algebra, calculus, optimisation, probability, statistics, information theory, differential equations and dynamical systems.",
    project: "PCA and dynamics on a real population recording" },
  { n: 2, title: "Neuroscience foundations", short: "Neuroscience", weeks: [28, 53],
    summary: "Neurons and their models, synapses, neural coding and decoding, real neural data, and the systems behind perception, action, memory, reward and cognition.",
    project: "Fit a decision model to the IBL mouse decision-making data" },
  { n: 3, title: "Machine learning", short: "Machine learning", weeks: [54, 79],
    summary: "Supervised and unsupervised learning, probabilistic and Bayesian methods, sequential models, learning theory, reinforcement learning and ML engineering.",
    project: "Decode behaviour from neural activity with a full ML pipeline" },
  { n: 4, title: "Deep learning", short: "Deep learning", weeks: [80, 105],
    summary: "Backprop from scratch, PyTorch and JAX, CNNs, RNNs, Transformers, LLMs, generative models, self-supervised learning, deep RL, theory and interpretability.",
    project: "Train a CNN and compare its layers with the ventral visual stream" },
  { n: 5, title: "Theoretical and computational neuroscience", short: "Theory", weeks: [106, 131],
    summary: "Network models, attractors, plasticity, efficient and predictive coding, the Bayesian brain, decision models, RL in the brain, population dynamics and representational geometry.",
    project: "Reproduce a classic theory paper, then extend it" },
  { n: 6, title: "NeuroAI core", short: "NeuroAI", weeks: [132, 157],
    summary: "Deep networks as brain models, comparing representations, biologically plausible learning, spiking networks, memory, world models, LLMs and the brain, interpretability, brain foundation models, BCIs and embodied agents.",
    project: "A NeuroAI study that seeds Research Project 1" },
  { n: 7, title: "Research apprenticeship and career", short: "Research", weeks: [158, 183],
    summary: "Research design, PhD applications, Research Project 1 to submission, writing, peer review, talks, open science and the industry engineering block.",
    project: "Research Project 1 submitted" },
  { n: 8, title: "Independent research", short: "Independent", weeks: [184, 208],
    summary: "Research Project 2 aimed at a main venue, from research to product, grant writing and your five-year plan.",
    project: "Research Project 2 submitted and a final portfolio" },
];

/** Day titles for weeks that have been written. Weeks without an entry show "In preparation". */
export const DAY_TITLES: Record<number, string[]> = {
  1: [
    "Two kinds of intelligence: what NeuroAI is and why it matters",
    "A tour of the field: questions, people, labs and the virtuous cycle",
    "How researchers work: reading papers and keeping a research journal",
    "Your toolkit: Python in the browser, Colab, Git and GitHub",
    "Your first model: from a biological neuron to a perceptron",
    "Forge: Week 1 challenge, quiz and deep read",
  ],
  2: [
    "Arrays: the shape of neural data",
    "Indexing, slicing and masks: selecting trials and neurons",
    "Broadcasting and vectorised thinking",
    "Reductions along axes: from spike rasters to firing rates",
    "Random numbers and simulation: Poisson spike trains",
    "Forge: Week 2 challenge, quiz and deep read",
  ],
  3: [
    "Matplotlib I: the anatomy of a figure",
    "Matplotlib II: figures that tell the truth",
    "pandas I: tables of trials",
    "pandas II: grouping, reshaping and the psychometric curve",
    "Reproducible research: notebooks, environments and Git branches",
    "Forge: Week 3 challenge, quiz and deep read",
  ],
  4: [
    "Vectors: population activity as a point in space",
    "The dot product: length, angle and similarity",
    "A neuron as a dot product: receptive fields and cosine tuning",
    "Linear combinations, span and basis: the population vector",
    "Orthogonality, projection and representational similarity",
    "Forge: Week 4 challenge, quiz and deep read",
  ],
  5: [
    "Matrices as transformations: what a layer of neurons does",
    "Matrix multiplication: composing transformations and layers",
    "Linear systems and inverses: recovering causes from effects",
    "Least squares: fitting linear encoding models",
    "Linear decoding, overfitting and ridge regression",
    "Forge: Week 5 challenge, quiz and deep read",
  ],
  6: [
    "Eigenvectors: the directions a matrix only stretches",
    "Finding eigenvalues: the characteristic polynomial, trace and determinant",
    "Diagonalisation and matrix powers: what repeated connectivity does",
    "Linear dynamics: stability, oscillation and the line attractor",
    "Symmetric matrices: the spectral theorem, covariance and energy",
    "Forge: Week 6 challenge, quiz and deep read",
  ],
  7: [
    "The singular value decomposition: rotate, stretch, rotate",
    "Low-rank approximation: keeping the structure, dropping the noise",
    "Principal component analysis: directions of greatest variance",
    "PCA on neural populations: trajectories and dimensionality reduction",
    "How many dimensions? Spectra, noise and cross-validation",
    "Forge: Week 7 challenge, quiz and deep read",
  ],
  8: [
    "Derivatives: rates of change and the slope of a tuning curve",
    "Derivative rules and the nonlinearities of neurons and networks",
    "The chain rule: composing functions and layers",
    "Partial derivatives and gradients: many inputs at once",
    "Backpropagation: the chain rule through a network",
    "Forge: Week 8 challenge, quiz and deep read",
  ],
  9: [
    "Taylor series: approximating nonlinear functions",
    "Linearisation and the Jacobian: local linear maps",
    "Fixed points and stability of nonlinear circuits",
    "The Hessian: curvature, minima and saddle points",
    "Matrix calculus: gradients of vector and matrix expressions",
    "Forge: Week 9 challenge, quiz and deep read",
  ],
  10: [
    "Integrals: accumulating change, from rates to spike counts",
    "Differential equations and the leaky integrator",
    "Convolution: smoothing spike trains",
    "Linear filters and the linear-nonlinear-Poisson model",
    "Two-dimensional convolution: receptive fields and convolutional networks",
    "Forge: Week 10 challenge, quiz and deep read",
  ],
  11: [
    "Sines, cosines and complex exponentials: describing rhythms",
    "Fourier series: building signals from harmonics",
    "The discrete Fourier transform, the FFT and sampling",
    "Power spectra: finding rhythms in noisy signals",
    "Filtering and the convolution theorem",
    "Forge: Week 11 challenge, quiz and deep read",
  ],
  12: [
    "Optimisation problems: losses, minima and landscapes",
    "Gradient descent: step size, convergence and divergence",
    "Convexity: when every valley is the bottom",
    "Stochastic gradient descent: learning from minibatches",
    "Learning rules as optimisation: perceptron, delta rule and tempotron",
    "Forge: Week 12 challenge, quiz and deep read",
  ],
  13: [
    "Momentum: heavy balls in long valleys",
    "Adaptive methods: AdaGrad, RMSProp and Adam",
    "Constrained optimisation and Lagrange multipliers",
    "Inequality constraints, sparsity and the L1 penalty",
    "Optimisation in practice: early stopping, schedules and weight decay",
    "Forge: Week 13 challenge, quiz and deep read",
  ],
  15: [
    "Random variables and distributions: describing variable responses",
    "Expectation, variance and the binomial: quantal synaptic release",
    "The Poisson distribution: limits, intervals and over-dispersion",
    "Continuous distributions, the Gaussian and the central limit theorem",
    "Simulating randomness: inverse transforms, thinning and dropout",
    "Forge: Week 15 challenge, quiz and deep read",
  ],
  16: [
    "Conditional probability: joint, marginal and conditional distributions",
    "Bayes' rule: priors, likelihoods and posteriors",
    "Bayesian perception: combining cues and priors",
    "The multivariate Gaussian: covariance, marginals and conditionals",
    "Decisions and Gaussian classifiers: from posteriors to choices",
    "Forge: Week 16 challenge, quiz and deep read",
  ],
  17: [
    "Estimators: bias, variance and the sampling distribution",
    "Maximum likelihood: fitting rates, tuning curves and GLMs",
    "Fisher information and the limits of precision",
    "MAP estimation: priors as regularisers",
    "The bias-variance trade-off, cross-validation and model selection",
    "Forge: Week 17 challenge, quiz and deep read",
  ],
  18: [
    "Hypothesis testing: null hypotheses, p-values and errors",
    "Permutation tests: testing by shuffling",
    "The bootstrap and confidence intervals",
    "Power, sample size and effect size",
    "Many tests at once: false discoveries and double dipping",
    "Forge: Week 18 challenge, quiz and deep read",
  ],
  19: [
    "Conjugate priors: beta-binomial and gamma-Poisson",
    "Posterior summaries, prediction and Bayes factors",
    "Monte Carlo and the Metropolis algorithm",
    "Latent variables and Gibbs sampling: sorting spikes",
    "Variational inference: approximating the posterior",
    "Forge: Week 19 challenge, quiz and deep read",
  ],
  20: [
    "Entropy: measuring uncertainty in bits",
    "Mutual information: what a response says about a stimulus",
    "Estimating information from spikes",
    "KL divergence and cross-entropy",
    "Channels, efficient coding and the information bottleneck",
    "Forge: Week 20 challenge, quiz and deep read",
  ],
  21: [
    "What a differential equation says: the membrane equation",
    "Linear equations with inputs: impulse responses and resonance",
    "Numerical solvers: Euler, stability and Runge-Kutta",
    "Systems of linear equations and the matrix exponential",
    "Integrate-and-fire neurons and the f-I curve",
    "Forge: Week 21 challenge, quiz and deep read",
  ],
  22: [
    "One-dimensional flows: fixed points and their stability",
    "The phase plane and the trace-determinant plane",
    "Linearisation, nullclines and the inhibition-stabilised network",
    "Excitability: the FitzHugh-Nagumo neuron",
    "Attractors, integrators and what trained networks learn",
    "Forge: Week 22 challenge, quiz and deep read",
  ],
  23: [
    "Bifurcations in one dimension: saddle-nodes and hysteresis",
    "Hopf bifurcations and limit cycles",
    "Coupled oscillators and synchronisation",
    "Chaos from a simple rule: the logistic map",
    "Strange attractors, Lyapunov exponents and chaotic networks",
    "Forge: Week 23 challenge, quiz and deep read",
  ],
  24: [
    "Random walks and diffusion",
    "Markov chains and the noisy ion channel",
    "Drift diffusion: accumulating evidence to a bound",
    "The Ornstein-Uhlenbeck process and stochastic differential equations",
    "Diffusion models: generating data by reversing noise",
    "Forge: Week 24 challenge, quiz and deep read",
  ],
  25: [
    "Meet the data: motor cortex during reaching",
    "Principal components of a population",
    "How many dimensions? Reconstruction and cross-validation",
    "Rotational dynamics: fitting dx/dt = Mx and jPCA",
    "Controls: what else could make rotations?",
    "Project report and deep read",
  ],
  26: [
    "Review I: arrays, vectors, matrices and least squares",
    "Review II: eigenvalues, the SVD and calculus",
    "Review III: Fourier analysis and optimisation",
    "Review IV: probability, statistics and Bayesian inference",
    "Review V: information, dynamics and stochastic processes",
    "Part 1 exam",
  ],
  28: [
    "Scales of the brain: from molecules to behaviour",
    "A tour of the brain: areas, layers and pathways",
    "Neurons and glia: what a cell type is",
    "Measuring activity I: electrodes, from single units to Neuropixels",
    "Measuring activity II: imaging, fMRI and EEG",
    "Forge: Week 28 challenge, quiz and deep read",
  ],
  29: [
    "Ions, gradients and the Nernst potential",
    "The resting potential: the Goldman-Hodgkin-Katz equation",
    "The membrane as a capacitor: size, input resistance and recording",
    "Conductances, driving force and shunting inhibition",
    "Ion channels and pumps: counting channels and paying for gradients",
    "Forge: Week 29 challenge, quiz and deep read",
  ],
  30: [
    "The voltage clamp: separating sodium and potassium currents",
    "Fitting the gates: why n to the fourth power",
    "Inactivation, recovery and the refractory period",
    "The cost of a spike: overlapping currents and temperature",
    "Many channels, one behaviour: the channel zoo and degeneracy",
    "Forge: Week 30 challenge, quiz and deep read",
  ],
  31: [
    "Reducing Hodgkin-Huxley: two variables and the Morris-Lecar model",
    "The exponential integrate-and-fire: where the spike begins",
    "Adaptation and firing patterns: the AdEx model",
    "Irregular firing: integrate-and-fire neurons with noisy, balanced input",
    "Spike timing: reliability and how well simple models predict",
    "Forge: Week 31 challenge, quiz and deep read",
  ],
  32: [
    "The cable equation: how voltage spreads along a dendrite",
    "Finite cables, branching trees and Rall's equivalent cylinder",
    "Compartmental models: discretising and simulating a neuron",
    "Active dendrites and dendritic computation",
    "Axons: propagating the action potential, and why myelin helps",
    "Forge: Week 32 challenge, quiz and deep read",
  ],
  33: [
    "From vesicle to conductance: synaptic kinetics and receptor types",
    "Short-term depression: the Tsodyks-Markram model",
    "Facilitation and the synapse as a filter",
    "Short-term plasticity as computation: memory traces and burst detection",
    "Neuromodulation: changing the rules of a circuit",
    "Forge: Week 33 challenge, quiz and deep read",
  ],
  34: [
    "Spike trains as point processes: renewal models and the time-rescaling test",
    "Trial-to-trial variability: Fano factors and variability quenching",
    "Tuning curves: fitting, uncertainty and selectivity",
    "Correlated variability: measuring and interpreting noise correlations",
    "Rate codes and temporal codes: what spike timing adds",
    "Forge: Week 34 challenge, quiz and deep read",
  ],
  35: [
    "Receptive fields from natural stimuli: whitening and regularisation",
    "Spike-triggered covariance: finding more than one filter",
    "The Poisson GLM with spike history",
    "Comparing encoding models: bits per spike, time rescaling and coupling",
    "Deep networks as encoding models",
    "Forge: Week 35 challenge, quiz and deep read",
  ],
  36: [
    "Population vectors and Bayesian decoding",
    "Fisher information: how well could any decoder do?",
    "The Kalman filter: decoding movement over time",
    "Machine learning for decoding",
    "Brain-computer interfaces: decoding in closed loop",
    "Forge: Week 36 challenge, quiz and deep read",
  ],
  37: [
    "Neurodata Without Borders: how neural data are stored",
    "Calcium imaging: from fluorescence to responses",
    "Neuropixels units: quality metrics and a visual hierarchy",
    "Behaviour as data: psychometric curves, lapses and priors",
    "Nested data: neurons, sessions and animals",
    "Forge: Week 37 challenge, quiz and deep read",
  ],
  38: [
    "The retina: centre and surround, ON and OFF, adaptation",
    "Primary visual cortex: oriented receptive fields",
    "Complex cells and divisive normalisation",
    "Motion: space-time filters and the dorsal stream",
    "The ventral stream: selectivity and invariance",
    "Forge: Week 38 challenge, quiz and deep read",
  ],
  39: [
    "Hearing: the cochlea as a filter bank",
    "Where is that sound? Interaural time and coincidence detection",
    "Smell: random expansion and sparse codes",
    "Efficient coding in space: why the retina has a surround",
    "Efficient coding of natural sounds",
    "Forge: Week 39 challenge, quiz and deep read",
  ],
  41: [
    "Moving: reaching, smoothness and minimum jerk",
    "Noise, accuracy and speed",
    "Internal models: knowing where your hand is",
    "Optimal feedback control",
    "Motor adaptation: learning at two speeds",
    "Forge: Week 41 challenge, quiz and deep read",
  ],
};

export const DAYS_PER_WEEK = 6;
export const DEFAULT_START = "2026-11-16";

export function partOf(week: number): Part {
  return PARTS.find((p) => week >= p.weeks[0] && week <= p.weeks[1]) ?? PARTS[0];
}

export function weekOf(n: number): Week | undefined {
  return WEEKS[n - 1];
}

export const lessonId = (w: number, d: number) => `w${String(w).padStart(3, "0")}d${d}`;
export const weekSlug = (w: number) => `w${String(w).padStart(3, "0")}`;

export function parseLessonId(id: string): { w: number; d: number } | null {
  const m = /^w(\d{3})d([1-6])$/.exec(id);
  return m ? { w: Number(m[1]), d: Number(m[2]) } : null;
}

export function dayTitle(w: number, d: number): string {
  const t = DAY_TITLES[w]?.[d - 1];
  if (t) return t;
  return d === 6 ? "Forge" : `Day ${d}`;
}

/** Weeks whose lesson files exist. Kept in sync by hand as content is written. */
export const WRITTEN_WEEKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 41];
export const isWritten = (w: number) => WRITTEN_WEEKS.includes(w);

/** Every lesson that is published, in order. */
export function publishedLessons(): { w: number; d: number; id: string }[] {
  return WRITTEN_WEEKS.flatMap((w) =>
    Array.from({ length: DAYS_PER_WEEK }, (_, i) => ({ w, d: i + 1, id: lessonId(w, i + 1) })),
  );
}

// ---------- Dates ----------
// Dates are handled as plain "YYYY-MM-DD" strings in the learner's timezone.

export function todayIn(timezone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400000);
}

export type Scheduled =
  | { kind: "before"; daysToGo: number }
  | { kind: "rest-day"; week: number }
  | { kind: "rest-week"; week: number }
  | { kind: "lesson"; week: number; day: number }
  | { kind: "after" };

/** What the calendar says for a date, given a start date (always a Monday in practice). */
export function scheduleFor(date: string, start: string): Scheduled {
  const offset = daysBetween(start, date);
  if (offset < 0) return { kind: "before", daysToGo: -offset };
  const week = Math.floor(offset / 7) + 1;
  if (week > WEEKS.length) return { kind: "after" };
  const day = (offset % 7) + 1;
  if (WEEKS[week - 1].kind === "rest") return { kind: "rest-week", week };
  if (day === 7) return { kind: "rest-day", week };
  return { kind: "lesson", week, day };
}

export function dateOf(w: number, d: number, start: string): string {
  return addDays(start, (w - 1) * 7 + (d - 1));
}

/** A study day is any scheduled lesson day. Rest days and rest weeks never break a streak. */
export function isStudyDay(date: string, start: string): boolean {
  return scheduleFor(date, start).kind === "lesson";
}

/** Current streak: consecutive scheduled study days with activity, counting back from today. */
export function streak(activeDays: Set<string>, today: string, start: string): number {
  let count = 0;
  let date = today;
  // Today only counts once it is done; an unfinished today does not break the streak.
  if (!activeDays.has(date)) date = addDays(date, -1);
  for (let i = 0; i < 2000; i++) {
    const s = scheduleFor(date, start);
    if (s.kind === "before") break;
    if (s.kind === "lesson") {
      if (activeDays.has(date)) count++;
      else break;
    } else if (activeDays.has(date)) {
      count++; // extra work on a rest day still counts
    }
    date = addDays(date, -1);
  }
  return count;
}

export function longestStreak(activeDays: Set<string>, start: string, today: string): number {
  let best = 0;
  let run = 0;
  const total = Math.max(0, daysBetween(start, today));
  for (let i = 0; i <= total; i++) {
    const date = addDays(start, i);
    const s = scheduleFor(date, start);
    if (activeDays.has(date)) { run++; best = Math.max(best, run); }
    else if (s.kind === "lesson" && date !== today) run = 0;
  }
  return best;
}
