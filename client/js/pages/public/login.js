document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorContainer = document.getElementById('errorContainer');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Utils.hideError('errorContainer');

    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      Utils.showError('errorContainer', 'Email and password are required');
      return;
    }

    if (!Utils.validateEmail(email)) {
      Utils.showError('errorContainer', 'Invalid email format');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Logging in...';

    try {
      const response = await Auth.login(email, password);
      if (!response.success) {
        Utils.showError('errorContainer', response.message || 'Login failed');
      }
    } catch (err) {
      Utils.showError('errorContainer', err.message || 'Login failed');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  });
});