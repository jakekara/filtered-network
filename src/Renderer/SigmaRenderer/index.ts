import { WebGLRenderer } from 'sigma';
import * as graphology from 'graphology';
// import erdosRenyi from 'graphology-generators/random/erdos-renyi';
import { stringify } from 'querystring';
// import { MultiDirectedGraph } from 'graphology';
import { UndirectedGraph } from 'graphology';

type GraphNode = {
    id: string,
    active?: boolean
    label?: string,
    x?: number,
    y?: number,
    // attr_label?: string,
}

type GraphEdge = {
    from: number,
    to: number,
    label: string,
    year?: number
}

class SigmaRenderer {

    props: { nodes: Array<GraphNode>; edges: Array<GraphEdge>, el: HTMLElement; };
    graph: any;
    highlightedNodes: Set<Object>
    highlightedEdges: Set<Object>

    filteredEdges: { [year: number]: boolean }

    node_dict: { [key: string]: string; }
    renderer: any;
    edges: { [edgeID: string]: GraphEdge };

    constructor(props: {
        nodes: Array<GraphNode>,
        edges: Array<GraphEdge>,
        el: HTMLElement,
    }) {
        this.props = {
            ...props
        }

        this.filteredEdges = {};

        this.render = this.render.bind(this);
        this.render();

        this.addEventHandlers = this.addEventHandlers.bind(this);
        this.addEventHandlers();

        this.filterEdges = this.filterEdges.bind(this);
    }

    filterEdges(selections: { [year: number]: boolean }) {
        this.filteredEdges = selections;
        console.log("Filtering edges", this.filteredEdges);
        console.log("All edges", this.edges);
        const edgeIDs = Array.from(new Set(Object.keys(this.edges)))
        console.log("Graph has ", this.graph.edges().length, " edges")
        console.log("SigmaRenderer has ", edgeIDs.length, " edges")

        let totalUpdated = 0
        edgeIDs.forEach(edgeID => {
            const edgeData = this.edges[edgeID];
            // if (true || edgeID.includes("1313_")){
            //     console.log("Filter edges is looking at ", edgeID, edgeData)
            // }

            let selected = true;
            const year = edgeData.year;
            if (this.filteredEdges[year] === false) {
                selected = false;
            }
            
            this.graph.setEdgeAttribute(edgeID, "active", selected)
            totalUpdated += 1;
            if (!selected) {
                // console.log("set edge attribute", this.graph.getEdgeAttribute(edgeID, "active"), edgeID);
            }
        })

        console.log("Updated ", totalUpdated, "edges", this.graph.edges().length, Object.keys(this.edges).length)
        this.graph.edges().forEach((edgeID:string)=>{
            // console.log(edgeID, this.graph.getEdgeAttribute(edgeID, "active"))
        })

        this.renderer.refresh();

    }

    addEventHandlers() {

        this.highlightedNodes = new Set();
        this.highlightedEdges = new Set();


        const nodeReducer = (node: Object, data: Object) => {

            // if all of the neighbor-edges are inactive, disable
            let active_count = 0;
            let inactive_count = 0;
            const neighbors = this.graph.neighbors(node);
            let hasAtLeastOneActiveEdge = false;

            const nodeEdges = this.graph.edges(node);

            for (const idx in nodeEdges) {
                const edge = nodeEdges[idx]
                // const edgeAttributes = this.graph.getEdgeAttributes(edge)
                // const edgeActive = this.graph.getEdgeAttribute(edge, "active")
                const edgeActive = this.graph.getEdgeAttribute(edge, "active")
                // if (!(edge in this.edges)){
                //     return { ...data, color: 'rgba(0,0,0,0)', zIndex: 0 }
                //     this.graph.dropEdge(edge);

                // }
                if (edgeActive === true) {
                    hasAtLeastOneActiveEdge = true;
                    active_count++;
                    // break;
                } else if (edgeActive === false){
                    inactive_count++;
                } else {
                    console.warn("ERROR edge", edge, edgeActive, this.graph.getEdgeAttributes(edge));                
                }
            }

            // console.log(inactive_count, active_count)
            if (!hasAtLeastOneActiveEdge) {
                return { ...data, color: '#efefef', zIndex: 0 };
            }

            if (this.highlightedNodes.has(node) && hasAtLeastOneActiveEdge)
                return { ...data, color: '#f00', zIndex: 2 };

            if (this.highlightedNodes.has(node) && !hasAtLeastOneActiveEdge)
                return { ...data, color: '#0f0', zIndex: 2 };

            return { ...data, color: '#000', zIndex: 1 }

            // return data;
        };

        const edgeReducer = (edge: Object, data: { year: number, active: boolean }) => {

            const edgeActive = this.graph.getEdgeAttribute(edge, "active");
            // if (data.active === false){
            if (edgeActive == false ){
                return { ...data, color: 'rgba(0,0,0,0)', zIndex: 1 }
            }

            if (this.highlightedEdges.has(edge) && edgeActive == true )
                return { ...data, color: '#f00', zIndex: 10 };
            
            // if (this.highlightedEdges.has(edge) && edgeActive === false)
            //     return { ...data, color: '#0f0', zIndex: 1 };

            // if (edgeActive === false) {
            //         console.log("edgeActive === false", edge)
            //         return { ...data, color: 'rgba(0,255,0,1)', zIndex: 0 };
            //     }
    
            
            return { ...data, color: '#efefef', zIndex: 1 }
        };

        this.renderer.on('clickNode', (obj: { node: object, captor: object }) => {
            console.log('Clicking:', obj.node, obj.captor);
        });

        this.renderer.on('clickStage', () => {
            console.log('Clicking the stage.');
        });

        this.renderer.on('enterNode', (evt: { node: object }) => {
            const node = evt.node;

            this.highlightedNodes = new Set(this.graph.neighbors(node));
            this.highlightedNodes.add(node);

            this.highlightedEdges = new Set(this.graph.edges(node));

            this.renderer.refresh();
        });

        this.renderer.on('leaveNode', (evt: { node: any }) => {

            this.highlightedNodes.clear();
            this.highlightedEdges.clear();

            this.renderer.refresh();
        });

        this.renderer.settings.nodeReducer = nodeReducer;
        this.renderer.settings.edgeReducer = edgeReducer;

    }

    render() {
        console.log("RENDER CALLED")
        this.node_dict = {};
        // this.graph = erdosRenyi(graphology.UndirectedGraph, { order: this.props.nodes.length, probability: 0.2 });
        this.graph = new UndirectedGraph();

        // this.graph.on('edgeAdded', function(evt:{key:string, source:string, target:string, attributes:{label:string}}) {
        //     // console.log("edgeAdded")//, evt.attributes.label, evt.source, evt.target)
        //     // console.log(evt.key, evt.source, evt.target, this.graph.getEdgeAttributes(evt.key));
        //   })

        //this.graph.nodes().forEach((node: string, i: number) => {
        this.props.nodes.forEach((full_node: GraphNode) =>{
            //const full_node: GraphNode = this.props.nodes[i];
            // graph.mergeNodeAttributes(node, full_node);
            const node = this.graph.addNode(full_node.id, {...full_node});
            // this.graph.mergeNodeAttributes(node, { ...full_node })
            // console.log(`Adding to full_node=${node}, i=${i} id=${full_node.id}`, full_node)
            this.node_dict[full_node.id] = node
        });

        console.log("* Added all nodes", this.graph.nodes());

        this.edges = {}

        // I'm not sure why we're starting with so many edges.
        // Is it a property of ErdosRenyi that all the nodes are connected?
        // console.log("There are ", this.graph.edges().length, " edges ")
        this.graph.clearEdges();
        // console.log("Now there are ", this.graph.edges().length, " edges ")

        this.props.edges.forEach((edge, i) => {
            try {
                const edgeID = this.graph.addEdge(this.node_dict[edge.from], this.node_dict[edge.to],
                    {
                        active: true,
                        label: edge.label
                    })
                this.graph.setEdgeAttribute(edgeID, "active", true);
                this.edges[edgeID] = edge;
            } catch (err) {
                if (String(err).includes("already exists. If you really want")){}
                else {

                    console.error(err)
                }
                // don't add duplicate edges between two nodes. Use MultiUndirectGraph if you want that.
            }
        });

        console.log("* Added all edges", Object.keys(this.edges).length, Object.keys(this.edges).length, this.edges)

        this.renderer = new WebGLRenderer(this.graph, this.props.el, {
            // renderEdgeLabels: true
        });
    }

}

export {
    GraphNode as Node,
    GraphEdge as Edge,
    SigmaRenderer
}
