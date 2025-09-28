import { FC, useState, useEffect, useCallback } from "react";
import { KTIcon } from "../../_metronic/helpers";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { getToken, decryptToJwt, PermissionEnums } from "../modules/auth/core/_requests";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { API_ENDPOINTS } from "../config/app";
import debounce from 'lodash/debounce';
import { useDropzone } from 'react-dropzone';

interface Call {
  id: number;
  title: string;
  code: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  createdById: number;
  createdBy?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  expertiseAreas: number[];
  problemDescription: string;
  expectedGoals: string;
  evaluationCriteria: number[];
  supportLevel: number[];
  submissionMethod: string;
  attachments?: CallAttachment[];
  stages?: CallStage[];
  ideas?: Idea[];
  organizer: string;
  faQs: { id: number; question: string; answer: string }[];
  bannerImagePath?: string;
  bannerImage?: { fileName: string };
}

interface CallAttachment {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  callId: number;
}

interface CallStage {
  id: number;
  name: string;
  description: string;
  order: number;
  startDate?: string;
  endDate?: string;
  status: string;
  callId: number;
}

interface Idea {
  id: number;
  title: string;
  description: string;
  status: string;
  currentStageId: number;
  callId: number;
  createdById: number;
  createdBy: {
    id: number;
    name: string;
  };
  attachments: any[];
  stages: any[];
  currentStage: CallStage;
}

interface CreateIdeaDto {
  title: string;
  description: string;
  status: string;
  currentStageId: number;
  callId: number;
  file?: File;
}

const Innovations: FC = () => {
  const navigate = useNavigate();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showSendIdeaModal, setShowSendIdeaModal] = useState(false);
  const [callToDelete, setCallToDelete] = useState<Call | null>(null);
  const [selectedCallForFaq, setSelectedCallForFaq] = useState<Call | null>(null);
  const [selectedCallForIdea, setSelectedCallForIdea] = useState<Call | null>(null);
  const [hasSuperAccess, setHasSuperAccess] = useState(false);

  useEffect(() => {
    const checkPermissions = () => {
      const data = decryptToJwt(getToken()?.toString()!);
      const isSuper = data.Permissions.includes(PermissionEnums.CreateInnovation) && 
                     data.Permissions.includes(PermissionEnums.UpdateInnovation) && 
                     data.Permissions.includes(PermissionEnums.DeleteInnovation);
      setHasSuperAccess(isSuper);
    };
    checkPermissions();
  }, []);

  const fetchCalls = async (searchText: string = '') => {
    try {
      setLoading(true);
      console.log(API_ENDPOINTS.INNOVATION.CALLS);
      const response = await axios.get(
        API_ENDPOINTS.INNOVATION.CALLS,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setCalls(response.data);
    } catch (error) {
      console.error("Error fetching calls:", error);
      toast.error("خطا در دریافت اطلاعات فراخوان‌ها", {
        position: "top-center",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchLoading(true);
      fetchCalls(query).finally(() => setSearchLoading(false));
    }, 500),
    []
  );

  useEffect(() => {
    fetchCalls();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleCreate = () => {
    navigate('/create-call');
  };

  const handleView = (call: Call) => {
    const data = decryptToJwt(getToken()?.toString()!);
    const hasUpdatePermission = data.Permissions.includes(PermissionEnums.UpdateInnovation);
    
    if (hasUpdatePermission) {
      navigate(`/call/${call.id}`);
    } else {
      navigate(`/view-call/${call.id}`);
    }
  };

  const handleEdit = (call: Call) => {
    navigate(`/call/${call.id}`);
  };

  const handleDelete = async (call: Call) => {
    setCallToDelete(call);
    setShowDeleteModal(true);
  };

  const handleManageFaqs = (call: Call) => {
    setSelectedCallForFaq(call);
    setShowFaqModal(true);
  };

  const handleSendIdea = (call: Call) => {
    setSelectedCallForIdea(call);
    setShowSendIdeaModal(true);
  };

  const confirmDelete = async () => {
    if (!callToDelete) return;

    try {
      await axios.delete(
        API_ENDPOINTS.INNOVATION.CALL(callToDelete.id),
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      toast.success("فراخوان با موفقیت حذف شد", {
        position: "top-center",
        autoClose: 3000,
      });

      setShowDeleteModal(false);
      setCallToDelete(null);
      fetchCalls(); // Refresh the list
    } catch (error) {
      console.error("Error deleting call:", error);
      toast.error("خطا در حذف فراخوان", {
        position: "top-center",
        autoClose: 4000,
      });
    }
  };

  const FaqModal = () => {
    const [faqs, setFaqs] = useState<{ id: number; question: string; answer: string }[]>([]);

    useEffect(() => {
      if (selectedCallForFaq) {
        // Initialize faqs with the selected call's FAQs
        const initialFaqs = selectedCallForFaq.faQs?.map(faq => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer
        })) || [];
        setFaqs(initialFaqs);
      }
    }, [selectedCallForFaq]);

    const addFaq = () => {
      setFaqs([...faqs, { id: 0, question: "", answer: "" }]);
    };

    const removeFaq = async (index: number) => {
      const faqToRemove = faqs[index];
      if (faqToRemove.id !== 0) {
        try {
          await axios.delete(
            API_ENDPOINTS.INNOVATION.FAQS.DELETE(faqToRemove.id),
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );
          toast.success("سوال با موفقیت حذف شد", {
            position: "top-center",
            autoClose: 3000,
          });
        } catch (error) {
          console.error("Error deleting FAQ:", error);
          toast.error("خطا در حذف سوال", {
            position: "top-center",
            autoClose: 4000,
          });
          return;
        }
      }
      setFaqs(faqs.filter((_, i) => i !== index));
    };

    const updateFaq = (index: number, field: "question" | "answer", value: string) => {
      const newFaqs = [...faqs];
      newFaqs[index] = { ...newFaqs[index], [field]: value };
      setFaqs(newFaqs);
    };

    const handleSave = async () => {
      if (!selectedCallForFaq) return;

      try {
        // Create new FAQs
        const newFaqs = faqs.filter(faq => faq.id === 0);
        if (newFaqs.length > 0) {
          console.log('Attempting to create new FAQs with payload:', newFaqs);
          console.log('Selected Call ID:', selectedCallForFaq.id);
          
          // Ensure we're sending a single FAQ object, not an array
          const faqToCreate = {
            id: 0,
            question: newFaqs[0].question,
            answer: newFaqs[0].answer
          };
          
          console.log('Sending single FAQ object:', faqToCreate);
          
          const response = await axios.post(
            API_ENDPOINTS.INNOVATION.CALL_FAQS(selectedCallForFaq.id),
            faqToCreate,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log('FAQ creation response:', response.data);
        }

        // Update existing FAQs
        const existingFaqs = faqs.filter(faq => faq.id !== 0);
        for (const faq of existingFaqs) {
          console.log('Updating FAQ:', faq);
          const response = await axios.put(
            API_ENDPOINTS.INNOVATION.FAQS.DELETE(faq.id),
            faq,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log('FAQ update response:', response.data);
        }

        toast.success("سوالات متداول با موفقیت بروزرسانی شد", {
          position: "top-center",
          autoClose: 3000,
        });

        setShowFaqModal(false);
        fetchCalls();
      } catch (error) {
        console.error("Error updating FAQs:", error);
        if (axios.isAxiosError(error)) {
          console.error("API Error Details:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            config: {
              url: error.config?.url,
              method: error.config?.method,
              data: error.config?.data,
              headers: error.config?.headers
            }
          });
        }
        toast.error("خطا در بروزرسانی سوالات متداول", {
          position: "top-center",
          autoClose: 4000,
        });
      }
    };

    return (
      <>
        <div className="modal fade show d-block" tabIndex={-1} dir="rtl" style={{ zIndex: 1056 }}>
          <div className="modal-dialog modal-dialog-centered mw-650px">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="fw-bold">مدیریت سوالات متداول</h2>
                <div
                  className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                  onClick={() => setShowFaqModal(false)}
                >
                  <KTIcon iconName="cross" className="fs-2x" />
                </div>
              </div>

              <div className="modal-body scroll-y mx-5 mx-xl-15 my-7">
                <div className="mb-7">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="fw-bold mb-0">سوالات متداول</h4>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={addFaq}
                    >
                      <KTIcon iconName="plus" className="fs-2" />
                      افزودن سوال
                    </button>
                  </div>

                  {faqs.map((faq, index) => (
                    <div key={index} className="card mb-5">
                      <div className="card-body">
                        <div className="d-flex justify-content-end mb-3">
                          <button
                            type="button"
                            className="btn btn-icon btn-sm btn-light-danger"
                            onClick={() => removeFaq(index)}
                          >
                            <KTIcon iconName="trash" className="fs-2" />
                          </button>
                        </div>

                        <div className="mb-3">
                          <label className="form-label required">سوال</label>
                          <input
                            type="text"
                            className="form-control"
                            value={faq.question}
                            onChange={(e) => updateFaq(index, "question", e.target.value)}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label required">پاسخ</label>
                          <CKEditor
                            editor={ClassicEditor}
                            data={faq.answer}
                            onChange={(event, editor) => {
                              const data = editor.getData();
                              updateFaq(index, "answer", data);
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowFaqModal(false)}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                >
                  ذخیره تغییرات
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>
      </>
    );
  };

  const SendIdeaModal = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
      setFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'image/*': ['.png', '.jpg', '.jpeg'],
      },
      maxSize: 10485760, // 10MB
    });

    const removeFile = (index: number) => {
      setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formik = useFormik({
      initialValues: {
        title: '',
        description: '',
      },
      validationSchema: Yup.object({
        title: Yup.string().required('عنوان ایده الزامی است'),
        description: Yup.string().required('توضیحات ایده الزامی است'),
      }),
      onSubmit: async (values) => {
        try {
          setUploading(true);
          
          const formData = new FormData();
          formData.append('Title', values.title);
          formData.append('Description', values.description);
          formData.append('Status', 'Pending');
          formData.append('CurrentStageId', '0');
          formData.append('CallId', selectedCallForIdea?.id.toString() || '0');
          
          // Add all files
          if (files.length > 0) {
            files.forEach(file => {
              formData.append('Files', file);
            });
          }

          await axios.post(
            API_ENDPOINTS.INNOVATION.IDEAS,
            formData,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
                'Content-Type': 'multipart/form-data',
              },
              transformRequest: [(data) => data],
            }
          );

          toast.success('ایده با موفقیت ثبت شد', {
            position: 'top-center',
            autoClose: 3000,
          });

          setShowSendIdeaModal(false);
          setSelectedCallForIdea(null);
          setFiles([]);
          formik.resetForm();
        } catch (error) {
          console.error('Error creating idea:', error);
          toast.error('خطا در ثبت ایده', {
            position: 'top-center',
            autoClose: 4000,
          });
        } finally {
          setUploading(false);
        }
      },
    });

    return (
      <>
        <div className="modal fade show d-block" tabIndex={-1} dir="rtl" style={{ zIndex: 1056 }}>
          <div className="modal-dialog modal-dialog-centered mw-650px">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="fw-bold">ارسال ایده جدید</h2>
                <div
                  className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                  onClick={() => {
                    setShowSendIdeaModal(false);
                    setSelectedCallForIdea(null);
                    setFiles([]);
                    formik.resetForm();
                  }}
                >
                  <KTIcon iconName="cross" className="fs-2x" />
                </div>
              </div>

              <form onSubmit={formik.handleSubmit}>
                <div className="modal-body scroll-y mx-5 mx-xl-15 my-7">
                  <div className="mb-7">
                    <div className="mb-3">
                      <label className="form-label required">عنوان ایده</label>
                      <input
                        type="text"
                        className={`form-control ${formik.touched.title && formik.errors.title ? 'is-invalid' : ''}`}
                        {...formik.getFieldProps('title')}
                      />
                      {formik.touched.title && formik.errors.title && (
                        <div className="invalid-feedback">{formik.errors.title}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label required">توضیحات ایده</label>
                      <CKEditor
                        editor={ClassicEditor}
                        data={formik.values.description}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          formik.setFieldValue('description', data);
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
                        <div className="text-danger mt-2">{formik.errors.description}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">فایل‌های پیوست</label>
                      <div
                        {...getRootProps()}
                        className={`dropzone-upload ${isDragActive ? 'dropzone-dragging' : ''}`}
                        style={{
                          border: '2px dashed #ccc',
                          borderRadius: '4px',
                          padding: '20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          backgroundColor: isDragActive ? '#f8f9fa' : 'transparent',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <input {...getInputProps()} />
                        <div className="dropzone-upload-message">
                          <KTIcon iconName="upload" className="fs-2x mb-3" />
                          <span className="dropzone-upload-message-text">
                            {isDragActive
                              ? 'فایل‌ها را اینجا رها کنید'
                              : 'فایل‌ها را اینجا رها کنید یا برای انتخاب کلیک کنید'}
                          </span>
                          <div className="text-muted mt-2">
                            فرمت‌های مجاز: PDF, DOC, DOCX, PNG, JPG
                            <br />
                            حداکثر حجم: 10MB
                          </div>
                        </div>
                      </div>

                      {files.length > 0 && (
                        <div className="mt-3">
                          <div className="d-flex flex-column gap-2">
                            {files.map((file, index) => (
                              <div key={index} className="d-flex align-items-center justify-content-between bg-light p-2 rounded">
                                <span className="text-truncate">{file.name}</span>
                                <button
                                  type="button"
                                  className="btn btn-icon btn-sm btn-active-light-danger"
                                  onClick={() => removeFile(index)}
                                >
                                  <KTIcon iconName="trash" className="fs-2" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => {
                      setShowSendIdeaModal(false);
                      setSelectedCallForIdea(null);
                      setFiles([]);
                      formik.resetForm();
                    }}
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={formik.isSubmitting || uploading}
                  >
                    {(formik.isSubmitting || uploading) ? (
                      <span className="indicator-progress">
                        در حال ثبت...{' '}
                        <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                      </span>
                    ) : (
                      'ثبت ایده'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>
      </>
    );
  };

  const userHasAccess = (permission: number) => {
    try {
      const token = getToken();
      if (!token) return false;
      const data = decryptToJwt(token.toString());
      return data?.Permissions?.includes(permission) || false;
    } catch {
      return false;
    }
  };

  return (
    <>
      <div dir="rtl" style={{ fontFamily: "sans" }}>
        <div className="card">
          <div className="card-header border-0 pt-6 bg-secondary">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTIcon
                  iconName="magnifier"
                  className="fs-1 position-absolute me-6"
                />
                <input
                  type="text"
                  className="form-control form-control-solid w-250px pe-14"
                  placeholder="جستجو"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchLoading && (
                  <div className="position-absolute end-0 me-3">
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  </div>
                )}
              </div>
            </div>

            <div className="card-toolbar">
              <div className="d-flex justify-content-end" data-kt-user-table-toolbar="base">
                {userHasAccess(PermissionEnums.CreateCallButton) && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCreate}
                  >
                    <KTIcon iconName="plus" className="fs-2" />
                    ایجاد فراخوان جدید
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="card-body py-4">
            {loading ? (
              <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">در حال بارگذاری...</span>
                </div>
              </div>
            ) : (
              <table className="table align-middle table-row-dashed fs-6 gy-5 text-center">
                <thead>
                  <tr className="text-center text-muted fw-bold fs-7 text-uppercase gs-0">
                    <th className="min-w-100px">تصویر</th>
                    <th className="min-w-125px">عنوان</th>
                    <th className="min-w-125px">کد فراخوان</th>
                    <th className="min-w-125px">تاریخ شروع</th>
                    <th className="min-w-125px">تاریخ پایان</th>
                    <th className="min-w-125px">وضعیت</th>
                    <th className="min-w-125px">نحوه ارسال</th>
                    <th className="min-w-125px">تعداد ایده‌ها</th>
                    <th className="min-w-100px">عملیات</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 fw-semibold">
                  {calls.map((call) => (
                    <tr key={call.id}>
                      <td>
                        <div className="d-flex align-items-center justify-content-center">
                          {call.bannerImage && (
                            <div className="mb-4">
                              <img
                                src={call.bannerImage.fileName}
                                alt={`Banner for ${call.title}`}
                                className="img-fluid rounded w-100"
                                style={{ height: "150px", objectFit: "cover" }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center justify-content-center">
                          <div className="d-flex flex-column align-items-center">
                            <span className="text-dark fw-bold text-hover-primary mb-1 fs-6">
                              {call.title}
                            </span>
                            <span className="text-muted fw-semibold text-muted d-block fs-7">
                              {call.organizer}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-light-primary fs-7 fw-semibold px-3 py-2">
                          {call.code}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-column align-items-center">
                          <span className="text-dark fw-bold fs-6">
                            {new Date(call.startDate).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column align-items-center">
                          <span className="text-dark fw-bold fs-6">
                            {new Date(call.endDate).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge badge-light-${
                            call.status === "Open" ? "success" : "danger"
                          } fs-7 fw-semibold px-3 py-2`}
                        >
                          {call.status === "Open" ? "باز" : "بسته"}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-light-info fs-7 fw-semibold px-3 py-2">
                          {call.submissionMethod === "FileUpload"
                            ? "بارگذاری فایل"
                            : call.submissionMethod === "OnlineForm"
                            ? "فرم آنلاین"
                            : "ایمیل"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center justify-content-center">
                          <span className="text-dark fw-bold fs-6 me-2 mx-2">
                            {call.ideas?.length || 0}  
                          </span>
                          <span className="text-muted fw-semibold text-muted d-block fs-7">
                            ایده
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          {userHasAccess(PermissionEnums.ViewCallButton) && (
                            <button
                              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                              onClick={() => handleView(call)}
                              title="مشاهده"
                            >
                              <KTIcon iconName="eye" className="fs-2" />
                            </button>
                          )}
                          {userHasAccess(PermissionEnums.UpdateCallButton) && (
                            <button
                              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                              onClick={() => handleEdit(call)}
                              title="ویرایش"
                            >
                              <KTIcon iconName="pencil" className="fs-2" />
                            </button>
                          )}
                          {userHasAccess(PermissionEnums.ManageCallFaqsButton) && (
                            <button
                              className="btn btn-icon btn-bg-light btn-active-color-info btn-sm me-1"
                              onClick={() => handleManageFaqs(call)}
                              title="مدیریت سوالات متداول"
                            >
                              <KTIcon iconName="question" className="fs-2" />
                            </button>
                          )}
                          {userHasAccess(PermissionEnums.ManageCallIdeasButton) && (
                            <button
                              className="btn btn-icon btn-bg-light btn-active-color-warning btn-sm me-1"
                              onClick={() => navigate(`/idea-management/${call.id}`)}
                              title="مدیریت ایده‌ها"
                            >
                              <KTIcon iconName="message-text-2" className="fs-2" />
                            </button>
                          )}
                          {userHasAccess(PermissionEnums.ManageCallStagesButton) && (
                            <button
                              className="btn btn-icon btn-bg-light btn-active-color-success btn-sm me-1"
                              onClick={() => navigate(`/call-stages/${call.id}`)}
                              title="مدیریت مراحل"
                            >
                              <KTIcon iconName="abstract-26" className="fs-2" />
                            </button>
                          )}
                          {userHasAccess(PermissionEnums.DeleteCallButton) && (
                            <button
                              className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                              onClick={() => handleDelete(call)}
                              title="حذف"
                            >
                              <KTIcon iconName="trash" className="fs-2" />
                            </button>
                          )}
                          {call.status === "Open" && userHasAccess(PermissionEnums.SendIdeaButton) && (
                            <button
                              className="btn btn-icon btn-bg-light btn-active-color-success btn-sm"
                              onClick={() => handleSendIdea(call)}
                              title="ارسال ایده"
                            >
                              <KTIcon iconName="message-text-2" className="fs-2" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {showFaqModal && <FaqModal />}
        {showSendIdeaModal && <SendIdeaModal />}

        {showDeleteModal && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            dir="rtl"
            style={{ zIndex: 1056 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">تایید حذف</h5>
                  <div
                    className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCallToDelete(null);
                    }}
                  >
                    <KTIcon iconName="cross" className="fs-2x" />
                  </div>
                </div>
                <div className="modal-body">
                  <p>
                    آیا از حذف فراخوان "{callToDelete?.title}" اطمینان دارید؟
                  </p>
                  <p className="text-danger">این عملیات غیرقابل بازگشت است.</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCallToDelete(null);
                    }}
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={confirmDelete}
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showDeleteModal && (
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1055 }}
          ></div>
        )}
      </div>
    </>
  );
};

export default Innovations;
