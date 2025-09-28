import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { KTCard, KTCardBody } from "../../../../_metronic/helpers";
import { getSubmissionById, getIdeaStages } from "../../auth/core/_requests";
import "react-progress-button/react-progress-button.css";

interface IdeaSubmissionDetailsPageProps {
  ideaId?: number;
  showTimeline?: boolean;
}

// مدل داده‌های واقعی دریافتی از API
interface IdeaData {
  id: number;
  title: string;
  description: string;
  callId: number;
  currentStageId: number;
  currentStageName: string;
  createdById: number;
  createdByUserName: string;
  accuracy: string;
  entryDate: string;
  status: number;
  move: boolean;
}

interface Stage {
  id: number;
  status: string;
  comment: string;
  createdAt: string;
}

const IdeaSubmissionDetailsPage: React.FC<IdeaSubmissionDetailsPageProps> = ({ ideaId, showTimeline }) => {
  const params = useParams<{ id: string }>();
  const ideaSubmissionId = ideaId ?? parseInt(params.id || "0", 10);

  const [ideaData, setIdeaData] = useState<IdeaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    const fetchIdeaDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getSubmissionById(ideaSubmissionId);
        console.log('Idea data received:', data);
        
        // اگر data آرایه است، اولین آیتم را بگیر
        if (Array.isArray(data) && data.length > 0) {
          setIdeaData(data[0]);
        } else if (data && typeof data === 'object') {
          setIdeaData(data);
        } else {
          setError("داده‌ای یافت نشد");
        }
      } catch (err) {
        console.error("Error fetching idea details:", err);
        setError("خطا در بارگذاری جزئیات ایده");
      } finally {
        setIsLoading(false);
      }
    };

    if (ideaSubmissionId) {
      fetchIdeaDetails();
    }
  }, [ideaSubmissionId]);

  useEffect(() => {
    if (showTimeline && ideaSubmissionId) {
      getIdeaStages(ideaSubmissionId)
        .then((stagesData) => {
          console.log('Stages data received:', stagesData);
          setStages(Array.isArray(stagesData) ? stagesData : []);
        })
        .catch((err) => {
          console.error("Error fetching stages:", err);
          setStages([]);
        });
    }
  }, [showTimeline, ideaSubmissionId]);

  // تابع برای دریافت آیکون مناسب بر اساس وضعیت
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return '✓';
      case 'Pending':
        return '⏳';
      case 'Rejected':
        return '✗';
      default:
        return '●';
    }
  };

  // تابع برای دریافت کلاس رنگ مناسب
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // تابع برای دریافت متن فارسی وضعیت
  const getStatusText = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'تایید شده';
      case 'Pending':
        return 'در انتظار بررسی';
      case 'Rejected':
        return 'رد شده';
      default:
        return status;
    }
  };

  return (
    <div dir="rtl" style={{ fontFamily: "sans" }}>
      <KTCard>
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold fs-3 mb-1">
              جزئیات ایده
            </span>
          </h3>
        </div>
        <KTCardBody className="py-4">
          {isLoading && <p>در حال بارگذاری جزئیات...</p>}
          {error && <div className="alert alert-danger">{error}</div>}
          
          {!isLoading && ideaData && (
            <div className="container-fluid">
              <div className="row mb-3">
                <div className="col-md-3">
                  <strong>شناسه:</strong>
                </div>
                <div className="col-md-9">
                  {ideaData.id}
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-3">
                  <strong>عنوان:</strong>
                </div>
                <div className="col-md-9">{ideaData.title}</div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-3">
                  <strong>توضیحات:</strong>
                </div>
                <div className="col-md-9" dangerouslySetInnerHTML={{ __html: ideaData.description }} />
              </div>
              
              <div className="row mb-3">
                <div className="col-md-3">
                  <strong>مرحله فعلی:</strong>
                </div>
                <div className="col-md-9">{ideaData.currentStageName}</div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-3">
                  <strong>ایجاد کننده:</strong>
                </div>
                <div className="col-md-9">{ideaData.createdByUserName}</div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-3">
                  <strong>تاریخ ثبت:</strong>
                </div>
                <div className="col-md-9">
                  {new Date(ideaData.entryDate).toLocaleDateString("fa-IR")}
                </div>
              </div>
            </div>
          )}
          
          {!isLoading && !error && !ideaData && (
            <div className="d-flex text-center w-100 align-content-center justify-content-center">
              جزئیات ایده یافت نشد
            </div>
          )}
          
          {/* نمایش تایم‌لاین حرفه‌ای مراحل */}
          {showTimeline && (
            <div className="mt-5">
              <div className="d-flex align-items-center mb-4">
                <div className="symbol symbol-40px me-3">
                  <div className="symbol-label bg-light-primary">
                    <i className="ki-duotone ki-clock fs-2 text-primary">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </div>
                </div>
                <div>
                  <h4 className="fw-bold mb-1">تایم‌لاین مراحل و کامنت‌های ادمین</h4>
                  <p className="text-muted mb-0">تاریخچه کامل بررسی ایده شما</p>
                </div>
              </div>
              
              {stages.length > 0 ? (
                <div className="position-relative">
                  {/* خط عمودی تایم‌لاین */}
                  <div className="position-absolute start-0 top-0 bottom-0" style={{ 
                    width: '2px', 
                    backgroundColor: '#e1e3ea', 
                    left: '20px',
                    zIndex: 1 
                  }}></div>
                  
                  {stages.map((stage, index) => (
                    <div key={stage.id} className="position-relative mb-4" style={{ paddingRight: '60px' }}>
                      {/* دایره تایم‌لاین */}
                      <div className="position-absolute" style={{ 
                        right: '15px', 
                        top: '0',
                        zIndex: 2,
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: `var(--kt-${getStatusColor(stage.status)})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        boxShadow: '0 0 0 4px white, 0 0 0 6px #e1e3ea'
                      }}>
                        {getStatusIcon(stage.status)}
                      </div>
                      
                      {/* محتوای مرحله */}
                      <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h6 className="fw-bold mb-1">مرحله {index + 1}</h6>
                              <span className={`badge badge-${getStatusColor(stage.status)} fs-7`}>
                                {getStatusText(stage.status)}
                              </span>
                            </div>
                            <div className="text-muted small">
                              <i className="ki-duotone ki-calendar fs-6 me-1">
                                <span className="path1"></span>
                                <span className="path2"></span>
                              </i>
                              {new Date(stage.createdAt).toLocaleDateString('fa-IR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          
                          {stage.comment && (
                            <div className="bg-light-primary rounded p-3 border-start border-4 border-primary">
                              <div className="d-flex align-items-start">
                                <i className="ki-duotone ki-message-text-2 fs-3 text-primary me-3 mt-1">
                                  <span className="path1"></span>
                                  <span className="path2"></span>
                                  <span className="path3"></span>
                                </i>
                                <div className="flex-grow-1">
                                  <h6 className="fw-bold mb-2 text-primary">کامنت ادمین:</h6>
                                  <div 
                                    className="mb-0" 
                                    style={{ lineHeight: '1.6' }}
                                    dangerouslySetInnerHTML={{ __html: stage.comment }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {!stage.comment && (
                            <div className="text-muted small">
                              <i className="ki-duotone ki-information-5 fs-6 me-1">
                                <span className="path1"></span>
                                <span className="path2"></span>
                              </i>
                              هیچ کامنتی برای این مرحله ثبت نشده است.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* مرحله فعلی (اگر در حال انتظار باشد) */}
                  {ideaData && ideaData.accuracy === 'Pending' && (
                    <div className="position-relative mb-4" style={{ paddingRight: '60px' }}>
                      <div className="position-absolute" style={{ 
                        right: '15px', 
                        top: '0',
                        zIndex: 2,
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#e1e3ea',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6c757d',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        boxShadow: '0 0 0 4px white, 0 0 0 6px #e1e3ea'
                      }}>
                        ⏳
                      </div>
                      
                      <div className="card border-0 shadow-sm" style={{ opacity: 0.7 }}>
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h6 className="fw-bold mb-1">مرحله بعدی</h6>
                              <span className="badge badge-secondary fs-7">
                                در انتظار بررسی
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-muted small">
                            <i className="ki-duotone ki-time fs-6 me-1">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                            ایده شما در صف بررسی قرار دارد و به زودی توسط تیم ارزیابی بررسی خواهد شد.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="symbol symbol-100px mb-4 mx-auto">
                    <div className="symbol-label bg-light-info">
                      <i className="ki-duotone ki-clock fs-2x text-info">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </div>
                  </div>
                  <h5 className="fw-bold mb-2">هنوز مرحله‌ای ثبت نشده</h5>
                  <p className="text-muted mb-0">
                    ایده شما هنوز در مرحله اولیه قرار دارد و به زودی مراحل بررسی آن آغاز خواهد شد.
                  </p>
                </div>
              )}
            </div>
          )}
        </KTCardBody>
      </KTCard>
    </div>
  );
};

export { IdeaSubmissionDetailsPage };