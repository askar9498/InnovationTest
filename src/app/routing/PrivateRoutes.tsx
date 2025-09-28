import { FC, lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { MasterLayout } from "../../_metronic/layout/MasterLayout";
import TopBarProgress from "react-topbar-progress-indicator";
import { DashboardWrapper } from "../pages/dashboard/DashboardWrapper";
import { MenuTestPage } from "../pages/MenuTestPage";
import { getCSSVariableValue } from "../../_metronic/assets/ts/_utils";
import { WithChildren } from "../../_metronic/helpers";
import BuilderPageWrapper from "../pages/layout-builder/BuilderPageWrapper";
import MyManager from "../pages/MyBlogManage.tsx";
import MyBlogManage from "../pages/MyBlogManage.tsx";
import MyDashBoard from "../pages/MyDashBoard.tsx";
import { MyUserManage } from "../pages/MyUserManage.tsx";
import UserDashBoard from "../pages/UserDashBoard.tsx";
import { Private } from "../modules/apps/chat/components/Private.tsx";
import ProfilePage from "../modules/profile/ProfilePage.tsx";
import { ProfileHeader } from "../modules/profile/ProfileHeader.tsx";
import { Horizontal } from "../modules/wizards/components/Horizontal.tsx";
import { Vertical } from "../modules/wizards/components/Vertical.tsx";
import Innovations from "../pages/Innovations.tsx";
import NewsManager from "../pages/NewsManager.tsx";
import EduManager from "../pages/EduManager.tsx";
import EventManager from "../pages/EventManager.tsx";
import NoticeManager from "../pages/NoticeManager.tsx";
import CreateCall from "../pages/CreateCall.tsx";
import ViewCall from "../pages/ViewCall.tsx";
import DynamicPageEditor from "../pages/DynamicPageEditor";
import DynamicPages from "../pages/DynamicPages";
import CompleteUserInfo from "../pages/CompleteUserInfo.tsx";
import CompleteUserInfoWrapper from "../pages/CompleteUserInfoWrapper.tsx";
import MenuItems from "../pages/MenuItems";
import MenuItemEditor from "../pages/MenuItemEditor";
import { decryptToJwt, getToken, PermissionEnums } from "../modules/auth/core/_requests";
import { IdeaSubmissionsManage } from "../pages/IdeaSubmissionsPage.tsx";
import { IdeaSubmissionDetailsPage } from "../modules/idea-submissions/components/IdeaSubmissionDetailsPage";
import AdminTicketsPage from "../modules/admin/tickets/AdminTicketsPage.tsx";
import UserTicketsPage from "../modules/user/tickets/UserTicketsPage.tsx";
import TicketGroupsPage from "../modules/admin/ticket-groups/TicketGroupsPage.tsx";
import ContactUsManage from "../pages/ContactUsManage.tsx";
import IdeaManagement from "../pages/IdeaManagement.tsx";
import CallStages from "../pages/call-stages/CallStages.tsx";
import CallDetail from "../pages/CallDetail.tsx";
import WelcomePage from "../pages/WelcomePage";
import { RequirePermission } from "../modules/auth/components/RequirePermission";
import MyIdeaSubmissions from "../pages/MyIdeaSubmissions.tsx";
import HeroSlideList from "../modules/hero-slides/HeroSlideList.tsx";
import HeroSlideEditor from "../modules/hero-slides/HeroSlideEditor.tsx";

const PrivateRoutes = () => {
  const WizardsPage = lazy(() => import("../modules/wizards/WizardsPage"));
  const AccountPage = lazy(() => import("../modules/accounts/AccountPage"));
  const WidgetsPage = lazy(() => import("../modules/widgets/WidgetsPage"));
  const ChatPage = lazy(() => import("../modules/apps/chat/ChatPage"));
  const UsersPage = lazy(
    () => import("../modules/apps/user-management/UsersPage")
  );

  const userHasAccess = (permission: string) => {
    const data = decryptToJwt(getToken()?.toString()!);
    return data.Permissions.includes(permission);
  };

  const ProtectedDashboard = () => {
    return <WelcomePage />;
  };

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* Redirect to Dashboard after success login/registartion */}
        <Route path="auth/*" element={<Navigate to="/welcome" />} />
        {/* Pages */}
        <Route
          path="builder"
          element={
            <SuspensedView>
              <BuilderPageWrapper />
            </SuspensedView>
          }
        />
        <Route path="menu-test" element={<MenuTestPage />} />
        <Route path="my-manager" element={<MyManager />} />
        <Route path="my-blog-manage" element={<MyBlogManage />} />
        <Route path="my-user-manage" element={<MyUserManage />} />
        <Route path="welcome" element={<WelcomePage />} />
        <Route path="complete-profile" element={<CompleteUserInfoWrapper />} />
        <Route path="chat/private" element={<Private />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="IdeaSubmissionsManage" element={<IdeaSubmissionsManage />} />
        <Route
          path="idea-submissions/:id"
          element={
            <SuspensedView>
              <IdeaSubmissionDetailsPage />
            </SuspensedView>
          }
        />
        <Route path="profile/header" element={<ProfileHeader />} />
        <Route path="wizard/horizontal" element={<Horizontal />} />
        <Route path="wizard/vertical" element={<Vertical />} />
        <Route path="innovations" element={<Innovations />} />
        <Route path="call/:id" element={
          <RequirePermission permission={PermissionEnums.UpdateInnovation}>
            <CallDetail />
          </RequirePermission>
        } />
        <Route path="view-call/:id" element={<ViewCall />} />
        <Route path="idea-management/:callId" element={
          <RequirePermission permission={PermissionEnums.UpdateInnovation}>
            <IdeaManagement />
          </RequirePermission>
        } />
        <Route path="create-call" element={<CreateCall />} />
        <Route path="create-call/:id" element={<CreateCall />} />
        
        <Route path="news-manager" element={<NewsManager />} />
        <Route path="edu-manager" element={<EduManager />} />
        <Route path="event-manager" element={<EventManager />} />
        <Route path="notice-manager" element={<NoticeManager />} />
        <Route path="dynamic-page-editor" element={<DynamicPageEditor />} />
        <Route path="dynamic-page-editor/:id" element={<DynamicPageEditor />} />
        <Route path="dynamic-pages" element={<DynamicPages />} />
        <Route path="menu-items" element={<MenuItems />} />
        <Route path="menu-item-editor" element={<MenuItemEditor />} />
        <Route path="menu-item-editor/:id" element={<MenuItemEditor />} />
        {/* Lazy Modules */}
        <Route
          path="crafted/pages/profile/*"
          element={
            <SuspensedView>
              <ProfilePage />
            </SuspensedView>
          }
        />
        <Route
          path="crafted/pages/wizards/*"
          element={
            <SuspensedView>
              <WizardsPage />
            </SuspensedView>
          }
        />
        <Route
          path="crafted/widgets/*"
          element={
            <SuspensedView>
              <WidgetsPage />
            </SuspensedView>
          }
        />
        <Route
          path="crafted/account/*"
          element={
            <SuspensedView>
              <AccountPage />
            </SuspensedView>
          }
        />
        <Route
          path="apps/chat/*"
          element={
            <SuspensedView>
              <ChatPage />
            </SuspensedView>
          }
        />
        <Route
          path="apps/user-management/*"
          element={
            <SuspensedView>
              <UsersPage />
            </SuspensedView>
          }
        />
        <Route path="/MyUserManage" element={<MyUserManage />} />
        <Route path="/MyBlogManage" element={<MyBlogManage />} />
        <Route path="/MyInnovations" element={<Vertical />} />
        <Route path="/Innovations" element={<Innovations />} />
        <Route path="/support" element={<AdminTicketsPage />} />
        <Route path="/usersupport" element={<UserTicketsPage />} />
        <Route path="/my-idea-submissions" element={<MyIdeaSubmissions />} />
        <Route path="/ticket-groups" element={<TicketGroupsPage />} />
        <Route path='/contact-us-manage' element={<ContactUsManage />} />
        <Route path='call-stages/:callId' element={<CallStages />} />
        
        {/* Hero Slides Management */}
        <Route path='/hero-slides' element={<HeroSlideList />} />
        <Route path='/hero-slides/create' element={<HeroSlideEditor />} />
        <Route path='/hero-slides/edit/:id' element={<HeroSlideEditor />} />

        {/* Page Not Found */}
        <Route path="*" element={<Navigate to="/error/404" />} />
      </Route>
    </Routes>
  );
};

const SuspensedView: FC<WithChildren> = ({ children }) => {
  const baseColor = getCSSVariableValue("--kt-primary");
  TopBarProgress.config({
    barColors: {
      "0": baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  });
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>;
};

export { PrivateRoutes };
