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
  // ---------- Week 3: plotting, tables and reproducible research ----------
  {
    id: "rougier-2014", week: 3, day: 1, kind: "methods", difficulty: 1,
    title: "Ten Simple Rules for Better Figures",
    authors: "Nicolas P. Rougier, Michael Droettboom, Philip E. Bourne",
    year: 2014, venue: "PLOS Computational Biology 10(9), e1003833",
    url: "https://doi.org/10.1371/journal.pcbi.1003833",
    why: "Written partly by a Matplotlib developer, this short paper is the best practical guide to scientific figures. Every rule is shown with Matplotlib code, so it pairs directly with today's lesson.",
    summary: [
      "The authors argue that a figure is a message to a reader, and that most bad figures come from forgetting who the reader is and what they should take away.",
      "The ten rules cover knowing your audience and message, adapting the figure to the medium (paper, slide, poster), captions, avoiding default settings, using colour with care, not misleading, avoiding chartjunk, preferring message over beauty, and choosing the right tool.",
      "Each rule comes with examples, and the figures in the paper were made with Python code the authors released.",
    ],
    focus: "Read every rule and look closely at the figure that shows how the same data can be made to mislead. Note which rules your own last figure broke.",
    questions: [
      "Which rule do you think is broken most often in neuroscience papers? Give an example you have seen.",
      "Why should you not trust the default settings of a plotting library?",
      "What is chartjunk, and why does it harm a figure?",
      "How should a figure for a talk differ from the same figure in a paper?",
      "Pick one figure from last week's papers and suggest one concrete improvement.",
    ],
  },
  {
    id: "crameri-2020", week: 3, day: 2, kind: "methods", difficulty: 1,
    title: "The misuse of colour in science communication",
    authors: "Fabio Crameri, Grace E. Shephard, Philip J. Heron",
    year: 2020, venue: "Nature Communications 11, 5444",
    url: "https://doi.org/10.1038/s41467-020-19160-7",
    why: "Rainbow colour maps such as jet distort data, hide some features and invent others, and exclude colour-blind readers. This paper explains why with clear examples and offers better maps, which is exactly today's figure.",
    summary: [
      "The authors show that colour maps which are not perceptually uniform, such as the rainbow and jet maps, change how data are perceived: they create apparent boundaries and hide real gradients.",
      "They estimate how often such maps appear in the literature and show how they fail for readers with colour-vision deficiencies and in greyscale.",
      "They recommend scientifically derived, perceptually uniform maps and give guidance on choosing sequential, diverging and cyclic maps for different kinds of data.",
    ],
    focus: "Study the figures comparing the same data under rainbow and uniform colour maps. Then read the section on choosing a map type for your data.",
    questions: [
      "What does perceptually uniform mean for a colour map?",
      "Give one way a rainbow map can make a reader see a feature that is not in the data.",
      "When should you use a diverging map rather than a sequential one?",
      "Which kind of map would suit a map of preferred orientation, which wraps around at 180 degrees?",
    ],
  },
  {
    id: "mckinney-2010", week: 3, day: 3, kind: "classic", difficulty: 1,
    title: "Data Structures for Statistical Computing in Python",
    authors: "Wes McKinney",
    year: 2010, venue: "Proceedings of the 9th Python in Science Conference (SciPy 2010), 56 to 61",
    url: "https://doi.org/10.25080/Majora-92bf1922-00a",
    why: "The paper that introduced pandas to the scientific community. It explains why labelled tables needed their own data structure, which is the idea behind every trial table you will build.",
    summary: [
      "McKinney describes the DataFrame: a table whose rows and columns carry labels, so data stay aligned when you select, combine and reshape them.",
      "He shows how automatic alignment by label, handling of missing data and group-by operations make statistical work in Python as convenient as in R.",
      "The paper places pandas alongside NumPy and statsmodels as part of a Python ecosystem for statistics.",
    ],
    focus: "Focus on the sections about data alignment and group-by. Try each example in today's lesson code.",
    questions: [
      "What problem does label-based alignment solve that plain NumPy arrays do not?",
      "How does pandas represent missing data, and why does that matter for experiments where some trials are aborted?",
      "Describe group-by in the split, apply, combine language.",
      "pandas has changed a great deal since 2010. Name one thing in the paper that still works the same way today.",
    ],
  },
  {
    id: "ibl-2021", week: 3, day: 4, kind: "brain", deepRead: true, difficulty: 2,
    title: "Standardized and reproducible measurement of decision-making in mice",
    authors: "The International Brain Laboratory, Valeria Aguillon-Rodriguez, Dora Angelaki, Hannah Bayer and others",
    year: 2021, venue: "eLife 10, e63711",
    url: "https://doi.org/10.7554/eLife.63711",
    why: "Can the same experiment give the same result in different labs? The IBL trained mice on one decision task across many labs and checked. It is a landmark for reproducibility, and its main analysis is the psychometric curve you build today.",
    summary: [
      "Mice turned a wheel to report whether a visual grating appeared on the left or right, at contrasts from easy to impossible. Labs in several countries used identical hardware, software and training protocols.",
      "The authors fitted psychometric curves (bias, threshold, lapse rates) to every mouse and compared them across labs. After training, behaviour was remarkably similar between labs, although learning speed differed.",
      "The study argues that standardised protocols and shared, open data make neuroscience results reproducible at scale, and it underpins the IBL's later brain-wide recordings.",
    ],
    focus: "Study the figure that shows psychometric curves for mice from each lab, and the description of how bias, threshold and lapse were fitted.",
    questions: [
      "Describe the task in two sentences. What makes a trial hard?",
      "What do the four parameters of the psychometric curve mean for a mouse?",
      "Which measures were similar across labs and which differed?",
      "Why is it useful to have the same task in many labs, instead of one lab running more mice?",
      "Which steps of their analysis can you already reproduce with pandas and Matplotlib?",
    ],
  },
  {
    id: "sandve-2013", week: 3, day: 5, kind: "methods", difficulty: 1,
    title: "Ten Simple Rules for Reproducible Computational Research",
    authors: "Geir Kjetil Sandve, Anton Nekrutenko, James Taylor, Eivind Hovig",
    year: 2013, venue: "PLOS Computational Biology 9(10), e1003285",
    url: "https://doi.org/10.1371/journal.pcbi.1003285",
    why: "Ten habits that let you, or anyone else, regenerate every number and figure in a paper. They are the backbone of today's lesson on environments, scripts and version control.",
    summary: [
      "The authors argue that results are only as trustworthy as the process that produced them, and that most computational results cannot be reproduced even by their own authors a year later.",
      "Their rules include keeping track of how every result was produced, avoiding manual data manipulation, archiving exact versions of programs, version-controlling custom scripts, recording intermediate results, noting random seeds, and storing the raw data behind plots.",
      "They stress that these habits also save time for the researcher, not only for reviewers.",
    ],
    focus: "Read all ten rules and score yourself out of ten. Compare them with last week's paper by Wilson and colleagues.",
    questions: [
      "Which rules does Git help you follow, and which does it not?",
      "Why record random seeds? Give an example from this course.",
      "What is the difference between a raw data file and an intermediate result?",
      "Which rule do you find hardest to follow, and what would make it easier?",
    ],
  },
  // ---------- Week 4: vectors, dot products and neural tuning ----------
  {
    id: "saxena-2019", week: 4, day: 1, kind: "brain", difficulty: 2,
    title: "Towards the neural population doctrine",
    authors: "Shreya Saxena, John P. Cunningham",
    year: 2019, venue: "Current Opinion in Neurobiology 55, 103 to 111",
    url: "https://doi.org/10.1016/j.conb.2019.02.002",
    why: "A short review arguing that the population, not the single neuron, is the right unit of computation in the brain. It describes neural activity as points and trajectories in a high-dimensional state space, which is exactly the vector view you learn today.",
    summary: [
      "The authors contrast the classic neuron doctrine (single neurons as the unit of computation) with a population doctrine, in which the joint activity of many neurons is the object of study.",
      "They organise the population view around a few concepts: the state space in which each neuron is an axis, manifolds within it, coding dimensions, subspaces and dynamics.",
      "They review evidence that these concepts explain phenomena in motor, decision-making and sensory areas that single-neuron analyses miss.",
    ],
    focus: "Study the figure that introduces state space, with one axis per neuron. Then read the sections on coding dimensions and subspaces, which return in Weeks 7 and 116.",
    questions: [
      "What is the neuron doctrine, and what does the population doctrine add?",
      "In the state-space picture, what is a single point, and what is a trajectory?",
      "What is a coding dimension? How is it related to a direction (a vector) in state space?",
      "Give one finding the authors say needs the population view to explain.",
    ],
  },
  {
    id: "mikolov-2013", week: 4, day: 2, kind: "ai", difficulty: 2,
    title: "Efficient Estimation of Word Representations in Vector Space",
    authors: "Tomas Mikolov, Kai Chen, Greg Corrado, Jeffrey Dean",
    year: 2013, venue: "arXiv:1301.3781 (workshop paper, ICLR 2013)",
    url: "https://arxiv.org/abs/1301.3781",
    why: "The word2vec paper made a striking idea famous: meanings can be vectors, and similarity of meaning is the cosine of the angle between them. Today's dot product is the core operation, and the same geometry is used for neural population codes.",
    summary: [
      "The authors propose two simple architectures (continuous bag-of-words and skip-gram) that learn a vector for every word from large amounts of text, much faster than earlier neural language models.",
      "Words that appear in similar contexts end up with similar vectors, measured by cosine similarity.",
      "The vectors show linear regularities: the vector from 'man' to 'woman' is close to the vector from 'king' to 'queen', so vector arithmetic captures relations between words.",
    ],
    focus: "Read the introduction and the section describing the word-similarity tests based on vector offsets. Skip the training-time comparisons on a first pass.",
    questions: [
      "How do the authors measure whether two word vectors are similar?",
      "Explain the 'king minus man plus woman' example as vector addition.",
      "Why would words used in similar contexts get similar vectors?",
      "How is a word vector like the activity vector of a neural population responding to a stimulus?",
    ],
  },
  {
    id: "georgopoulos-1982", week: 4, day: 3, kind: "classic", difficulty: 2,
    title: "On the relations between the direction of two-dimensional arm movements and cell discharge in primate motor cortex",
    authors: "Apostolos P. Georgopoulos, John F. Kalaska, Roberto Caminiti, Joe T. Massey",
    year: 1982, venue: "Journal of Neuroscience 2(11), 1527 to 1537",
    url: "https://doi.org/10.1523/JNEUROSCI.02-11-01527.1982",
    why: "Monkeys moved a handle towards targets in eight directions while single motor-cortex neurons were recorded. Each neuron's firing rate followed a cosine of the angle between the movement and its preferred direction: a neuron computing a dot product.",
    summary: [
      "Monkeys made arm movements from a centre to eight targets arranged in a circle. Many motor-cortex cells changed their firing with movement direction.",
      "For most directionally tuned cells, the firing rate was well fitted by a cosine function of the angle between the movement direction and the cell's preferred direction.",
      "Tuning was broad: each cell fired for a wide range of directions, so any one movement involves many cells, which set up the population-vector paper of 1986.",
    ],
    focus: "Study the rasters for the eight directions and the fitted cosine tuning curve. Find the equation they fit and match it to today's lesson.",
    questions: [
      "Write the cosine tuning model. Which parameter is the preferred direction?",
      "Show that a cosine tuning curve is a dot product between two unit vectors, plus a baseline.",
      "Why does broad tuning mean that many cells take part in every movement?",
      "What might cosine tuning fail to capture about real arm movements?",
    ],
  },
  {
    id: "georgopoulos-1986", week: 4, day: 4, kind: "brain", deepRead: true, difficulty: 2,
    title: "Neuronal population coding of movement direction",
    authors: "Apostolos P. Georgopoulos, Andrew B. Schwartz, Ronald E. Kettner",
    year: 1986, venue: "Science 233(4771), 1416 to 1419",
    url: "https://doi.org/10.1126/science.3749885",
    why: "A four-page classic that turned broad, noisy tuning into precise information: add up each neuron's preferred direction, weighted by its firing, and the sum points where the arm moves. It is a linear combination of vectors, today's topic, and the ancestor of modern brain-computer interfaces.",
    summary: [
      "The authors recorded motor-cortex neurons while monkeys made arm movements in three-dimensional space.",
      "Each neuron contributes a vector in its preferred direction, scaled by how much its firing changes. The vector sum over the population, the population vector, pointed close to the direction of the movement.",
      "So although single neurons are broadly tuned, the population as a whole specifies direction precisely, an early and influential demonstration of population coding.",
    ],
    focus: "Study the figure showing individual cell vectors and their sum for each movement direction. Read how each cell's contribution was weighted.",
    questions: [
      "Write the population vector as a sum. What is each term?",
      "Why can broadly tuned neurons give a precise estimate when combined?",
      "What happens to the population vector if preferred directions are not spread evenly?",
      "How is this related to the decoders used in brain-computer interfaces?",
      "What does the population vector not tell you about how the brain itself reads out direction?",
    ],
  },
  {
    id: "kriegeskorte-2008", week: 4, day: 5, kind: "methods", difficulty: 2,
    title: "Representational similarity analysis: connecting the branches of systems neuroscience",
    authors: "Nikolaus Kriegeskorte, Marieke Mur, Peter Bandettini",
    year: 2008, venue: "Frontiers in Systems Neuroscience 2, 4",
    url: "https://doi.org/10.3389/neuro.06.004.2008",
    why: "Representational similarity analysis compares brains, models and behaviour by asking which stimuli each one treats as similar. It is built from today's tools: vectors of responses and distances or correlations between them. It returns in Week 117 and is central to NeuroAI in Week 134.",
    summary: [
      "The authors propose summarising any representation (a brain region, a model layer, behaviour) by a representational dissimilarity matrix: the dissimilarity between the response patterns to every pair of stimuli.",
      "Because the matrix is indexed by stimuli, not by neurons or voxels or units, it lets you compare representations measured in completely different ways, such as fMRI in humans, single cells in monkeys and units in a model.",
      "They show how to test models by correlating their matrices with brain matrices, and discuss the choice of dissimilarity measure.",
    ],
    focus: "Study the figure that builds a dissimilarity matrix from response patterns, and the one comparing matrices across measurement types.",
    questions: [
      "What is one entry of a representational dissimilarity matrix?",
      "Why does indexing by stimuli let you compare brains with models?",
      "Name two dissimilarity measures and say when they differ.",
      "Sketch the dissimilarity matrix for the orientation-tuned population from Week 2. What pattern do you expect?",
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
