import { FC, useState, useEffect } from "react";
import { KTIcon } from "../../_metronic/helpers";
import axios from "axios";
import { getToken, decryptToJwt, PermissionEnums } from "../modules/auth/core/_requests";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { API_ENDPOINTS } from "../config/app";
import debounce from 'lodash/debounce';

interface Idea {
  id: number;
  title: string;
  description: string;
  status: string;
  currentStageId: number;
  currentStageName: string | null;
  callId: number;
  callTitle: string | null;
  createdById: number;
  createdByUserName: string | null;
}

interface IdeaAttachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  ideaId: number;
}

const IdeaManagement: FC = () => {
  const navigate = useNavigate();
  const { callId } = useParams();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkPermissions = () => {
      const data = decryptToJwt(getToken()?.toString()!);
      const hasPermission = data.Permissions.includes(PermissionEnums.GetAllInnovations);
      setHasAccess(hasPermission);
    };
    checkPermissions();
  }, []);

  const fetchIdeas = async (searchText: string = '') => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_ENDPOINTS.INNOVATION.CALLS}/${callId}/ideas`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
          }
        }
      );
      const formattedIdeas = Object.values(response.data).map((idea: any) => ({
        ...idea,
        createdBy: {
          id: idea.createdById,
          name: idea.createdByUserName || 'نامشخص'
        },
        call: {
          id: idea.callId,
          title: idea.callTitle || 'نامشخص',
          code: idea.callTitle || 'نامشخص'
        },
        currentStage: {
          name: idea.currentStageName || 'نامشخص'
        },
        attachments: []
      }));
      setIdeas(formattedIdeas);
    } catch (error) {
      console.error("Error fetching ideas:", error);
      toast.error("خطا در دریافت اطلاعات ایده‌ها", {
        position: "top-center",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debounce((query: string) => {
      setSearchLoading(true);
      fetchIdeas(query).finally(() => setSearchLoading(false));
    }, 500)(value);
  };

  const handleViewDetails = async (idea: Idea) => {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.INNOVATION.IDEAS}/${idea.id}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setSelectedIdea(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching idea details:", error);
      toast.error("خطا در دریافت جزئیات ایده", {
        position: "top-center",
        autoClose: 4000,
      });
    }
  };

  const handleApprove = async (idea: Idea) => {
    try {
      await axios.put(
        `${API_ENDPOINTS.INNOVATION.IDEAS}/${idea.id}`,
        {
          ...idea,
          status: "Approved"
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      toast.success("ایده با موفقیت تایید شد", {
        position: "top-center",
        autoClose: 3000,
      });
      fetchIdeas();
    } catch (error) {
      console.error("Error approving idea:", error);
      toast.error("خطا در تایید ایده", {
        position: "top-center",
        autoClose: 4000,
      });
    }
  };

  const handleReject = async (idea: Idea) => {
    try {
      await axios.put(
        `${API_ENDPOINTS.INNOVATION.IDEAS}/${idea.id}`,
        {
          ...idea,
          status: "Rejected"
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      toast.success("ایده با موفقیت رد شد", {
        position: "top-center",
        autoClose: 3000,
      });
      fetchIdeas();
    } catch (error) {
      console.error("Error rejecting idea:", error);
      toast.error("خطا در رد ایده", {
        position: "top-center",
        autoClose: 4000,
      });
    }
  };

  const handleDelete = async (idea: Idea) => {
    if (!window.confirm("آیا از حذف این ایده اطمینان دارید؟")) {
      return;
    }

    try {
      await axios.delete(
        `${API_ENDPOINTS.INNOVATION.IDEAS}/${idea.id}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      toast.success("ایده با موفقیت حذف شد", {
        position: "top-center",
        autoClose: 3000,
      });
      fetchIdeas();
    } catch (error) {
      console.error("Error deleting idea:", error);
      toast.error("خطا در حذف ایده", {
        position: "top-center",
        autoClose: 4000,
      });
    }
  };

  const DetailsModal = () => {
    if (!selectedIdea) return null;

    return (
      <>
        <div className="modal fade show d-block" tabIndex={-1} dir="rtl" style={{ zIndex: 1056 ,fontFamily: "sans"}}>
          <div className="modal-dialog modal-dialog-centered mw-650px">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="fw-bold">جزئیات ایده</h2>
                <div
                  className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                  onClick={() => setShowDetailsModal(false)}
                >
                  <KTIcon iconName="cross" className="fs-2x" />
                </div>
              </div>

              <div className="modal-body scroll-y mx-5 mx-xl-15 my-7">
                <div className="mb-7">
                  <h4 className="fw-bold mb-3">اطلاعات اصلی</h4>
                  <div className="mb-3">
                    <label className="form-label fw-bold">عنوان:</label>
                    <p>{selectedIdea.title}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">توضیحات:</label>
                    <div dangerouslySetInnerHTML={{ __html: selectedIdea.description }} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">وضعیت:</label>
                    <span className={`badge badge-light-${selectedIdea.status === "Approved" ? "success" : selectedIdea.status === "Rejected" ? "danger" : "warning"} fs-7 fw-semibold px-3 py-2`}>
                      {selectedIdea.status === "Approved" ? "تایید شده" : selectedIdea.status === "Rejected" ? "رد شده" : "در انتظار بررسی"}
                    </span>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ارسال کننده:</label>
                    <p>{selectedIdea.createdByUserName || 'نامشخص'}</p>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowDetailsModal(false)}
                >
                  بستن
                </button>
                {selectedIdea.status === "Pending" && (
                  <>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleApprove(selectedIdea)}
                    >
                      تایید ایده
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleReject(selectedIdea)}
                    >
                      رد ایده
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>
      </>
    );
  };

  return (
    <>
      <div dir="rtl" style={{ fontFamily: "sans" }}>
        <div className="card">
          <div className="card-header border-0 pt-6 bg-secondary">
            <div className="card-title">
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-3"
                  onClick={() => navigate(-1)}
                  title="بازگشت"
                >
                  <KTIcon iconName="arrow-right" className="fs-2" />
                </button>
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
                    <th className="min-w-125px">عنوان</th>
                    <th className="min-w-125px">ارسال کننده</th>
                    <th className="min-w-125px">وضعیت</th>
                    <th className="min-w-125px">مرحله فعلی</th>
                    <th className="min-w-100px">عملیات</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 fw-semibold">
                  {ideas.map((idea) => (
                    <tr key={idea.id}>
                      <td>
                        <div className="d-flex align-items-center justify-content-center">
                          <div className="d-flex flex-column">
                            <span className="text-dark fw-bold text-hover-primary mb-1 fs-6">
                              {idea.title}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column align-items-center">
                          <span className="text-dark fw-bold fs-6">
                            {idea.createdByUserName || 'نامشخص'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-light-${
                          idea.status === "Approved" ? "success" :
                          idea.status === "Rejected" ? "danger" :
                          "warning"
                        } fs-7 fw-semibold px-3 py-2`}>
                          {idea.status === "Approved" ? "تایید شده" :
                           idea.status === "Rejected" ? "رد شده" :
                           "در انتظار بررسی"}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-light-info fs-7 fw-semibold px-3 py-2">
                          {idea.currentStageName || "-"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                            onClick={() => handleViewDetails(idea)}
                            title="مشاهده جزئیات"
                          >
                            <KTIcon iconName="eye" className="fs-2" />
                          </button>
                          {idea.status === "Pending" && (
                            <>
                              <button
                                className="btn btn-icon btn-bg-light btn-active-color-success btn-sm me-1"
                                onClick={() => handleApprove(idea)}
                                title="تایید ایده"
                              >
                                <KTIcon iconName="check" className="fs-2" />
                              </button>
                              <button
                                className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                                onClick={() => handleReject(idea)}
                                title="رد ایده"
                              >
                                <KTIcon iconName="cross" className="fs-2" />
                              </button>
                            </>
                          )}
                          <button
                            className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                            onClick={() => handleDelete(idea)}
                            title="حذف ایده"
                          >
                            <KTIcon iconName="trash" className="fs-2" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showDetailsModal && <DetailsModal />}
    </>
  );
};

export default IdeaManagement;