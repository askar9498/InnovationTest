import { FC, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getToken, getUserByToken, updateUser } from "../modules/auth/core/_requests";
import { useAuth } from "../modules/auth/core/Auth";
import { useNavigate } from "react-router-dom";
import { KTIcon, KTSVG } from "../../_metronic/helpers";
import { toast } from "react-toastify";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import CreatableSelect from 'react-select/creatable';

const CompleteUserInfo: FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const educationLevels = [
    "دیپلم",
    "کاردانی",
    "کارشناسی",
    "کارشناسی ارشد",
    "دکتری",
    "فوق دکتری",
  ];

  const expertiseAreas = [
    "هوش مصنوعی",
    "برنامه‌نویسی",
    "طراحی",
    "مدیریت",
    "تحقیق و توسعه",
    "مهندسی",
    "علوم پایه",
    "علوم انسانی",
  ];

  const interests = [
    "هوش مصنوعی",
    "برنامه‌نویسی",
    "طراحی",
    "مدیریت",
    "تحقیق و توسعه",
    "مهندسی",
    "علوم پایه",
    "علوم انسانی",
  ];

  // Convert Gregorian date to Shamsi
  const convertToShamsi = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new DateObject({ date, calendar: persian, locale: persian_fa }).format();
  };

  // Convert Shamsi date to Gregorian
  const convertToGregorian = (dateString: string) => {
    if (!dateString) return "";
    const persianDate = new DateObject({ date: dateString, calendar: persian, locale: persian_fa });
    return persianDate.convert(gregorian, gregorian_en).format();
  };

  const formik = useFormik({
    initialValues: {
      first_name: currentUser?.firstName || "",
      last_name: currentUser?.lastName || "",
      email: currentUser?.email || "",
      mobile: currentUser?.phoneNumber || "",
      national_id: currentUser?.nationalCode || "",
      birth_date: currentUser?.birthDate ? convertToShamsi(currentUser.birthDate) : "",
      education_level: currentUser?.educationLevel || "",
      expertise_areas: (() => {
        try {
          if (typeof currentUser?.expertise === 'string') {
            return JSON.parse(currentUser.expertise);
          }
          return [];
        } catch {
          return [];
        }
      })(),
      resume: currentUser?.resume || null,
      interests: (() => {
        try {
          if (typeof currentUser?.interests === 'string') {
            const parsed = JSON.parse(currentUser.interests);
            if (typeof parsed[0] === 'string') {
              return JSON.parse(parsed[0]);
            }
            return parsed;
          }
          return [];
        } catch {
          return [];
        }
      })(),
      password: "",
      confirm_password: "",
      skill_level: currentUser?.skillLevel || "",
      research_gate: currentUser?.researchGateLink || "",
      orcid: currentUser?.orcidLink || "",
      google_scholar: currentUser?.googleScholarLink || "",
      saved_interests: (() => {
        try {
          if (typeof currentUser?.savedInterests === 'string') {
            const parsed = JSON.parse(currentUser.savedInterests);
            if (typeof parsed[0] === 'string') {
              return JSON.parse(parsed[0]);
            }
            return parsed;
          }
          return [];
        } catch {
          return [];
        }
      })(),
    },
    validationSchema: Yup.object({
      first_name: Yup.string()
        .required("نام الزامی است")
        .min(2, "نام باید حداقل 2 کاراکتر باشد"),
      last_name: Yup.string()
        .required("نام خانوادگی الزامی است")
        .min(2, "نام خانوادگی باید حداقل 2 کاراکتر باشد"),
      email: Yup.string()
        .email("فرمت ایمیل نامعتبر است")
        .required("ایمیل الزامی است"),
      mobile: Yup.string()
        .matches(/^[0-9]{11}$/, "شماره موبایل باید 11 رقم باشد")
        .required("شماره موبایل الزامی است"),
      national_id: Yup.string()
        .matches(/^[0-9]{10}$/, "کد ملی باید 10 رقم باشد")
        .required("کد ملی الزامی است"),
      birth_date: Yup.string()
        .test('is-valid-date', 'فرمت تاریخ نامعتبر است', function(value) {
          if (!value) return true; // Allow empty values
          return true; // Temporarily allow all values to debug
        })
        .nullable(),
      education_level: Yup.string(),
      expertise_areas: Yup.array().of(Yup.string()),
      resume: Yup.mixed().nullable(),
      interests: Yup.array().of(Yup.string()),
      password: Yup.string()
        .min(8, "رمز عبور باید حداقل 8 کاراکتر باشد")
        .matches(/[0-9]/, "رمز عبور باید شامل حداقل یک عدد باشد")
        .matches(/[a-z]/, "رمز عبور باید شامل حداقل یک حرف کوچک باشد")
        .matches(/[A-Z]/, "رمز عبور باید شامل حداقل یک حرف بزرگ باشد"),
      confirm_password: Yup.string().oneOf(
        [Yup.ref("password")],
        "رمز عبور و تکرار آن باید یکسان باشند"
      ),
      skill_level: Yup.string(),
      research_gate: Yup.string().url("لینک نامعتبر است"),
      orcid: Yup.string().url("لینک نامعتبر است"),
      google_scholar: Yup.string().url("لینک نامعتبر است"),
      saved_interests: Yup.array().of(Yup.string()),
    }),
    onSubmit: async (values) => {
      if (!formik.isValid) {
        formik.validateForm();
        return;
      }
      
      setLoading(true);
      try {
        const formData = {
          firstName: values.first_name,
          lastName: values.last_name,
          email: values.email,
          phoneNumber: values.mobile,
          nationalCode: values.national_id,
          birthDate: values.birth_date ? new DateObject({ date: values.birth_date, calendar: persian, locale: persian_fa }).convert(gregorian, gregorian_en).format('YYYY-MM-DD') : undefined,
          educationLevel: values.education_level,
          expertise: values.expertise_areas as string[],
          resume: values.resume,
          interests: values.interests as string[],
          password: values.password,
          skillLevel: values.skill_level,
          researchGateLink: values.research_gate,
          orcidLink: values.orcid,
          googleScholarLink: values.google_scholar,
          savedInterests: values.saved_interests as string[],
        };
        
        await updateUser(formData);

         // Get updated profile data
         const token = getToken();
         if (token) {
           const response = await getUserByToken(token);
           if (response.data) {
            console.log(response.data);
             setCurrentUser(response.data);
           }
         }
        toast.success("اطلاعات کاربری با موفقیت ثبت شد");
        navigate("/userdashboard");
      } catch (error) {
        console.error("Error updating user info:", error);
        toast.error("اطلاعات کاربری با خطا ثبت شد");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="card" dir="rtl" style={{ fontFamily: "sans" }}>
      <div className="card-header bg-secondary">
        <h3 className="card-title">تکمیل اطلاعات کاربری</h3>
      </div>
      <div className="card-body">
        <form onSubmit={formik.handleSubmit} className="form">
          <div className="row mb-6">
            <div className="col-md-6">
              <label className="form-label required">نام</label>
              <input
                type="text"
                className={`form-control ${
                  formik.touched.first_name && formik.errors.first_name
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("first_name")}
              />
              {formik.touched.first_name && formik.errors.first_name && (
                <div className="invalid-feedback">
                  {formik.errors.first_name}
                </div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label required">نام خانوادگی</label>
              <input
                type="text"
                className={`form-control ${
                  formik.touched.last_name && formik.errors.last_name
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("last_name")}
              />
              {formik.touched.last_name && formik.errors.last_name && (
                <div className="invalid-feedback">
                  {formik.errors.last_name}
                </div>
              )}
            </div>
          </div>

          <div className="row mb-6">
            <div className="col-md-6">
              <label className="form-label required">کد ملی</label>
              <input
                type="text"
                maxLength={10}
                pattern="[0-9]*"
                inputMode="numeric"
                className={`form-control ${
                  formik.touched.national_id && formik.errors.national_id
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("national_id")}
              />
              {formik.touched.national_id && formik.errors.national_id && (
                <div className="invalid-feedback">
                  {formik.errors.national_id}
                </div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label">تاریخ تولد</label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                value={formik.values.birth_date}
                onChange={(date) => {
                  console.log('Selected date:', date);
                  const formattedDate = date ? new DateObject({ date, calendar: persian, locale: persian_fa }).format() : "";
                  console.log('Formatted date:', formattedDate);
                  formik.setFieldValue("birth_date", formattedDate);
                }}
                className={`form-control ${
                  formik.touched.birth_date && formik.errors.birth_date
                    ? "is-invalid"
                    : ""
                }`}
                inputClass="form-control"
                format="YYYY/MM/DD"
                placeholder="تاریخ تولد را انتخاب کنید"
              />
              {formik.touched.birth_date && formik.errors.birth_date && (
                <div className="invalid-feedback">
                  {formik.errors.birth_date as string}
                </div>
              )}
            </div>
          </div>

          <div className="row mb-6">
            <div className="col-md-6">
              <label className="form-label required">ایمیل</label>
              <input
                type="email"
                disabled
                dir="ltr"
                className={`form-control ${
                  formik.touched.email && formik.errors.email
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="invalid-feedback">{formik.errors.email}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label required">شماره موبایل</label>
              <input
                type="tel"
                maxLength={11}
                className={`form-control ${
                  formik.touched.mobile && formik.errors.mobile
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("mobile")}
              />
              {formik.touched.mobile && formik.errors.mobile && (
                <div className="invalid-feedback">{formik.errors.mobile}</div>
              )}
            </div>
          </div>

          <div className="row mb-6">
            <div className="col-md-6">
              <label className="form-label">مدرک تحصیلی</label>
              <select
                className={`form-select ${
                  formik.touched.education_level &&
                  formik.errors.education_level
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("education_level")}
              >
                <option value="">انتخاب کنید</option>
                {educationLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">سطح تخصص</label>
              <select
                className={`form-select ${
                  formik.touched.skill_level && formik.errors.skill_level
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("skill_level")}
              >
                <option value="">انتخاب کنید</option>
                <option value="beginner">مبتدی</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">پیشرفته</option>
                <option value="expert">متخصص</option>
              </select>
            </div>
          </div>

          <div className="row mb-6">
            <div className="col-md-12">
              <label className="form-label">تخصص/حوزه فعالیت</label>
              <CreatableSelect
                isMulti
                isClearable
                isRtl
                placeholder="تخصص‌های خود را انتخاب یا وارد کنید"
                options={expertiseAreas.map((area: string) => ({ value: area, label: area }))}
                value={formik.values.expertise_areas.map((area: string) => ({ value: area, label: area }))}
                onChange={(newValue) => {
                  formik.setFieldValue(
                    "expertise_areas",
                    newValue ? newValue.map(option => option.value) : []
                  );
                }}
                className={`${formik.touched.expertise_areas && formik.errors.expertise_areas ? "is-invalid" : ""}`}
                classNamePrefix="select"
                noOptionsMessage={() => "موردی یافت نشد"}
                formatCreateLabel={(inputValue) => `افزودن "${inputValue}"`}
              />
              {formik.touched.expertise_areas && formik.errors.expertise_areas && (
                <div className="invalid-feedback">
                  {formik.errors.expertise_areas as string}
                </div>
              )}
            </div>
          </div>

          <div className="row mb-6">
            <div className="col-md-4">
              <label className="form-label">ResearchGate</label>
              <input
                type="url"
                className={`form-control ${
                  formik.touched.research_gate && formik.errors.research_gate
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("research_gate")}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">ORCID</label>
              <input
                type="url"
                className={`form-control ${
                  formik.touched.orcid && formik.errors.orcid
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("orcid")}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Google Scholar</label>
              <input
                type="url"
                className={`form-control ${
                  formik.touched.google_scholar && formik.errors.google_scholar
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("google_scholar")}
              />
            </div>
          </div>

          <div className="row mb-6">
            <div className="col-md-12">
              <label className="form-label">علاقه‌مندی‌ها</label>
              <CreatableSelect
                isMulti
                isClearable
                isRtl
                placeholder="علاقه‌مندی‌های خود را انتخاب یا وارد کنید"
                options={interests.map((interest: string) => ({ value: interest, label: interest }))}
                value={formik.values.interests.map((interest: string) => ({ value: interest, label: interest }))}
                onChange={(newValue) => {
                  formik.setFieldValue(
                    "interests",
                    newValue ? newValue.map(option => option.value) : []
                  );
                }}
                className={`${formik.touched.interests && formik.errors.interests ? "is-invalid" : ""}`}
                classNamePrefix="select"
                noOptionsMessage={() => "موردی یافت نشد"}
                formatCreateLabel={(inputValue) => `افزودن "${inputValue}"`}
              />
              {formik.touched.interests && formik.errors.interests && (
                <div className="invalid-feedback">
                  {formik.errors.interests as string}
                </div>
              )}
            </div>
          </div>

          <div className="row mb-6">
            <div className="col-md-12">
              <label className="form-label">رزومه/CV</label>
              {currentUser?.resume && currentUser.resume.filePath && (
                <div className="mb-3">
                  <div className="d-flex align-items-center p-3 bg-light rounded shadow-sm border mb-2" style={{maxWidth: 400}}>
                    <KTSVG path="/media/svg/files/pdf.svg" className="svg-icon-2x text-danger me-3" />
                    <div className="flex-grow-1">
                      <div className="fw-bold">{currentUser.resume.fileName || 'رزومه قبلی'}</div>
                      <div className="text-muted small">حجم: {currentUser.resume.fileSize ? (currentUser.resume.fileSize/1024).toFixed(1) + ' KB' : '--'}</div>
                    </div>
                    <a
                      href={currentUser.resume.filePath.startsWith('http') ? currentUser.resume.filePath : `/api/file/uploads/${currentUser.resume.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-icon btn-bg-light btn-active-color-primary ms-2"
                      title="دانلود رزومه"
                    >
                      <KTSVG path="/media/icons/duotune/general/gen019.svg" className="svg-icon-2" />
                    </a>
                  </div>
                </div>
              )}
              <input
                type="file"
                className={`form-control ${
                  formik.touched.resume && formik.errors.resume
                    ? "is-invalid"
                    : ""
                }`}
                accept=".pdf,.doc,.docx"
                onChange={(event) => {
                  formik.setFieldValue(
                    "resume",
                    event.currentTarget.files?.[0] || null
                  );
                }}
              />
              <div className="form-text">فرمت‌های مجاز: PDF, DOC, DOCX</div>
            </div>
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
                autoComplete="new-password"
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
                  formik.touched.confirm_password &&
                  formik.errors.confirm_password
                    ? "is-invalid"
                    : ""
                }`}
                {...formik.getFieldProps("confirm_password")}
                autoComplete="new-password"
              />
              {formik.touched.confirm_password &&
                formik.errors.confirm_password && (
                  <div className="invalid-feedback">
                    {formik.errors.confirm_password}
                  </div>
                )}
            </div>
          </div>

          <div className="text-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              onClick={() => {
                if (!formik.isValid) {
                  const errors = formik.errors;
                  const errorMessages = Object.values(errors)
                    .filter((error): error is string => typeof error === 'string');
                  if (errorMessages.length > 0) {
                    toast.error(errorMessages[0]);
                  }
                }
              }}
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

export default CompleteUserInfo;
