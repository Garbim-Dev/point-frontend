import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, MapPin, BookOpen, Building2, CalendarCheck, 
  Layers, ArrowLeft, Plus, Pencil, Trash2, KeyRound, X, UserPlus
} from 'lucide-react';
import './PainelCoordenador.css';

const configTabelas = {
  professores: { 
    titulo: 'Professores', 
    campos: [
      { name: 'nome', label: 'Nome', type: 'text' }, 
      { name: 'matricula', label: 'Matrícula', type: 'text' }, 
      { name: 'area_atuacao', label: 'Área', type: 'text' }, 
      { name: 'email', label: 'E-mail', type: 'email' },
      { name: 'telefone', label: 'Telefone', type: 'text' }
    ] 
  },
  salas: { 
    titulo: 'Salas e Ambientes', 
    campos: [
      { name: 'nome', label: 'Nome da Sala', type: 'text' }, 
      { name: 'bloco_andar', label: 'Bloco / Andar', type: 'text' }, 
      { name: 'capacidade', label: 'Capacidade', type: 'number' }
    ] 
  },
  cursos: { 
    titulo: 'Cursos', 
    campos: [
      { name: 'nome', label: 'Nome do Curso', type: 'text' }, 
      { name: 'carga_horaria', label: 'Carga Horária', type: 'number' }
    ] 
  },
  disciplinas: { 
    titulo: 'Disciplinas (UCs)', 
    campos: [
      { name: 'nome', label: 'Nome da UC', type: 'text' }, 
      { name: 'carga_horaria', label: 'Carga Horária', type: 'number' }
    ] 
  },
  empresas: { 
    titulo: 'Empresas', 
    campos: [
      { name: 'nome', label: 'Nome da Empresa', type: 'text' }, 
      { name: 'telefone', label: 'Telefone', type: 'text' }
    ] 
  },
  modalidades: { 
    titulo: 'Modalidades', 
    campos: [
      { name: 'nome', label: 'Modalidade', type: 'text' }
    ] 
  },
};

const PainelCoordenador = () => {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('alocacoes');
  const nomeGestor = localStorage.getItem('gestorNome') || 'Gestor';
  
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [mostrarForm, setMostrarForm] = useState(false);
  const [modalSenha, setModalSenha] = useState(false);
  const [dadosSenha, setDadosSenha] = useState({ email: '', senhaAtual: '', novaSenha: '' });

  // ESTADOS DO NOVO CADASTRO DE GESTOR
  const [novoGestor, setNovoGestor] = useState({ nome: '', email: '', senha: '' });
  const [mensagemGestor, setMensagemGestor] = useState('');

  const [listasApoio, setListasApoio] = useState({ professores: [], salas: [], cursos: [], disciplinas: [], empresas: [], turnos: [], modalidades: [] });

  useEffect(() => {
    carregarDadosPrincipais();
    cancelarEdicao(); 
  }, [abaAtiva]);

  const carregarDadosPrincipais = async () => {
    // Evita que o sistema tente buscar dados na API quando estivermos na aba de criar coordenador
    if (abaAtiva === 'novoGestor') return;

    setLoading(true);
    try {
      const response = await api.get(`/${abaAtiva}/`);
      setDados(response.data);

      if (abaAtiva === 'alocacoes') {
        const [p, s, c, d, e, t, m] = await Promise.all([
          api.get('/professores/'), api.get('/salas/'), api.get('/cursos/'),
          api.get('/disciplinas/'), api.get('/empresas/'), api.get('/turnos/'), api.get('/modalidades/')
        ]);
        setListasApoio({ professores: p.data, salas: s.data, cursos: c.data, disciplinas: d.data, empresas: e.data, turnos: t.data, modalidades: m.data });
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // FUNÇÃO DE SALVAR O NOVO COORDENADOR
  const handleCadastroGestor = async (e) => {
    e.preventDefault();
    setMensagemGestor('');
    try {
      await api.post('/gestores', {
        nome: novoGestor.nome,
        email: novoGestor.email,
        senha: novoGestor.senha,
        funcao: 'Coordenação'
      });
      setMensagemGestor("Coordenador cadastrado com sucesso!");
      setNovoGestor({ nome: '', email: '', senha: '' }); // Limpa o formulário após o sucesso
    } catch (error) {
      setMensagemGestor("Erro ao cadastrar. Verifique se o e-mail já existe no sistema.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let payload = { ...formData };

    if (abaAtiva === 'alocacoes') {
      payload = {
        quant_alunos: parseInt(payload.quant_alunos) || 0,
        data_ini_dic: payload.data_ini_dic,
        data_fim_dic: payload.data_fim_dic,
        sala_id: parseInt(payload.sala_id), curso_id: parseInt(payload.curso_id),
        disciplina_id: parseInt(payload.disciplina_id), professor_id: parseInt(payload.professor_id),
        empresa_id: parseInt(payload.empresa_id), turno_id: parseInt(payload.turno_id),
        modalidade_id: parseInt(payload.modalidade_id)
      };
    }

    try {
      if (editingId) {
        await api.put(`/${abaAtiva}/${editingId}`, payload);
      } else {
        await api.post(`/${abaAtiva}/`, payload);
      }
      carregarDadosPrincipais();
      cancelarEdicao();
    } catch (error) {
      alert("Erro ao salvar. Verifique se preencheu tudo corretamente.");
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setMostrarForm(true);
    
    if (abaAtiva === 'alocacoes') {
      setFormData({
        quant_alunos: item.quant_alunos, data_ini_dic: item.data_ini_dic, data_fim_dic: item.data_fim_dic,
        sala_id: item.sala?.id || '', curso_id: item.curso?.id || '', disciplina_id: item.disciplina?.id || '',
        professor_id: item.professor?.id || '', empresa_id: item.empresa?.id || '', turno_id: item.turno?.id || '',
        modalidade_id: item.modalidade?.id || ''
      });
    } else {
      setFormData({ ...item });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente apagar este registro?")) {
      try {
        await api.delete(`/${abaAtiva}/${id}`);
        carregarDadosPrincipais();
      } catch (error) {
        if (error.response && error.response.data && error.response.data.detail) {
          alert(`Atenção: ${error.response.data.detail}`);
        } else {
          alert("Erro inesperado ao tentar excluir o registro.");
        }
        console.error("Erro na exclusão:", error);
      }
    }
  };

  const cancelarEdicao = () => {
    setEditingId(null);
    setFormData({});
    setMostrarForm(false);
  };

  const renderFormularioApoio = () => {
    const config = configTabelas[abaAtiva];
    return (
      <form onSubmit={handleSubmit} className="modern-form">
        <div className="input-grid">
          {config.campos.map(campo => (
            <div className="field" key={campo.name}>
              <label>{campo.label}</label>
              <input 
                type={campo.type || "text"} 
                name={campo.name} 
                value={formData[campo.name] || ''} 
                onChange={handleInputChange} 
                required 
              />
            </div>
          ))}
        </div>
        <div className="form-buttons">
          <button type="submit" className="btn-primary">{editingId ? 'Salvar Alterações' : 'Cadastrar'}</button>
          <button type="button" onClick={cancelarEdicao} className="btn-secondary">Cancelar</button>
        </div>
      </form>
    );
  };

  const renderFormularioAlocacao = () => (
    <form onSubmit={handleSubmit} className="modern-form">
      <div className="input-grid">
        <div className="field">
          <label>Professor</label>
          <select name="professor_id" value={formData.professor_id || ''} onChange={handleInputChange} required>
            <option value="">Selecione...</option>
            {listasApoio.professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Sala</label>
          <select name="sala_id" value={formData.sala_id || ''} onChange={handleInputChange} required>
            <option value="">Selecione...</option>
            {listasApoio.salas.map(s => <option key={s.id} value={s.id}>{s.nome} ({s.bloco_andar || 'Sem Bloco'})</option>)}
          </select>
        </div>
        <div className="field">
          <label>Curso</label>
          <select name="curso_id" value={formData.curso_id || ''} onChange={handleInputChange} required>
            <option value="">Selecione...</option>
            {listasApoio.cursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Disciplina (UC)</label>
          <select name="disciplina_id" value={formData.disciplina_id || ''} onChange={handleInputChange} required>
            <option value="">Selecione...</option>
            {listasApoio.disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Empresa</label>
          <select name="empresa_id" value={formData.empresa_id || ''} onChange={handleInputChange} required>
            <option value="">Selecione...</option>
            {listasApoio.empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Turno</label>
          <select name="turno_id" value={formData.turno_id || ''} onChange={handleInputChange} required>
            <option value="">Selecione...</option>
            {listasApoio.turnos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Modalidade</label>
          <select name="modalidade_id" value={formData.modalidade_id || ''} onChange={handleInputChange} required>
            <option value="">Selecione...</option>
            {listasApoio.modalidades.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Quantidade de Alunos</label>
          <input type="number" name="quant_alunos" value={formData.quant_alunos || ''} onChange={handleInputChange} required min="1"/>
        </div>
        <div className="field">
          <label>Data Início</label>
          <input type="date" name="data_ini_dic" value={formData.data_ini_dic || ''} onChange={handleInputChange} required />
        </div>
        <div className="field">
          <label>Data Término</label>
          <input type="date" name="data_fim_dic" value={formData.data_fim_dic || ''} onChange={handleInputChange} required />
        </div>
      </div>
      <div className="form-buttons">
        <button type="submit" className="btn-primary">{editingId ? 'Salvar Alterações' : 'Concluir Alocação'}</button>
        <button type="button" onClick={cancelarEdicao} className="btn-secondary">Cancelar</button>
      </div>
    </form>
  );

  const handleMudarSenha = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/mudar-senha', {
        email: dadosSenha.email,
        senha_atual: dadosSenha.senhaAtual,
        nova_senha: dadosSenha.novaSenha
      });
      alert("Senha atualizada com sucesso!");
      setModalSenha(false);
      setDadosSenha({ email: '', senhaAtual: '', novaSenha: '' });
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        alert(error.response.data.detail);
      } else {
        alert("Erro ao tentar alterar a senha.");
      }
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src="/logoh.png" alt="Logo Point" className="sidebar-logo" />
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-btn ${abaAtiva === 'alocacoes' ? 'active' : ''}`} onClick={() => setAbaAtiva('alocacoes')}><CalendarCheck size={20}/> Turmas Ativas</button>
          <div className="nav-divider">Cadastros Base</div>
          <button className={`nav-btn ${abaAtiva === 'professores' ? 'active' : ''}`} onClick={() => setAbaAtiva('professores')}><Users size={20}/> Professores</button>
          <button className={`nav-btn ${abaAtiva === 'salas' ? 'active' : ''}`} onClick={() => setAbaAtiva('salas')}><MapPin size={20}/> Salas</button>
          <button className={`nav-btn ${abaAtiva === 'cursos' ? 'active' : ''}`} onClick={() => setAbaAtiva('cursos')}><BookOpen size={20}/> Cursos</button>
          <button className={`nav-btn ${abaAtiva === 'disciplinas' ? 'active' : ''}`} onClick={() => setAbaAtiva('disciplinas')}><Layers size={20}/> Disciplinas</button>
          <button className={`nav-btn ${abaAtiva === 'empresas' ? 'active' : ''}`} onClick={() => setAbaAtiva('empresas')}><Building2 size={20}/> Empresas</button>
          <button className={`nav-btn ${abaAtiva === 'modalidades' ? 'active' : ''}`} onClick={() => setAbaAtiva('modalidades')}><Layers size={20}/> Modalidades</button>
        </nav>
        
        {/* NOVA ABA PARA CADASTRO DE COORDENADORES */}
        <div className="nav-divider">Configurações</div>
        <button className={`nav-btn ${abaAtiva === 'novoGestor' ? 'active' : ''}`} onClick={() => setAbaAtiva('novoGestor')}>
          <UserPlus size={20}/> Novo Coordenador
        </button>
        
        <button className="nav-btn" onClick={() => setModalSenha(true)}>
          <KeyRound size={20}/> Alterar Senha
        </button>
        <button onClick={() => navigate('/')} className="logout-btn">
          <ArrowLeft size={18}/> Ver App de Leitura
        </button>
      </aside>

      <main className="admin-main">
        <header className="main-header">
          <div>
            {/* O cabeçalho se ajusta se a aba do Novo Coordenador estiver ativa */}
            <h1>{abaAtiva === 'alocacoes' ? 'Gestão de Turmas' : abaAtiva === 'novoGestor' ? 'Controle de Acesso' : configTabelas[abaAtiva].titulo}</h1>
            <p>Olá, <strong>{nomeGestor}</strong>! Gerencie os registros ativos no sistema.</p>
          </div>
          {abaAtiva !== 'novoGestor' && !mostrarForm && (
            <button className="add-btn" onClick={() => setMostrarForm(true)}>
              <Plus size={18}/> Novo Registro
            </button>
          )}
        </header>

        {loading ? <p>Carregando dados...</p> : (
          <div className="dashboard-content">
            
            {/* TELA EXCLUSIVA DO NOVO COORDENADOR */}
            {abaAtiva === 'novoGestor' ? (
              <div className="card form-card mb-4 animacao-deslize">
                <h3>Cadastrar Novo Coordenador (Acesso Restrito)</h3>
                <p style={{color: '#666', fontSize: '14px', marginBottom: '20px'}}>
                  Preencha os dados abaixo para gerar um novo acesso administrativo. A senha criada aqui é provisória e pode ser alterada pelo usuário posteriormente.
                </p>

                {mensagemGestor && (
                  <div className="mb-4">
                    <span className="badge-info" style={{ fontSize: '14px', padding: '8px 12px' }}>
                      {mensagemGestor}
                    </span>
                  </div>
                )}

                <form onSubmit={handleCadastroGestor} className="modern-form">
                  <div className="input-grid">
                    <div className="field">
                      <label>Nome Completo</label>
                      <input 
                        type="text" 
                        value={novoGestor.nome} 
                        onChange={(e) => setNovoGestor({...novoGestor, nome: e.target.value})} 
                        required 
                        placeholder="Nome do membro da equipe"
                      />
                    </div>
                    <div className="field">
                      <label>E-mail Institucional</label>
                      <input 
                        type="email" 
                        value={novoGestor.email} 
                        onChange={(e) => setNovoGestor({...novoGestor, email: e.target.value})} 
                        required 
                        placeholder="email@escola.com"
                      />
                    </div>
                    <div className="field">
                      <label>Senha Provisória</label>
                      <input 
                        type="password" 
                        value={novoGestor.senha} 
                        onChange={(e) => setNovoGestor({...novoGestor, senha: e.target.value})} 
                        required 
                        placeholder="Crie uma senha inicial"
                      />
                    </div>
                  </div>
                  
                  <div className="form-buttons" style={{ marginTop: '15px' }}>
                    <button type="submit" className="btn-primary">Salvar Acesso</button>
                  </div>
                </form>
              </div>

            // O RESTO DO SISTEMA (Tabelas e Formulários Base)
            ) : (
              <>
                {mostrarForm && (
                  <div className="card form-card mb-4">
                    <h2>{editingId ? 'Editando Registro' : 'Novo Cadastro'}</h2>
                    {abaAtiva === 'alocacoes' ? renderFormularioAlocacao() : renderFormularioApoio()}
                  </div>
                )}

                <div className="card table-card">
                  <table className="modern-table">
                    <thead>
                      {abaAtiva === 'alocacoes' ? (
                        <tr><th>Turma e Período</th><th>Sala</th><th>Ações</th></tr>
                      ) : (
                        <tr><th>Dados Básicos</th><th>Ações</th></tr>
                      )}
                    </thead>
                    <tbody>
                      {dados.length === 0 ? (
                        <tr><td colSpan="3" style={{textAlign:'center'}}>Nenhum registro encontrado.</td></tr>
                      ) : dados.map(item => (
                        <tr key={item.id}>
                          {abaAtiva === 'alocacoes' ? (
                            <>
                              <td>
                                <strong>{item.professor?.nome}</strong><br/>
                                <small>{item.curso?.nome} | {item.data_ini_dic} a {item.data_fim_dic}</small>
                              </td>
                              <td><span className="badge-info">{item.sala?.nome}</span></td>
                            </>
                          ) : (
                            <td>
                              <strong>{item.nome}</strong>
                              {item.email && <><br/><small>{item.email}</small></>}
                              
                              {item.bloco_andar && <span className="badge-info ms-2">Local: {item.bloco_andar}</span>}
                              {item.capacidade && <span className="badge-info ms-2">Cap: {item.capacidade}</span>}
                              
                            </td>
                          )}
                          <td style={{width: '120px'}}>
                            <button onClick={() => handleEdit(item)} className="action-btn edit"><Pencil size={18}/></button>
                            <button onClick={() => handleDelete(item.id)} className="action-btn delete"><Trash2 size={18}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            
          </div>
        )}
      </main>
      
      {/* MODAL DE ALTERAÇÃO DE SENHA */}
      {modalSenha && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="btn-fechar-modal" onClick={() => setModalSenha(false)}><X size={24} /></button>
            <h2 style={{marginTop: 0, color: '#333'}}>Alterar Senha</h2>
            <form onSubmit={handleMudarSenha} className="modern-form">
              <div className="field">
                <label>Confirme seu E-mail</label>
                <input type="email" value={dadosSenha.email} onChange={(e) => setDadosSenha({...dadosSenha, email: e.target.value})} required />
              </div>
              <div className="field">
                <label>Senha Atual</label>
                <input type="password" value={dadosSenha.senhaAtual} onChange={(e) => setDadosSenha({...dadosSenha, senhaAtual: e.target.value})} required />
              </div>
              <div className="field">
                <label>Nova Senha</label>
                <input type="password" value={dadosSenha.novaSenha} onChange={(e) => setDadosSenha({...dadosSenha, novaSenha: e.target.value})} required />
              </div>
              <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '15px'}}>Atualizar Senha</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PainelCoordenador;