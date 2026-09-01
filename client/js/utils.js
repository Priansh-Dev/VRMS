const Utils = {
  showToast(message, type = 'info') {
    const container = this.getToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-message">${this.escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Dismiss">&times;</button>
    `;
    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    setTimeout(() => toast.remove(), 5000);
  },

  getToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  },

  showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
      container.textContent = message;
      container.classList.remove('hidden');
    }
  },

  hideError(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.classList.add('hidden');
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  },

  formatDateTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  },

  getCsrfToken() {
    const cookies = document.cookie.split('; ');
    const csrfCookie = cookies.find(c => c.startsWith('csrfToken='));
    return csrfCookie ? csrfCookie.split('=')[1] : '';
  },

  setCsrfHeader(headers = {}) {
    const token = this.getCsrfToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
    return headers;
  },

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return /^(\+91|91)?[6-9]\d{9}$/.test(cleaned);
  },

  validateRequired(form, fields) {
    const errors = [];
    for (const field of fields) {
      const input = form.querySelector(`[name="${field}"]`);
      if (input && !input.value.trim()) {
        errors.push(`${field} is required`);
      }
    }
    return errors;
  },

  serializeForm(form) {
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    return data;
  },

  debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }
};