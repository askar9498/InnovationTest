import { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { toAbsoluteUrl } from "../../../_metronic/helpers";

const AuthLayout = () => {
  useEffect(() => {
    const root = document.getElementById("root");
    if (root) {
      root.style.height = "100%";
    }
    return () => {
      if (root) {
        root.style.height = "auto";
      }
    };
  }, []);

  return (
    <div
      className="d-flex flex-column flex-lg-row flex-column-fluid"
      style={{ fontFamily: "sans" }}
      dir="rtl"
    >
      {/* begin::Body */}
      <div className="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1">
        {/* begin::Form */}
        <div className="d-flex flex-center flex-column flex-lg-row-fluid">
          {/* begin::Wrapper */}
          <div className="w-100 w-lg-500px p-10">
            <Outlet />
          </div>
          {/* end::Wrapper */}
        </div>
        {/* end::Form */}
      </div>
      {/* end::Body */}

      {/* begin::Aside */}
      <div
        className="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2"
        style={{
          backgroundImage: `url(${toAbsoluteUrl("media/misc/auth-bg.png")})`,
        }}
      >
        {/* begin::Content */}
        <div className="d-flex flex-column flex-center py-15 px-5 px-md-15 w-100">
          {/* begin::Logo */}
          <Link to="/" className="mb-12">
            <img
              className="mx-auto w-275px w-md-50 w-xl-500px mb-10 mb-lg-20"
              src={toAbsoluteUrl("media/misc/logo.png")}
              alt=""
            />
          </Link>
          {/* end::Logo */}

          {/* begin::Title */}
          <h1 className="text-white fs-2qx fw-bolder text-center mb-7">
            به مرکز نوآوری خوش آمدید
          </h1>
          {/* end::Title */}

          {/* begin::Text */}
          <div
            className="text-white fs-base text-center"
            style={{ lineHeight: "2.5rem" }}
          >
            دنیایی از خلاقیت و راه‌حل‌های پیشرفته را کشف کنید.{" "}
            <a href="#" className="opacity-75-hover text-warning fw-bold me-1">
              ایده‌های جدید را بررسی کنید
            </a>{" "}
            و با متخصصان صنعت برای ایجاد تغییرات معنادار ارتباط برقرار کنید.
            آخرین نوآوری‌ها را کشف کنید و بخشی از{" "}
            <a href="#" className="opacity-75-hover text-warning fw-bold me-1">
              جامعه پویا
            </a>{" "}
            باشید که به شکل‌دهی آینده اختصاص دارد.
          </div>
          {/* end::Text */}
        </div>
        {/* end::Content */}
      </div>
      {/* end::Aside */}
    </div>
  );
};

export { AuthLayout };
