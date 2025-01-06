from flask import Flask, request, jsonify
from pulp import LpProblem, LpVariable, LpMaximize, LpMinimize, lpSum, LpStatus
import logging
from flask_cors import CORS

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)
CORS(app)  # Permite requisições de qualquer origem

@app.route('/optimize', methods=['POST'])
def optimize():
    try:
        # Dados recebidos
        data = request.json
        app.logger.debug(f"Dados recebidos: {data}")
        variables = data['variables']
        objective = data['objective']
        constraints = data['constraints']

        # Validação dos dados
        if not isinstance(variables, list) or not all(isinstance(v, str) for v in variables):
            return jsonify({"error": "As variáveis devem ser uma lista de strings."}), 400
        if not isinstance(objective, dict) or 'type' not in objective or 'expression' not in objective:
            return jsonify({"error": "Função objetivo deve conter 'type' e 'expression'."}), 400
        if not isinstance(constraints, list) or not all(isinstance(c, str) for c in constraints):
            return jsonify({"error": "As restrições devem ser uma lista de strings."}), 400

        # Criando as variáveis de decisão
        decision_vars = {var: LpVariable(var, lowBound=0) for var in variables}

        # Criando o problema de otimização
        prob = LpProblem("OptimizationProblem", LpMaximize if objective['type'] == 'maximize' else LpMinimize)

        # Adicionando a função objetivo
        prob += eval(objective['expression'], {}, decision_vars)

        # Adicionando as restrições
        for constraint in constraints:
            prob += eval(constraint, {}, decision_vars)

        # Resolver o problema
        prob.solve()

        # Resultados
        result = {
            "status": LpStatus[prob.status],
            "objective_value": prob.objective.value(),
            "variables": {var: decision_vars[var].value() for var in decision_vars}
        }
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Erro ao processar o problema: {e}")
        return jsonify({"error": "Erro ao processar o problema. Verifique os dados enviados."}), 400

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS,PUT,DELETE"
    return response

if __name__ == '__main__':
    app.run(debug=True)
