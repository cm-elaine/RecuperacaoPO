1. Iniciar no terminal App.py
2. Iniciar npm start no terminal do Front-end
3. Preencher os dados para calcular e gerar o gráfico

OBS: Talvez seja necessário rodar o comando npm install no front-end para instalar as dependências

Exemplo de problema para teste:

{
  "variables": ["x", "y"],
  "objective": {
    "type": "maximize",
    "expression": "3*x + 5*y"
  },
  "constraints": [
    "x + 2*y <= 8",
    "3*x + 2*y <= 12",
    "x >= 0",
    "y >= 0"
  ]
}


