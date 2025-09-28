import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../modules/auth/core/_requests";
import { toast } from "react-toastify";
import { KTIcon } from "../../_metronic/helpers";
import { API_ENDPOINTS } from "../config/app";

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
  expertiseAreas: string[];
  problemDescription: string;
  expectedGoals: string;
  evaluationCriteria: string[];
  supportLevel: string[];
  submissionMethod: string;
  attachments?: CallAttachment[];
  stages?: CallStage[];
  ideas?: Idea[];
  organizer: string;
  faQs: { id: number; question: string; answer: string }[];
  bannerImagePath?: string;
  bannerImage?: { 
    id: number;
    fileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
  };
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

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const ViewCall: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [call, setCall] = useState<Call | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (id) {
          const response = await axios.get(
            API_ENDPOINTS.INNOVATION.CALL(Number(id)),
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );
          setCall(response.data);

          // Fetch FAQs
          const faqsResponse = await axios.get(
            API_ENDPOINTS.INNOVATION.CALL_FAQS(Number(id)),
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );
          setFaqs(faqsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("خطا در دریافت اطلاعات", {
          position: "top-center",
          autoClose: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getExpertiseAreaText = (id: number) => {
    const areas = {
      1: "شیمی",
      2: "پلیمر",
      3: "برق",
      4: "بازاریابی",
      5: "نرم‌افزار",
      6: "سخت‌افزار",
    };
    return areas[id as keyof typeof areas] || "نامشخص";
  };

  const getEvaluationCriteriaText = (id: number) => {
    const criteria = {
      1: "نوآوری",
      2: "کاربردپذیری",
      3: "هزینه",
      4: "زمان اجرا",
      5: "کیفیت",
    };
    return criteria[id as keyof typeof criteria] || "نامشخص";
  };

  const getSupportLevelText = (id: number) => {
    const levels = {
      1: "مالی",
      2: "تجهیزات",
      3: "فضای کار",
      4: "شبکه‌سازی",
    };
    return levels[id as keyof typeof levels] || "نامشخص";
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="alert alert-danger">فراخوان مورد نظر یافت نشد</div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ fontFamily: "sans" }}>
      <div className="card">
        <div className="card-header border-0 pt-6 bg-secondary">
          <div className="card-title">
            <h2 className="fw-bold">مشاهده فراخوان</h2>
          </div>
          <div className="card-toolbar">
            {/* TODO: Uncomment when edit functionality is needed
            <button
              type="button"
              className="btn btn-primary me-3"
              onClick={() => navigate(`/call/${call.id}`)}
            >
              <KTIcon iconName="pencil" className="fs-2" />
              ویرایش فراخوان
            </button>
            */}
            <button
              type="button"
              className="btn btn-light"
              onClick={() => navigate("/innovations")}
            >
              <KTIcon iconName="arrow-right" className="fs-2" />
              بازگشت
            </button>
          </div>
        </div>

        <div className="card-body">
          {/* Banner Image */}
          <div className="position-relative">
            {call.bannerImage && (
              <img
                src={call.bannerImage.fileName}
                alt="Call Banner"
                className="img-fluid rounded-top w-100"
                style={{ height: "200px", objectFit: "cover" }}
              />
            )}
            <div className="position-absolute top-0 start-0 m-3">
              <span className="badge bg-primary px-3 py-2">
                {call.status}
              </span>
            </div>
          </div>

          <div className="card mb-7">
            <div className="card-body">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-7">
                <div className="d-flex flex-column">
                  <h3 className="fw-bold mb-2">{call.title}</h3>
                  <span className="text-muted fs-6">
                    کد فراخوان: {call.code}
                  </span>
                </div>
                <div className="d-flex gap-2 mt-3 mt-md-0">
                  <span
                    className={`badge badge-light-${
                      call.status === "Open" ? "success" : "danger"
                    } fs-7 fw-semibold px-3 py-2`}
                  >
                    {call.status === "Open" ? "باز" : "بسته"}
                  </span>
                  <span className="badge badge-light-info fs-7 fw-semibold px-3 py-2">
                    {call.submissionMethod === "FileUpload"
                      ? "بارگذاری فایل"
                      : call.submissionMethod === "OnlineForm"
                      ? "فرم آنلاین"
                      : "ایمیل"}
                  </span>
                </div>
              </div>

              <div className="separator separator-dashed my-5"></div>

              <div className="row mb-7">
                <div className="col-md-6">
                  <div className="d-flex flex-column">
                    <span className="text-muted fs-7 mb-1">تاریخ شروع</span>
                    <span className="text-dark fw-bold fs-6">
                      {new Date(call.startDate).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex flex-column">
                    <span className="text-muted fs-7 mb-1">تاریخ پایان</span>
                    <span className="text-dark fw-bold fs-6">
                      {new Date(call.endDate).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="separator separator-dashed my-5"></div>

              <div className="mb-7">
                <h4 className="fw-bold mb-3">توضیحات</h4>
                <div
                  className="text-gray-600 fs-6"
                  dangerouslySetInnerHTML={{ __html: call.description }}
                />
              </div>

              <div className="mb-7">
                <h4 className="fw-bold mb-3">شرح مسئله</h4>
                <div
                  className="text-gray-600 fs-6"
                  dangerouslySetInnerHTML={{ __html: call.problemDescription }}
                />
              </div>

              <div className="mb-7">
                <h4 className="fw-bold mb-3">اهداف مورد انتظار</h4>
                <div
                  className="text-gray-600 fs-6"
                  dangerouslySetInnerHTML={{ __html: call.expectedGoals }}
                />
              </div>

              <div className="separator separator-dashed my-5"></div>

              <div className="row mb-7">
                <div className="col-md-4">
                  <div className="d-flex flex-column">
                    <span className="text-muted fs-7 mb-2">حوزه‌های تخصصی</span>
                    <div className="d-flex flex-wrap gap-2">
                      {call.expertiseAreas.map((areaId, index) => (
                        <span
                          key={index}
                          className="badge badge-light-primary fs-7 px-3 py-2"
                        >
                          {getExpertiseAreaText(Number(areaId))}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex flex-column">
                    <span className="text-muted fs-7 mb-2">
                      معیارهای ارزیابی
                    </span>
                    <div className="d-flex flex-wrap gap-2">
                      {call.evaluationCriteria.map((criteriaId, index) => (
                        <span
                          key={index}
                          className="badge badge-light-info fs-7 px-3 py-2"
                        >
                          {getEvaluationCriteriaText(Number(criteriaId))}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex flex-column">
                    <span className="text-muted fs-7 mb-2">سطح پشتیبانی</span>
                    <div className="d-flex flex-wrap gap-2">
                      {call.supportLevel.map((levelId, index) => (
                        <span
                          key={index}
                          className="badge badge-light-success fs-7 px-3 py-2"
                        >
                          {getSupportLevelText(Number(levelId))}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="separator separator-dashed my-5"></div>

              <div className="mb-7">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="fw-bold mb-0">سوالات متداول</h4>
                  <span className="badge badge-light-primary fs-7 px-3 py-2">
                    {faqs.length} سوال
                  </span>
                </div>
                {faqs.length > 0 ? (
                  <div className="accordion" id="faqAccordion">
                    {faqs.map((item, index) => (
                      <div key={index} className="accordion-item mb-3">
                        <h2 className="accordion-header" id={`heading${index}`}>
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#faq${index}`}
                            aria-expanded="false"
                            aria-controls={`faq${index}`}
                          >
                            <span className="fw-bold fs-6">
                              {item.question}
                            </span>
                          </button>
                        </h2>
                        <div
                          id={`faq${index}`}
                          className="accordion-collapse collapse"
                          aria-labelledby={`heading${index}`}
                          data-bs-parent="#faqAccordion"
                        >
                          <div className="accordion-body">
                            <div
                              className="text-gray-600 fs-6"
                              dangerouslySetInnerHTML={{ __html: item.answer }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-light-primary">
                    <span className="fw-semibold">
                      هیچ سوال متداولی ثبت نشده است.
                    </span>
                  </div>
                )}
              </div>

              <div className="separator separator-dashed my-5"></div>

              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex flex-column">
                  <span className="text-muted fs-7 mb-1">برگزارکننده</span>
                  <span className="text-dark fw-bold fs-6">
                    {call.organizer}
                  </span>
                </div>
                <div className="d-flex flex-column align-items-end">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted fs-7 mb-1">تعداد ایده‌ها</span>
                    <span className="text-dark fw-bold fs-6">
                      {call.ideas?.length || 0}
                    </span>
                    {call.ideas && call.ideas.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-light-primary"
                        onClick={() => navigate(`/call-ideas/${call.id}`)}
                      >
                        <KTIcon iconName="eye" className="fs-2" />
                        مشاهده ایده‌ها
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="separator separator-dashed my-5"></div>

              <div className="mb-7">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="fw-bold mb-0">فایل‌های پیوست</h4>
                  <span className="badge badge-light-primary fs-7 px-3 py-2">
                    {call.attachments?.length || 0} فایل
                  </span>
                </div>
                {call.attachments && call.attachments.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table align-middle table-row-dashed fs-6 gy-5">
                      <thead>
                        <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                          <th className="text-center">نام فایل</th>
                          <th className="text-center">نوع فایل</th>
                          <th className="text-center">حجم</th>
                          <th className="text-center">عملیات</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 fw-semibold">
                        {call.attachments.map((attachment) => (
                          <tr key={attachment.id}>
                            <td className="text-center">
                              {attachment.fileName}
                            </td>
                            <td className="text-center">
                              {attachment.fileType}
                            </td>
                            <td className="text-center">
                              {(attachment.fileSize / 1024).toFixed(2)} KB
                            </td>
                            <td className="text-center">
                              <a
                                href={API_ENDPOINTS.INNOVATION.ATTACHMENTS.DOWNLOAD(attachment.id)}
                                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="دانلود فایل"
                              >
                                دانلود
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-light-primary">
                    <span className="fw-semibold">
                      هیچ فایل پیوستی ثبت نشده است.
                    </span>
                  </div>
                )}
              </div>

              <div className="separator separator-dashed my-5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCall;
