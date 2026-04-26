document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const logoutBtn = document.getElementById('logout-btn');
    const authLink = document.getElementById('auth-link');
    const logoutLink = document.getElementById('logout-link');
    const profileLink = document.getElementById('profile-link');
    const adminLink = document.getElementById('admin-link');
    const navUsername = document.getElementById('nav-username');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // Update auth state UI
    function updateAuthUI() {
        const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

        const isLoggedIn = !!currentUser;
        const isAdmin = currentUser && currentUser.role === 'admin';

        if (authLink) {
            authLink.style.display = isLoggedIn ? 'none' : 'block';
        }
        if (profileLink) {
            profileLink.style.display = isLoggedIn ? 'block' : 'none';
        }
        if (logoutLink) {
            logoutLink.style.display = isLoggedIn ? 'block' : 'none';
        }
        if (adminLink) {
            adminLink.style.display = isAdmin ? 'block' : 'none';
        }
        if (navUsername) {
            navUsername.textContent = isLoggedIn ? currentUser.username : '';
        }
    }

    // Initialize auth UI
    updateAuthUI();

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await api.request('/auth/logout', 'POST');
            } catch (e) {
                console.error('Logout failed:', e);
            } finally {
                localStorage.removeItem('user');
                updateAuthUI();
                showModal('Logged out', 'You have been successfully logged out.');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 800);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            try {
                const data = await api.request('/auth/login', 'POST', { email, password });
                localStorage.setItem('user', JSON.stringify(data.user));

                const dest = data.user.role === 'admin' ? 'admin.html' : 'profile.html';
                showModal('Login successful', `Welcome back, ${data.user.username}!`);
                setTimeout(() => {
                    window.location.href = dest;
                }, 800);
            } catch (err) {
                showModal('Login failed', err.message, true);
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('su-username').value.trim();
            const email = document.getElementById('su-email').value.trim();
            const password = document.getElementById('su-password').value.trim();

            try {
                await api.request('/auth/register', 'POST', { username, email, password });
                showModal('Account created', 'You can now log in.');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 800);
            } catch (err) {
                showModal('Sign up failed', err.message, true);
            }
        });
    }
});