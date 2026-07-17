import { useAuth } from './authContext';

export function usePermission() {
  const { user } = useAuth();

  const canWrite = user?.access_level !== 'read_only';
  const isReadOnly = user?.access_level === 'read_only';

  return { canWrite, isReadOnly };
}
