import React, { useState } from 'react';
import OptimizationForm from './components/OptimizationForm';

function App() {
  const [optimizationData, setOptimizationData] = useState(null);

  const handleFormSubmit = (data) => {
    setOptimizationData(data);
    console.log('Dados submetidos:', data);
    // Aqui, vamos chamar o backend mais tarde para processar a otimização
  };

  return (
    <div>
      <h1>Aplicação de Otimização</h1>
      <OptimizationForm onSubmit={handleFormSubmit} />
      {optimizationData && (
        <div>
          <h2>Dados Submetidos:</h2>
          <pre>{JSON.stringify(optimizationData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
