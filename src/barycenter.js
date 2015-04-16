reorder.barycenter = function(graph, comps, iter) {
    var perm = [];
    // Compute the barycenter heuristic on each connected component
    if (! comps) {
	comps = graph.components();
    }
    for (var i = 0; i < comps.length; i++)
	perm = perm.concat(reorder.barycenter1(graph, comps[i], iter));
    return perm;
};

// Take the list of neighbor indexes and return the median according to 
// P. Eades and N. Wormald, Edge crossings in drawings of bipartite graphs.
// Algorithmica, vol. 11 (1994) 379–403.
function median(neighbors) {
    if (neighbors.length == 0)
	return -1; // should not happen
    if (neighbors.length == 1)
	return neighbors[0];
    if (neighbors.length == 2)
	return (neighbors[0]+neighbors[1])/2;
    neighbors.sort();
    if (neighbors.length % 2)
	return neighbors[(neighbors.length-1)/2];
    var rm = neighbors.length/2,
	lm = rm - 1,
	rspan = neighbors[neighbors.length-1] - neighbors[rm],
	lspan = neighbors[lm] - neighbors[0];
    if (lspan == rspan)
	return (neighbors[lm] + neighbors[rm])/2;
    else
	return (neighbors[lm]*rspan + neighbors[rm]*lspan) / (lspan+rspan);
}

reorder.barycenter1 = function(graph, comp, iter) {
    var nodes = graph.nodes(),
	layer1, layer2,
	layer, layer_inv,
	i, v, neighbors;

    if (comp.length < 3)
	return comp;

    if (! iter)
	iter = 20;
    else if ((iter%2)==1)
	iter++; // want even number of iterations

    layer1 = comp.filter(function(n) {
	return graph.outEdges(n).length!=0;
    });
    layer2 = comp.filter(function(n) {
	return graph.inEdges(n).length!=0;
    });

    for (layer = layer1;
	 iter--;
	 layer = (layer == layer1) ? layer2 : layer1) {
	layer_inv = inverse_permutation(layer);
	for (i = 0; i < layer.length; i++) {
	    // Compute the median/barycenter for this node and set
	    // its (real) value into node.mval
	    v = nodes[layer[i]];
	    if (layer == layer1)
		neighbors = graph.outEdges(v.index);
	    else
		neighbors = graph.inEdges(v.index);
	    neighbors = neighbors.map(function(e) {
		    var n = e.source == v ? e.target : e.source;
		    return layer_inv[n.index];
	    });
	    v.median = median(neighbors);
	    console.log('median['+i+']='+v.median);
	}
	layer.sort(function(a, b) {
	    var d = nodes[a].median - nodes[b].median;
	    if (d == 0) {
		// If both values are equal,
		// place the odd degree vertex on the left of the even
		// degree vertex
		d = (graph.edges(b).length%2) - (graph.edges(a).length%2);
	    }
	    if (d < 0) return -1;
	    else if (d > 0) return 1;
	    return 0;
	});
    }
    return [ layer1, layer2];
};