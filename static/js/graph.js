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
            console.log(this.$refs)
            this.display_panel = panel
        },
        initializeGraph(in_nodes, in_edges) {
            container = this.$refs.my_network;
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
            };
            network = new vis.Network(container, data, options);
            network.on('click', network_click)
            console.log("network initialized")
        },
        toFullscreen(element) {
            //全屏
            if (element.requestFullscreen) {
                element.requestFullscreen()
            }
            //兼容Firefox全屏
            else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen()
            }
            //兼容Chrome Safari Opera全屏
            else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen()
            }
            //兼容IE Edge全屏
            else if (element.msRequestFullscreen) {
                element.msRequestFullscreen()
            }
        },
        fullScreen() {
            this.fullBoolean = true
            //获取需要全屏的元素
            let full = this.$refs.my_network
            //开启全屏方法
            this.toFullscreen(full)
        }
    }
})
info.initializeGraph([], [])

function drawGraph(in_nodes, in_edges) {
    nodes = new vis.DataSet(in_nodes);
    edges = new vis.DataSet(in_edges);
    network.setData({nodes: nodes, edges: edges})
    console.log("successfully update network")
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