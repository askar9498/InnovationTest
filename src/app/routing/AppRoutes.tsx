/**
 * High level router.
 *
 * Note: It's recommended to compose related routes in internal router
 * components (e.g: `src/app/modules/Auth/pages/AuthPage`, `src/app/BasePage`).
 */

import {FC} from 'react'
import {Routes, Route, BrowserRouter, Navigate} from 'react-router-dom'
import {PrivateRoutes} from './PrivateRoutes'
import {ErrorsPage} from '../modules/errors/ErrorsPage'
import {Logout, AuthPage, useAuth} from '../modules/auth'
import {App} from '../App'
import BlogPreview from "../pages/BlogPreview";
import { TermsAndConditionsPage } from "../pages/TermsAndConditionsPage";
import { decryptToJwt, getToken, PermissionEnums } from '../modules/auth/core/_requests';
import ContactUsManage from '../pages/ContactUsManage';
import IdeaManagement from '../pages/idea-management/IdeaManagement';
import CallStages from '../pages/call-stages/CallStages';

/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */
const {BASE_URL} = import.meta.env

const AppRoutes: FC = () => {
  const {currentUser} = useAuth()

  const userHasAccess = (permission: string) => {
    const token = getToken();
    if (!token) {
      return false;
    }
    const data = decryptToJwt(token.toString());
    return data.Permissions.includes(permission);
  };

  const getDefaultRoute = () => {
    return '/welcome';
  };

  return (
    <BrowserRouter basename={BASE_URL}>
      <Routes>
        <Route element={<App />}>
          <Route path='error/*' element={<ErrorsPage />} />
          <Route path='logout' element={<Logout />} />
          <Route path='/terms-and-conditions' element={<TermsAndConditionsPage />} />
          {currentUser ? (
            <>
              <Route path='/*' element={<PrivateRoutes />} />
              <Route index element={<Navigate to={getDefaultRoute()} />} />
            </>
          ) : (
            <>
              <Route path='auth/*' element={<AuthPage />} />
              <Route path='*' element={<Navigate to='/auth' />} />
            </>
          )}
          <Route path='/blog-preview/:title' element={<BlogPreview />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export {AppRoutes}
