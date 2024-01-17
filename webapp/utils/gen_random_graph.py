import networkx as nx
import matplotlib.pyplot as plt

def gen_same_degree_graph(nodes_num: int, degree: int, color: str, edge_type: str) -> dict:
    random_graph = nx.random_regular_graph(d=degree, n=nodes_num)
    nodes = []
    edges = []
    for node in random_graph.nodes(data=True):
        node_id = str(node[0])
        nodes.append({
            'id': node_id,
            'name': node_id,
            'label': node_id,
            'title': node_id,
            'color': color
        })
    if edge_type == "undirected":
        arrows = ""
    else:
        arrows = "to"
    for edge in random_graph.edges(data=True):
        edges.append({
            'from': edge[0],
            'to': edge[1],
            'smooth': False,
            'arrows': arrows
        })
        if edge_type == "bi-directed":
            edges.append({
            'to': edge[0],
            'from': edge[1],
            'smooth': False,
            'arrows': arrows
        })
    return {
        'nodes': nodes,
        'edges': edges,
    }
        
if __name__ == '__main__':
    gen_same_degree_graph(10, 3)