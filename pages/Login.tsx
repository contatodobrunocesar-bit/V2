import React, { useState } from 'react';
import { User } from '../types';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from '../components/Icons';

interface LoginProps {
    onLogin: (user: User) => void;
    users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Validar domínio antes de tentar login
            if (!email.endsWith('@secom.rs.gov.br')) {
                setError('Acesso restrito a funcionários da SECOM RS. Use seu e-mail institucional @secom.rs.gov.br');
                return;
            }

            // Usar senha padrão se não fornecida
            const loginPassword = password || 'Gov@2025+';
            
            const { login } = await import('../dataService');
            const user = await login(email, loginPassword);
            
            if (user) {
                onLogin(user);
            } else {
                setError('Erro ao fazer login. Verifique suas credenciais.');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex min-h-screen bg-white dark:bg-dark-bg">
            {/* Left Panel */}
            <div className="hidden lg:flex w-1/2 items-center justify-center bg-black p-12 text-white relative overflow-hidden">
                <div className="z-10 text-center">
                    <h1 className="text-4xl font-bold mb-4">Pauta de Mídia SECOM</h1>
                </div>
                 {/* Decorative shapes */}
                <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-24 -right-10 w-64 h-64 bg-white/10 rounded-full"></div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                        {isSignUp ? 'Criar Conta' : 'Bem-vindo(a) de volta!'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {isSignUp && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nome completo
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required={isSignUp}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-dark-accent dark:border-gray-600 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                                    placeholder="Seu nome completo"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                E-mail
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <MailIcon className="h-5 w-5 text-gray-400" />
                                </span>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 p-3 border rounded-lg bg-gray-50 dark:bg-dark-accent dark:border-gray-600 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                                    placeholder="seuemail@secom.rs.gov.br"
                                />
                            </div>
                        </div>

                        <div>
                             <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Senha
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <LockIcon className="h-5 w-5 text-gray-400" />
                                </span>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 p-3 border rounded-lg bg-gray-50 dark:bg-dark-accent dark:border-gray-600 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                                    placeholder="Digite sua senha"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 dark:disabled:bg-gray-600"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (isSignUp ? "Criar Conta" : "Entrar")}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;