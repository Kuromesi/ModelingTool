import json, os, shutil

from flask import request, render_template, Blueprint, Response
from flask import current_app
from rpc.ResilienceMeaurer import ResilienceMeasurer
from utils.gen_random_graph import gen_same_degree_graph
from utils.response import Response, SUCCESS_CODE, ERROR_CODE
from utils.utils import run_command
from analyzer.static_resilience import calculate_static_resilience, generate_compare_results
from analyzer.adapter import convert_graph


model = Blueprint('model', __name__, url_prefix="/model")
rm = ResilienceMeasurer()
tmp_results = ""

@model.route("/", methods=['GET'])
def model_page():
    current_app.logger.debug("test")
    return render_template("model.html")

@model.route('/submit', methods=['POST'])
def model_submit():
    data = json.loads(request.get_data())
    graph = data['graph']
    path = os.path.join('./projects', data['project_name'], data['graph_name'])
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(graph, f)
    return "Saved!"

@model.route('/list', methods=['POST'])
def model_list():
    data = json.loads(request.get_data())
    projects = os.listdir(os.path.join('./projects', data['cur_path']))
    current_app.logger.debug(f"listing projects: {data['cur_path']}")
    return Response(SUCCESS_CODE, files=projects).get_response()

@model.route('/load_project', methods=['POST'])
def model_load_project():
    data = json.loads(request.get_data())
    path = data['cur_project']
    current_app.logger.debug(f"loading project: {path}")
    files = os.listdir(os.path.join('./projects', path))
    graphs = {}
    for file in files:
        graphs[file] = load_graph(os.path.join('./projects', path, file))
    return Response(SUCCESS_CODE, graphs=graphs).get_response()

@model.route('/new_project', methods=['POST'])
def model_new_project():
    data = json.loads(request.get_data())
    path = data['project_name']
    if not os.path.exists(os.path.join('./projects', path)):
        os.mkdir(os.path.join("./projects", path))
    projects = os.listdir('./projects')
    return projects

@model.route('/delete', methods=['POST'])
def model_delete():
    data = json.loads(request.get_data())
    project = data['project_name']
    if project == "":
        return "project name cannot be empty"
    if not os.path.exists(os.path.join('./projects', project)):
            return f"project {project} not found"
    if data['deletion_type'] == "project":
        try:
            shutil.rmtree(os.path.join('./projects', project))
        except Exception as e:
            return f"error deleting project {project}: {e}"
        return f"project {project} deleted"
    elif data['deletion_type'] == "graph":
        graph = data['graph_name']
        file_to_delete = os.path.join('./projects', project, graph)
        if not os.path.exists(file_to_delete):
            return f"graph {graph} not found in {project}"
        try:
            os.remove(file_to_delete)
            return(f"graph {graph} deleted")
        except Exception as e:
            current_app.logger.error(f"error deleting graph {graph}: {e}")
    else:
        return("invalid deletion type")

def load_graph(path: str) -> dict:
    with open(os.path.join(path), 'r', encoding='utf-8') as f:
        graph = json.load(f)
    return graph

@model.route('/static', methods=['POST'])
def generate_static_analyze_results():
    graph = json.loads(request.get_data())
    resilience = calculate_static_resilience(convert_graph(graph))
    current_app.logger.debug(f"get static resilience: {resilience}")
    return str(resilience)
    # headers = ["test", "test2"]
    # data = [[1, 2], [2, 3]]
    # return render_template('static_analyze_results.html', headers=headers, data=data)

@model.route('/compare', methods=['POST'])
def model_generate_compare_results():
    global tmp_results
    plans = json.loads(request.get_data())
    results = generate_compare_results(plans)
    headers = ["方案名称", "执行器故障", "网络攻击", "拒止环境"]
    tmp_results = render_template('static_analyze_results.html', headers=headers, data=results)
    return tmp_results

@model.route('/compare', methods=['GET'])
def show_results():
    return tmp_results

@model.route('/dynamic', methods=['POST'])
def call_dynamic_measurer():
    # message = rm.run_dynamic_measure()
    data = json.loads(request.get_data())
    if data['command'] == 1:
        run_command("")
    elif data['command'] == 2:
        run_command("")
    return "success"
    
@model.route('/random-graph', methods=['POST'])
def generate_random_graph():
    data = json.loads(request.get_data())
    nodes_num = int(data['nodes_num'])
    degree = int(data['degree'])
    color = data['color']
    edge_type = data['edge_type']
    try:
        current_app.logger.debug(f"generating same degree random graph with {nodes_num} nodes and {degree} degree")
        same_degree_graph = gen_same_degree_graph(nodes_num, degree, color, edge_type)
    except Exception as e:
        msg = f"error generating graph: {e}"
        current_app.logger.error(msg)
        return Response(ERROR_CODE, msg).get_response()
        # return {'status': 500, 'msg': msg}
    msg = f"same degree random graph with {nodes_num} nodes and {degree} degree generated"
    return Response(SUCCESS_CODE, msg, graph=same_degree_graph).get_response()