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
var network_control = new Vue({
    el: "#network_control",
    delimiters:['{[', ']}'],
    data: {
        content: {},
        display_panel: "information",
        network_control_panel_list: ["information", "configuration", "calculation"],
        static_resilience_value: 0,
        dynamic_url: "",
        random_graph: {
            nodes_num: 0,
            degree: 0,
            color: "#ff0000",
            edge_type: "undirected"
        },
        graph_list: {},
        compare_results: {},
        plan_name: "",
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
        },
        calculate_static_resilience() {
            console.log("calculating static resilience: " + project_control.cur_project + project_control.cur_graph)
            var url = "/model/static";
            axios({
                method: 'post',
                url: url,
                data: project_control.graphs[project_control.cur_graph]
            }).then(function (res) {
                console.log("received resilience: " + res.data);
                network_control.static_resilience_value = res.data
            })
        },
        calculate_dynamic_resilience() {
            console.log("calculating static resilience")
            this.dynamic_url = "static"
            // window.location.href = "static?test=1,2,3,4"
            // var url = "/model/dynamic";
            // axios({
            //     method: 'get',
            //     url: url,
            // }).then(function (res) {
            //     console.log(res.data);
            // })
        },
        run_command(command) {
            console.log("calculating static resilience")
            var url = "/model/dynamic";
            axios({
                method: 'post',
                url: url,
                data: {'command': command}
            }).then(function (res) {
                console.log(res.data);
            })
        },
        save_node_position() {
            network.storePositions()
            console.log(JSON.stringify(nodes.get()))
            project_control.save_graph()
        },
        generate_random_graph() {
            console.log("generating random graph")
            this.$router.push('/static');
            var url = "/model/random-graph";
            axios({
                method: 'post',
                url: url,
                data: { "nodes_num": this.random_graph.nodes_num, "degree": this.random_graph.degree, "color": this.random_graph.color, "edge_type": this.random_graph.edge_type  }
            }).then(function (res) {
                response = res.data
                console.log(response.msg)
                if (response.status == 200) {
                    drawGraph([], [{}])
                    project_control._import_graph(response.graph)
                }
                else if (response.status == 500) {
                    alert("invalid graph attributes")
                }
            })
        },
        set_edge_type(edge_type) {
            this.random_graph.edge_type = edge_type
        },
        add_plan() {
            Vue.set(this.compare_results, this.plan_name, {
                "attack1": "",
                "attack2": "",
                "attack3": ""
            })
            this.plan_name = ""
        },
        set_attack(key, attack, graph_name) {
            this.compare_results[key][attack] = graph_name
        },
        generate_compare_results() {
            console.log("generating compare results")
            var url = "/model/compare";
            compare_results = {}
            for (key in this.compare_results) {
                compare_results[key] = {}
                compare_results[key]['attack1'] = project_control.graphs[this.compare_results[key]['attack1']]
                compare_results[key]['attack2'] = project_control.graphs[this.compare_results[key]['attack2']]
                compare_results[key]['attack3'] = project_control.graphs[this.compare_results[key]['attack3']]
            }
            axios({
                method: 'post',
                url: url,
                data: compare_results
            }).then(function (res) {
                response = res.data
                console.log(response)
                window.location.href = "compare"
            })
        }
    }
})
network_control.initializeGraph([], [])

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
            Vue.set(network_control, 'content', JSON.parse(JSON.stringify(clickedNode)))
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
        Vue.set(network_control, 'content', clickedEdge)
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