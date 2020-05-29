import loadJSON from "./loadJSON";
import RangeFilter from "./Filters/RangeFilter"
import * as SigmaRenderer from "./Renderer/SigmaRenderer/index";


console.log("Hello!")

// Load JSON data
Promise.all(["./data/nodes.json", "./data/edges.json"].map(loadJSON))
    .then((results: [Array<SigmaRenderer.Node>, Array<SigmaRenderer.Edge>]) => {


        const [nodes, edges] = results;
        let filterYears:{[year:number]:boolean} = {};

        // render graph
        const graphEl: HTMLElement = document.getElementById("graph")
        console.log(`loaded ${edges.length} edges and ${nodes.length} nodes`)
        console.log(graphEl)

        let renderer: SigmaRenderer.SigmaRenderer;


        function selectedNodesAndEdges(){

            let goodNodes:Array<SigmaRenderer.Node> = [];
            let goodEdges:Array<SigmaRenderer.Edge> = []

            let addedNodeIds:Array<string> = [];
            
            edges.forEach(e=>{
                if (filterYears[e.year] === false){
                    return;
                }

                goodEdges.push(e);
                for (const n in [e.from, e.to]){
                    if (n in addedNodeIds){ continue}

                    goodNodes.push(nodes.filter(x => x.id === n)[0])
                    addedNodeIds.push(n);

                }

            })

            return {
                nodes: goodNodes,
                edges: goodEdges
            }
        }


        function update() {
            // const selected:{nodes:Array<SigmaRenderer.Node>, edges:Array<SigmaRenderer.Edge>} = selectedNodesAndEdges();
            // const goodNodes = selected.nodes;
            // const goodEdges = selected.edges;
            // if (renderer){
                
            // }
            console.log("Rendering with ", nodes.length, " nodes and ", edges.length, " edges.")
            renderer = new SigmaRenderer.SigmaRenderer({
                nodes,
                edges,
                el: graphEl
            });
        }

        // render controls
        const controlsEl: HTMLElement = document.getElementById("controls")
        const filter = new RangeFilter({
            el: controlsEl,
            items: edges.map((e, i) => {
                return {
                    id: String(i),
                    value: Number(e.year || 0)
                }
            }),
            id: "year-demo"
        })

        // subscribe to filter events
        controlsEl.addEventListener("filterUpdate", (evt: CustomEvent) => {
            console.log("Received event details:", evt.detail)
            renderer.filterEdges(evt.detail)
            // filterYears = evt.detail;
            // update();

        })

        update();

    })

