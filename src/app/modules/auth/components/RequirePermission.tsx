import { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, decryptToJwt, PermissionEnums } from '../core/_requests';

interface RequirePermissionProps {
  permission: PermissionEnums;
  children: ReactNode;
}

export const RequirePermission: FC<RequirePermissionProps> = ({ permission, children }) => {
  const data = decryptToJwt(getToken()?.toString()!);
  const hasPermission = data.Permissions.includes(permission);

  if (!hasPermission) {
    // اگر کاربر دسترسی نداشته باشد، به صفحه نمایش فقط خواندنی هدایت می‌شود
    const id = window.location.pathname.split('/').pop();
    return <Navigate to={`/view-call/${id}`} replace />;
  }

  return <>{children}</>;
}; 