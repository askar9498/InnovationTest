import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import clsx from "clsx";
import { register } from "../core/_requests";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../../../../config/api";
import { SimpleCaptcha } from "./SimpleCaptcha";

const initialValues = {
  userType: localStorage.getItem("userType") || "individual",
  firstname: "",
  lastname: "",
  email: "",
  phoneNumber: "",
  nationalCode: "",
  // Corporate fields
  companyName: "",
  companyNationalId: "",
  companyEmail: "",
  companyPhoneNumber: "",
  // Common fields
  password: "",
  changepassword: "",
  acceptTerms: false,
  captcha: "",
};

const registrationSchema = Yup.object().shape({
  userType: Yup.string().required("نوع کاربر الزامی است"),
  // Individual validation
  firstname: Yup.string().when("userType", {
    is: "individual",
    then: (schema) =>
      schema
        .min(3, "حداقل 3 کاراکتر")
        .max(50, "حداکثر 50 کاراکتر")
        .required("نام الزامی است"),
  }),
  lastname: Yup.string().when("userType", {
    is: "individual",
    then: (schema) =>
      schema
        .min(3, "حداقل 3 کاراکتر")
        .max(50, "حداکثر 50 کاراکتر")
        .required("نام خانوادگی الزامی است"),
  }),
  email: Yup.string().when("userType", {
    is: "individual",
    then: (schema) =>
      schema
        .email("فرمت ایمیل اشتباه است")
        .min(3, "حداقل 3 کاراکتر")
        .max(50, "حداکثر 50 کاراکتر")
        .required("ایمیل الزامی است"),
  }),
  phoneNumber: Yup.string().when("userType", {
    is: "individual",
    then: (schema) => schema.required("شماره تلفن الزامی است"),
  }),
  nationalCode: Yup.string().when("userType", {
    is: "individual",
    then: (schema) => schema.required("کد ملی الزامی است"),
  }),
  // Corporate validation
  companyName: Yup.string().when("userType", {
    is: "corporate",
    then: (schema) =>
      schema
        .min(3, "حداقل 3 کاراکتر")
        .max(50, "حداکثر 50 کاراکتر")
        .required("نام شرکت الزامی است"),
  }),
  companyNationalId: Yup.string().when("userType", {
    is: "corporate",
    then: (schema) =>
      schema
        .min(10, "شناسه ملی شرکت باید 10 رقم باشد")
        .max(10, "شناسه ملی شرکت باید 10 رقم باشد")
        .required("شناسه ملی شرکت الزامی است"),
  }),
  companyEmail: Yup.string().when("userType", {
    is: "corporate",
    then: (schema) =>
      schema
        .email("فرمت ایمیل اشتباه است")
        .min(3, "حداقل 3 کاراکتر")
        .max(50, "حداکثر 50 کاراکتر")
        .required("ایمیل شرکت الزامی است"),
  }),
  companyPhoneNumber: Yup.string().when("userType", {
    is: "corporate",
    then: (schema) => schema.required("شماره تلفن شرکت الزامی است"),
  }),
  // Common validation
  password: Yup.string()
    .min(3, "حداقل 3 کاراکتر")
    .max(50, "حداکثر 50 کاراکتر")
    .required("رمز عبور الزامی است"),
  changepassword: Yup.string()
    .min(3, "حداقل 3 کاراکتر")
    .max(50, "حداکثر 50 کاراکتر")
    .required("تکرار رمز عبور الزامی است")
    .oneOf([Yup.ref("password")], "رمز عبور و تکرار آن مطابقت ندارند"),
  acceptTerms: Yup.bool().required("لطفا قوانین و مقررات را بپذیرید"),
  captcha: Yup.string().required("لطفا کد امنیتی را وارد کنید"),
});

export function Registration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema: registrationSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      if (!values.captcha) {
        setStatus("لطفا کد امنیتی را وارد کنید");
        return;
      }

      setLoading(true);
      try {
        if (values.userType === "individual") {
          await register(
            values.firstname,
            values.lastname,
            values.email,
            values.password,
            undefined,
            values.phoneNumber,
            values.nationalCode
          );
          navigate("/auth/email-confirmation", { state: { email: values.email } });
        } else {
          // Handle corporate registration
          const formData = new FormData();
          formData.append("Email", values.companyEmail);
          formData.append("PhoneNumber", values.companyPhoneNumber);
          formData.append("Password", values.password);
          formData.append("CompanyName", values.companyName);
          formData.append("CompanyNationalId", values.companyNationalId);

          const response = await fetch(
            getApiUrl("/api/User/RegisterCorporate"),
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error("Registration failed");
          }
          navigate("/auth/email-confirmation", { state: { email: values.companyEmail } });
        }
      } catch (error) {
        console.error(error);
        setStatus("اطلاعات ثبت نام نادرست است");
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
      className="form w-100 fv-plugins-bootstrap5 fv-plugins-framework"
      noValidate
      id="kt_login_signup_form"
      onSubmit={formik.handleSubmit}
      dir="rtl"
    >
      {/* begin::Heading */}
      <div className="text-center mb-11">
        <h1 className="text-gray-900 fw-bolder mb-3">ثبت نام</h1>
      </div>
      {/* end::Heading */}

      {/* begin::User Type Selection */}
      <div className="fv-row mb-8">
        <div className="d-flex flex-stack justify-content-center">
          <div className="me-5">
            <label className="form-check form-check-custom form-check-solid">
              <input
                className="form-check-input mx-5"
                type="radio"
                name="userType"
                value="individual"
                checked={formik.values.userType === "individual"}
                onChange={(e) => {
                  formik.setFieldValue("userType", e.target.value);
                  localStorage.setItem("userType", e.target.value);
                }}
              />
              <span className="form-check-label">حقیقی</span>
            </label>
          </div>
          <div>
            <label className="form-check form-check-custom form-check-solid">
              <input
                className="form-check-input mx-5"
                type="radio"
                name="userType"
                value="corporate"
                checked={formik.values.userType === "corporate"}
                onChange={(e) => {
                  formik.setFieldValue("userType", e.target.value);
                  localStorage.setItem("userType", e.target.value);
                }}
              />
              <span className="form-check-label">حقوقی</span>
            </label>
          </div>
        </div>
      </div>
      {/* end::User Type Selection */}

      {formik.status && (
        <div className="mb-lg-15 alert alert-danger">
          <div className="alert-text font-weight-bold">{formik.status}</div>
        </div>
      )}

      {/* Individual Fields */}
      {formik.values.userType === "individual" && (
        <>
          {/* begin::Form group Firstname */}
          <div className="fv-row mb-8">
            <label className="form-label fw-bolder text-gray-900 fs-6">
              نام
            </label>
            <input
              placeholder="نام"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps("firstname")}
              className={clsx(
                "form-control bg-transparent",
                {
                  "is-invalid":
                    formik.touched.firstname && formik.errors.firstname,
                },
                {
                  "is-valid":
                    formik.touched.firstname && !formik.errors.firstname,
                }
              )}
            />
            {formik.touched.firstname && formik.errors.firstname && (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">
                  <span role="alert">{formik.errors.firstname}</span>
                </div>
              </div>
            )}
          </div>
          {/* end::Form group */}

          {/* begin::Form group Lastname */}
          <div className="fv-row mb-8">
            <label className="form-label fw-bolder text-gray-900 fs-6">
              نام خانوادگی
            </label>
            <input
              placeholder="نام خانوادگی"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps("lastname")}
              className={clsx(
                "form-control bg-transparent",
                {
                  "is-invalid":
                    formik.touched.lastname && formik.errors.lastname,
                },
                {
                  "is-valid":
                    formik.touched.lastname && !formik.errors.lastname,
                }
              )}
            />
            {formik.touched.lastname && formik.errors.lastname && (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">
                  <span role="alert">{formik.errors.lastname}</span>
                </div>
              </div>
            )}
          </div>
          {/* end::Form group */}

          {/* begin::Form group Email */}
          <div className="fv-row mb-8">
            <label className="form-label fw-bolder text-gray-900 fs-6">
              ایمیل
            </label>
            <input
              placeholder="ایمیل"
              type="email"
              dir="ltr"
              autoComplete="off"
              {...formik.getFieldProps("email")}
              className={clsx(
                "form-control bg-transparent",
                { "is-invalid": formik.touched.email && formik.errors.email },
                {
                  "is-valid": formik.touched.email && !formik.errors.email,
                }
              )}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">
                  <span role="alert">{formik.errors.email}</span>
                </div>
              </div>
            )}
          </div>
          {/* end::Form group */}

          {/* begin::Form group Phone Number */}
          <div className="fv-row mb-8">
            <label className="form-label fw-bolder text-gray-900 fs-6">
              شماره تلفن
            </label>
            <input
              placeholder="شماره تلفن"
              type="tel"
              maxLength={11}
              autoComplete="off"
              {...formik.getFieldProps("phoneNumber")}
              className={clsx(
                "form-control bg-transparent",
                {
                  "is-invalid":
                    formik.touched.phoneNumber && formik.errors.phoneNumber,
                },
                {
                  "is-valid":
                    formik.touched.phoneNumber && !formik.errors.phoneNumber,
                }
              )}
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">
                  <span role="alert">{formik.errors.phoneNumber}</span>
                </div>
              </div>
            )}
          </div>
          {/* end::Form group */}

          {/* begin::Form group National Code */}
          <div className="fv-row mb-8">
            <label className="form-label fw-bolder text-gray-900 fs-6">
              کد ملی
            </label>
            <input
              placeholder="کد ملی"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps("nationalCode")}
              className={clsx(
                "form-control bg-transparent",
                {
                  "is-invalid":
                    formik.touched.nationalCode && formik.errors.nationalCode,
                },
                {
                  "is-valid":
                    formik.touched.nationalCode && !formik.errors.nationalCode,
                }
              )}
            />
            {formik.touched.nationalCode && formik.errors.nationalCode && (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">
                  <span role="alert">{formik.errors.nationalCode}</span>
                </div>
              </div>
            )}
          </div>
          {/* end::Form group */}
        </>
      )}

      {/* Corporate Fields */}
      {formik.values.userType === "corporate" && (
        <>
          {/* begin::Form group Company Name */}
          <div className="fv-row mb-8">
            <label className="form-label fw-bolder text-gray-900 fs-6">
              نام شرکت
            </label>
            <input
              placeholder="نام شرکت"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps("companyName")}
              className={clsx(
                "form-control bg-transparent",
                {
                  "is-invalid":
                    formik.touched.companyName && formik.errors.companyName,
                },
                {
                  "is-valid":
                    formik.touched.companyName && !formik.errors.companyName,
                }
              )}
            />
            {formik.touched.companyName && formik.errors.companyName && (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">
                  <span role="alert">{formik.errors.companyName}</span>
                </div>
              </div>
            )}
          </div>
          {/* end::Form group */}

          {/* begin::Form group Company National ID */}
          <div className="fv-row mb-8">
            <label className="form-label fw-bolder text-gray-900 fs-6">
              شناسه ملی شرکت
            </label>
            <input
              placeholder="شناسه ملی شرکت"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps("companyNationalId")}
              className={clsx(
                "form-control bg-transparent",
                {
                  "is-invalid":
                    formik.touched.companyNationalId &&
                    formik.errors.companyNationalId,
                },
                {
                  "is-valid":
                    formik.touched.companyNationalId &&
                    !formik.errors.companyNationalId,
                }
              )}
            />
            {formik.touched.companyNationalId &&
              formik.errors.companyNationalId && (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">
                    <span role="alert">{formik.errors.companyNationalId}</span>
                  </div>
                </div>
              )}
          </div>
          {/* end::Form group */}

          {/* begin::Form group Company Email */}
          <div className="fv-row mb-8">
            <label className="form-label fw-bolder text-gray-900 fs-6">
              ایمیل شرکت
            </label>
            <input
              placeholder="ایمیل شرکت"
              type="email"
              dir="ltr"
              autoComplete="off"
              {...formik.getFieldProps("companyEmail")}
              className={clsx(
                "form-control bg-transparent",
                {
                  "is-invalid":
                    formik.touched.companyEmail && formik.errors.companyEmail,
                },
                {
                  "is-valid":
                    formik.touched.companyEmail && !formik.errors.companyEmail,
                }
              )}
            />
            {formik.touched.companyEmail && formik.errors.companyEmail && (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">
                  <span role="alert">{formik.errors.companyEmail}</span>
                </div>
              </div>
            )}
          </div>
          {/* end::Form group */}

          {/* begin::Form group Company Phone Number */}
          <div className="fv-row mb-8">
            <label className="form-label fw-bolder text-gray-900 fs-6">
              شماره تلفن شرکت
            </label>
            <input
              placeholder="شماره تلفن شرکت"
              type="tel"
              maxLength={11}
              autoComplete="off"
              {...formik.getFieldProps("companyPhoneNumber")}
              className={clsx(
                "form-control bg-transparent",
                {
                  "is-invalid":
                    formik.touched.companyPhoneNumber &&
                    formik.errors.companyPhoneNumber,
                },
                {
                  "is-valid":
                    formik.touched.companyPhoneNumber &&
                    !formik.errors.companyPhoneNumber,
                }
              )}
            />
            {formik.touched.companyPhoneNumber &&
              formik.errors.companyPhoneNumber && (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">
                    <span role="alert">{formik.errors.companyPhoneNumber}</span>
                  </div>
                </div>
              )}
          </div>
          {/* end::Form group */}
        </>
      )}

      {/* begin::Form group Password */}
      <div className="fv-row mb-8">
        <label className="form-label fw-bolder text-gray-900 fs-6">
          رمز عبور
        </label>
        <input
          type="password"
          placeholder="رمز عبور"
          autoComplete="off"
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

      {/* begin::Form group Confirm password */}
      <div className="fv-row mb-5">
        <label className="form-label fw-bolder text-gray-900 fs-6">
          تکرار رمز عبور
        </label>
        <input
          type="password"
          placeholder="تکرار رمز عبور"
          autoComplete="off"
          {...formik.getFieldProps("changepassword")}
          className={clsx(
            "form-control bg-transparent",
            {
              "is-invalid":
                formik.touched.changepassword && formik.errors.changepassword,
            },
            {
              "is-valid":
                formik.touched.changepassword && !formik.errors.changepassword,
            }
          )}
        />
        {formik.touched.changepassword && formik.errors.changepassword && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">
              <span role="alert">{formik.errors.changepassword}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Form group */}
      <div className="fv-row mb-8">
        <label
          className="form-check form-check-inline"
          htmlFor="kt_login_toc_agree"
        >
          <input
            className="form-check-input"
            type="checkbox"
            id="kt_login_toc_agree"
            {...formik.getFieldProps("acceptTerms")}
          />
          <p>
            من{" "}
            <a href="/terms-and-conditions" target="_blank" className="ms-1 link-primary">
              قوانین و مقررات
            </a>{" "}
            را می‌پذیرم.
          </p>
        </label>
        {formik.touched.acceptTerms && formik.errors.acceptTerms && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">
              <span role="alert">{formik.errors.acceptTerms}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Form group */}
      <div className="fv-row mb-8">
        <div className="d-flex justify-content-center">
          <SimpleCaptcha
            onChange={handleCaptchaChange}
            error={formik.errors.captcha}
            touched={formik.touched.captcha}
          />
        </div>
      </div>
      {/* end::Form group */}

      {/* begin::Form group */}
      <div className="text-center">
        <button
          type="submit"
          id="kt_sign_up_submit"
          className="btn btn-lg btn-primary w-100 mb-5"
          disabled={
            formik.isSubmitting || 
            !formik.isValid || 
            !formik.values.acceptTerms || 
            !formik.values.captcha
          }
        >
          {!loading && <span className="indicator-label">ثبت نام</span>}
          {loading && (
            <span className="indicator-progress" style={{ display: "block" }}>
              لطفا صبر کنید...{" "}
              <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
            </span>
          )}
        </button>
        <Link to="/auth/login">
          <button
            type="button"
            id="kt_login_signup_form_cancel_button"
            className="btn btn-lg btn-light-primary w-100 mb-5"
          >
            انصراف
          </button>
        </Link>
      </div>
      {/* end::Form group */}
    </form>
  );
}
