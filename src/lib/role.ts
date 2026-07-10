export const getUserRole = () => {
  return localStorage.getItem('role') || 'teacher';
};

export const isViewer = () => {
  return getUserRole() === 'viewer';
};
