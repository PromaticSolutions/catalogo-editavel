// src/lib/auth.ts
import { localDB } from './localStorage';

export const adminLogin = async (username: string, password: string): Promise<boolean> => {
  const { data, error } = await localDB
    .from('admin_users')
    .select('*')
    .eq('username', username)
    .eq('password_hash', password)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  localStorage.setItem('adminAuth', JSON.stringify({ username, loggedIn: true }));
  return true;
};

export const adminLogout = () => {
  localStorage.removeItem('adminAuth');
};

export const isAdminLoggedIn = (): boolean => {
  const auth = localStorage.getItem('adminAuth');
  if (!auth) return false;

  try {
    const parsed = JSON.parse(auth);
    return parsed.loggedIn === true;
  } catch {
    return false;
  }
};