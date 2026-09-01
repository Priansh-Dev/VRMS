document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const errorContainer = document.getElementById('errorContainer');

  const urlParams = new URLSearchParams(window.location.search);
  const roleParam = urlParams.get('role');
  if (roleParam) {
    const roleSelect = document.getElementById('role');
    if (roleSelect) roleSelect.value = roleParam;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Utils.hideError('errorContainer');

    const data = Utils.serializeForm(form);
    const errors = [];

    if (!data.name?.trim()) errors.push('Name is required');
    if (!data.email?.trim()) errors.push('Email is required');
    else if (!Utils.validateEmail(data.email)) errors.push('Invalid email format');
    if (!data.phone?.trim()) errors.push('Mobile number is required');
    else if (!Utils.validatePhone(data.phone)) errors.push('Invalid mobile number format (use +91XXXXXXXXXX)');
    if (!data.password) errors.push('Password is required');
    else if (data.password.length < 8) errors.push('Password must be at least 8 characters');
    if (data.password !== data.confirmPassword) errors.push('Passwords do not match');
    if (!data.role) errors.push('Please select a role');

    if (errors.length > 0) {
      Utils.showError('errorContainer', errors.join('; '));
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Registering...';

    try {
      const { confirmPassword, ...userData } = data;
      const response = await Auth.register(userData);
      if (!response.success) {
        Utils.showError('errorContainer', response.message || 'Registration failed');
      }
    } catch (err) {
      Utils.showError('errorContainer', err.message || 'Registration failed');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register';
    }
  });
});