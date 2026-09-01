const Auth = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.success) {
      this.redirectByRole(response.data.user.role);
    }
    return response;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.success) {
      this.redirectByRole(response.data.user.role);
    }
    return response;
  },

  async logout() {
    await api.post('/auth/logout');
    window.location.href = '/login';
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data?.user || null;
    } catch (err) {
      return null;
    }
  },

  redirectByRole(role) {
    const paths = {
      ADMIN: '/admin/dashboard',
      OWNER: '/owner/dashboard',
      CUSTOMER: '/customer/dashboard'
    };
    window.location.href = paths[role] || '/';
  },

  async requireAuth(allowedRoles = []) {
    const user = await this.getCurrentUser();
    if (!user) {
      window.location.href = '/login';
      return null;
    }
    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      window.location.href = '/';
      return null;
    }
    return user;
  }
};