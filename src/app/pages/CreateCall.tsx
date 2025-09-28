import { FC, useEffect, useState } from "react";
import { PageTitle } from "../../_metronic/layout/core";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { getToken } from "../modules/auth/core/_requests";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { KTIcon } from "../../_metronic/helpers";
import { API_ENDPOINTS } from "../config/app";

interface CallAttachment {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  callId: number;
}

interface FileWithPreview extends File {
  preview?: string;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface CallFormValues {
  id: number;
  title: string;
  code: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  createdById: number;
  expertiseAreas: string[];
  problemDescription: string;
  expectedGoals: string;
  evaluationCriteria: string[];
  supportLevel: string[];
  submissionMethod: string;
  organizer: string;
  faQs: FAQItem[];
}

const CreateCall: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<CallAttachment[]>([]);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const formik = useFormik<CallFormValues>({
    initialValues: {
      id: 0,
      title: "",
      code: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "",
      createdById: 0,
      expertiseAreas: [],
      problemDescription: "",
      expectedGoals: "",
      evaluationCriteria: [],
      supportLevel: [],
      submissionMethod: "",
      organizer: "",
      faQs: [],
    },
    validationSchema: Yup.object({
      title: Yup.string().required("عنوان الزامی است"),
      code: Yup.string().required("کد فراخوان الزامی است"),
      description: Yup.string().required("توضیحات الزامی است"),
      startDate: Yup.date().required("تاریخ شروع الزامی است"),
      endDate: Yup.date()
        .required("تاریخ پایان الزامی است")
        .min(Yup.ref("startDate"), "تاریخ پایان باید بعد از تاریخ شروع باشد"),
      status: Yup.string().required("وضعیت الزامی است"),
      expertiseAreas: Yup.array().min(1, "حداقل یک حوزه تخصصی باید انتخاب شود"),
      problemDescription: Yup.string().required("شرح مسئله الزامی است"),
      expectedGoals: Yup.string().required("اهداف مورد انتظار الزامی است"),
      evaluationCriteria: Yup.array().min(
        1,
        "حداقل یک معیار ارزیابی باید انتخاب شود"
      ),
      supportLevel: Yup.array().min(1, "حداقل یک سطح پشتیبانی باید انتخاب شود"),
      submissionMethod: Yup.string().required("نحوه ارسال پیشنهاد الزامی است"),
      organizer: Yup.string().required("برگزارکننده الزامی است"),
    }),
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        
        // Add each field separately to match the .NET Core API's UpdateCallDto structure
        formData.append('Id', values.id.toString());
        formData.append('Title', values.title);
        formData.append('Code', values.code);
        formData.append('Description', values.description);
        formData.append('StartDate', new Date(values.startDate + "T00:00:00").toISOString());
        formData.append('EndDate', new Date(values.endDate + "T00:00:00").toISOString());
        formData.append('Status', values.status);
        
        // Convert arrays to match .NET Core enum lists
        if (values.expertiseAreas && values.expertiseAreas.length > 0) {
          (values.expertiseAreas as string[]).forEach((area) => {
            formData.append('ExpertiseAreas', area.toString());
          });
        }
        
        formData.append('ProblemDescription', values.problemDescription);
        formData.append('ExpectedGoals', values.expectedGoals);
        
        if (values.evaluationCriteria && values.evaluationCriteria.length > 0) {
          (values.evaluationCriteria as string[]).forEach((criteria) => {
            formData.append('EvaluationCriteria', criteria.toString());
          });
        }
        
        if (values.supportLevel && values.supportLevel.length > 0) {
          (values.supportLevel as string[]).forEach((level) => {
            formData.append('SupportLevel', level.toString());
          });
        }
        
        formData.append('SubmissionMethod', values.submissionMethod);
        formData.append('Organizer', values.organizer);
        
        // Handle FAQs as an array of objects
        if (values.faQs && values.faQs.length > 0) {
          (values.faQs as FAQItem[]).forEach((faq, index: number) => {
            formData.append(`FAQs[${index}].Id`, faq.id.toString());
            formData.append(`FAQs[${index}].Question`, faq.question);
            formData.append(`FAQs[${index}].Answer`, faq.answer);
          });
        } else {
          // Send empty array if no FAQs
          formData.append('FAQs', '[]');
        }
        
        // Add only the new files that were selected in the file input
        files.forEach((file) => {
          formData.append('files', file);
        });

        // Add banner image if selected
        if (bannerImage) {
          formData.append('bannerImage', bannerImage);
        }

        if (isEditMode) {
          await axios.put(
            API_ENDPOINTS.INNOVATION.CALL(Number(id)),
            formData,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          toast.success("فراخوان با موفقیت ویرایش شد", {
            position: "top-center",
            autoClose: 3000,
          });
        } else {
          await axios.post(
            API_ENDPOINTS.INNOVATION.CALLS,
            formData,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          toast.success("فراخوان با موفقیت ایجاد شد", {
            position: "top-center",
            autoClose: 3000,
          });
        }

        navigate("/Innovations");
      } catch (error) {
        console.error("Error saving call:", error);
        if (axios.isAxiosError(error)) {
          console.error("API Error Response:", error.response?.data);
          toast.error(
            `خطا در ذخیره فراخوان: ${
              error.response?.data?.message || error.message
            }`,
            {
              position: "top-center",
              autoClose: 4000,
            }
          );
        } else {
          toast.error("خطا در ذخیره فراخوان", {
            position: "top-center",
            autoClose: 4000,
          });
        }
      }
    },
  });

  useEffect(() => {
    const fetchCall = async () => {
      if (isEditMode && id) {
        try {
          const response = await axios.get(
            API_ENDPOINTS.INNOVATION.CALL(Number(id)),
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
                'Content-Type': 'application/json',
              },
            }
          );
          const call = response.data;
          
          // Format dates for input fields
          const formattedCall = {
            ...call,
            startDate: new Date(call.startDate).toISOString().split('T')[0],
            endDate: new Date(call.endDate).toISOString().split('T')[0],
            expertiseAreas: call.expertiseAreas || [],
            evaluationCriteria: call.evaluationCriteria || [],
            supportLevel: call.supportLevel || [],
            faQs: call.faQs || [],
          };
          
          formik.setValues(formattedCall);
          setExistingAttachments(call.attachments || []);
          
          // Set banner image preview if exists
          if (call.bannerImagePath) {
            setBannerPreview(call.bannerImagePath);
          }
        } catch (error) {
          console.error("Error fetching call:", error);
          toast.error("خطا در دریافت اطلاعات فراخوان", {
            position: "top-center",
            autoClose: 4000,
          });
          navigate("/Innovations");
        }
      }
    };

    fetchCall();
  }, [id, isEditMode]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = async (attachmentId: number) => {
    try {
      await axios.delete(
        API_ENDPOINTS.INNOVATION.ATTACHMENTS.DELETE(attachmentId),
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setExistingAttachments((prev) => 
        prev.filter((attachment) => attachment.id !== attachmentId)
      );
      toast.success("فایل با موفقیت حذف شد", {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast.error("خطا در حذف فایل", {
        position: "top-center",
        autoClose: 4000,
      });
    }
  };

  const handleBannerImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Validate image type
      if (!file.type.startsWith('image/')) {
        toast.error("لطفا یک فایل تصویری انتخاب کنید", {
          position: "top-center",
          autoClose: 4000,
        });
        return;
      }
      
      setBannerImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBannerImage = () => {
    setBannerImage(null);
    setBannerPreview(null);
  };

  return (
    <>
      <div dir="rtl" style={{ fontFamily: "sans" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              {isEditMode ? "ویرایش فراخوان" : "ایجاد فراخوان جدید"}
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={formik.handleSubmit} className="form">
              <div className="row mb-7">
                <div className="col-md-6">
                  <label className="required fw-bold fs-6 mb-2">عنوان</label>
                  <input
                    {...formik.getFieldProps("title")}
                    type="text"
                    className="form-control form-control-solid mb-3 mb-lg-0"
                  />
                  {formik.touched.title && formik.errors.title && (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">{formik.errors.title}</div>
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="required fw-bold fs-6 mb-2">
                    کد فراخوان
                  </label>
                  <input
                    {...formik.getFieldProps("code")}
                    type="text"
                    className="form-control form-control-solid mb-3 mb-lg-0"
                  />
                  {formik.touched.code && formik.errors.code && (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">{formik.errors.code}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="fv-row mb-7">
                <label className="required fw-bold fs-6 mb-2">توضیحات</label>
                <CKEditor
                  editor={ClassicEditor as any}
                  data={formik.values.description}
                  onChange={(_, editor) => {
                    formik.setFieldValue("description", editor.getData());
                  }}
                  onBlur={() => {
                    formik.setFieldTouched("description", true);
                  }}
                  config={{
                    toolbar: [
                      'heading',
                      '|',
                      'bold',
                      'italic',
                      'link',
                      'bulletedList',
                      'numberedList',
                      '|',
                      'outdent',
                      'indent',
                      '|',
                      'blockQuote',
                      'insertTable',
                      'undo',
                      'redo'
                    ],
                    language: 'fa'
                  }}
                />
                {formik.touched.description && formik.errors.description && (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">
                      {formik.errors.description}
                    </div>
                  </div>
                )}
              </div>

              <div className="row mb-7">
                <div className="col-md-6">
                  <label className="required fw-bold fs-6 mb-2">
                    تاریخ شروع
                  </label>
                  <input
                    {...formik.getFieldProps("startDate")}
                    type="date"
                    className="form-control form-control-solid mb-3 mb-lg-0"
                    value={formik.values.startDate}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.startDate && formik.errors.startDate && (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">
                        {formik.errors.startDate}
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="required fw-bold fs-6 mb-2">
                    تاریخ پایان
                  </label>
                  <input
                    {...formik.getFieldProps("endDate")}
                    type="date"
                    className="form-control form-control-solid mb-3 mb-lg-0"
                    value={formik.values.endDate}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.endDate && formik.errors.endDate && (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">
                        {formik.errors.endDate}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="fv-row mb-7">
                <label className="required fw-bold fs-6 mb-2">
                  حوزه‌های تخصصی
                </label>
                <select
                  {...formik.getFieldProps("expertiseAreas")}
                  className="form-select form-select-solid"
                  multiple
                >
                  <option value={1}>شیمی</option>
                  <option value={2}>پلیمر</option>
                  <option value={3}>برق</option>
                  <option value={4}>بازاریابی</option>
                  <option value={5}>نرم‌افزار</option>
                  <option value={6}>سخت‌افزار</option>
                </select>
                {formik.touched.expertiseAreas &&
                  formik.errors.expertiseAreas && (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">
                        {formik.errors.expertiseAreas}
                      </div>
                    </div>
                  )}
              </div>

              <div className="fv-row mb-7">
                <label className="required fw-bold fs-6 mb-2">شرح مسئله</label>
                <CKEditor
                  editor={ClassicEditor as any}
                  data={formik.values.problemDescription}
                  onChange={(_, editor) => {
                    formik.setFieldValue("problemDescription", editor.getData());
                  }}
                  onBlur={() => {
                    formik.setFieldTouched("problemDescription", true);
                  }}
                  config={{
                    toolbar: [
                      'heading',
                      '|',
                      'bold',
                      'italic',
                      'link',
                      'bulletedList',
                      'numberedList',
                      '|',
                      'outdent',
                      'indent',
                      '|',
                      'blockQuote',
                      'insertTable',
                      'undo',
                      'redo'
                    ],
                    language: 'fa'
                  }}
                />
                {formik.touched.problemDescription &&
                  formik.errors.problemDescription && (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">
                        {formik.errors.problemDescription}
                      </div>
                    </div>
                  )}
              </div>

              <div className="fv-row mb-7">
                <label className="required fw-bold fs-6 mb-2">
                  اهداف مورد انتظار
                </label>
                <CKEditor
                  editor={ClassicEditor as any}
                  data={formik.values.expectedGoals}
                  onChange={(_, editor) => {
                    formik.setFieldValue("expectedGoals", editor.getData());
                  }}
                  onBlur={() => {
                    formik.setFieldTouched("expectedGoals", true);
                  }}
                  config={{
                    toolbar: [
                      'heading',
                      '|',
                      'bold',
                      'italic',
                      'link',
                      'bulletedList',
                      'numberedList',
                      '|',
                      'outdent',
                      'indent',
                      '|',
                      'blockQuote',
                      'insertTable',
                      'undo',
                      'redo'
                    ],
                    language: 'fa'
                  }}
                />
                {formik.touched.expectedGoals &&
                  formik.errors.expectedGoals && (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">
                        {formik.errors.expectedGoals}
                      </div>
                    </div>
                  )}
              </div>

              <div className="fv-row mb-7">
                <label className="required fw-bold fs-6 mb-2">
                  معیارهای ارزیابی
                </label>
                <select
                  {...formik.getFieldProps("evaluationCriteria")}
                  className="form-select form-select-solid"
                  multiple
                >
                  <option value={1}>نوآوری</option>
                  <option value={2}>کاربردپذیری</option>
                  <option value={3}>هزینه</option>
                  <option value={4}>زمان اجرا</option>
                  <option value={5}>کیفیت</option>
                </select>
                {formik.touched.evaluationCriteria &&
                  formik.errors.evaluationCriteria && (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">
                        {formik.errors.evaluationCriteria}
                      </div>
                    </div>
                  )}
              </div>

              <div className="fv-row mb-7">
                <label className="required fw-bold fs-6 mb-2">
                  سطح پشتیبانی
                </label>
                <select
                  {...formik.getFieldProps("supportLevel")}
                  className="form-select form-select-solid"
                  multiple
                >
                  <option value={1}>مالی</option>
                  <option value={2}>تجهیزات</option>
                  <option value={3}>فضای کار</option>
                  <option value={4}>شبکه‌سازی</option>
                </select>
                {formik.touched.supportLevel && formik.errors.supportLevel && (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">
                      {formik.errors.supportLevel}
                    </div>
                  </div>
                )}
              </div>

              <div className="fv-row mb-7">
                <label className="required fw-bold fs-6 mb-2">
                  نحوه ارسال پیشنهاد
                </label>
                <select
                  {...formik.getFieldProps("submissionMethod")}
                  className="form-select form-select-solid"
                >
                  <option value="">انتخاب کنید</option>
                  <option value="FileUpload">بارگذاری فایل</option>
                  <option value="OnlineForm">فرم آنلاین</option>
                  <option value="Email">ایمیل</option>
                </select>
                {formik.touched.submissionMethod &&
                  formik.errors.submissionMethod && (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">
                        {formik.errors.submissionMethod}
                      </div>
                    </div>
                  )}
              </div>

              <div className="row mb-7">
                <div className="col-md-6">
                  <label className="required fw-bold fs-6 mb-2">وضعیت</label>
                  <select
                    {...formik.getFieldProps("status")}
                    className="form-select form-select-solid"
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="Open">باز</option>
                    <option value="Closed">بسته</option>
                  </select>
                  {formik.touched.status && formik.errors.status && (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">
                        {formik.errors.status}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="fv-row mb-7">
                <label className="fw-bold fs-6 mb-2">تصویر بنر فراخوان</label>
                <div className="banner-image-upload">
                  {bannerPreview ? (
                    <div className="banner-preview mb-3">
                      <img 
                        src={bannerPreview} 
                        alt="Banner Preview" 
                        className="img-fluid rounded"
                        style={{ maxHeight: '200px', width: 'auto' }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger mt-2"
                        onClick={removeBannerImage}
                      >
                        <i className="fa fa-trash me-2"></i>حذف تصویر
                      </button>
                    </div>
                  ) : (
                    <div className="banner-upload-area p-4 border-2 border-dashed border-gray-300 rounded text-center">
                      <i className="fa fa-image fa-3x text-muted mb-3"></i>
                      <p className="text-muted mb-3">برای انتخاب تصویر بنر کلیک کنید</p>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleBannerImageChange}
                        style={{ display: 'none' }}
                        id="bannerImageInput"
                      />
                      <label htmlFor="bannerImageInput" className="btn btn-primary">
                        <i className="fa fa-upload me-2"></i>انتخاب تصویر
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="fv-row mb-7">
                <label className="required fw-bold fs-6 mb-2">
                  برگزارکننده
                </label>
                <input
                  {...formik.getFieldProps("organizer")}
                  type="text"
                  className="form-control form-control-solid mb-3 mb-lg-0"
                />
                {formik.touched.organizer && formik.errors.organizer && (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">
                      {formik.errors.organizer}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-7">
                <label className="fw-bold fs-6 mb-2">فایل‌های پیوست</label>
                <div className="dropzone dropzone-multi px-8 py-4">
                  <div className="dropzone-items">
                    {existingAttachments.map((attachment) => (
                      <div key={attachment.id} className="dropzone-item">
                        <div className="dropzone-file">
                          <div className="dropzone-filename" title={attachment.fileName}>
                            <span>{attachment.fileName}</span>
                            <strong>
                              (<span>{(attachment.fileSize / 1024).toFixed(2)} KB</span>)
                            </strong>
                          </div>
                        </div>
                        <div className="dropzone-toolbar">
                          <span className="dropzone-delete">
                            <button
                              type="button"
                              className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                              onClick={() => removeExistingAttachment(attachment.id)}
                            >
                              <KTIcon className="fs-1" iconName="cross" />
                            </button>
                          </span>
                        </div>
                      </div>
                    ))}
                    {files.map((file, index) => (
                      <div key={index} className="dropzone-item">
                        <div className="dropzone-file">
                          <div className="dropzone-filename" title={file.name}>
                            <span>{file.name}</span>
                            <strong>
                              (<span>{(file.size / 1024).toFixed(2)} KB</span>)
                            </strong>
                          </div>
                        </div>
                        <div className="dropzone-toolbar">
                          <span className="dropzone-delete">
                            <button
                              type="button"
                              className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                              onClick={() => removeFile(index)}
                            >
                              <KTIcon className="fs-1" iconName="cross" />
                            </button>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="dropzone-upload">
                    <input
                      type="file"
                      className="dropzone-input"
                      onChange={handleFileChange}
                      multiple
                    />
                    <div className="dropzone-upload-message">
                      <span className="dropzone-upload-message-text">
                        فایل‌ها را اینجا رها کنید یا برای انتخاب کلیک کنید
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-15">
                <button
                  type="button"
                  className="btn btn-light me-3"
                  onClick={() => navigate("/Innovations")}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? (
                    <span className="indicator-progress">
                      لطفا صبر کنید...
                      <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                    </span>
                  ) : (
                    <span className="indicator-label">ذخیره</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCall;
