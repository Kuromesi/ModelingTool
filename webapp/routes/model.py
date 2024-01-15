from flask import Blueprint
from flask import request, render_template
import json, os, shutil
from rpc.ResilienceMeaurer import ResilienceMeasurer


model = Blueprint('model', __name__, url_prefix="/model")
rm = ResilienceMeasurer()

@model.route("/", methods=['GET'])
def model_page():
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
    return projects

@model.route('/load_graph', methods=['POST'])
def model_load_graph():
    path = request.get_data().decode("utf-8")
    project = load_project(os.path.join('./src/webapp/data', path))
    return project

@model.route('/load_project', methods=['POST'])
def model_load_project():
    data = json.loads(request.get_data())
    path = data['cur_project']
    files = os.listdir(os.path.join('./projects', path))
    graphs = {}
    for file in files:
        graphs[file] = load_graph(os.path.join('./projects', path, file))
    return graphs

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
            print(f"error deleting graph {graph}: {e}")
    else:
        return("invalid deletion type")

# ma = ModelAnalyzer()
@model.route('/analyze', methods=['POST'])
def model_analyze():
    data = json.loads(request.get_data())
    return "ok"

def load_graph(path: str) -> dict:
    with open(os.path.join(path), 'r', encoding='utf-8') as f:
        graph = json.load(f)
    return graph

@model.route('/static', methods=['GET'])
def generate_static_analyze_results():
    headers = ["test", "test2"]
    data = [[1, 2], [2, 3]]
    return render_template('static_analyze_results.html', headers=headers, data=data)

@model.route('/dynamic', methods=['GET'])
def call_dynamic_measurer():
    message = rm.run_dynamic_measure()
    headers = ["test", "test2"]
    data = [[1, 2], [2, 3]]
    return render_template('static_analyze_results.html', headers=headers, data=data)
    