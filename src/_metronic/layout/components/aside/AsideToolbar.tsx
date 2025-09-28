import { FC } from "react";
import { removeAuth, useAuth } from "../../../../app/modules/auth";
import { KTIcon, toAbsoluteUrl } from "../../../helpers";
import { HeaderUserMenu } from "../../../partials";
import { Search } from "../../../partials";

const AsideToolbar: FC = () => {
  const { currentUser, logout } = useAuth();
  const name = currentUser?.firstName || "";
  const email = currentUser?.email || "";

  return (
    <>
      {/*begin::User*/}
      <div className="aside-user d-flex align-items-sm-center justify-content-end py-5">
        {/*begin::Symbol*/}
        <div className="symbol symbol-50px">
          <img
            src={toAbsoluteUrl("media/avatars/300-1.jpg")}
            alt={name}
            className="symbol-label"
            style={{ objectFit: "cover" }}
          />
        </div>
        {/*end::Symbol*/}

        {/*begin::Wrapper*/}
        <div className="ms-5">
          {/*begin::Section*/}
          <div className="d-flex">
            {/*begin::Info*/}
            <div className="flex-grow-1 me-2">
              {/*begin::Username*/}
              <a
                href="#"
                className="text-white text-hover-primary fs-6 fw-bold"
              >
                {name}
              </a>
              {/*end::Username*/}

              {/*begin::Description*/}
              <span className="text-gray-600 fw-bold d-block fs-8 mb-1">
                {email}
              </span>
              {/*end::Description*/}

              {/*begin::Label*/}
              <div className="d-flex align-items-center text-success fs-9">
                <span className="bullet bullet-dot bg-success me-1"></span>
                online
              </div>
              {/*end::Label*/}
            </div>
            {/*end::Info*/}

            {/*begin::User menu*/}
            <div className="me-n2">
              {/*begin::Action*/}
              <a
                onClick={logout}
                className="btn btn-icon btn-sm btn-active-color-primary mt-n2"
                data-kt-menu-trigger="click"
                data-kt-menu-placement="bottom-start"
                data-kt-menu-overflow="false"
              >
                <i className="fas fa-sign-out-alt fs-2x text-white"></i>
              </a>
              {/*end::Action*/}
            </div>
            {/*end::User menu*/}
          </div>
          {/*end::Section*/}
        </div>
        {/*end::Wrapper*/}
      </div>
      {/*end::User*/}

      {/*begin::Aside search*/}
      <div className="aside-search py-5">
        <Search />
      </div>
      {/*end::Aside search*/}
    </>
  );
};

export default AsideToolbar;
