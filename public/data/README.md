# Engram datasets

`churchland2012_reach.npz`: trial-averaged firing rates of 218 neurons recorded from motor and premotor cortex of a monkey (monkey N) performing a maze reaching task, 108 reach conditions, 10 ms bins from 50 ms before to 550 ms after movement onset. Arrays: `rates` (conditions × times × neurons, spikes per second, stored as float16) and `times` (ms).

Source: the example data distributed with the jPCA code pack of the Churchland lab (exampleData.mat), from Churchland, Cunningham, Kaufman, Foster, Nuyujukian, Ryu and Shenoy (2012), Neural population dynamics during reaching, Nature 487, 51 to 56, https://doi.org/10.1038/nature11129. Converted to NumPy format for use in the browser; the values are unchanged apart from rounding to half precision. All credit for the recordings belongs to the authors.
