import React from "react";
import Plot from "react-plotly.js";

const Graph = ({ data, region }) => {
  return (
    <Plot
      data={[
        // Gráfico da região factível
        {
          x: region.x,
          y: region.y,
          fill: "toself",
          type: "scatter",
          mode: "lines",
          name: "Região Factível",
          fillcolor: "rgba(0,255,0,0.2)",
          line: { color: "green" },
        },
        // Gráficos das restrições
        ...data.map((constraint) => ({
          x: constraint.x,
          y: constraint.y,
          type: "scatter",
          mode: "lines",
          name: constraint.name,
          line: { color: "red", dash: "dashdot" },
        })),
        // Solução ótima
        {
          x: [region.solution.x],
          y: [region.solution.y],
          type: "scatter",
          mode: "markers",
          name: "Solução Ótima",
          marker: { color: "blue", size: 10 },
        },
      ]}
      layout={{
        title: "Espaço de Soluções",
        xaxis: { title: "x₁" },
        yaxis: { title: "x₂" },
        showlegend: true,
      }}
      style={{ width: "100%", height: "500px" }}
    />
  );
};

export default Graph;
