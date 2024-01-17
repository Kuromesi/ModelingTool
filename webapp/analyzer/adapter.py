import json
import networkx as nx
import matplotlib.pyplot as plt

def convert_graph(pyvis_graph: dict) -> nx.DiGraph:
    DG = nx.DiGraph()
    nodes = []
    # Edges
    edges = []
    labels = {}
    for edge in pyvis_graph['edges']:
        if 'from' in edge and 'to' in edge:
            src = edge.pop('from')
            dest = edge.pop('to')
            edges.append((src, dest, edge))
    for node in pyvis_graph['nodes']:
        nodes.append((node['id'], node))
        labels[node['id']] = node['name']
    DG.add_edges_from(edges)
    DG.add_nodes_from(nodes)
    # nx.draw(DG, with_labels=True, labels=labels)
    # plt.show()
    return DG

def convert_file(path: str) -> nx.DiGraph:
    with open(path, 'r') as f:
        pyvis_graph = json.load(f)

    DG = nx.DiGraph()
    nodes = []
    # Edges
    edges = []
    labels = {}
    for edge in pyvis_graph['edges']:
        if 'from' in edge and 'to' in edge:
            src = edge.pop('from')
            dest = edge.pop('to')
            edges.append((src, dest, edge))
    for node in pyvis_graph['nodes']:
        nodes.append((node['id'], node))
        labels[node['id']] = node['name']
    DG.add_edges_from(edges)
    DG.add_nodes_from(nodes)
    # nx.draw(DG, with_labels=True, labels=labels)
    # plt.show()
    return DG

if __name__ == "__main__":
    convert("./projects/test/test.json")