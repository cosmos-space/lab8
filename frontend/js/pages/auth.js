document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

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