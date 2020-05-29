# Filtered network graph via SigmaJS

I'm using sigma2, which is still in alpha, but looks very promising, especially
from a performance persepctive with moderate-sized networks.

## Issues and TODOs
* Sigma2 doesn't have a way to drag nodes around. Sigma v1 has a plugin for it,
so that can probably be ported over.
* Instead of merely hiding nodes and edges, it may be desirable to _drop_ them when they are filtered out
* I intend to make the filter a double-handled slider, but checkboxes was faster.
* Remove labels for inactive nodes/edges