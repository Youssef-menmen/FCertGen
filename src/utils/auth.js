const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const TOKEN_KEY = 'emsi_cert_token';
const USER_KEY  = 'emsi_cert_user';

async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Erreur serveur.');
  return data;
}

export async function login(username, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST', body: JSON.stringify({ username, password }),
  });
  sessionStorage.setItem(TOKEN_KEY, data.data.token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(data.data));
  return data.data;
}

export async function verifyToken() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return { valid: false };
  try {
    const data = await apiFetch('/auth/verify', { method: 'POST' });
    if (data.success) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(data.data));
      return { valid: true, user: data.data };
    }
    return { valid: false };
  } catch { return { valid: false }; }
}

export async function forgotPassword(email) {
  return apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function resetPassword(token, newPassword) {
  return apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) });
}

export async function createAdmin(adminData) {
  const data = await apiFetch('/admin/create', { method: 'POST', body: JSON.stringify(adminData) });
  return data.data;
}

export async function listAdmins() {
  const data = await apiFetch('/admin/list');
  return data.data;
}

export async function updateMyProfile(profileData) {
  const data = await apiFetch('/admin/me', { method: 'PUT', body: JSON.stringify(profileData) });
  return data.data;
}

export async function changeMyPassword(passwordData) {
  return apiFetch('/admin/me/password', { method: 'PUT', body: JSON.stringify(passwordData) });
}

export async function updateAdmin(id, profileData) {
  const data = await apiFetch(`/admin/${id}`, { method: 'PUT', body: JSON.stringify(profileData) });
  return data.data;
}

export async function resetAdminPassword(id, newPassword) {
  return apiFetch(`/admin/${id}/reset-password`, { method: 'PUT', body: JSON.stringify({ newPassword }) });
}

export async function deleteAdmin(id) {
  return apiFetch(`/admin/${id}`, { method: 'DELETE' });
}

export async function recordExport(exportData) {
  try {
    const data = await apiFetch('/admin/exports/record', { method: 'POST', body: JSON.stringify(exportData) });
    return data.data;
  } catch(e) { console.warn('recordExport failed:', e.message); return null; }
}

export async function getMyExports() {
  const data = await apiFetch('/admin/exports/my');
  return data.data;
}

export async function getAllExports() {
  const data = await apiFetch('/admin/exports/all');
  return data.data;
}

export async function getExportStats() {
  const data = await apiFetch('/admin/exports/stats');
  return data.data;
}

export function logout()          { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(USER_KEY); }
export function getToken()        { return sessionStorage.getItem(TOKEN_KEY); }
export function getUser()         { try { return JSON.parse(sessionStorage.getItem(USER_KEY)); } catch { return null; } }
export function isAuthenticated() { return !!sessionStorage.getItem(TOKEN_KEY); }

export async function getAllCertificates() {
  const data = await apiFetch('/admin/certificates/all');
  return data.data;
}

export async function getMyCertificates() {
  const data = await apiFetch('/admin/certificates/my');
  return data.data;
}
