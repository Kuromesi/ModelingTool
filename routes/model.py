from flask import Blueprint
from flask import request, render_template
import json, os, shutil

model = Blueprint('model', __name__, url_prefix="/model")
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

@model.route('/delete_project', methods=['POST'])
def model_delete_project():
    data = json.loads(request.get_data())
    path = data['project_name']
    if not os.path.exists(os.path.join('./projects', path)):
        return f"project {path} not found"
    shutil.rmtree(os.path.join('./projects', path))
    return f"project {path} deleted"

# ma = ModelAnalyzer()
@model.route('/analyze', methods=['POST'])
def model_analyze():
    data = json.loads(request.get_data())
    return "ok"

def load_graph(path: str) -> dict:
    with open(os.path.join(path), 'r', encoding='utf-8') as f:
        graph = json.load(f)
    return graph