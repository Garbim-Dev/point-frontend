import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../services/api'; 
import { Mail, Lock, User, ArrowLeft, Send } from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  // Controle de qual tela estamos vendo: 'login', 'cadastro' ou 'recuperacao'
  const [view, setView] = useState('login'); 
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '' });
  
  // Novos estados para dar feedback ao usuário
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Lógica Real de Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        senha: formData.senha
      });

      if (response.data.mensagem === "Login aprovado") {
        localStorage.setItem('gestorNome', response.data.nome);
        navigate('/coordenador');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErro("E-mail ou senha incorretos.");
      } else {
        setErro("Erro de conexão com o servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Lógica Real de Cadastro no Banco de Dados
  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      await api.post('/gestores', {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        funcao: 'Coordenação' // Função padrão para novos cadastros
      });
      alert("Conta criada com sucesso! Faça o login para entrar.");
      setView('login'); // Volta pra tela de login
    } catch (error) {
      setErro("Erro ao criar conta. Este e-mail já pode estar em uso.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperacao = (e) => {
    e.preventDefault();
    alert(`Instruções de recuperação enviadas para o e-mail: ${formData.email}`);
    setView('login');
  };

  // Função para limpar erros ao trocar de tela
  const mudarTela = (novaTela) => {
    setErro('');
    setView(novaTela);
  }

  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* CABEÇALHO LIMPO - APENAS A LOGO */}
        <div className="login-header">
          <img src="/logo.png" alt="Logo Point" className="logo-imagem" />
        </div>

        {/* Caixa de mensagens de erro (Aparece se houver erro) */}
        {erro && <div className="mensagem-erro animacao-deslize">{erro}</div>}

        {/* TELA DE LOGIN */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="login-form animacao-deslize">
            <h3>Acesse sua conta</h3>
            <div className="input-with-icon">
              <Mail className="icon" size={20} />
              <input type="email" name="email" placeholder="Seu e-mail" onChange={handleInputChange} required />
            </div>
            <div className="input-with-icon">
              <Lock className="icon" size={20} />
              <input type="password" name="senha" placeholder="Sua senha" onChange={handleInputChange} required />
            </div>
            
            <button type="submit" className="btn-primario" disabled={loading}>
              {loading ? 'Validando...' : 'Entrar'}
            </button>
            
            <div className="login-links">
              <button type="button" onClick={() => mudarTela('recuperacao')} className="btn-link">Esqueci minha senha</button>
              <button type="button" onClick={() => mudarTela('cadastro')} className="btn-link destaque">Criar nova conta</button>
            </div>
          </form>
        )}

        {/* TELA DE CADASTRO */}
        {view === 'cadastro' && (
          <form onSubmit={handleCadastro} className="login-form animacao-deslize">
            <h3>Novo Cadastro</h3>
            <div className="input-with-icon">
              <User className="icon" size={20} />
              <input type="text" name="nome" placeholder="Nome completo" onChange={handleInputChange} required />
            </div>
            <div className="input-with-icon">
              <Mail className="icon" size={20} />
              <input type="email" name="email" placeholder="E-mail" onChange={handleInputChange} required />
            </div>
            <div className="input-with-icon">
              <Lock className="icon" size={20} />
              <input type="password" name="senha" placeholder="Crie uma senha" onChange={handleInputChange} required />
            </div>
            
            <button type="submit" className="btn-primario" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
            
            <button type="button" onClick={() => mudarTela('login')} className="btn-voltar">
              <ArrowLeft size={16} /> Voltar para o Login
            </button>
          </form>
        )}

        {/* TELA DE RECUPERAÇÃO DE SENHA */}
        {view === 'recuperacao' && (
          <form onSubmit={handleRecuperacao} className="login-form animacao-deslize">
            <h3>Recuperar Senha</h3>
            <p className="texto-instrucao">Digite seu e-mail abaixo. Enviaremos as instruções e uma senha provisória para você.</p>
            <div className="input-with-icon">
              <Mail className="icon" size={20} />
              <input type="email" name="email" placeholder="Seu e-mail cadastrado" onChange={handleInputChange} required />
            </div>
            
            <button type="submit" className="btn-primario">
              <Send size={18} /> Enviar E-mail
            </button>
            
            <button type="button" onClick={() => mudarTela('login')} className="btn-voltar">
              <ArrowLeft size={16} /> Voltar para o Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;