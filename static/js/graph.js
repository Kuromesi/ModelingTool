// initialize global variables.
var edges;
var nodes;
var node_id = 0;
var allNodes;
var allEdges;
var nodeColors;
var originalNodes;
var network;
var container;
var options, data;
var filter = {
    item: '',
    property: '',
    value: []
};

// view node information
var info = new Vue({
    el: "#network_control",
    delimiters:['{[', ']}'],
    data: {
        content: {},
        display_panel: "information",
        network_control_panel_list: ["information", "configuration", "calculation"],
    },
    methods: {
        switch_panel(panel) {
            this.display_panel = panel
        },
    }
})
initializeGraph([], [])

function drawGraph(in_nodes, in_edges) {
    nodes = new vis.DataSet(in_nodes);
    edges = new vis.DataSet(in_edges);
    network.setData({nodes: nodes, edges: edges})
    console.log("successfully update network")
}

// This method is responsible for drawing the graph, returns the drawn network
function initializeGraph(in_nodes, in_edges) {
    var container = document.getElementById('mynetwork');
    // parsing and collecting nodes and edges from the python
    
    nodes = new vis.DataSet(in_nodes);
    edges = new vis.DataSet(in_edges);
    nodeColors = {};
    allNodes = nodes.get({
        returnType: "Object"
    });
    for (nodeId in allNodes) {
        nodeColors[nodeId] = allNodes[nodeId].color;
    }
    allEdges = edges.get({
        returnType: "Object"
    });
    // adding nodes and edges to the graph
    data = {
        nodes: nodes,
        edges: edges
    };

    var options = {
        "configure": {
            "enabled": true,
            "container": document.getElementById('configure_panel')
        },
        "edges": {
            "color": {
                "inherit": true
            },
            "smooth": {
                "enabled": true,
                "type": "dynamic"
            }
        },
        "interaction": {
            "dragNodes": true,
            "hideEdgesOnDrag": false,
            "hideNodesOnDrag": false
        },
        // "physics": {
        //     "enabled": false,
        //     "stabilization": {
        //         "enabled": true,
        //         "fit": true,
        //         "iterations": 1000,
        //         "onlyDynamicEdges": false,
        //         "updateInterval": 50
        //     }
        // }
    };
    network = new vis.Network(container, data, options);
    network.on('click', network_click)
    console.log("network initialized")
    return network;
}

function network_click(params) {
    if (params.nodes.length != 0) {
        var nodeID = params.nodes[0];
        if (nodeID) {
            clickedNode = nodes.get(nodeID)
            Vue.set(info, 'content', JSON.parse(JSON.stringify(clickedNode)))
            tmp_node = copy_object(clickedNode)
            Vue.delete(tmp_node, 'id')
            Vue.set(node_control, 'cur_node', tmp_node)
            // set_object(node_control.clicked_node, clickedNode)
            node_control.clicked_node = clickedNode
        }

        // for (key in clickedNode) {
        //     if (attributes.indexOf(key) > -1)
        //         continue;
        //     if (key == "additional") {
        //         for (ak in clickedNode[key]) {
        //             node_control.cur_node[ak] = clickedNode[key][ak]
        //         }
        //     } else {
        //         node_control.cur_node[key] = clickedNode[key]
        //     }
        // }
    } else if (params.edges.length != 0) {
        var edgeID = params.edges[0];
        if (edgeID) {
            clickedEdge = edges.get(edgeID);
        }
        Vue.set(info, 'content', clickedEdge)
        edge_control.$set(edge_control.selected_edge, "src", nodes.get(clickedEdge.from))
        edge_control.$set(edge_control.selected_edge, "dst", nodes.get(clickedEdge.to))

    } else {
        console.log("blank space clicked")
        initialize_node_control_panel()
    }
}

function addNode(in_node) {
    return nodes.update(in_node);
}

function addEdge(in_edge) {
    return edges.update(in_edge);
}