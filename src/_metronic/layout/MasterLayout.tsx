import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AsideDefault } from "./components/aside/AsideDefault";
import { Footer } from "./components/Footer";
import { HeaderWrapper } from "./components/header/HeaderWrapper";
import { RightToolbar } from "../partials/layout/RightToolbar";
import { ScrollTop } from "./components/ScrollTop";
import { Content } from "./components/Content";
import { PageDataProvider } from "./core";
import {
  ActivityDrawer,
  DrawerMessenger,
  InviteUsers,
  UpgradePlan,
  UserPermission,
} from "../partials";
import {
  DrawerComponent,
  MenuComponent,
  ScrollComponent,
  ScrollTopComponent,
  SwapperComponent,
  ToggleComponent,
} from "../assets/ts/components";
import { UserView } from "../partials/modals/invite-users/UserView";
import { AddBlog } from "../partials/modals/AddBlog";
import '../../assets/css/custom-menu.css';

const MasterLayout = () => {
  const location = useLocation();

  useEffect(() => {
    setTimeout(() => {
      ToggleComponent.reinitialization();
      ScrollTopComponent.reinitialization();
      DrawerComponent.reinitialization();
      MenuComponent.reinitialization();
      ScrollComponent.reinitialization();
      SwapperComponent.reinitialization();
    }, 500);
  }, [location.key]);

  return (
    <PageDataProvider>
      <div className="page d-flex flex-row flex-column-fluid">
        <AsideDefault />
        <div
          className="wrapper d-flex flex-column flex-row-fluid"
          id="kt_wrapper"
        >
          <HeaderWrapper />

          <div
            id="kt_content"
            className="content d-flex flex-column flex-column-fluid"
          >
            <div className="post d-flex flex-column-fluid" id="kt_post">
              <Content>
                <Outlet />
              </Content>
            </div>
          </div>
          <Footer />
        </div>
      </div>

      {/* begin:: Drawers */}
      <ActivityDrawer />
      <RightToolbar />
      <DrawerMessenger />
      {/* end:: Drawers */}

      {/* begin:: Modals */}
      <InviteUsers />
      <UserPermission show={false} handleClose={function (): void {
        throw new Error("Function not implemented.");
      } } userId={undefined} />
      <UserView />
      {/* <UserBlock /> */}
      <AddBlog onSuccess={function (): void {}} />
      <UpgradePlan />
      {/* end:: Modals */}
      <ScrollTop />
    </PageDataProvider>
  );
};

export { MasterLayout };
