    import React, { useState, useEffect, useRef } from "react";
    import axios from "axios";
    import { Chart as ChartJS, LinearScale, CategoryScale, Title, Tooltip, Legend, ScatterController, PointElement, LineElement, LineController } from 'chart.js';

    // Registrar os componentes necessários
    ChartJS.register(
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
    ScatterController,
    PointElement,
    LineElement, // Necessário para gráficos de linha
    LineController // Registrar o controlador de linha
    );

    const OptimizationForm = () => {
    const [variables, setVariables] = useState([""]);
    const [objective, setObjective] = useState({ type: "maximize", expression: "" });
    const [constraints, setConstraints] = useState([""]);
    const [errors, setErrors] = useState({});
    const [result, setResult] = useState(null); // Para armazenar o resultado da otimização

    const chartRef = useRef(null); // Referência para o canvas do gráfico

    // Validações (mesmo código anterior)
    const validate = () => {
        const newErrors = {};

        // Validações aqui (mesmo código do exemplo anterior)

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
        const data = { variables, objective, constraints };
        try {
            const response = await axios.post("http://localhost:5000/optimize", data);
            setResult(response.data); // Armazena o resultado recebido
        } catch (error) {
            console.error("Erro ao otimizar:", error.response?.data || error.message);
            alert("Erro ao processar o problema.");
        }
        }
    };

    // Função para desenhar o gráfico após receber os resultados
    useEffect(() => {
        if (result) {
        const ctx = chartRef.current.getContext("2d");

        // Função para gerar os pontos das linhas das restrições
        const generateLineData = (constraint) => {
            const [a, b, c] = constraint.match(/([+-]?\d*\.?\d+|\d+)(x|y)?([<=|>=]\s*\d+)?/g).map(val => parseFloat(val));
            const points = [];
            // Se for uma restrição como "ax + by <= c"
            // Exemplo: "x + y <= 10" será transformado em "y = 10 - x"
            for (let x = -10; x < 10; x++) {
            const y = (c - a * x) / b; // Equação da reta
            points.push({ x, y });
            }
            return points;
        };

        // Função para encontrar pontos de interseção
        const findIntersection = (constraint1, constraint2) => {
            const [a1, b1, c1] = constraint1.match(/([+-]?\d*\.?\d+|\d+)(x|y)?([<=|>=]\s*\d+)?/g).map(val => parseFloat(val));
            const [a2, b2, c2] = constraint2.match(/([+-]?\d*\.?\d+|\d+)(x|y)?([<=|>=]\s*\d+)?/g).map(val => parseFloat(val));

            // Sistema de equações lineares: ax + by = c
            const denominator = a1 * b2 - a2 * b1;
            if (denominator === 0) return null; // As linhas são paralelas ou coincidentes

            const x = (b2 * c1 - b1 * c2) / denominator;
            const y = (a1 * c2 - a2 * c1) / denominator;

            return { x, y };
        };

        // Gerar dados para as restrições
        const lineDatasets = constraints.map((constraint, index) => ({
            label: `Restrição ${index + 1}`,
            data: generateLineData(constraint),
            borderColor: "green",
            borderWidth: 2,
            fill: false,
            type: 'line', // Tipo de gráfico como linha
        }));

        // Encontrar os pontos extremos (interseções)
        const intersectionPoints = [];
        for (let i = 0; i < constraints.length; i++) {
            for (let j = i + 1; j < constraints.length; j++) {
            const intersection = findIntersection(constraints[i], constraints[j]);
            if (intersection) intersectionPoints.push(intersection);
            }
        }

        // Adicionar pontos extremos como dados para o gráfico
        const pointDatasets = intersectionPoints.map((point, index) => ({
            label: `Ponto Extremo ${index + 1}`,
            data: [point],
            backgroundColor: "purple",
            pointRadius: 5,
            type: 'scatter', // Tipo de gráfico como dispersão
        }));

        // Adicionar a solução ótima como ponto (se houver)
        const optimalSolution = result ? [{ x: result.variables.x, y: result.variables.y }] : [];
        const optimalDataset = optimalSolution.length > 0 ? [{
            label: "Solução Ótima",
            data: optimalSolution,
            backgroundColor: "red",
            pointRadius: 7,
            type: 'scatter',
        }] : [];

        // Criar o gráfico com todos os dados (restrições, pontos extremos, solução ótima)
        const chart = new ChartJS(ctx, {
            type: "scatter", // Tipo de gráfico, você pode mudar para 'line' ou outros
            data: {
            datasets: [
                ...lineDatasets,
                ...pointDatasets,
                ...optimalDataset,
                {
                label: "Região Factível (Exemplo)",
                data: [
                    { x: 1, y: 5 },
                    { x: 2, y: 4 },
                    { x: 3, y: 3 },
                    { x: 4, y: 2 },
                    { x: 5, y: 1 },
                ], // Dados de exemplo da região factível
                backgroundColor: "blue",
                pointRadius: 3,
                },
            ],
            },
            options: {
            scales: {
                x: {
                type: "linear",
                position: "bottom",
                title: {
                    display: true,
                    text: "Variável X",
                },
                },
                y: {
                type: "linear",
                title: {
                    display: true,
                    text: "Variável Y",
                },
                },
            },
            },
        });

        // Limpar o gráfico anterior quando necessário
        return () => {
            chart.destroy();
        };
        }
    }, [result, constraints]);

    return (
        <div>
        <form onSubmit={handleSubmit}>
            <h2>Definir Problema de Otimização</h2>

            {/* Variáveis de Decisão */}
            <div>
            <h3>Variáveis de Decisão</h3>
            {variables.map((variable, index) => (
                <div key={index}>
                <input
                    type="text"
                    placeholder={`Variável ${index + 1}`}
                    value={variable}
                    onChange={(e) => {
                    const newVariables = [...variables];
                    newVariables[index] = e.target.value;
                    setVariables(newVariables);
                    }}
                />
                {errors[`variable_${index}`] && (
                    <p style={{ color: "red" }}>{errors[`variable_${index}`]}</p>
                )}
                </div>
            ))}
            <button type="button" onClick={() => setVariables([...variables, ""])}>Adicionar Variável</button>
            </div>

            {/* Função Objetivo */}
            <div>
            <h3>Função Objetivo</h3>
            <select
                value={objective.type}
                onChange={(e) => setObjective({ ...objective, type: e.target.value })}
            >
                <option value="maximize">Maximizar</option>
                <option value="minimize">Minimizar</option>
            </select>
            <input
                type="text"
                placeholder="Expressão (ex: 2x + 3y)"
                value={objective.expression}
                onChange={(e) => setObjective({ ...objective, expression: e.target.value })}
            />
            {errors.objective && <p style={{ color: "red" }}>{errors.objective}</p>}
            </div>

            {/* Restrições */}
            <div>
            <h3>Restrições</h3>
            {constraints.map((constraint, index) => (
                <div key={index}>
                <input
                    type="text"
                    placeholder={`Restrição ${index + 1} (ex: x + y <= 10)`}
                    value={constraint}
                    onChange={(e) => {
                    const newConstraints = [...constraints];
                    newConstraints[index] = e.target.value;
                    setConstraints(newConstraints);
                    }}
                />
                {errors[`constraint_${index}`] && (
                    <p style={{ color: "red" }}>{errors[`constraint_${index}`]}</p>
                )}
                </div>
            ))}
            <button type="button" onClick={() => setConstraints([...constraints, ""])}>Adicionar Restrição</button>
            </div>

            <button type="submit">Resolver Problema</button>
        </form>

        {/* Exibição dos Resultados */}
        {result && (
            <div>
            <h3>Resultado</h3>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Valor da Função Objetivo:</strong> {result.objective_value}</p>
            <h4>Valores das Variáveis:</h4>
            <ul>
                {Object.entries(result.variables).map(([varName, value]) => (
                <li key={varName}>{varName}: {value}</li>
                ))}
            </ul>
            </div>
        )}

        {/* Gráfico com a Região Factível e Solução Ótima */}
        {result && (
            <div>
            <h3>Gráfico da Solução</h3>
            <canvas ref={chartRef} width="400" height="400"></canvas>
            </div>
        )}
        </div>
    );
    };

    export default OptimizationForm;
