ontology = {
    node: {
        node_id: "",
        name: "",
        description: "",
        type: "",
        color: "#ff0000",
        // shape: "",
        linked_graph: "",
        beta: "1",
        sigma: "1",
        hetero: "1",
        is_entry: false,
        additional: {}
    },
    edge: {
        src: {
            linked_graph: "",
            entry_name: ""
        },
        dst: {
            linked_graph: "",
            entry_name: ""
        },
        edge_type: "undirected"
    }
}

var attributes = ['label', 'id', 'shape', 'size', 'title'];

function copy_object(object) {
    return JSON.parse(JSON.stringify(object))
}

function initialize_node_control_panel() {
    Vue.set(node_control, "cur_node", JSON.parse(JSON.stringify(ontology)))
    Vue.set(network_control, "content", {})
    Vue.set(node_control, "cur_node", copy_object(ontology.node))
    Vue.set(node_control, "clicked_node", {})

    node_control.linked_graph = "linked_graph"
    console.log("control panel initialized")
}

function initialize_edge_control_panel() {
    Vue.set(edge_control, "selected_edge", JSON.parse(JSON.stringify(ontology.edge)))
    // edge_control.$set(edge_control.selected_edge.src, "name", "")
    // edge_control.$set(edge_control.selected_edge.dst, "name", "")
}

function set_object(dst_obj, src_obj) {
    for (k in src_obj) {
        Vue.set(dst_obj, k, src_obj[k])
    }
}

node_control = new Vue({
    el: "#node-control",
    delimiters: ['{[', ']}'],
    data: {
        cur_node: {
            node_id: "",
            name: "",
            description: "",
            type: "",
            color: "#ff0000",
            // shape: "",
            beta: "1",
            sigma: "1",
            hetero: "1",
            linked_graph: "",
            is_entry: false,
            additional: {}
        },
        clicked_node: {},
        new_property_key: "key",
        new_property_value: "value",
        graph_list: {},
        entry_list: {}
    },
    methods: {
        add_node() {
            node = {}
            for (k in this.cur_node) {
                if (k == "additional") {
                    for (ak in this.cur_node.additional) {
                        node[ak] = this.cur_node.additional[ak]
                    }
                } else {
                    node[k] = this.cur_node[k]
                }
            }
            node.title = this.cur_node.name;
            node.label = this.cur_node.name;
            if (network) {
                addNode(node);
            } else {
                drawGraph([node], [{}])
                // network.on('click', network_click)
            }
            // this.cur_node = JSON.parse(JSON.stringify(ontology.node))
            initialize_node_control_panel()
        },
        delete_node() {
            console.log("node deleted: " + this.clicked_node.name)
            network.deleteSelected()
            initialize_node_control_panel()
        },
        modify_node() {
            if (network) {
                Vue.set(this.cur_node, "id", this.clicked_node.id)
                Vue.set(this, "clicked_node", this.cur_node)
                this.clicked_node.title = this.cur_node.name;
                this.clicked_node.label = this.cur_node.name;
            } else {
                alert("Network not initialized!")
            }
            addNode(this.clicked_node)
        },
        add_property() {
            this.$set(this.cur_node.additional, this.new_property_key, this.new_property_value)
            this.new_property_key = "key"
            this.new_property_value = "value"
        },
        delete_property(key) {
            this.$delete(this.cur_node.additional, key)
        },
        link_graph(graph_name) {
            this.$set(this.cur_node, "linked_graph", graph_name)
            this.linked_graph = graph_name
        },
    },
})

edge_control = new Vue({
    el: "#edge-control",
    delimiters: ['{[', ']}'],
    data: {
        selected_edge: {
            src: {
                linked_graph: "",
                entry_name: ""
            },
            dst: {
                linked_graph: "",
                entry_name: ""
            },
            edge_type: "undirected"
        },
        edge_type: "undirected",
        entry_list: {}
    },
    methods: {
        select_node(type) {
            if (type == "src") {
                this.$set(this.selected_edge, "src", copy_object(node_control.clicked_node))
            } else {
                this.$set(this.selected_edge, "dst", copy_object(node_control.clicked_node))
            }
        },
        delete_edge() {
            network.deleteSelected();
            initialize_edge_control_panel()
        },
        add_edge() {
            if (this.selected_edge.src.name && this.selected_edge.dst.name) {
                console.log("adding edge " + this.selected_edge.src.id + " -> " + this.selected_edge.dst.id)
                if (this.selected_edge.edge_type == "undirected") {
                    arrows = ""
                } else {
                    arrows = "to"
                }
                edge_attributes = {
                    arrows: arrows,
                    edge_type: this.selected_edge.edge_type,
                    description: this.selected_edge.description,
                }
                if (this.selected_edge.edge_type == "directed") {
                    addEdge(convert_panel_to_edge(this.selected_edge.src, this.selected_edge.dst, edge_attributes))
                } else {
                    addEdge(convert_panel_to_edge(this.selected_edge.src, this.selected_edge.dst, edge_attributes))
                    addEdge(convert_panel_to_edge(this.selected_edge.dst, this.selected_edge.src, edge_attributes))
                }
                initialize_edge_control_panel()
            } else {
                alert("Must select 2 nodes to create an edge!")
            }
        },
        set_edge_type(val) {
            this.selected_edge.edge_type = val
        },
        set_entry(node, graph_name, entry_id, entry_name) {
            this.$set(this.selected_edge[node], 'entry_id', entry_id)
            this.$set(this.selected_edge[node], 'graph_name', graph_name)
            this.$set(this.selected_edge[node], 'entry_name', entry_name)
        }
    }
})

project_control = new Vue({
    el: "#project-control",
    delimiters: ['{[', ']}'],
    data: {
        files: {},
        cur_graph: "",
        cur_path: "",
        cur_project: "",
        graphs: {},
        project_name: ""
    },
    methods: {
        save_graph() {
            var data = {
                nodes: nodes.get(),
                edges: edges.get()
            };
            var url = "/model/submit";
            if (!this.cur_graph) {
                alert("Please input project name!")
            } else {
                axios({
                    method: 'post',
                    url: url,
                    data: {
                        graph: data,
                        project_name: project_control.cur_project,
                        graph_name: project_control.cur_graph
                    }
                }).then(function (res) {
                    alert(res.data);
                    project_control.$set(project_control.graphs, project_control.cur_graph, data)
                    Vue.set(node_control.graph_list, project_control.cur_graph, data)
                    Vue.set(network_control.graph_list, project_control.cur_graph, data)
                    Vue.set(project_control.files, project_control.cur_graph, {})
                    Vue.set(node_control.entry_list, project_control.cur_graph, {})
                    update_entry_list(project_control.graphs[project_control.cur_graph], node_control.entry_list, project_control.cur_graph)
                    Vue.set(edge_control, "entry_list", node_control.entry_list)
                })
            }
        },
        list_files(path) {
            var url = "/model/list";
            if (path != "") {
                this.cur_path = path
                this.load_project()
            }
            axios({
                method: 'post',
                url: url,
                data: { "cur_path": this.cur_path }
            }).then(function (res) {
                files = res.data.files
                Vue.set(project_control, "files", {})
                for (i = 0; i < files.length; i++) {
                    Vue.set(project_control.files, files[i], {})
                }
            })
        },
        load_graph(file) {
            project_control.cur_graph = file;
            graph = this.graphs[file]
            drawGraph(graph.nodes, graph.edges);
            // network.on('click', network_click);
        },
        import_graph(graph) {
            console.log("import graph " + graph)
            node_id_map = {}
            this._import_graph(this.graphs[graph])
        },
        _import_graph(graph) {
            node_id_map = {}
            for (i = 0; i < graph.nodes.length; i++) { 
                node = graph.nodes[i]
                old_id = node.id
                Vue.delete(node, "id")
                new_id = addNode(node)
                node_id_map[old_id] = new_id[0]
            }
            for (i = 0; i < graph.edges.length; i++) {
                edge = graph.edges[i]
                edge.from = node_id_map[edge.from]
                edge.to = node_id_map[edge.to]
                Vue.delete(edge, "id")
                addEdge(edge)
            }
        },
        load_project() {
            var url = "/model/load_project"
            this.cur_project = this.cur_path
            axios({
                method: 'post',
                url: url,
                data: { "cur_project": this.cur_project }
            }).then(function (res) {
                project_control.graphs = res.data.graphs;
                // reset graph_list and entry_list
                node_control.graph_list = {}
                node_control.entry_list = {}
                for (k in project_control.graphs) {
                    console.log("graphs loaded: " + k)
                    node_control.$set(node_control.graph_list, k, project_control.graphs[k])
                    Vue.set(network_control.graph_list, k, project_control.graphs[k])
                    update_entry_list(project_control.graphs[k], node_control.entry_list, k)
                    Vue.set(edge_control, "entry_list", node_control.entry_list)
                }
            })
        },
        new_project() {
            var url = "/model/new_project"
            if (this.project_name == "") {
                alert("project name cannot be null")
                return
            }
            axios({
                method: 'post',
                url: url,
                data: { "project_name": this.project_name }
            }).then(function (res) {
                // for (var i = 0; i < res.data.length; i++) {
                //     project_control.$set(project_control.files, i, res.data[i])
                // }

            })
            this.$set(this.files, this.project_name, "")
            this.project_name = ""
        },
        new_graph() {
            drawGraph([], [{}])
            // network.on('click', network_click)
        },
        upper_folder() {
            this.cur_path = ""
            this.cur_project = ""
            this.cur_graph = ""
            this.list_files("")
        },
        delete_project(project_name) {
            console.log("deleting project: " + project_name)
            var url = "/model/delete"
            axios({
                method: 'post',
                url: url,
                data: { "project_name": project_name, "deletion_type": "project" }
            }).then(function (res) {
                
                console.log(res.data)
            })
            if (project_name in this.files) {
                this.$delete(this.files, project_name)
            }
            this.project_name = ""
        },
        delete_graph(graph_name) {
            console.log("deleting graph: " + graph_name)
            var url = "/model/delete"
            axios({
                method: 'post',
                url: url,
                data: { "project_name": project_control.cur_project, "graph_name": graph_name, "deletion_type": "graph" }
            }).then(function (res) {
                console.log(res.data)
            })
            Vue.delete(project_control.graphs, graph_name)
            Vue.delete(node_control.graphs, graph_name)
            Vue.delete(network_control.graphs, graph_name)
            Vue.delete(project_control.files, graph_name)
            Vue.delete(node_control.entry_list, graph_name)
        }
    }
})

function update_entry_list(graph, entry_list, graph_name) {
    for (var i = 0; i < graph.nodes.length; i++) {
        node = graph.nodes[i]
        if (node.is_entry) {
            if (!entry_list.hasOwnProperty(graph_name)) {
                Vue.set(entry_list, k, {})
            }
            Vue.set(entry_list[graph_name], node.id, node)
        }
    }
}

function convert_panel_to_edge(src, dst, edge_attributes) {
    return {
        from: src.id,
        to: dst.id,
        src: src.name,
        dst: dst.name,
        src_graph_name: src.graph_name,
        src_entry_id: src.entry_id,
        src_entry_name: src.entry_name,
        dst_graph_name: dst.graph_name,
        dst_entry_id: dst.entry_id,
        dst_entry_name: dst.entry_name,
        arrows: edge_attributes.arrows,
        edge_type: edge_attributes.edge_type,
        smooth: false,
        description: edge_attributes.description
    }
}

function convert_edge_to_panel(edge) {
    edge_panel = {
        src: {},
        dst: {},
        description: edge.description,
        edge_type: edge.edge_type,
        id: edge.id,
    }
    return {
        src: {

        }
    }
}