import { FC, useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getToken, getUserByToken, updateLegalUser } from "../modules/auth/core/_requests";
import { useAuth } from "../modules/auth/core/Auth";
import { useNavigate } from "react-router-dom";
import { KTIcon } from "../../_metronic/helpers";
import { toast } from "react-toastify";
import axios from "axios";
import { getApiUrl } from "../../config/api";

const CompleteLegalUserInfo: FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    formik.setFieldValue("official_documents", files);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    formik.setFieldValue("official_documents", files);
  }, []);

  const handleDropzoneClick = useCallback(() => {
    const fileInput = document.querySelector('.dropzone-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      company_name: currentUser?.companyName || "",
      economic_code: currentUser?.companyNationalId || "",
      registration_number: currentUser?.registrationNumber || "",
      company_type: currentUser?.activityField || "",
      company_website: currentUser?.website || "",
      company_address: currentUser?.fullAddress || "",
      company_phone: currentUser?.companyPhone || "",
      company_email: currentUser?.email || "",
      company_description: currentUser?.companyDescription || "",
      representative_name: currentUser?.representativeName || "",
      representative_national_id: currentUser?.representativeNationalId || "",
      representative_email: currentUser?.representativeEmail || "",
      representative_phone: currentUser?.representativePhone || "",
      logo: undefined as File | undefined,
      official_documents: [] as File[],
      show_public_profile: currentUser?.showPublicProfile || false,
      password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      company_name: Yup.string()
        .required("نام شرکت الزامی است")
        .min(2, "نام شرکت باید حداقل 2 کاراکتر باشد"),
      economic_code: Yup.string()
        .required("کد اقتصادی الزامی است")
        .matches(/^[0-9]{12}$/, "کد اقتصادی باید 12 رقم باشد"),
      registration_number: Yup.string()
        .required("شماره ثبت الزامی است")
        .matches(/^[0-9]{10}$/, "شماره ثبت باید 10 رقم باشد"),
      company_type: Yup.string().required("نوع شرکت الزامی است"),
      company_website: Yup.string().url("آدرس وب‌سایت نامعتبر است"),
      company_address: Yup.string().required("آدرس شرکت الزامی است"),
      company_phone: Yup.string()
        .matches(/^[0-9]{11}$/, "شماره تلفن باید 11 رقم باشد")
        .required("شماره تلفن الزامی است"),
      company_email: Yup.string()
        .email("فرمت ایمیل نامعتبر است")
        .required("ایمیل الزامی است"),
      company_description: Yup.string(),
      representative_name: Yup.string().required("نام نماینده الزامی است"),
      representative_national_id: Yup.string()
        .required("کد ملی نماینده الزامی است")
        .matches(/^[0-9]{10}$/, "کد ملی باید 10 رقم باشد"),
      representative_email: Yup.string()
        .email("فرمت ایمیل نامعتبر است")
        .required("ایمیل نماینده الزامی است"),
      representative_phone: Yup.string()
        .matches(/^[0-9]{11}$/, "شماره تلفن باید 11 رقم باشد")
        .required("شماره تلفن نماینده الزامی است"),
      logo: Yup.mixed().nullable(),
      official_documents: Yup.array().of(Yup.mixed()),
      show_public_profile: Yup.boolean(),
      password: Yup.string()
        .min(8, "رمز عبور باید حداقل 8 کاراکتر باشد")
        .matches(/[0-9]/, "رمز عبور باید شامل حداقل یک عدد باشد")
        .matches(/[a-z]/, "رمز عبور باید شامل حداقل یک حرف کوچک باشد")
        .matches(/[A-Z]/, "رمز عبور باید شامل حداقل یک حرف بزرگ باشد"),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("password")], "رمز عبور و تکرار آن باید یکسان باشند"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const formData = new FormData();
        
        // BaseUserDto fields
        formData.append("Email", values.company_email);
        formData.append("PhoneNumber", values.company_phone);
        if (values.password) {
          formData.append("Password", values.password);
        }

        // CorporateUserDto fields
        formData.append("CompanyName", values.company_name);
        formData.append("CompanyNationalId", values.economic_code);
        if (values.registration_number) {
          formData.append("RegistrationNumber", values.registration_number);
        }
        if (values.company_type) {
          formData.append("ActivityField", values.company_type);
        }
        if (values.company_address) {
          formData.append("FullAddress", values.company_address);
        }
        if (values.company_phone) {
          formData.append("CompanyPhone", values.company_phone);
        }
        if (values.company_website) {
          formData.append("Website", values.company_website);
        }
        if (values.company_description) {
          formData.append("CompanyDescription", values.company_description);
        }
        if (values.logo) {
          formData.append("Logo", values.logo);
        }
        if (values.representative_name) {
          formData.append("RepresentativeName", values.representative_name);
        }
        if (values.representative_national_id) {
          formData.append("RepresentativeNationalId", values.representative_national_id);
        }
        if (values.representative_email) {
          formData.append("RepresentativeEmail", values.representative_email);
        }
        if (values.representative_phone) {
          formData.append("RepresentativePhone", values.representative_phone);
        }
        
        // Handle multiple official documents
        if (values.official_documents && values.official_documents.length > 0) {
          values.official_documents.forEach((file) => {
            formData.append("OfficialDocuments", file);
          });
        }
        
        formData.append("ShowPublicProfile", values.show_public_profile.toString());

        // Log the FormData contents for debugging
        for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }

        const response = await axios.post(getApiUrl("/api/user/CompleteCorporateProfile"), formData, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        });

        // Get updated profile data
        const token = localStorage.getItem('token');
        if (token) {
          const response = await getUserByToken(token);
          if (response.data) {
            setCurrentUser(response.data);
          }
        }
        toast.success("اطلاعات شما با موفقیت ثبت شد");
        navigate("/userdashboard");
      } catch (error) {
        console.error("Error details:", error);
        toast.error("ثبت اطلاعات شما با خطا مواجه شد");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="card" dir="rtl" style={{ fontFamily: "sans" }}>
      <div className="card-header bg-secondary">
        <h3 className="card-title">تکمیل اطلاعات شرکت</h3>
      </div>
      <div className="card-body">
        <form onSubmit={formik.handleSubmit} className="form">
          {/* Company Information */}
          <div className="row mb-6">
            <div className="col-md-6">
              <label className="form-label required">نام شرکت</label>
              <input
                type="text"
                className={`form-control ${
                  formik.touched.company_name && formik.errors.company_name
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("company_name")}
              />
              {formik.touched.company_name && formik.errors.company_name && (
                <div className="invalid-feedback">{formik.errors.company_name}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label required">کد اقتصادی</label>
              <input
                type="text"
                className={`form-control ${
                  formik.touched.economic_code && formik.errors.economic_code
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("economic_code")}
              />
              {formik.touched.economic_code && formik.errors.economic_code && (
                <div className="invalid-feedback">{formik.errors.economic_code}</div>
              )}
            </div>
          </div>

          <div className="row mb-6">
            <div className="col-md-6">
              <label className="form-label required">شماره ثبت</label>
              <input
                type="text"
                className={`form-control ${
                  formik.touched.registration_number && formik.errors.registration_number
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("registration_number")}
              />
              {formik.touched.registration_number && formik.errors.registration_number && (
                <div className="invalid-feedback">{formik.errors.registration_number}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label required">نوع شرکت</label>
              <select
                className={`form-select ${
                  formik.touched.company_type && formik.errors.company_type
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("company_type")}
              >
                <option value="">انتخاب کنید</option>
                <option value="saham">سهامی</option>
                <option value="masool">مسئولیت محدود</option>
                <option value="tavoni">تعاونی</option>
                <option value="sayer">سایر</option>
              </select>
              {formik.touched.company_type && formik.errors.company_type && (
                <div className="invalid-feedback">{formik.errors.company_type}</div>
              )}
            </div>
          </div>

          <div className="row mb-6">
            <div className="col-md-6">
              <label className="form-label">وب‌سایت شرکت</label>
              <input
                type="url"
                className={`form-control ${
                  formik.touched.company_website && formik.errors.company_website
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("company_website")}
              />
              {formik.touched.company_website && formik.errors.company_website && (
                <div className="invalid-feedback">{formik.errors.company_website}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label required">شماره تلفن</label>
              <input
                type="tel"
                maxLength={11}
                className={`form-control ${
                  formik.touched.company_phone && formik.errors.company_phone
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("company_phone")}
              />
              {formik.touched.company_phone && formik.errors.company_phone && (
                <div className="invalid-feedback">{formik.errors.company_phone}</div>
              )}
            </div>
          </div>

          <div className="row mb-6">
            <div className="col-md-12">
              <label className="form-label required">آدرس شرکت</label>
              <textarea
                className={`form-control ${
                  formik.touched.company_address && formik.errors.company_address
                    ? "is-invalid"
                    : ""
                }`}
                rows={3}
                {...formik.getFieldProps("company_address")}
              />
              {formik.touched.company_address && formik.errors.company_address && (
                <div className="invalid-feedback">{formik.errors.company_address}</div>
              )}
            </div>
          </div>

          <div className="row mb-6">
            <div className="col-md-6">
              <label className="form-label required">ایمیل</label>
              <input
                type="email"
                dir="ltr"
                disabled
                className={`form-control ${
                  formik.touched.company_email && formik.errors.company_email
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("company_email")}
              />
              {formik.touched.company_email && formik.errors.company_email && (
                <div className="invalid-feedback">{formik.errors.company_email}</div>
              )}
            </div>
          </div>

          <div className="row mb-6">
            <div className="col-md-12">
              <label className="form-label">توضیحات شرکت</label>
              <textarea
                className={`form-control ${
                  formik.touched.company_description && formik.errors.company_description
                    ? "is-invalid"
                    : ""
                }`}
                rows={4}
                {...formik.getFieldProps("company_description")}
              />
              {formik.touched.company_description && formik.errors.company_description && (
                <div className="invalid-feedback">{formik.errors.company_description}</div>
              )}
            </div>
          </div>

          {/* Representative Information */}
          <div className="separator separator-dashed my-10"></div>
          <div className="mb-10">
            <h3 className="mb-5">اطلاعات نماینده</h3>
          </div>

          <div className="row mb-6">
            <div className="col-md-6">
              <label className="form-label required">نام نماینده</label>
              <input
                type="text"
                className={`form-control ${
                  formik.touched.representative_name && formik.errors.representative_name
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("representative_name")}
              />
              {formik.touched.representative_name && formik.errors.representative_name && (
                <div className="invalid-feedback">{formik.errors.representative_name}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label required">کد ملی نماینده</label>
              <input
                type="text"
                className={`form-control ${
                  formik.touched.representative_national_id && formik.errors.representative_national_id
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("representative_national_id")}
              />
              {formik.touched.representative_national_id && formik.errors.representative_national_id && (
                <div className="invalid-feedback">{formik.errors.representative_national_id}</div>
              )}
            </div>
          </div>

          <div className="row mb-6">
            <div className="col-md-6">
              <label className="form-label required">ایمیل نماینده</label>
              <input
                type="email"
                dir="ltr"
                className={`form-control ${
                  formik.touched.representative_email && formik.errors.representative_email
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("representative_email")}
              />
              {formik.touched.representative_email && formik.errors.representative_email && (
                <div className="invalid-feedback">{formik.errors.representative_email}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label required">شماره تلفن نماینده</label>
              <input
                type="tel"
                maxLength={11}
                className={`form-control ${
                  formik.touched.representative_phone && formik.errors.representative_phone
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("representative_phone")}
              />
              {formik.touched.representative_phone && formik.errors.representative_phone && (
                <div className="invalid-feedback">{formik.errors.representative_phone}</div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="separator separator-dashed my-10"></div>
          <div className="mb-10">
            <h3 className="mb-5">مدارک</h3>
          </div>

          <div className="row mb-6">
            <div className="col-md-6">
              <label className="form-label">لوگوی شرکت</label>
              <input
                type="file"
                className={`form-control ${
                  formik.touched.logo && formik.errors.logo ? "is-invalid" : ""
                }`}
                accept="image/*"
                onChange={(event) => {
                  formik.setFieldValue("logo", event.currentTarget.files?.[0] || null);
                }}
              />
              <div className="form-text">فرمت‌های مجاز: JPG, PNG, GIF</div>
            </div>
            <div className="col-md-6">
              <label className="form-label">مدارک رسمی</label>
              <div
                className={`dropzone-upload ${isDragging ? 'dropzone-dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleDropzoneClick}
                style={{
                  border: '2px dashed #ccc',
                  borderRadius: '4px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragging ? '#f8f9fa' : 'transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                <input
                  type="file"
                  className="dropzone-input"
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx"
                  multiple
                  onChange={handleFileChange}
                />
                <div className="dropzone-upload-message">
                  <KTIcon iconName="upload" className="fs-2x mb-3" />
                  <span className="dropzone-upload-message-text">
                    فایل‌ها را اینجا رها کنید یا برای انتخاب کلیک کنید
                  </span>
                </div>
                {formik.values.official_documents.length > 0 && (
                  <div className="mt-3">
                    <div className="d-flex flex-column gap-2">
                      {formik.values.official_documents.map((file, index) => (
                        <div key={index} className="d-flex align-items-center justify-content-between bg-light p-2 rounded">
                          <span className="text-truncate">{file.name}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-icon btn-light-danger"
                            onClick={() => {
                              const newFiles = [...formik.values.official_documents];
                              newFiles.splice(index, 1);
                              formik.setFieldValue("official_documents", newFiles);
                            }}
                          >
                            <KTIcon iconName="trash" className="fs-2" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="form-text">فرمت‌های مجاز: PDF, DOC, DOCX</div>
            </div>
          </div>

          <div className="row mb-6">
            <div className="col-md-12">
              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="showPublicProfile"
                  {...formik.getFieldProps("show_public_profile")}
                />
                <label className="form-check-label" htmlFor="showPublicProfile">
                  نمایش پروفایل در سایت
                </label>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="separator separator-dashed my-10"></div>
          <div className="mb-10">
            <h3 className="mb-5">تغییر رمز عبور</h3>
          </div>

          <div className="row mb-6">
            <div className="col-md-6">
              <label className="form-label">رمز عبور</label>
              <input
                type="password"
                className={`form-control ${
                  formik.touched.password && formik.errors.password
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("password")}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="invalid-feedback">{formik.errors.password}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label">تکرار رمز عبور</label>
              <input
                type="password"
                className={`form-control ${
                  formik.touched.confirm_password && formik.errors.confirm_password
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("confirm_password")}
              />
              {formik.touched.confirm_password && formik.errors.confirm_password && (
                <div className="invalid-feedback">{formik.errors.confirm_password}</div>
              )}
            </div>
          </div>

          <div className="text-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="indicator-progress">
                    <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </span>
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <KTIcon iconName="check" className="fs-2 ms-2 me-0" />
                  ذخیره اطلاعات
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteLegalUserInfo;
