document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const data = await api.request('/auth/login', 'POST', { email, password });

        // Save user info to localStorage
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to shop
        window.location.href = 'index.html';
    } catch (err) {
        alert(err.message);
    }
});