import networkx as nx
from analyzer.adapter import convert_graph

def calculate_static_resilience(graph: nx.DiGraph):
    resilience_val = 0
    calculated_nodes = []
    edges_count = {}
    nodes_count = {}
    total_nodes: dict[str, list] = {}
    for node in graph.nodes(data=True):
        if node[1]['type'] not in total_nodes:
            nodes_count[node[1]['type']] = 0
            edges_count[node[1]['type']] = 0
            total_nodes[node[1]['type']] = []
        nodes_count[node[1]['type']] += 1
        node_resilience = 0
        beta = float(node[1]['beta'])
        sigma = float(node[1]['sigma'])
        h_count = len(node[1]['description'].split(", "))
        h = float(node[1]['hetero']) if h_count == 1 else h_count
        edges = graph.in_edges(node[0], data=True)
        in_degree = 1
        for edge in edges:
            src_node = graph.nodes.get(edge[0])
            if src_node['type'] == node[1]['type']:
                in_degree += 1
                edges_count[node[1]['type']] += 1
        node_resilience = 1 + beta / sigma * h / in_degree
        node[1]['xt'] = node_resilience
        calculated_nodes.append(node)
        total_nodes[node[1]['type']].append(node)
    graph.add_nodes_from(calculated_nodes)

    for node_type in total_nodes:
        val = 0
        for node in total_nodes[node_type]:
            val += node[1]['xt']
        sigma = edges_count[node_type] + nodes_count[node_type]
        beta = 1
        resilience_val += 1 + beta / sigma * val / nodes_count[node_type]
    resilience_val = resilience_val / len(total_nodes)
    return resilience_val

def generate_compare_results(plans) -> dict[list]:
    results = []
    for plan in plans:
        result = [plan]
        result.append(calculate_static_resilience(convert_graph(plans[plan]['attack1'])))
        result.append(calculate_static_resilience(convert_graph(plans[plan]['attack2'])))
        result.append(calculate_static_resilience(convert_graph(plans[plan]['attack3'])))
        results.append(result)
    return results

if __name__ == "__main__":
    print(len("1, ".split(", ")))
