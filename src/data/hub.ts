// The NeuroAI Hub: books, videos, tools, datasets, institutes, events, communities and a glossary.
// Links point to official pages. Dates and people change: always check the official site.

export type Book = { title: string; authors: string; year: string; topic: string; weeks: string; free?: string; publisher?: string; how: string };

export const BOOKS: Book[] = [
  { title: "Mathematics for Machine Learning", authors: "Marc Peter Deisenroth, A. Aldo Faisal, Cheng Soon Ong", year: "2020", topic: "Maths", weeks: "Weeks 4 to 24",
    free: "https://mml-book.github.io/", how: "Read the chapter that matches each maths week after the lesson, as a second explanation. Chapters 2 to 7 cover all of Part 1's linear algebra, calculus, probability and optimisation." },
  { title: "Theoretical Neuroscience", authors: "Peter Dayan, L. F. Abbott", year: "2001", topic: "Neuroscience", weeks: "Weeks 29 to 131",
    publisher: "https://mitpress.mit.edu/", how: "The classic graduate text. Chapters 1 to 4 (coding) go with Weeks 34 to 36; Chapters 5 and 6 (neuron models) with Weeks 29 to 32; Chapters 7 to 10 (networks, plasticity) with Part 5." },
  { title: "Neuronal Dynamics", authors: "Wulfram Gerstner, Werner M. Kistler, Richard Naud, Liam Paninski", year: "2014", topic: "Neuroscience", weeks: "Weeks 29 to 33, 106 to 110",
    free: "https://neuronaldynamics.epfl.ch/", how: "Free online with Python exercises. Best for neuron models, spiking networks and plasticity. Use it alongside Part 2 and Part 5." },
  { title: "Understanding Deep Learning", authors: "Simon J. D. Prince", year: "2023", topic: "Deep learning", weeks: "Weeks 80 to 105",
    free: "https://udlbook.github.io/udlbook/", how: "The clearest modern deep learning text, with excellent figures and notebooks. Read the matching chapter after each Part 4 lesson." },
  { title: "Deep Learning", authors: "Ian Goodfellow, Yoshua Bengio, Aaron Courville", year: "2016", topic: "Deep learning", weeks: "Weeks 80 to 97",
    free: "https://www.deeplearningbook.org/", how: "Foundational and mathematical. Part I is a good maths review; Part II covers the core architectures. Some material predates Transformers." },
  { title: "Dive into Deep Learning", authors: "Aston Zhang, Zachary C. Lipton, Mu Li, Alexander J. Smola", year: "2023", topic: "Deep learning", weeks: "Weeks 80 to 101",
    free: "https://d2l.ai/", how: "Code-first, with every model implemented in PyTorch, JAX and others. Use it when you want to see an idea in working code." },
  { title: "Pattern Recognition and Machine Learning", authors: "Christopher M. Bishop", year: "2006", topic: "Machine learning", weeks: "Weeks 54 to 68",
    free: "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/", how: "The Bayesian view of machine learning. Chapters 1 to 4 go with Weeks 54 to 57; 9 to 13 with Weeks 60 to 65. Demanding but rewarding." },
  { title: "Probabilistic Machine Learning (Books 1 and 2)", authors: "Kevin P. Murphy", year: "2022 to 2023", topic: "Machine learning", weeks: "Weeks 54 to 72",
    free: "https://probml.github.io/pml-book/", how: "Encyclopaedic and current. Use it as a reference when a lesson leaves you wanting more depth." },
  { title: "Information Theory, Inference, and Learning Algorithms", authors: "David J. C. MacKay", year: "2003", topic: "Maths", weeks: "Weeks 19 to 20, 63",
    free: "https://www.inference.org.uk/mackay/itila/", how: "Beautifully written. Read the information theory chapters with Week 20 and the inference chapters with Week 63." },
  { title: "The Elements of Statistical Learning", authors: "Trevor Hastie, Robert Tibshirani, Jerome Friedman", year: "2009", topic: "Machine learning", weeks: "Weeks 54 to 59",
    free: "https://hastie.su.domains/ElemStatLearn/", how: "The statistician's view: regularisation, model selection, trees and boosting." },
  { title: "Reinforcement Learning: An Introduction", authors: "Richard S. Sutton, Andrew G. Barto", year: "2018", topic: "Reinforcement learning", weeks: "Weeks 69 to 71, 95, 115",
    free: "http://incompleteideas.net/book/the-book-2nd.html", how: "The standard text, with a chapter on neuroscience. Read Chapters 1 to 6 with Weeks 69 to 70." },
  { title: "Hands-On Machine Learning with Scikit-Learn, Keras and TensorFlow", authors: "Aurélien Géron", year: "2022", topic: "Practice", weeks: "Weeks 54 to 74",
    publisher: "https://github.com/ageron/handson-ml3", how: "Practical engineering of ML pipelines. The notebooks are free on GitHub; use them for Week 74's engineering skills." },
  { title: "Deep Learning with Python", authors: "François Chollet", year: "2021", topic: "Practice", weeks: "Weeks 80 to 91",
    publisher: "https://github.com/fchollet/deep-learning-with-python-notebooks", how: "Intuitive, practical introduction by the creator of Keras. Good for a gentle second view of Part 4." },
  { title: "Nonlinear Dynamics and Chaos", authors: "Steven H. Strogatz", year: "2015", topic: "Maths", weeks: "Weeks 21 to 24, 106 to 108", publisher: "https://www.routledge.com/",
    how: "The best introduction to dynamical systems. Read Chapters 2, 5 to 8 alongside Weeks 21 to 23." },
  { title: "Dynamical Systems in Neuroscience", authors: "Eugene M. Izhikevich", year: "2007", topic: "Neuroscience", weeks: "Weeks 30 to 31, 106", publisher: "https://mitpress.mit.edu/",
    how: "Neuron models through the lens of bifurcation theory. Read after Week 23." },
  { title: "Probabilistic Artificial Intelligence", authors: "Andreas Krause, Jonas Hübotter", year: "2023", topic: "Machine learning", weeks: "Weeks 64, 68, 71",
    free: "https://scholar.google.com/scholar?q=Probabilistic+Artificial+Intelligence+Krause+H%C3%BCbotter", how: "Lecture notes from ETH Zurich on Bayesian learning, Gaussian processes, active learning and model-based RL. Free on arXiv." },
  { title: "Machine Learning: Discriminative and Generative", authors: "Tony Jebara", year: "2004", topic: "Machine learning", weeks: "Weeks 56, 62 to 63", publisher: "https://link.springer.com/",
    how: "A focused monograph on combining discriminative and generative models. Optional, after Week 63." },
];

export type Channel = { name: string; by: string; topic: string; why: string; url: string };

export const CHANNELS: Channel[] = [
  { name: "3Blue1Brown", by: "Grant Sanderson", topic: "Maths, deep learning", why: "The best visual intuition for linear algebra, calculus and neural networks.", url: "https://www.youtube.com/@3blue1brown" },
  { name: "StatQuest", by: "Josh Starmer", topic: "Statistics, machine learning", why: "Clear step-by-step explanations of statistical and ML methods.", url: "https://www.youtube.com/@statquest" },
  { name: "Andrej Karpathy", by: "Andrej Karpathy", topic: "Deep learning, LLMs", why: "Builds neural networks and language models from scratch in code.", url: "https://www.youtube.com/@AndrejKarpathy" },
  { name: "Artem Kirsanov", by: "Artem Kirsanov", topic: "Computational neuroscience", why: "Beautiful explanations of neuroscience and NeuroAI ideas.", url: "https://www.youtube.com/@ArtemKirsanov" },
  { name: "Steve Brunton", by: "Steve Brunton", topic: "Dynamical systems, data-driven science", why: "Dynamical systems, SVD, Fourier and control theory with applications.", url: "https://www.youtube.com/@Eigensteve" },
  { name: "Neuromatch Academy", by: "Neuromatch", topic: "Computational neuroscience, NeuroAI", why: "Full lecture series from the Neuromatch summer courses.", url: "https://www.youtube.com/results?search_query=Neuromatch+Academy" },
  { name: "MIT 18.06 Linear Algebra", by: "Gilbert Strang, MIT OpenCourseWare", topic: "Maths", why: "The classic linear algebra lectures.", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/" },
  { name: "Stanford CS231n", by: "Stanford University", topic: "Deep learning for vision", why: "Convolutional networks and modern vision, taught in depth.", url: "https://cs231n.stanford.edu/" },
  { name: "Brains, Minds and Machines", by: "Center for Brains, Minds and Machines (MIT)", topic: "NeuroAI", why: "Talks and summer-school lectures at the meeting point of brains and AI.", url: "https://cbmm.mit.edu/" },
  { name: "Cosyne and CCN talks", by: "Conference recordings", topic: "Research", why: "Recent research talks; watch one a week from Part 5 on.", url: "https://www.youtube.com/results?search_query=Cosyne+main+meeting+talk" },
];

export type Tool = { name: string; kind: string; use: string; week: number; url: string };

export const TOOLS: Tool[] = [
  { name: "NumPy", kind: "Arrays", use: "Every numerical computation in the course.", week: 2, url: "https://numpy.org/" },
  { name: "Matplotlib", kind: "Plotting", use: "Figures for every lesson and paper.", week: 3, url: "https://matplotlib.org/" },
  { name: "pandas", kind: "Tables", use: "Trial tables, behaviour and metadata.", week: 3, url: "https://pandas.pydata.org/" },
  { name: "SciPy", kind: "Scientific computing", use: "Optimisation, ODE solvers, statistics, signal processing.", week: 12, url: "https://scipy.org/" },
  { name: "scikit-learn", kind: "Machine learning", use: "Regression, classification, PCA, cross-validation.", week: 54, url: "https://scikit-learn.org/" },
  { name: "PyTorch", kind: "Deep learning", use: "Training neural networks from Part 4 on.", week: 81, url: "https://pytorch.org/" },
  { name: "JAX", kind: "Deep learning", use: "Fast differentiable code and research models.", week: 96, url: "https://docs.jax.dev/" },
  { name: "Brian2", kind: "Spiking simulation", use: "Spiking neurons and networks, written as equations.", week: 121, url: "https://briansimulator.org/" },
  { name: "NEST", kind: "Spiking simulation", use: "Large spiking network simulations.", week: 121, url: "https://www.nest-simulator.org/" },
  { name: "NEURON", kind: "Biophysical simulation", use: "Detailed neurons with dendrites and ion channels.", week: 32, url: "https://neuron.yale.edu/" },
  { name: "PyNWB", kind: "Data format", use: "Reading Neurodata Without Borders files from DANDI.", week: 37, url: "https://pynwb.readthedocs.io/" },
  { name: "snnTorch", kind: "Spiking deep learning", use: "Training spiking networks with surrogate gradients.", week: 138, url: "https://snntorch.readthedocs.io/" },
  { name: "Kilosort", kind: "Spike sorting", use: "Turning Neuropixels voltages into spikes.", week: 73, url: "https://github.com/MouseLand/Kilosort" },
  { name: "Suite2p", kind: "Calcium imaging", use: "Finding cells and their activity in two-photon movies.", week: 73, url: "https://github.com/MouseLand/suite2p" },
  { name: "DeepLabCut", kind: "Pose tracking", use: "Tracking animal body parts from video with deep learning.", week: 73, url: "https://github.com/DeepLabCut/DeepLabCut" },
  { name: "Git and GitHub", kind: "Version control", use: "Every project from Week 1.", week: 1, url: "https://github.com/" },
  { name: "Google Colab", kind: "Notebooks", use: "Free GPUs and the companion notebooks.", week: 1, url: "https://colab.research.google.com/" },
  { name: "uv", kind: "Environments", use: "Fast, reproducible Python environments on your own computer.", week: 22, url: "https://docs.astral.sh/uv/" },
];

export type Dataset = { name: string; what: string; species: string; week: number; url: string };

export const DATASETS: Dataset[] = [
  { name: "Steinmetz et al. (2019)", what: "Neuropixels recordings of about 30,000 neurons in 42 regions during visual decisions.", species: "Mouse", week: 37, url: "https://doi.org/10.1038/s41586-019-1787-x" },
  { name: "IBL Brain-Wide Map", what: "Standardised decision-making task with Neuropixels recordings across the whole brain, from many labs.", species: "Mouse", week: 51, url: "https://www.internationalbrainlab.com/" },
  { name: "Allen Brain Observatory", what: "Calcium imaging and Neuropixels responses to natural and artificial visual stimuli.", species: "Mouse", week: 38, url: "https://portal.brain-map.org/" },
  { name: "DANDI Archive", what: "Hundreds of public neurophysiology datasets in NWB format.", species: "Many", week: 37, url: "https://dandiarchive.org/" },
  { name: "Natural Scenes Dataset", what: "High-resolution 7T fMRI of people viewing thousands of natural images.", species: "Human", week: 133, url: "https://naturalscenesdataset.org/" },
  { name: "MICrONS", what: "Functional imaging and electron-microscopy connectome of a cubic millimetre of visual cortex.", species: "Mouse", week: 152, url: "https://www.microns-explorer.org/" },
  { name: "Brain-Score", what: "Benchmarks comparing deep networks with primate neural and behavioural data.", species: "Primate", week: 133, url: "https://www.brain-score.org/" },
  { name: "OpenNeuro", what: "Open human neuroimaging datasets (fMRI, EEG, MEG).", species: "Human", week: 145, url: "https://openneuro.org/" },
  { name: "CRCNS", what: "Collaborative Research in Computational Neuroscience: classic electrophysiology datasets.", species: "Many", week: 35, url: "https://crcns.org/" },
];

export type Place = { name: string; region: "Europe" | "Canada" | "Australia"; city: string; what: string; url: string };

export const PLACES: Place[] = [
  { name: "Gatsby Computational Neuroscience Unit, UCL", region: "Europe", city: "London", what: "Theoretical neuroscience and machine learning; a four-year PhD programme.", url: "https://www.gatsby.ucl.ac.uk/" },
  { name: "Sainsbury Wellcome Centre, UCL", region: "Europe", city: "London", what: "Neural circuits and behaviour, with strong links to the Gatsby Unit.", url: "https://www.sainsburywellcome.org/" },
  { name: "ELLIS PhD Program", region: "Europe", city: "Across Europe", what: "Co-supervised machine learning PhDs across European labs, including NeuroAI topics.", url: "https://ellis.eu/" },
  { name: "Max Planck Institute for Biological Cybernetics", region: "Europe", city: "Tübingen", what: "Computational neuroscience and cognition; part of the Tübingen AI ecosystem.", url: "https://www.kyb.tuebingen.mpg.de/" },
  { name: "IMPRS for Intelligent Systems", region: "Europe", city: "Stuttgart and Tübingen", what: "Max Planck graduate school in machine learning and intelligent systems.", url: "https://imprs.is.mpg.de/" },
  { name: "Bernstein Network Computational Neuroscience", region: "Europe", city: "Germany", what: "Network of computational neuroscience groups in Germany; lists PhD positions.", url: "https://bernstein-network.de/" },
  { name: "Institute of Neuroinformatics, UZH and ETH", region: "Europe", city: "Zurich", what: "Neural computation, neuromorphic engineering and learning.", url: "https://www.ini.uzh.ch/" },
  { name: "EPFL Brain Mind Institute and School of Computer Science", region: "Europe", city: "Lausanne", what: "Computational neuroscience, plasticity and machine learning.", url: "https://www.epfl.ch/" },
  { name: "Champalimaud Foundation", region: "Europe", city: "Lisbon", what: "Systems and computational neuroscience; an international PhD programme.", url: "https://www.fchampalimaud.org/" },
  { name: "Donders Institute", region: "Europe", city: "Nijmegen", what: "Cognitive and computational neuroscience; artificial intelligence department.", url: "https://www.ru.nl/donders/" },
  { name: "Computational and Biological Learning Lab, Cambridge", region: "Europe", city: "Cambridge", what: "Machine learning and computational neuroscience in the Engineering Department.", url: "https://cbl.eng.cam.ac.uk/" },
  { name: "Ernst Strüngmann Institute", region: "Europe", city: "Frankfurt", what: "Systems neuroscience with a computational focus.", url: "https://www.esi-frankfurt.de/" },
  { name: "Mila", region: "Canada", city: "Montreal", what: "Deep learning institute with a large NeuroAI community, linked to McGill and Université de Montréal.", url: "https://mila.quebec/" },
  { name: "Vector Institute", region: "Canada", city: "Toronto", what: "AI research institute linked to the University of Toronto and other universities.", url: "https://vectorinstitute.ai/" },
  { name: "CIFAR Learning in Machines and Brains", region: "Canada", city: "Canada and international", what: "Research programme joining deep learning and neuroscience.", url: "https://cifar.ca/" },
  { name: "The Neuro (Montreal Neurological Institute), McGill", region: "Canada", city: "Montreal", what: "Neuroscience institute with computational and open-science groups.", url: "https://www.mcgill.ca/neuro/" },
  { name: "Queensland Brain Institute", region: "Australia", city: "Brisbane", what: "Neuroscience research institute at the University of Queensland.", url: "https://qbi.uq.edu.au/" },
  { name: "Florey Institute", region: "Australia", city: "Melbourne", what: "Brain research institute linked to the University of Melbourne.", url: "https://florey.edu.au/" },
  { name: "Brain and Mind Centre, University of Sydney", region: "Australia", city: "Sydney", what: "Neuroscience and mental health research, including computational work.", url: "https://www.sydney.edu.au/brain-mind/" },
];

export type Event = { name: string; kind: string; when: string; deadline: string; url: string };

export const EVENTS: Event[] = [
  { name: "Cosyne", kind: "Conference, neuroscience", when: "Usually March", deadline: "Abstracts usually October to November", url: "https://www.cosyne.org/" },
  { name: "CCN (Cognitive Computational Neuroscience)", kind: "Conference, NeuroAI", when: "Usually August", deadline: "Papers and abstracts usually April", url: "https://ccneuro.org/" },
  { name: "NeurIPS", kind: "Conference, ML", when: "December", deadline: "Papers usually May; workshops around September", url: "https://neurips.cc/" },
  { name: "ICLR", kind: "Conference, ML", when: "April to May", deadline: "Papers usually late September to October", url: "https://iclr.cc/" },
  { name: "ICML", kind: "Conference, ML", when: "July", deadline: "Papers usually January", url: "https://icml.cc/" },
  { name: "Bernstein Conference", kind: "Conference, computational neuroscience", when: "September", deadline: "Abstracts usually May", url: "https://bernstein-network.de/" },
  { name: "CNS (Organization for Computational Neurosciences)", kind: "Conference, computational neuroscience", when: "July", deadline: "Abstracts usually February to March", url: "https://www.cnsorg.org/" },
  { name: "Neuromatch Academy", kind: "Summer school, online", when: "July", deadline: "Applications usually March to April", url: "https://neuromatch.io/" },
  { name: "Simons Computational Neuroscience Imbizo", kind: "Summer school, South Africa", when: "January", deadline: "Applications usually around August", url: "https://imbizo.africa/" },
  { name: "TReND in Africa", kind: "Training, Africa", when: "Various", deadline: "See site", url: "https://trendinafrica.org/" },
  { name: "Deep Learning Indaba", kind: "Summer school, Africa", when: "Usually August to September", deadline: "Applications usually spring", url: "https://deeplearningindaba.com/" },
  { name: "EEML (Eastern European Machine Learning summer school)", kind: "Summer school, Europe", when: "July", deadline: "Applications usually spring", url: "https://www.eeml.eu/" },
];

export const COMMUNITIES = [
  { name: "Neuromatch community", what: "Courses, project groups and a global network of computational neuroscientists.", url: "https://neuromatch.io/" },
  { name: "World Wide Neuro", what: "A calendar of online neuroscience seminars from around the world.", url: "https://www.world-wide.org/" },
  { name: "Data Science Africa", what: "Community and workshops for data science and ML in Africa.", url: "https://www.datascienceafrica.org/" },
  { name: "Women in Machine Learning", what: "Events and mentoring, including workshops at NeurIPS.", url: "https://wimlworkshop.org/" },
  { name: "Black in AI", what: "Community, mentoring and workshops for Black researchers in AI.", url: "https://blackinai.github.io/" },
  { name: "arXiv q-bio.NC", what: "Daily preprints in neurons and cognition.", url: "https://arxiv.org/list/q-bio.NC/recent" },
  { name: "bioRxiv Neuroscience", what: "Daily neuroscience preprints.", url: "https://www.biorxiv.org/collection/neuroscience" },
];

export const GLOSSARY: { term: string; def: string; week: number }[] = [
  { term: "Action potential", def: "A brief all-or-nothing electrical pulse (a spike) that travels down a neuron's axon.", week: 1 },
  { term: "Activation function", def: "The nonlinear function an artificial neuron applies to its weighted sum, such as ReLU.", week: 1 },
  { term: "Array", def: "A block of numbers of one type with a shape; NumPy's basic object.", week: 2 },
  { term: "Axis", def: "One dimension of an array; reductions along an axis remove it.", week: 2 },
  { term: "Backpropagation", def: "An algorithm that computes how every weight in a network affects the error, by applying the chain rule backwards.", week: 80 },
  { term: "Bias (unit)", def: "A constant added to a neuron's weighted sum; it shifts the threshold.", week: 1 },
  { term: "Broadcasting", def: "NumPy's rule for combining arrays of different shapes by stretching size-1 axes.", week: 2 },
  { term: "Coefficient of variation (CV)", def: "Standard deviation divided by mean; for interspike intervals it measures irregularity.", week: 2 },
  { term: "Convolution", def: "Sliding a kernel over a signal and taking weighted sums; used for smoothing and in CNNs.", week: 2 },
  { term: "Credit assignment", def: "Working out which parts of a system caused an error and how to change them.", week: 1 },
  { term: "Dendrite", def: "A branch of a neuron that receives inputs from other neurons.", week: 1 },
  { term: "Fano factor", def: "Variance of spike counts divided by their mean; 1 for a Poisson process.", week: 2 },
  { term: "Hebbian learning", def: "Strengthening a connection when the neurons on both sides are active together.", week: 1 },
  { term: "Interspike interval (ISI)", def: "Time between two consecutive spikes.", week: 1 },
  { term: "Leaky integrate-and-fire (LIF)", def: "A neuron model with a leaky membrane equation, a threshold and a reset.", week: 1 },
  { term: "Linearly separable", def: "Two classes that a straight line (or hyperplane) can separate perfectly.", week: 1 },
  { term: "Marr's levels", def: "Computational (what and why), algorithmic (how) and implementational (with what).", week: 1 },
  { term: "Membrane time constant", def: "τ in the LIF model: how quickly the voltage relaxes towards rest.", week: 1 },
  { term: "Neuropixels", def: "Silicon probes that record hundreds of neurons across many brain areas at once.", week: 2 },
  { term: "Perceptron", def: "A threshold unit with learnable weights that separates classes with a hyperplane.", week: 1 },
  { term: "Poisson process", def: "A random spike train with constant probability per unit time and no memory.", week: 2 },
  { term: "PSTH", def: "Peri-stimulus time histogram: trial-averaged spike counts per time bin, in spikes per second.", week: 2 },
  { term: "Raster plot", def: "A plot with one row per trial and a tick at each spike.", week: 2 },
  { term: "Refractory period", def: "A short time after a spike during which a neuron cannot fire again.", week: 2 },
  { term: "Standard error of the mean (SEM)", def: "SD divided by the square root of n: the uncertainty of a mean.", week: 1 },
  { term: "Synapse", def: "The junction where one neuron passes a signal to another; its strength can change with learning.", week: 1 },
  { term: "Synaptic plasticity", def: "Changes in synaptic strength with activity; the main basis of learning in the brain.", week: 1 },
  { term: "TD error", def: "Temporal-difference prediction error, δ = r + γV(s') − V(s); resembles dopamine signals.", week: 1 },
  { term: "Temporal summation", def: "Inputs close together in time adding up because the membrane has not leaked back to rest.", week: 1 },
  { term: "Tuning curve", def: "A neuron's mean response as a function of a stimulus feature, such as orientation.", week: 2 },
  { term: "View (NumPy)", def: "An array sharing memory with another; slices are views.", week: 2 },
  { term: "Z-score", def: "A value minus its mean, divided by its standard deviation.", week: 2 },
];
