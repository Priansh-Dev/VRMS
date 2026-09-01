document.addEventListener('DOMContentLoaded', async () => {
  const user = await Auth.requireAuth(['ADMIN']);
  if (!user) return;

  document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());

  try {
    const response = await api.get('/admin/dashboard');
    if (response.success && response.data) {
      document.getElementById('statUsers').textContent = response.data.totalUsers || 0;
      document.getElementById('statPending').textContent = response.data.pendingVerifications || 0;
      document.getElementById('statVehicles').textContent = response.data.totalVehicles || 0;
      document.getElementById('statBookings').textContent = response.data.totalBookings || 0;
    }
  } catch (err) {
    Utils.showToast('Failed to load dashboard stats', 'error');
  }
});