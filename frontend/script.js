const { createClient } = supabase;

// Configurações do Supabase - Substitua pelas suas credenciais
const SUPABASE_URL = 'https://zdwacbnbkzsqwrmvftyc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkd2FjYm5ia3pzcXdybXZmdHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTI5NDUsImV4cCI6MjA3ODU2ODk0NX0.JR-HYIT1eDkKdsb0UC7R2IBgV4pX1ON93TNEeGiB3jA';

const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const apiStatusSpan = document.getElementById('api-status');

    // --- Verificação de Status da API Backend ---
    fetch('http://localhost:3001/api/status')
        .then(response => {
            if (!response.ok) {
                throw new Error('Resposta da API não foi OK');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'ok') {
                apiStatusSpan.textContent = 'Online';
                apiStatusSpan.style.color = 'green';
            } else {
                apiStatusSpan.textContent = 'Status Inesperado';
                apiStatusSpan.style.color = 'orange';
            }
        })
        .catch(error => {
            console.error('Erro ao conectar com a API:', error);
            apiStatusSpan.textContent = 'Offline';
            apiStatusSpan.style.color = 'red';
        });

    // --- Lógica de Autenticação Supabase ---
    const loginForm = document.getElementById('login');
    const signupForm = document.getElementById('signup');
    const forgotPasswordForm = document.getElementById('forgot-password');

    const authForms = document.getElementById('auth-forms');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout');

    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const showForgotLink = document.getElementById('show-forgot');
    const backToLoginLink = document.getElementById('back-to-login');

    const loginFormContainer = document.getElementById('login-form');
    const signupFormContainer = document.getElementById('signup-form');
    const forgotPasswordFormContainer = document.getElementById('forgot-password-form');

    // --- Funções de UI ---
    function showLoginForm() {
        loginFormContainer.classList.remove('hidden');
        signupFormContainer.classList.add('hidden');
        forgotPasswordFormContainer.classList.add('hidden');
    }

    function showSignupForm() {
        loginFormContainer.classList.add('hidden');
        signupFormContainer.classList.remove('hidden');
        forgotPasswordFormContainer.classList.add('hidden');
    }

    function showForgotPasswordForm() {
        loginFormContainer.classList.add('hidden');
        signupFormContainer.classList.add('hidden');
        forgotPasswordFormContainer.classList.remove('hidden');
    }

    function showWelcomeMessage() {
        authForms.classList.add('hidden');
        welcomeMessage.classList.remove('hidden');
    }

    function showAuthForms() {
        authForms.classList.remove('hidden');
        welcomeMessage.classList.add('hidden');
    }

    // --- Event Listeners para navegação entre formulários ---
    showSignupLink.addEventListener('click', (e) => { e.preventDefault(); showSignupForm(); });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); });
    showForgotLink.addEventListener('click', (e) => { e.preventDefault(); showForgotPasswordForm(); });
    backToLoginLink.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); });

    // --- Funções de Autenticação ---

    // Cadastro
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        const { data, error } = await _supabase.auth.signUp({ email, password });

        if (error) {
            alert('Erro no cadastro: ' + error.message);
        } else {
            alert('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.');
            showLoginForm(); // Volta para a tela de login
        }
    });

    // Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const { data, error } = await _supabase.auth.signInWithPassword({ email, password });

        if (error) {
            alert('Erro no login: ' + error.message);
        } else {
            // O estado da autenticação é verificado abaixo
        }
    });

    // Recuperação de Senha
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;

        const { data, error } = await _supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin, // Link para onde o usuário será redirecionado após resetar a senha
        });

        if (error) {
            alert('Erro ao enviar e-mail de recuperação: ' + error.message);
        } else {
            alert('Link de recuperação de senha enviado para o seu e-mail.');
            showLoginForm();
        }
    });

    // Logout
    logoutButton.addEventListener('click', async () => {
        const { error } = await _supabase.auth.signOut();
        if (error) {
            alert('Erro ao sair: ' + error.message);
        }
        // O estado da autenticação é verificado abaixo
    });

    // --- Gerenciamento de Sessão ---

    // Verifica o estado da autenticação quando a página carrega
    _supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
            showWelcomeMessage();
        } else {
            showAuthForms();
        }
    });
});
