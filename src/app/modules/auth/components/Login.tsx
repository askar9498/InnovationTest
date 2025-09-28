import { useState } from "react";
import * as Yup from "yup";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import { getUserByToken, login } from "../core/_requests";
import { toAbsoluteUrl } from "../../../../_metronic/helpers";
import { useAuth } from "../core/Auth";
import axios from "axios";
import { SimpleCaptcha } from "./SimpleCaptcha";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("فرمت ایمیل اشتباه است")
    .min(3, "حداقل 3 کاراکتر")
    .max(50, "حداکثر 50 کاراکتر")
    .required("ایمیل الزامی است"),
  password: Yup.string()
    .min(3, "حداقل 3 کاراکتر")
    .max(50, "حداکثر 50 کاراکتر")
    .required("رمز عبور الزامی است"),
  captcha: Yup.string().required("لطفا کد امنیتی را وارد کنید"),
});

const initialValues = {
  email: "WebAdmin@AryaSasol.com",
  password: "Web@12345",
  captcha: "",
};

export function Login() {
  const [loading, setLoading] = useState(false);
  const { saveAuth, setCurrentUser } = useAuth();

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      if (!values.captcha) {
        setStatus("لطفا کد امنیتی را وارد کنید");
        return;
      }

      setLoading(true);
      try {
        const { data: auth } = await login(values.email, values.password);
        saveAuth(auth);
        const { data: user } = await getUserByToken(auth);
        setCurrentUser(user);
        setStatus(undefined);
      } catch (error) {
        console.error(error);
        saveAuth(undefined);
        setStatus("اطلاعات ورود اشتباه است");
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  const handleCaptchaChange = (value: string) => {
    formik.setFieldValue("captcha", value, true); // Set touched to true
  };

  return (
    <form
      className="form w-100"
      onSubmit={formik.handleSubmit}
      noValidate
      id="kt_login_signin_form"
      dir="rtl"
    >
      {/* begin::Heading */}
      <div className="text-center mb-11">
        <h1 className="text-gray-900 fw-bolder mb-3">ورود به سیستم</h1>
        <div className="text-gray-500 fw-semibold fs-6">مرکز نوآوری ASPC</div>
      </div>
      {/* begin::Heading */}
      {formik.status ? (
        <div className="mb-lg-15 alert alert-danger">
          <div className="alert-text font-weight-bold">{formik.status}</div>
        </div>
      ) : (
        <div className="mb-10 bg-light-info p-8 rounded">
          <div className="text-info">
            لطفا نام کاربری و رمز عبور خود را وارد کنید
          </div>
        </div>
      )}

      {/* begin::Form group */}
      <div className="fv-row mb-8">
        <label className="form-label fs-6 fw-bolder text-gray-900">ایمیل</label>
        <input
          placeholder="ایمیل"
          {...formik.getFieldProps("email")}
          className={clsx(
            "form-control bg-transparent",
            { "is-invalid": formik.touched.email && formik.errors.email },
            {
              "is-valid": formik.touched.email && !formik.errors.email,
            }
          )}
          style={{ textAlign: "left" }}
          type="email"
          dir="ltr"
          name="email"
          autoComplete="off"
        />
        {formik.touched.email && formik.errors.email && (
          <div className="fv-plugins-message-container">
            <span role="alert">{formik.errors.email}</span>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Form group */}
      <div className="fv-row mb-3">
        <label className="form-label fw-bolder text-gray-900 fs-6 mb-0">
          رمز عبور
        </label>
        <input
          type="password"
          autoComplete="off"
          style={{ textAlign: "left" }}
          {...formik.getFieldProps("password")}
          className={clsx(
            "form-control bg-transparent",
            {
              "is-invalid": formik.touched.password && formik.errors.password,
            },
            {
              "is-valid": formik.touched.password && !formik.errors.password,
            }
          )}
        />
        {formik.touched.password && formik.errors.password && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">
              <span role="alert">{formik.errors.password}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Form group */}
      <div className="fv-row">
        <div className="d-flex justify-content-center">
          <SimpleCaptcha
            onChange={handleCaptchaChange}
            error={formik.errors.captcha}
            touched={formik.touched.captcha}
          />
        </div>
      </div>
      {/* end::Form group */}

      {/* begin::Wrapper */}
      <div className="d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8">
        <div />

        {/* begin::Link */}
        {/* <Link to="/auth/forgot-password" className="link-primary">
          فراموشی رمز عبور؟
        </Link> */}
        {/* end::Link */}
      </div>
      {/* end::Wrapper */}

      {/* begin::Action */}
      <div className="d-grid mb-10">
        <button
          type="submit"
          id="kt_sign_in_submit"
          className="btn btn-primary"
          disabled={formik.isSubmitting || !formik.isValid || !formik.values.captcha}
        >
          {!loading && <span className="indicator-label">ادامه</span>}
          {loading && (
            <span className="indicator-progress" style={{ display: "block" }}>
              لطفا صبر کنید...
              <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
            </span>
          )}
        </button>
      </div>
      {/* end::Action */}

      <div className="text-gray-500 text-center fw-semibold fs-6">
        هنوز عضو نشده‌اید؟{" "}
        <Link to="/auth/registration" className="link-primary">
          ثبت نام
        </Link>
      </div>
      <div className="text-center mt-4">
        <Link to="/auth/forgot-password" className="link-primary">
          فراموشی رمز عبور؟
        </Link>
      </div>
    </form>
  );
}
