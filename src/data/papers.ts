// Hand-picked papers, five a week, matched to that week's lessons.
// Summaries and questions are written for Engram; links go to the publisher or an official free copy.

export type PaperKind = "classic" | "brain" | "ai" | "recent" | "methods";

export type Paper = {
  id: string;
  week: number;
  day: number; // the lesson day it goes with (1 to 5)
  kind: PaperKind;
  title: string;
  authors: string;
  year: number;
  venue: string;
  url: string;
  why: string;
  summary: string[];
  focus: string; // what to look at closely (figures, sections)
  questions: string[];
  difficulty: 1 | 2 | 3;
  deepRead?: boolean; // the Forge deep read for the week
};

export const PAPERS: Paper[] = [
  // ---------- Week 1: what NeuroAI is ----------
  {
    id: "hassabis-2017", week: 1, day: 1, kind: "brain", deepRead: true, difficulty: 1,
    title: "Neuroscience-Inspired Artificial Intelligence",
    authors: "Demis Hassabis, Dharshan Kumaran, Christopher Summerfield, Matthew Botvinick",
    year: 2017, venue: "Neuron 95(2), 245 to 258",
    url: "https://doi.org/10.1016/j.neuron.2017.06.011",
    why: "The clearest map of how ideas have moved from neuroscience into AI, written by people who built some of those systems. It gives you the vocabulary for the whole course.",
    summary: [
      "The authors argue that neuroscience helps AI in two ways: as a source of new algorithms and architectures, and as a check that an approach is plausible for a general intelligence.",
      "They trace the history (deep learning and reinforcement learning both have roots in the study of brains) and then survey current links: attention, episodic memory, working memory and continual learning.",
      "The last part looks ahead to intuitive physics, efficient learning, transfer, imagination and planning, and virtual brain analytics: using neuroscience tools to understand AI systems.",
    ],
    focus: "Read the box on Marr's levels of analysis carefully, and the section on episodic memory and experience replay.",
    questions: [
      "What are the two ways the authors say neuroscience can benefit AI? Give one example of each.",
      "What are Marr's three levels of analysis, and at which level do the authors think neuroscience is most useful to AI?",
      "How does experience replay in DQN relate to hippocampal replay? What is similar and what is different?",
      "Which of the future directions do you find least convincing, and why?",
      "The paper is mostly about neuroscience helping AI. Write two sentences on how AI could help neuroscience in return.",
    ],
  },
  {
    id: "zador-2023", week: 1, day: 2, kind: "recent", difficulty: 1,
    title: "Catalyzing next-generation Artificial Intelligence through NeuroAI",
    authors: "Anthony Zador, Sean Escola, Blake Richards, Bence Ölveczky, Yoshua Bengio and others",
    year: 2023, venue: "Nature Communications 14, 1597",
    url: "https://doi.org/10.1038/s41467-023-37180-x",
    why: "A short manifesto signed by many leaders of the field. It proposes the embodied Turing test as a goal for NeuroAI and explains why the field needs people trained in both worlds, which is exactly what this course is for.",
    summary: [
      "The authors note that AI has excelled at tasks humans find hard (chess, language) but still lags at what animals do easily: moving through and interacting with the physical world.",
      "They propose an embodied Turing test: an artificial animal whose behaviour cannot be told apart from a real one, from worms up to primates.",
      "They call for a new generation of researchers trained in both neuroscience and AI, and for shared platforms and benchmarks.",
    ],
    focus: "Focus on the definition of the embodied Turing test and the argument about what evolution has already solved.",
    questions: [
      "What is the embodied Turing test? Why do the authors prefer it to the classic Turing test?",
      "Why do the authors think sensorimotor skills are a better target than language for NeuroAI?",
      "What do they mean by evolution's 'pre-training'? How does that relate to genomes and innate behaviour?",
      "Which animal would you choose for a first embodied Turing test, and why?",
    ],
  },
  {
    id: "richards-2019", week: 1, day: 3, kind: "brain", difficulty: 2,
    title: "A deep learning framework for neuroscience",
    authors: "Blake A. Richards, Timothy P. Lillicrap, Philippe Beaudoin, Yoshua Bengio and others",
    year: 2019, venue: "Nature Neuroscience 22, 1761 to 1770",
    url: "https://doi.org/10.1038/s41593-019-0520-2",
    why: "This paper reframes how to do theory in systems neuroscience: instead of describing what each neuron computes, describe the objective, the architecture and the learning rule. You will use this framing for the rest of the course.",
    summary: [
      "The authors argue that systems neuroscience should borrow the three design components of deep learning: objective functions, learning rules and architectures.",
      "Rather than explaining the brain neuron by neuron, the goal becomes explaining which objectives, rules and architectures could have produced what we observe.",
      "They discuss how the framework makes testable predictions, and its limits, including the question of whether the brain does anything like gradient descent.",
    ],
    focus: "Study Figure 1 (the three components) and the section on how the framework produces testable predictions.",
    questions: [
      "What are the three components the authors want neuroscience to focus on?",
      "Why do they argue that describing the computation of each neuron is not enough?",
      "Give an example of an objective function a brain area might optimise.",
      "What would count as evidence against this framework?",
      "Write one research question in this framework about a brain area you are curious about.",
    ],
  },
  {
    id: "wilson-2017", week: 1, day: 4, kind: "methods", difficulty: 1,
    title: "Good enough practices in scientific computing",
    authors: "Greg Wilson, Jennifer Bryan, Karen Cranston, Justin Kitzes, Lex Nederbragt, Tracy K. Teal",
    year: 2017, venue: "PLOS Computational Biology 13(6), e1005510",
    url: "https://doi.org/10.1371/journal.pcbi.1005510",
    why: "Practical rules for organising data, code and projects that every researcher should follow from day one. Read it now and your future self will thank you.",
    summary: [
      "The paper lists practices that are easy to adopt and make the biggest difference: save raw data untouched, keep code modular, put everything under version control and write a short README.",
      "It covers data management, software, collaboration, project organisation, tracking changes and writing manuscripts.",
      "The authors deliberately stop short of best practice: the aim is habits a beginner can keep.",
    ],
    focus: "Read Box 1 (the summary of practices) twice and compare it with how you organise your files now.",
    questions: [
      "Why should raw data be kept exactly as it came, and never edited by hand?",
      "What should go in a project's README?",
      "What do the authors recommend about naming files and folders?",
      "Pick three practices you do not follow yet. How will you adopt them this week?",
    ],
  },
  {
    id: "rosenblatt-1958", week: 1, day: 5, kind: "classic", difficulty: 2,
    title: "The perceptron: a probabilistic model for information storage and organization in the brain",
    authors: "Frank Rosenblatt",
    year: 1958, venue: "Psychological Review 65(6), 386 to 408",
    url: "https://doi.org/10.1037/h0042519",
    why: "The paper that started learning machines, written as a theory of the brain. Reading it shows how deeply AI and neuroscience were joined from the beginning.",
    summary: [
      "Rosenblatt asks how a physical system could sense, remember and recognise patterns, and proposes the perceptron: sensory units connected to association units connected to response units.",
      "Connections change with experience, so the system learns to give the same response to similar stimuli without being programmed.",
      "He analyses what such systems can learn, framing it as a model of memory and perception in the brain, not as an engineering device.",
    ],
    focus: "Read the opening questions and the description of the system's organisation. Skim the probability analysis on a first pass.",
    questions: [
      "What three questions does Rosenblatt open with? Which is the perceptron meant to answer?",
      "How does his perceptron differ from the simple single-layer perceptron you built in today's lesson?",
      "Where does learning happen in his system, and what drives it?",
      "Rosenblatt wrote this as a brain model. What does it get right about brains, and what does it miss?",
    ],
  },

  // ---------- Week 2: arrays and neural data ----------
  {
    id: "harris-2020", week: 2, day: 1, kind: "methods", difficulty: 1,
    title: "Array programming with NumPy",
    authors: "Charles R. Harris, K. Jarrod Millman, Stéfan J. van der Walt, Ralf Gommers and others",
    year: 2020, venue: "Nature 585, 357 to 362",
    url: "https://doi.org/10.1038/s41586-020-2649-2",
    why: "The official description of the library you will use every day. Figure 1 is the best single picture of what an array is and what you can do with one.",
    summary: [
      "The paper explains the NumPy array: a block of memory with a data type, a shape and strides that say how to step through it.",
      "It describes the core operations (indexing, vectorisation, broadcasting, reduction) and how they make code shorter and faster than loops.",
      "It shows NumPy's role at the centre of the scientific Python ecosystem, including in the first image of a black hole and the detection of gravitational waves.",
    ],
    focus: "Study Figure 1 panel by panel: data structure, indexing, vectorisation, broadcasting, reduction. Try each one in code.",
    questions: [
      "What are shape and strides, and why does a view not copy data?",
      "Explain broadcasting in your own words using one example from Figure 1.",
      "Why is vectorised code faster than a Python loop?",
      "What is the array API standard trying to solve?",
    ],
  },
  {
    id: "stevenson-2011", week: 2, day: 2, kind: "brain", difficulty: 1,
    title: "How advances in neural recording affect data analysis",
    authors: "Ian H. Stevenson, Konrad P. Kording",
    year: 2011, venue: "Nature Neuroscience 14, 139 to 142",
    url: "https://doi.org/10.1038/nn.2731",
    why: "Shows that the number of neurons we can record at once has doubled about every seven years. That growth is why neuroscience became a data science, and why you are learning arrays this week.",
    summary: [
      "The authors gather decades of studies and find that the number of simultaneously recorded neurons has grown exponentially, doubling roughly every seven years.",
      "Larger recordings change which analyses are possible and which are needed: population decoding, dimensionality reduction and models of interactions between neurons.",
      "They discuss the statistical challenges that come with more neurons, such as how much data is needed to fit models of interactions.",
    ],
    focus: "Look at the main figure: the number of recorded neurons against year on a log scale. Estimate the doubling time yourself.",
    questions: [
      "What is the doubling time the authors report, and how did they estimate it?",
      "Why does recording more neurons make some analyses harder rather than easier?",
      "Extrapolate: if the trend held, how many neurons would we record at once in 2030?",
      "Find one recent recording technology and check whether it is on, above or below the trend.",
    ],
  },
  {
    id: "jun-2017", week: 2, day: 3, kind: "methods", difficulty: 2,
    title: "Fully integrated silicon probes for high-density recording of neural activity",
    authors: "James J. Jun, Nicholas A. Steinmetz, Joshua H. Siegle, Daniel J. Denman and others",
    year: 2017, venue: "Nature 551, 232 to 236",
    url: "https://doi.org/10.1038/nature24636",
    why: "Neuropixels probes record hundreds of neurons across many brain areas at once. Most large datasets you will analyse in this course were recorded with them, so it helps to know where the numbers come from.",
    summary: [
      "The paper describes the Neuropixels probe: a thin silicon shank with nearly a thousand recording sites, with the electronics built into the probe itself.",
      "In mice and rats it records hundreds of well-isolated neurons at once, across several brain structures along the shank.",
      "The authors show stable recordings in freely moving animals and describe how the data are processed into spikes from single neurons.",
    ],
    focus: "Look at the figures showing many brain areas recorded along one probe. Think about the shape of the resulting data array.",
    questions: [
      "What problem does putting the electronics on the probe solve?",
      "Why can one probe record from several brain areas at once?",
      "Spike sorting turns voltage traces into spikes from single neurons. Why is that hard?",
      "Sketch the array you would get from one recording: what are its axes and roughly what sizes?",
    ],
  },
  {
    id: "steinmetz-2019", week: 2, day: 4, kind: "brain", deepRead: true, difficulty: 2,
    title: "Distributed coding of choice, action and engagement across the mouse brain",
    authors: "Nicholas A. Steinmetz, Peter Zatka-Haas, Matteo Carandini, Kenneth D. Harris",
    year: 2019, venue: "Nature 576, 266 to 273",
    url: "https://doi.org/10.1038/s41586-019-1787-x",
    why: "A landmark dataset: about 30,000 neurons in 42 brain regions while mice make visual decisions. You will analyse this dataset yourself later in the course, so meeting it now pays off.",
    summary: [
      "Mice turned a wheel to report which side of a screen had the higher-contrast image, while the authors recorded with Neuropixels probes across the brain.",
      "Neurons encoding the visual stimulus were found in few areas, but neurons related to action and choice were spread widely, and engagement in the task changed activity in almost every region.",
      "The work suggests that even simple decisions involve large, distributed networks rather than a single chain of areas.",
    ],
    focus: "Study the task figure and the brain-wide maps of where each kind of signal appears. Note how firing rates were binned and averaged: that is today's lesson.",
    questions: [
      "Describe the task in two sentences. What does the mouse see and what does it do?",
      "Which kinds of signal were localised and which were widespread?",
      "What does 'engagement' mean in this paper and how was it measured?",
      "Which analysis in the paper could you already do with what you know about arrays and averaging?",
      "What experiment would you add to test whether the widespread choice signals are needed for the decision?",
    ],
  },
  {
    id: "softky-1993", week: 2, day: 5, kind: "classic", difficulty: 3,
    title: "The highly irregular firing of cortical cells is inconsistent with temporal integration of random EPSPs",
    authors: "William R. Softky, Christof Koch",
    year: 1993, venue: "Journal of Neuroscience 13(1), 334 to 350",
    url: "https://doi.org/10.1523/JNEUROSCI.13-01-00334.1993",
    why: "Cortical neurons fire almost like a Poisson process. This paper asked why, and started a debate about neural variability that still shapes theory today. It goes with today's Poisson simulation.",
    summary: [
      "The authors measured how irregular the spike trains of cortical neurons are, using the coefficient of variation of the intervals between spikes, and found values close to 1, as in a Poisson process.",
      "They showed that a simple neuron that adds up many small random inputs would fire much more regularly than that.",
      "So either neurons do something other than simple integration (such as detecting coincidences), or the inputs are organised in a special way. Later work proposed a balance of excitation and inhibition as the answer.",
    ],
    focus: "Concentrate on the definition of the coefficient of variation and on the argument for why integration makes firing regular. Skip the detailed compartmental model on a first read.",
    questions: [
      "What is the coefficient of variation of interspike intervals, and what value does a Poisson process give?",
      "Why would integrating many small random inputs lead to regular firing?",
      "What two broad explanations do the authors offer for irregular firing?",
      "Look up the idea of balanced excitation and inhibition (you will study it in Week 107). How does it resolve the puzzle?",
    ],
  },
];

export function paperById(id: string) {
  return PAPERS.find((p) => p.id === id);
}

export function papersForWeek(week: number) {
  return PAPERS.filter((p) => p.week === week).sort((a, b) => a.day - b.day);
}

export const PAPER_KIND_LABEL: Record<PaperKind, string> = {
  classic: "Classic", brain: "Brain", ai: "AI", recent: "Recent", methods: "Methods",
};
