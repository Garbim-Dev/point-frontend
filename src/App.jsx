import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PainelCoordenador from './pages/PainelCoordenador';
import PainelAluno from './pages/PainelAluno';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* A Rota principal (raiz) agora aponta direto para o Painel do Aluno (Modo Leitura) */}
        <Route path="/" element={<PainelAluno />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/coordenador" element={<PainelCoordenador />} />
        
        {/* Qualquer rota não encontrada joga pro início */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;