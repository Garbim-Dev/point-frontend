import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LogIn, Calendar, MapPin, GraduationCap, User } from 'lucide-react';
import './PainelAluno.css';

const PainelAluno = () => {
  const [alocacoes, setAlocacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ESTADOS DOS FILTROS (A mágica acontece aqui)
  const [filtroTurno, setFiltroTurno] = useState('Todos');
  const [filtroSala, setFiltroSala] = useState('Todas');
  
  const navigate = useNavigate();

  // Lista fixa de turnos baseada na sua ideia de domínio fechado
  const turnosDisponiveis = ['Todos', 'Manhã', 'Tarde', 'Noite', 'Diurno', 'Integral'];

  useEffect(() => {
    carregarAlocacoes();
  }, []);

  const carregarAlocacoes = async () => {
    try {
      const response = await api.get('/alocacoes/');
      setAlocacoes(response.data);
    } catch (error) {
      console.error("Erro ao carregar alocações:", error);
    } finally {
      setLoading(false);
    }
  };

  // A PENEIRA: Filtra a lista original antes de mostrar na tela
  const alocacoesFiltradas = alocacoes.filter(aloc => {
    const turnoCorreto = filtroTurno === 'Todos' || aloc.turno?.nome === filtroTurno;
    const salaCorreta = filtroSala === 'Todas' || aloc.sala?.nome === filtroSala;
    return turnoCorreto && salaCorreta;
  });

  // Pega todas as salas únicas que têm turmas alocadas para montar o Dropdown
  const salasDisponiveis = [...new Set(alocacoes.map(a => a.sala?.nome))].filter(Boolean);

  if (loading) {
    return <div className="loading-mensagem">Carregando turmas...</div>;
  }

  return (
    <div className="leitura-container">
      <header className="leitura-header">
        <div className="logo-container">
          <img src="/logoh.png" alt="Logo Point" className="logo-img" />
          <span className="slogan-texto">Gestão de Ambientes Escolares</span>
        </div>
        <button 
          onClick={() => navigate('/login')} 
          className="btn-login-icone"
          title="Acesso a Coordenação"
        >
          <LogIn color="#cc0000" size={28} />
        </button>
      </header>

      {/* ÁREA DE FILTROS */}
      <section className="filtros-section">
        <div className="filtro-sala-row">
          <div className="input-group-filtro">
            <label>Filtrar Sala</label>
            <select 
              value={filtroSala} 
              onChange={(e) => setFiltroSala(e.target.value)}
            >
              <option value="Todas">Todas as Salas</option>
              {salasDisponiveis.map(sala => (
                <option key={sala} value={sala}>{sala}</option>
              ))}
            </select>
          </div>
          <button className="btn-calendario" title="Filtrar por Data (Em breve)">
            <Calendar size={24} color="#005A9C" />
          </button>
        </div>

        {/* BOTÕES DE TURNO DINÂMICOS */}
        <div className="filtros-turno">
          {turnosDisponiveis.map(turno => (
            <button 
              key={turno}
              className={`btn-turno ${filtroTurno === turno ? 'ativo' : ''}`}
              onClick={() => setFiltroTurno(turno)}
            >
              {filtroTurno === turno ? `✓ ${turno}` : turno}
            </button>
          ))}
        </div>
      </section>

      <div className="status-bar">
        Modo Leitura - Faça login para editar
      </div>

      {/* LISTA DE CARTÕES FILTRADOS */}
      <main className="cards-list">
        {alocacoesFiltradas.length === 0 ? (
          <div className="empty-state">
            Nenhuma turma encontrada para os filtros selecionados.
          </div>
        ) : (
          alocacoesFiltradas.map((aloc) => (
            <article key={aloc.id} className="card-turma">
              <div className="card-turma-header">
                <div className="professor-info">
                  <User size={18} color="white" />
                  <h3>{aloc.professor?.nome.toUpperCase()}</h3>
                </div>
                <span className="badge-turno">{aloc.turno?.nome}</span>
              </div>
              
              <div className="card-turma-body">
                <div className="info-linha data-linha">
                  <Calendar size={18} className="icone-cinza" />
                  <span>
                    {aloc.data_ini_dic.split('-').reverse().join('/')} a {aloc.data_fim_dic.split('-').reverse().join('/')}
                  </span>
                </div>
                
                <div className="info-linha destaque-vermelho">
                  <MapPin size={18} className="icone-vermelho" />
                  <span><strong>Sala: {aloc.sala?.nome.toUpperCase()}</strong></span>
                </div>

                <div className="info-linha destaque-vermelho">
                  <GraduationCap size={18} className="icone-vermelho" />
                  <span>
                    {aloc.curso?.nome.toUpperCase()} - {aloc.disciplina?.nome.toUpperCase()}
                  </span>
                </div>

                <div className="rodape-card">
                   <span className="modalidade-txt">{aloc.modalidade?.nome}</span> • {aloc.empresa?.nome.toUpperCase()} • {aloc.quant_alunos} alunos
                </div>
              </div>
            </article>
          ))
        )}
      </main>
    </div>
  );
};

export default PainelAluno;