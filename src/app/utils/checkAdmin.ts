

// src/app/components/utils/checkAdmin.ts

export const isAdminLoggedIn = (): boolean => {
  if (typeof window !== "undefined") {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const adminId = localStorage.getItem('adminId');
    return isAdmin && !!adminId;
  }
  return false;
};

export const requireAdmin = () => {
  if (!isAdminLoggedIn()) {
    window.location.href = "/admin-login";
  }
};
