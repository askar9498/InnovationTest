import { FC, useState, useEffect, useCallback, ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { KTIcon } from "../../_metronic/helpers";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  getToken,
  decryptToJwt,
  PermissionEnums,
  getCallStages,
  getIdeaStages,
  moveIdeaToNextStage,
  rejectIdea,
  getAllTags,
  getIdeaTags,
  addTagToIdea,
  removeTagFromIdea,
  updateIdea,
  createIdea,
  deleteCallStage,
  createTag,
} from "../modules/auth/core/_requests";
import Swal from "sweetalert2";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { API_ENDPOINTS } from "../config/app";
import { useDropzone } from "react-dropzone";
import DatePicker, {
  DayValue,
} from "@amir04lm26/react-modern-calendar-date-picker";
import "@amir04lm26/react-modern-calendar-date-picker/lib/DatePicker.css";
import moment from "moment-jalaali";
import { GetBaseUrl } from "../../config/api";

// تبدیل تاریخ به فرمت مناسب input[type=datetime-local]
const formatDateTime = (dateStr: string | undefined) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16);
};

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
  createdByUserName: ReactNode;
  entryDate: string | number | Date;
  id: number;
  title: string;
  description: string;
  status: number;
  currentStageId: number;
  currentStageName: string;
  callId: number;
  createdById: number;
  createdAt: string;
  accuracy: string;
  createdBy: {
    id: number;
    name: string;
  };
  attachments: any[];
  stages: any[];
  currentStage: CallStage;
  move: boolean;
}

interface IdeaStage {
  id: number;
  name: string;
  description: string;
  order: number;
  startDate?: string;
  endDate?: string;
  status: string;
  callId: number;
}

interface IdeaTag {
  id: number;
  name: string;
}

const showSuccessAlert = (title: string, text: string) => {
  Swal.fire({
    title: title,
    text: text,
    icon: "success",
    confirmButtonText: "باشه",
    confirmButtonColor: "#3699FF",
    customClass: {
      popup: "animated fadeInDown",
      title: "text-success",
      confirmButton: "btn btn-primary",
    },
  });
};

const showErrorAlert = (title: string, text: string) => {
  Swal.fire({
    title: title,
    text: text,
    icon: "error",
    confirmButtonText: "باشه",
    confirmButtonColor: "#F64E60",
    customClass: {
      popup: "animated fadeInDown",
      title: "text-danger",
      confirmButton: "btn btn-danger",
    },
  });
};

const showConfirmAlert = (title: string, text: string) => {
  return Swal.fire({
    title: title,
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "بله",
    cancelButtonText: "خیر",
    confirmButtonColor: "#3699FF",
    cancelButtonColor: "#F64E60",
    customClass: {
      popup: "animated fadeInDown",
      title: "text-warning",
      confirmButton: "btn btn-primary",
      cancelButton: "btn btn-danger",
    },
  });
};

interface FaqModalProps {
  show: boolean;
  onClose: () => void;
  faqFormData: { question: string; answer: string };
  setFaqFormData: React.Dispatch<
    React.SetStateAction<{ question: string; answer: string }>
  >;
  selectedFaq: { id: number; question: string; answer: string } | null;
  onSave: () => void;
}

const FaqModal: FC<FaqModalProps> = ({
  show,
  onClose,
  faqFormData,
  setFaqFormData,
  selectedFaq,
  onSave,
}) => {
  if (!show) return null;
  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      dir="rtl"
      style={{ zIndex: 1056, fontFamily: "sans" }}
    >
      <div className="modal-dialog modal-dialog-centered mw-650px">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="fw-bold">
              {selectedFaq ? "ویرایش سوال" : "افزودن سوال جدید"}
            </h2>
            <div
              className="btn btn-icon btn-sm btn-active-light-primary ms-2"
              onClick={onClose}
            >
              <KTIcon iconName="cross" className="fs-2x" />
            </div>
          </div>

          <div className="modal-body scroll-y mx-5 mx-xl-15 my-7">
            <div className="mb-7">
              <div className="mb-3">
                <label className="form-label required">سوال</label>
                <input
                  type="text"
                  className="form-control"
                  value={faqFormData.question}
                  onChange={(e) =>
                    setFaqFormData({ ...faqFormData, question: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label required">پاسخ</label>
                <CKEditor
                  editor={ClassicEditor}
                  data={faqFormData.answer}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setFaqFormData({ ...faqFormData, answer: data });
                  }}
                  config={{
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "outdent",
                      "indent",
                      "|",
                      "blockQuote",
                      "insertTable",
                      "undo",
                      "redo",
                    ],
                    language: "fa",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-light" onClick={onClose}>
              انصراف
            </button>
            <button type="button" className="btn btn-primary" onClick={onSave}>
              ذخیره
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StageModalProps {
  show: boolean;
  onClose: () => void;
  stageFormData: {
    name: string;
    description: string;
    order: number;
    startDate: string;
    endDate: string;
    status: string;
  };
  setStageFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      order: number;
      startDate: string;
      endDate: string;
      status: string;
    }>
  >;
  selectedStage: CallStage | null;
  onSave: () => void;
}

const StageModal: FC<StageModalProps> = ({
  show,
  onClose,
  stageFormData,
  setStageFormData,
  selectedStage,
  onSave,
}) => {
  const [stageStartDate, setStageStartDate] = useState<DayValue>(null);
  const [stageEndDate, setStageEndDate] = useState<DayValue>(null);

  useEffect(() => {
    if (show) {
      if (stageFormData.startDate) {
        const m = moment(stageFormData.startDate, "YYYY-MM-DD");
        setStageStartDate({
          year: m.jYear(),
          month: m.jMonth() + 1,
          day: m.jDate(),
        });
      } else {
        setStageStartDate(null);
      }
      if (stageFormData.endDate) {
        const m = moment(stageFormData.endDate, "YYYY-MM-DD");
        setStageEndDate({
          year: m.jYear(),
          month: m.jMonth() + 1,
          day: m.jDate(),
        });
      } else {
        setStageEndDate(null);
      }
    }
  }, [show, stageFormData.startDate, stageFormData.endDate]);

  if (!show) return null;
  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      dir="rtl"
      style={{ zIndex: 1056, fontFamily: "sans" }}
    >
      <div className="modal-dialog modal-dialog-centered mw-650px">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="fw-bold">
              {selectedStage ? "ویرایش مرحله" : "افزودن مرحله جدید"}
            </h2>
            <div
              className="btn btn-icon btn-sm btn-active-light-primary ms-2"
              onClick={onClose}
            >
              <KTIcon iconName="cross" className="fs-2x" />
            </div>
          </div>

          <div className="modal-body scroll-y mx-5 mx-xl-15 my-7">
            <div className="mb-7">
              <div className="mb-3">
                <label className="form-label required">نام مرحله</label>
                <input
                  type="text"
                  className="form-control"
                  value={stageFormData.name}
                  onChange={(e) =>
                    setStageFormData({ ...stageFormData, name: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label required">توضیحات</label>
                <CKEditor
                  editor={ClassicEditor}
                  data={stageFormData.description}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setStageFormData({ ...stageFormData, description: data });
                  }}
                  config={{
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "outdent",
                      "indent",
                      "|",
                      "blockQuote",
                      "insertTable",
                      "undo",
                      "redo",
                    ],
                    language: "fa",
                  }}
                />
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">تاریخ شروع</label>
                  <DatePicker
                    value={stageStartDate}
                    onChange={(date: DayValue) => {
                      setStageStartDate(date);
                      setStageFormData({
                        ...stageFormData,
                        startDate: date
                          ? moment(
                            `${date.year}/${date.month}/${date.day}`,
                            "jYYYY/jM/jD"
                          ).format("YYYY-MM-DD")
                          : "",
                      });
                    }}
                    locale="fa"
                    calendarClassName="persian-calendar"
                    colorPrimary="#3699FF"
                    shouldHighlightWeekends
                    inputPlaceholder="انتخاب تاریخ"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">تاریخ پایان</label>
                  <DatePicker
                    value={stageEndDate}
                    onChange={(date: DayValue) => {
                      setStageEndDate(date);
                      setStageFormData({
                        ...stageFormData,
                        endDate: date
                          ? moment(
                            `${date.year}/${date.month}/${date.day}`,
                            "jYYYY/jM/jD"
                          ).format("YYYY-MM-DD")
                          : "",
                      });
                    }}
                    locale="fa"
                    calendarClassName="persian-calendar"
                    colorPrimary="#3699FF"
                    shouldHighlightWeekends
                    inputPlaceholder="انتخاب تاریخ"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label required">وضعیت</label>
                <select
                  className="form-select"
                  value={stageFormData.status}
                  onChange={(e) =>
                    setStageFormData({
                      ...stageFormData,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="Active">فعال</option>
                  <option value="Inactive">غیرفعال</option>
                  <option value="Completed">تکمیل شده</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label required">ترتیب (Order)</label>
                <input
                  type="number"
                  className="form-control"
                  value={stageFormData.order}
                  min={1}
                  onChange={(e) =>
                    setStageFormData({
                      ...stageFormData,
                      order: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-light" onClick={onClose}>
              انصراف
            </button>
            <button type="button" className="btn btn-primary" onClick={onSave}>
              ذخیره
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MoveIdeaModalProps {
  show: boolean;
  onClose: () => void;
  ideaId: number;
  onSuccess: () => void;
}

const MoveIdeaModal: FC<MoveIdeaModalProps> = ({
  show,
  onClose,
  ideaId,
  onSuccess,
}) => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        GetBaseUrl() + `/api/IdeaStage/${ideaId}/move`,
        { comment },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        showSuccessAlert("موفق", "ایده با موفقیت به مرحله بعد منتقل شد");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error moving idea:", error);
      showErrorAlert("خطا", "خطا در انتقال به مرحله بعد");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      dir="rtl"
      style={{ fontFamily: "sans" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">انتقال به مرحله بعد</h5>
            <div
              className="btn btn-icon btn-sm btn-active-light-primary ms-2"
              onClick={onClose}
            >
              <KTIcon iconName="cross" className="fs-2x" />
            </div>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label required">نظر کارشناس</label>
              <CKEditor
                editor={ClassicEditor}
                data={comment}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setComment(data);
                }}
                config={{
                  toolbar: [
                    "heading",
                    "|",
                    "bold",
                    "italic",
                    "link",
                    "bulletedList",
                    "numberedList",
                    "|",
                    "outdent",
                    "indent",
                    "|",
                    "blockQuote",
                    "insertTable",
                    "undo",
                    "redo",
                  ],
                  language: "fa",
                }}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-light"
              onClick={onClose}
              disabled={loading}
            >
              انصراف
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="indicator-progress">
                  لطفا صبر کنید...{" "}
                  <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                </span>
              ) : (
                "تایید"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CallDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // فعال کردن ویرایش
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [hasSuperAccess, setHasSuperAccess] = useState(false);
  const [hasUpdateAccess, setHasUpdateAccess] = useState(false);
  const [faqs, setFaqs] = useState<
    { id: number; question: string; answer: string }[]
  >([]);
  const [selectedFaq, setSelectedFaq] = useState<{
    id: number;
    question: string;
    answer: string;
  } | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [faqFormData, setFaqFormData] = useState({ question: "", answer: "" });
  const [ideaFormData, setIdeaFormData] = useState({
    title: "",
    description: "",
    status: "Pending",
    currentStageId: 0,
  });
  const [ideaFiles, setIdeaFiles] = useState<File[]>([]);
  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<CallStage | null>(null);
  const [stageFormData, setStageFormData] = useState({
    name: "",
    description: "",
    order: 0,
    startDate: "",
    endDate: "",
    status: "Active",
  });
  const [ideaFilter, setIdeaFilter] = useState("all");
  const [ideaSearch, setIdeaSearch] = useState("");
  const [ideaStages, setIdeaStages] = useState<IdeaStage[]>([]);
  const [ideaTags, setIdeaTags] = useState<IdeaTag[]>([]);
  const [tags, setTags] = useState<IdeaTag[]>([]);
  const [selectedIdeaForStage, setSelectedIdeaForStage] = useState<Idea | null>(
    null
  );
  const [showIdeaStageModal, setShowIdeaStageModal] = useState(false);
  const [showIdeaRejectModal, setShowIdeaRejectModal] = useState(false);
  const [showIdeaTagModal, setShowIdeaTagModal] = useState(false);
  const [stageComment, setStageComment] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [callStages, setCallStages] = useState<CallStage[]>([]); // اضافه کردن state جدید
  const [stageFilter, setStageFilter] = useState("all");
  const [stageSearch, setStageSearch] = useState("");
  const [attachments, setAttachments] = useState<CallAttachment[]>([]);
  const [attachmentForm, setAttachmentForm] = useState<{
    file: File | null;
  }>({
    file: null,
  });
  const [showMoveIdeaModal, setShowMoveIdeaModal] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);

  useEffect(() => {
    const checkPermissions = () => {
      const data = decryptToJwt(getToken()?.toString()!);
      const isSuper =
        data.Permissions.includes(PermissionEnums.CreateInnovation) &&
        data.Permissions.includes(PermissionEnums.UpdateInnovation) &&
        data.Permissions.includes(PermissionEnums.DeleteInnovation);
      const hasUpdate = data.Permissions.includes(
        PermissionEnums.UpdateInnovation
      );
      setHasSuperAccess(isSuper);
      setHasUpdateAccess(hasUpdate);
    };
    checkPermissions();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (id) {
        const [callData, faqsData, ideasData] = await Promise.all([
          axios.get(API_ENDPOINTS.INNOVATION.CALL(Number(id)), {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }),
          axios.get(API_ENDPOINTS.INNOVATION.CALL_FAQS(Number(id)), {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }),
          axios.get(`${API_ENDPOINTS.INNOVATION.CALLS}/${id}/ideas`, {
            headers: {
              Authorization: `Bearer ${getToken()}`,
              "Content-Type": "application/json",
            },
          }),
        ]);
        let stagesData = { data: [] };
        try {
          stagesData = await axios.get(
            `${API_ENDPOINTS.INNOVATION.CALLS}/${id}/stages`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );
        } catch (error) {
          // خطا را نادیده بگیر و فقط مراحل را خالی بگذار
          stagesData = { data: [] };
        }
        
        // دریافت attachments در همان درخواست اصلی
        let attachmentsData = [];
        try {
          const attachmentsResponse = await axios.get(
            `${API_ENDPOINTS.INNOVATION.CALLS}/${id}/attachments`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );
          attachmentsData = attachmentsResponse.data;
        } catch (error) {
          console.error("Error fetching attachments:", error);
          attachmentsData = [];
        }
        
        setCall(callData.data);
        setFaqs(faqsData.data);
        setIdeas(ideasData.data);
        setCallStages(stagesData.data);
        setAttachments(attachmentsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showErrorAlert("خطا", "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]); // فقط id را به عنوان dependency قرار می‌دهیم

  const fetchCallStages = async (callId: number) => {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.INNOVATION.CALLS}/${callId}/stages`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      console.log("Call Stages API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching call stages:", error);
      showErrorAlert("خطا", "خطا در دریافت مراحل فراخوان");
      return [];
    }
  };

  const fetchIdeaDetails = async (ideaId: number) => {
    try {
      const [stages, tags] = await Promise.all([
        getIdeaStages(ideaId),
        getIdeaTags(ideaId),
      ]);
      setIdeaStages(stages);
      setIdeaTags(tags);
    } catch (error) {
      console.error("Error fetching idea details:", error);
      showErrorAlert("خطا", "خطا در دریافت جزئیات ایده");
    }
  };

  const handleMoveIdea = (ideaId: number) => {
    setSelectedIdeaId(ideaId);
    setShowMoveIdeaModal(true);
  };

  const handleRejectIdea = async () => {
    if (!selectedIdeaForStage) return;

    try {
      await rejectIdea(
        selectedIdeaForStage.id,
        selectedIdeaForStage.currentStageId,
        stageComment
      );
      showSuccessAlert("موفق", "ایده با موفقیت رد شد");
      setShowIdeaRejectModal(false);
      setStageComment("");
      fetchIdeaDetails(selectedIdeaForStage.id);
    } catch (error) {
      console.error("Error rejecting idea:", error);
      showErrorAlert("خطا", "خطا در رد ایده");
    }
  };

  const handleAddIdeaTag = async (tagId: number) => {
    if (!selectedIdeaForStage) return;

    try {
      await addTagToIdea(selectedIdeaForStage.id, tagId);
      showSuccessAlert("موفق", "برچسب با موفقیت اضافه شد");
      fetchIdeaDetails(selectedIdeaForStage.id);
    } catch (error) {
      console.error("Error adding tag:", error);
      showErrorAlert("خطا", "خطا در افزودن برچسب");
    }
  };

  const handleRemoveIdeaTag = async (tagId: number) => {
    if (!selectedIdeaForStage) return;

    try {
      await removeTagFromIdea(selectedIdeaForStage.id, tagId);
      showSuccessAlert("موفق", "برچسب با موفقیت حذف شد");
      fetchIdeaDetails(selectedIdeaForStage.id);
    } catch (error) {
      console.error("Error removing tag:", error);
      showErrorAlert("خطا", "خطا در حذف برچسب");
    }
  };
  interface CreateCallAttachmentDto {
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    callId: number;
  }
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
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);

  const handleAttachmentFormChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentForm({ file: e.target.files[0] });
    }
  };
  const handleAttachmentFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentForm.file) {
      showErrorAlert("خطا", "لطفا یک فایل انتخاب کنید");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", attachmentForm.file);

      const response = await axios.post(
        `${API_ENDPOINTS.INNOVATION.CALLS}/${id}/attachments`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAttachments([...attachments, response.data]);
      setAttachmentForm({ file: null });
      setShowAttachmentModal(false);
      showSuccessAlert("موفق", "فایل با موفقیت آپلود شد");

      // آپدیت لیست فایل‌ها
      await fetchData();
    } catch (error) {
      console.error("Error adding call attachment:", error);
      showErrorAlert("خطا", "خطا در آپلود فایل");
    }
  };

  const formik = useFormik({
    initialValues: {
      title: call?.title || "",
      code: call?.code || "",
      description: call?.description || "",
      startDate: call?.startDate,
      endDate: call?.endDate,
      status: call?.status || "Open",
      problemDescription: call?.problemDescription || "",
      expectedGoals: call?.expectedGoals || "",
      submissionMethod: call?.submissionMethod || "FileUpload",
      organizer: call?.organizer || "",
      expertiseAreas: Array.isArray(call?.expertiseAreas)
        ? call.expertiseAreas.map(Number)
        : [],
      evaluationCriteria: Array.isArray(call?.evaluationCriteria)
        ? call.evaluationCriteria.map(Number)
        : [],
      supportLevel: Array.isArray(call?.supportLevel)
        ? call.supportLevel.map(Number)
        : [],
    },
    validationSchema: Yup.object({
      title: Yup.string().required("عنوان فراخوان الزامی است"),
      code: Yup.string().required("کد فراخوان الزامی است"),
      description: Yup.string().required("توضیحات فراخوان الزامی است"),
      startDate: Yup.date().required("تاریخ شروع الزامی است"),
      endDate: Yup.date()
        .required("تاریخ پایان الزامی است")
        .min(Yup.ref('startDate'), 'تاریخ پایان باید بعد از تاریخ شروع باشد'),
      status: Yup.string().required("وضعیت الزامی است"),
      problemDescription: Yup.string().required("توضیحات مشکل الزامی است"),
      expectedGoals: Yup.string().required("اهداف مورد انتظار الزامی است"),
      submissionMethod: Yup.string().required("نحوه ارسال الزامی است"),
      organizer: Yup.string().required("برگزار کننده الزامی است"),
      expertiseAreas: Yup.array()
        .of(Yup.number())
        .min(1, "حداقل یک حوزه تخصصی انتخاب کنید")
        .required("حوزه‌های تخصصی الزامی است"),
      evaluationCriteria: Yup.array()
        .of(Yup.number())
        .min(1, "حداقل یک معیار ارزیابی انتخاب کنید")
        .required("معیارهای ارزیابی الزامی است"),
      supportLevel: Yup.array()
        .of(Yup.number())
        .min(1, "حداقل یک سطح پشتیبانی انتخاب کنید")
        .required("سطح پشتیبانی الزامی است"),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append('Id', id || '');
        formData.append('Title', values.title);
        formData.append('Code', values.code);
        formData.append('Description', values.description);
        formData.append('StartDate', values.startDate || '');
        formData.append('EndDate', values.endDate || '');
        formData.append('Status', values.status);
        formData.append('ProblemDescription', values.problemDescription);
        formData.append('ExpectedGoals', values.expectedGoals);
        formData.append('SubmissionMethod', values.submissionMethod);
        formData.append('Organizer', values.organizer);

        // اضافه کردن آرایه‌ها
        values.expertiseAreas.forEach(area => {
          formData.append('ExpertiseAreas', area.toString());
        });
        values.evaluationCriteria.forEach(criteria => {
          formData.append('EvaluationCriteria', criteria.toString());
        });
        values.supportLevel.forEach(level => {
          formData.append('SupportLevel', level.toString());
        });

        await axios.put(API_ENDPOINTS.INNOVATION.CALL(Number(id)), formData, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        });
        showSuccessAlert("موفق", "فراخوان با موفقیت بروزرسانی شد");
        setIsEditing(false);
        fetchData();
      } catch (error) {
        console.error("Error updating call:", error);
        showErrorAlert("خطا", "خطا در بروزرسانی فراخوان");
      }
    },
  });

  const handleAddFaq = () => {
    setSelectedFaq(null);
    setFaqFormData({ question: "", answer: "" });
    setShowFaqModal(true);
  };

  const handleEditFaq = (faq: {
    id: number;
    question: string;
    answer: string;
  }) => {
    setSelectedFaq(faq);
    setFaqFormData({ question: faq.question, answer: faq.answer });
    setShowFaqModal(true);
    fetchData();
  };

  const handleDeleteFaq = async (faqId: number) => {
    const result = await showConfirmAlert(
      "حذف سوال",
      "آیا از حذف این سوال اطمینان دارید؟"
    );
    if (result.isConfirmed) {
      try {
        await axios.delete(API_ENDPOINTS.INNOVATION.FAQS.DELETE(faqId), {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        showSuccessAlert("موفق", "سوال با موفقیت حذف شد");
        fetchData();
        //fetchIdeaDetails(selectedIdea?.id || 0);
      } catch (error) {
        console.error("Error deleting FAQ:", error);
        showErrorAlert("خطا", "خطا در حذف سوال");
      }
    }
  };

  const handleSaveFaq = async () => {
    try {
      if (selectedFaq) {
        await axios.put(
          API_ENDPOINTS.INNOVATION.FAQS.DELETE(selectedFaq.id),
          faqFormData,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
              "Content-Type": "application/json",
            },
          }
        );
        showSuccessAlert("موفق", "سوال با موفقیت ویرایش شد");
        fetchData();
      } else {
        await axios.post(
          API_ENDPOINTS.INNOVATION.CALL_FAQS(Number(id)),
          faqFormData,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
              "Content-Type": "application/json",
            },
          }
        );
        showSuccessAlert("موفق", "سوال با موفقیت اضافه شد");
        fetchData();
      }
      setShowFaqModal(false);
    } catch (error) {
      console.error("Error saving FAQ:", error);
      showErrorAlert("خطا", "خطا در ذخیره سوال");
    }
  };

  const handleAddIdea = () => {
    setSelectedIdea(null);
    setIdeaFormData({
      title: "",
      description: "",
      status: "Pending",
      currentStageId: call?.stages?.[0]?.id || 0,
    });
    setIdeaFiles([]);
    setShowIdeaModal(true);
  };

  const handleEditIdea = (idea: Idea) => {
    setSelectedIdea(idea);
    setIdeaFormData({
      title: idea.title,
      description: idea.description,
      status: idea.status.toString(),
      currentStageId: idea.currentStageId,
    });
    setShowIdeaModal(true);
  };

  const handleDeleteIdea = async (ideaId: number) => {
    const result = await showConfirmAlert(
      "حذف ایده",
      "آیا از حذف این ایده اطمینان دارید؟"
    );
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_ENDPOINTS.INNOVATION.IDEAS}/${ideaId}`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        showSuccessAlert("موفق", "ایده با موفقیت حذف شد");
        fetchData();
      } catch (error) {
        console.error("Error deleting idea:", error);
        showErrorAlert("خطا", "خطا در حذف ایده");
      }
    }
  };

  const handleSaveIdea = async () => {
    try {
      setLoading(true);
      const ideaData = {
        ...ideaFormData,
        callId: id,
        files: ideaFiles,
      };

      if (selectedIdea) {
        // ویرایش ایده موجود
        await updateIdea(selectedIdea.id, ideaData);
        showSuccessAlert("موفق", "ایده با موفقیت ویرایش شد");
      } else {
        // ایجاد ایده جدید
        await createIdea(ideaData);
        showSuccessAlert("موفق", "ایده با موفقیت ایجاد شد");
      }
      setShowIdeaModal(false);
      fetchData();
    } catch (error) {
      console.error("Error saving idea:", error);
      showErrorAlert("خطا", "خطا در ذخیره ایده");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStage = () => {
    setSelectedStage(null);
    setStageFormData({
      name: "",
      description: "",
      order: call?.stages?.length || 0,
      startDate: "",
      endDate: "",
      status: "Active",
    });
    setShowStageModal(true);
  };

  const handleEditStage = (stage: CallStage) => {
    setSelectedStage(stage);
    setStageFormData({
      name: stage.name,
      description: stage.description,
      order: stage.order,
      startDate: stage.startDate
        ? new Date(stage.startDate).toISOString().split("T")[0]
        : "",
      endDate: stage.endDate
        ? new Date(stage.endDate).toISOString().split("T")[0]
        : "",
      status: stage.status,
    });
    setShowStageModal(true);
  };

  const handleDeleteStage = async (stageId: number) => {
    const result = await showConfirmAlert(
      "حذف مرحله",
      "آیا از حذف این مرحله اطمینان دارید؟"
    );
    if (result.isConfirmed) {
      try {
        await deleteCallStage(Number(id), stageId);
        showSuccessAlert("موفق", "مرحله با موفقیت حذف شد");
        fetchData();
      } catch (error) {
        console.error("Error deleting stage:", error);
        showErrorAlert("خطا", "خطا در حذف مرحله");
      }
    }
  };

  const handleSaveStage = async () => {
    try {
      if (selectedStage) {
        await axios.put(
          `${API_ENDPOINTS.INNOVATION.STAGES(Number(id))}/${selectedStage.id}`,
          {
            ...stageFormData,
            callId: Number(id),
          },
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
              "Content-Type": "application/json",
            },
          }
        );
        showSuccessAlert("موفق", "مرحله با موفقیت ویرایش شد");
        fetchData();
      } else {
        await axios.post(
          API_ENDPOINTS.INNOVATION.STAGES(Number(id)),
          {
            ...stageFormData,
            callId: Number(id),
          },
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
              "Content-Type": "application/json",
            },
          }
        );
        showSuccessAlert("موفق", "مرحله با موفقیت اضافه شد");
        fetchData();
      }
      setShowStageModal(false);
    } catch (error) {
      console.error("Error saving stage:", error);
      showErrorAlert("خطا", "خطا در ذخیره مرحله");
    }
  };

  const fetchCallAttachments = async (callId: number) => {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.INNOVATION.CALLS}/${callId}/attachments`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setAttachments(response.data);
    } catch (error) {
      console.error("Error fetching call attachments:", error);
    }
  };

  const handleAddAttachment = async (attachment: CreateCallAttachmentDto) => {
    try {
      const response = await axios.post(
        `${API_ENDPOINTS.INNOVATION.CALLS}/${id}/attachments`,
        attachment,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setAttachments([...attachments, response.data]);
    } catch (error) {
      console.error("Error adding call attachment:", error);
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    try {
      await axios.delete(
        API_ENDPOINTS.INNOVATION.ATTACHMENTS.DELETE(attachmentId),
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      // به‌روزرسانی لیست فایل‌ها
      await fetchData();
      showSuccessAlert(
        "موفق",
        "فایل با موفقیت حذف شد"
      );
    } catch (error) {
      console.error("Error deleting call attachment:", error);
      showErrorAlert("خطا", "خطا در حذف فایل");
    }
  };

  useEffect(() => {
    if (id) {
      fetchCallAttachments(Number(id));
    }
  }, [id]);

  const getFileIcon = (fileType: string): string => {
    if (fileType.includes("image")) return "image";
    if (fileType.includes("pdf")) return "document";
    if (fileType.includes("word")) return "document";
    if (fileType.includes("excel") || fileType.includes("sheet"))
      return "document";
    if (fileType.includes("zip") || fileType.includes("rar")) return "archive";
    return "document";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 16);
  };

  const IdeaModal: FC = () => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
      setIdeaFiles((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
        "application/msword": [".doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
        "image/*": [".png", ".jpg", ".jpeg"],
      },
      maxSize: 10485760, // 10MB
    });

    const removeFile = (index: number) => {
      setIdeaFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        dir="rtl"
        style={{ zIndex: 1056, fontFamily: "sans" }}
      >
        <div className="modal-dialog modal-dialog-centered mw-850px">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="fw-bold">
                {selectedIdea ? "ویرایش ایده" : "افزودن ایده جدید"}
              </h2>
              <div
                className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                onClick={() => setShowIdeaModal(false)}
              >
                <KTIcon iconName="cross" className="fs-2x" />
              </div>
            </div>

            <div className="modal-body scroll-y mx-5 mx-xl-15 my-7">
              <div className="row">
                <div className="col-md-8">
                  <div className="mb-7">
                    <div className="mb-3">
                      <label className="form-label required">عنوان ایده</label>
                      <input
                        type="text"
                        className="form-control"
                        value={ideaFormData.title}
                        onChange={(e) =>
                          setIdeaFormData({
                            ...ideaFormData,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label required">
                        توضیحات ایده
                      </label>
                      <CKEditor
                        editor={ClassicEditor}
                        data={ideaFormData.description}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setIdeaFormData({
                            ...ideaFormData,
                            description: data,
                          });
                        }}
                        config={{
                          toolbar: [
                            "heading",
                            "|",
                            "bold",
                            "italic",
                            "link",
                            "bulletedList",
                            "numberedList",
                            "|",
                            "outdent",
                            "indent",
                            "|",
                            "blockQuote",
                            "insertTable",
                            "undo",
                            "redo",
                          ],
                          language: "fa",
                        }}
                      />
                    </div>

                    {hasSuperAccess && (
                      <div className="mb-3">
                        <label className="form-label required">وضعیت</label>
                        <select
                          className="form-select"
                          value={ideaFormData.status}
                          onChange={(e) =>
                            setIdeaFormData({
                              ...ideaFormData,
                              status: e.target.value,
                            })
                          }
                        >
                          <option value="Pending">در انتظار بررسی</option>
                          <option value="Approved">تایید شده</option>
                          <option value="Rejected">رد شده</option>
                        </select>
                      </div>
                    )}

                    {hasSuperAccess &&
                      call?.stages &&
                      call.stages.length > 0 && (
                        <div className="mb-3">
                          <label className="form-label required">
                            مرحله فعلی
                          </label>
                          <select
                            className="form-select"
                            value={ideaFormData.currentStageId}
                            onChange={(e) =>
                              setIdeaFormData({
                                ...ideaFormData,
                                currentStageId: Number(e.target.value),
                              })
                            }
                          >
                            {call.stages.map((stage) => (
                              <option key={stage.id} value={stage.id}>
                                {stage.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowIdeaModal(false)}
              >
                انصراف
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveIdea}
              >
                ذخیره
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const IdeaStageModal: FC = () => {
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!selectedIdeaForStage) return;

      try {
        setLoading(true);
        const response = await axios.post(
          GetBaseUrl() + `/api/IdeaStage/${selectedIdeaForStage.id}/move`,
          { comment },
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          showSuccessAlert("موفق", "ایده با موفقیت به مرحله بعد منتقل شد");
          setShowIdeaStageModal(false);
          setComment("");
          fetchIdeaDetails(selectedIdeaForStage.id);
          fetchData();
        }
      } catch (error) {
        console.error("Error moving idea:", error);
        showErrorAlert("خطا", "خطا در انتقال به مرحله بعد");
      } finally {
        setLoading(false);
      }
    };

    const handleClose = (e: React.MouseEvent) => {
      e.preventDefault();
      setShowIdeaStageModal(false);
    };

    return (
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        dir="rtl"
        style={{ zIndex: 1056, fontFamily: "sans" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">انتقال به مرحله بعد</h5>
              <div
                className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                onClick={handleClose}
              >
                <KTIcon iconName="cross" className="fs-2x" />
              </div>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label required">نظر کارشناس</label>
                <CKEditor
                  editor={ClassicEditor}
                  data={comment}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setComment(data);
                  }}
                  config={{
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "outdent",
                      "indent",
                      "|",
                      "blockQuote",
                      "insertTable",
                      "undo",
                      "redo",
                    ],
                    language: "fa",
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={handleClose}
                disabled={loading}
              >
                انصراف
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className="indicator-progress">
                    لطفا صبر کنید...{" "}
                    <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </span>
                ) : (
                  "تایید"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const IdeaRejectModal: FC = () => {
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!selectedIdeaForStage) return;

      try {
        setLoading(true);
        const response = await axios.post(
          GetBaseUrl() + `/api/IdeaStage/${selectedIdeaForStage.id}/reject`,
          { comment },
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          showSuccessAlert("موفق", "ایده با موفقیت رد شد");
          setShowIdeaRejectModal(false);
          setComment("");
          fetchIdeaDetails(selectedIdeaForStage.id);
          fetchData();
        }
      } catch (error) {
        console.error("Error rejecting idea:", error);
        showErrorAlert("خطا", "خطا در رد ایده");
      } finally {
        setLoading(false);
      }
    };

    const handleClose = (e: React.MouseEvent) => {
      e.preventDefault();
      setShowIdeaRejectModal(false);
    };

    return (
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        dir="rtl"
        style={{ zIndex: 1056 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">رد ایده</h5>
              <div
                className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                onClick={handleClose}
              >
                <KTIcon iconName="cross" className="fs-2x" />
              </div>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label required">دلیل رد</label>
                <CKEditor
                  editor={ClassicEditor}
                  data={comment}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setComment(data);
                  }}
                  config={{
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "outdent",
                      "indent",
                      "|",
                      "blockQuote",
                      "insertTable",
                      "undo",
                      "redo",
                    ],
                    language: "fa",
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={handleClose}
                disabled={loading}
              >
                انصراف
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className="indicator-progress">
                    لطفا صبر کنید...{" "}
                    <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </span>
                ) : (
                  "رد ایده"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const IdeaTagModal: FC = () => {
    const [tagInput, setTagInput] = useState("");
    const [availableTags, setAvailableTags] = useState<IdeaTag[]>([]);
    const [loading, setLoading] = useState(false);
    const [tagsLoaded, setTagsLoaded] = useState(false);

    useEffect(() => {
      const fetchAvailableTags = async () => {
        if (tagsLoaded) return; // جلوگیری از درخواست‌های تکراری
        
        try {
          setLoading(true);
          const tags = await getAllTags();
          setAvailableTags(tags);
          setTagsLoaded(true);
        } catch (error) {
          console.error("Error fetching available tags:", error);
          showErrorAlert("خطا", "خطا در دریافت برچسب‌های موجود");
        } finally {
          setLoading(false);
        }
      };

      if (showIdeaTagModal && selectedIdeaForStage && !tagsLoaded) {
        fetchAvailableTags();
      }
    }, [showIdeaTagModal, selectedIdeaForStage, tagsLoaded]);

    // Reset tags loaded state when modal closes
    useEffect(() => {
      if (!showIdeaTagModal) {
        setTagsLoaded(false);
      }
    }, [showIdeaTagModal]);

    const handleAddTag = async () => {
      if (!tagInput.trim()) {
        showErrorAlert("خطا", "نام برچسب نمی‌تواند خالی باشد");
        return;
      }

      if (!selectedIdeaForStage) return;

      try {
        setLoading(true);
        
        // بررسی اینکه آیا برچسب قبلاً وجود دارد
        const existingTag = availableTags.find(tag => 
          tag.name.toLowerCase() === tagInput.trim().toLowerCase()
        );

        let tagId: number;

        if (existingTag) {
          // استفاده از برچسب موجود
          tagId = existingTag.id;
        } else {
          // ایجاد برچسب جدید
          const newTag = await createTag({
            name: tagInput.trim(),
            description: `برچسب ${tagInput.trim()}`
          });
          tagId = newTag.id;
          setAvailableTags([...availableTags, newTag]);
        }

        // اضافه کردن برچسب به ایده
        await addTagToIdea(selectedIdeaForStage.id, tagId);
        
        // به‌روزرسانی برچسب‌های ایده
        await fetchIdeaDetails(selectedIdeaForStage.id);
        
        setTagInput("");
        showSuccessAlert("موفق", "برچسب با موفقیت اضافه شد");
      } catch (error) {
        console.error("Error adding tag:", error);
        showErrorAlert("خطا", "خطا در افزودن برچسب");
      } finally {
        setLoading(false);
      }
    };

    const handleRemoveTag = async (tagId: number) => {
      if (!selectedIdeaForStage) return;

      try {
        setLoading(true);
        await removeTagFromIdea(selectedIdeaForStage.id, tagId);
        await fetchIdeaDetails(selectedIdeaForStage.id);
        showSuccessAlert("موفق", "برچسب با موفقیت حذف شد");
      } catch (error) {
        console.error("Error removing tag:", error);
        showErrorAlert("خطا", "خطا در حذف برچسب");
      } finally {
        setLoading(false);
      }
    };

    const handleAddExistingTag = async (tagId: number) => {
      if (!selectedIdeaForStage) return;

      try {
        setLoading(true);
        await addTagToIdea(selectedIdeaForStage.id, tagId);
        await fetchIdeaDetails(selectedIdeaForStage.id);
        showSuccessAlert("موفق", "برچسب با موفقیت اضافه شد");
      } catch (error) {
        console.error("Error adding existing tag:", error);
        showErrorAlert("خطا", "خطا در افزودن برچسب");
      } finally {
        setLoading(false);
      }
    };

    if (!showIdeaTagModal) return null;

    return (
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        dir="rtl"
        style={{ zIndex: 1056, fontFamily: "sans" }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">مدیریت برچسب‌ها</h5>
              <div
                className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                onClick={() => setShowIdeaTagModal(false)}
              >
                <KTIcon iconName="cross" className="fs-2x" />
              </div>
            </div>
            <div className="modal-body">
              {/* افزودن برچسب جدید */}
              <div className="mb-5">
                <label className="form-label">افزودن برچسب جدید</label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="نام برچسب جدید"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddTag}
                    disabled={loading || !tagInput.trim()}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" />
                    ) : (
                      <KTIcon iconName="plus" className="fs-2 me-2" />
                    )}
                    افزودن
                  </button>
                </div>
              </div>

              {/* برچسب‌های موجود ایده */}
              <div className="mb-5">
                <label className="form-label">برچسب‌های فعلی ایده</label>
                <div className="d-flex flex-wrap gap-2">
                  {ideaTags.length > 0 ? (
                    ideaTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="badge badge-light-primary fs-7 fw-semibold px-3 py-2"
                      >
                        {tag.name}
                        <button
                          type="button"
                          className="btn btn-icon btn-sm btn-active-light-danger ms-2"
                          onClick={() => handleRemoveTag(tag.id)}
                          disabled={loading}
                        >
                          <KTIcon iconName="cross" className="fs-2" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-muted">هیچ برچسبی اضافه نشده است</span>
                  )}
                </div>
              </div>

              {/* برچسب‌های موجود در سیستم */}
              <div className="mb-5">
                <label className="form-label">برچسب‌های موجود در سیستم</label>
                <div className="d-flex flex-wrap gap-2">
                  {availableTags.length > 0 ? (
                    availableTags.map((tag) => {
                      const isAlreadyAdded = ideaTags.some(ideaTag => ideaTag.id === tag.id);
                      return (
                        <span
                          key={tag.id}
                          className={`badge fs-7 fw-semibold px-3 py-2 ${
                            isAlreadyAdded 
                              ? 'badge-light-success' 
                              : 'badge-light-info'
                          }`}
                        >
                          {tag.name}
                          {!isAlreadyAdded && (
                            <button
                              type="button"
                              className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                              onClick={() => handleAddExistingTag(tag.id)}
                              disabled={loading}
                            >
                              <KTIcon iconName="plus" className="fs-2" />
                            </button>
                          )}
                          {isAlreadyAdded && (
                            <span className="ms-2">
                              <KTIcon iconName="check" className="fs-2" />
                            </span>
                          )}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-muted">هیچ برچسبی در سیستم موجود نیست</span>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowIdeaTagModal(false)}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
      <div className="alert alert-danger m-5">فراخوان مورد نظر یافت نشد</div>
    );
  }

  return (
    <>
      <div className="card" dir="rtl" style={{ fontFamily: "sans" }}>
        <div className="card-header border-0 pt-6">
          <div className="card-title">
            <h2 className="fw-bold">جزئیات فراخوان</h2>
          </div>
          <div className="card-toolbar">
            <div className="d-flex gap-2">
              {hasSuperAccess && (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <KTIcon
                      iconName={isEditing ? "cross" : "pencil"}
                      className="fs-2"
                    />
                    {isEditing ? "انصراف" : "ویرایش"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-info"
                    onClick={() => setShowFaqModal(true)}
                  >
                    <KTIcon iconName="question" className="fs-2" />
                    افزودن سوالات متداول
                  </button>
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={() => setShowIdeaModal(true)}
                  >
                    <KTIcon iconName="message-text-2" className="fs-2" />
                    افزودن ایده‌ها
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => setShowStageModal(true)}
                  >
                    <KTIcon iconName="abstract-26" className="fs-2" />
                    افزودن مراحل
                  </button>
                </>
              )}
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
        </div>

        <div className="card-body">
          <form onSubmit={formik.handleSubmit}>
            <div className="card mb-7">
              <div className="card-body">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-7">
                  {isEditing ? (
                    <div className="d-flex flex-column w-100">
                      <div className="mb-5">
                        <label className="form-label required">
                          عنوان فراخوان
                        </label>
                        <input
                          type="text"
                          className={`form-control ${formik.touched.title && formik.errors.title
                              ? "is-invalid"
                              : ""
                            }`}
                          {...formik.getFieldProps("title")}
                        />
                        {formik.touched.title && formik.errors.title && (
                          <div className="invalid-feedback">
                            {formik.errors.title}
                          </div>
                        )}
                      </div>
                      <div className="mb-5">
                        <label className="form-label required">
                          کد فراخوان
                        </label>
                        <input
                          type="text"
                          className={`form-control ${formik.touched.code && formik.errors.code
                              ? "is-invalid"
                              : ""
                            }`}
                          {...formik.getFieldProps("code")}
                        />
                        {formik.touched.code && formik.errors.code && (
                          <div className="invalid-feedback">
                            {formik.errors.code}
                          </div>
                        )}
                      </div>
                      <div className="d-flex gap-2">
                        <select
                          className={`form-select ${formik.touched.status && formik.errors.status
                              ? "is-invalid"
                              : ""
                            }`}
                          {...formik.getFieldProps("status")}
                        >
                          <option value="Open">باز</option>
                          <option value="Closed">بسته</option>
                        </select>
                        <select
                          className={`form-select ${formik.touched.submissionMethod &&
                              formik.errors.submissionMethod
                              ? "is-invalid"
                              : ""
                            }`}
                          {...formik.getFieldProps("submissionMethod")}
                        >
                          <option value="FileUpload">بارگذاری فایل</option>
                          <option value="OnlineForm">فرم آنلاین</option>
                          <option value="Email">ایمیل</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex flex-column">
                        <h3 className="fw-bold mb-2">{call.title}</h3>
                        <span className="text-muted fs-6">
                          کد فراخوان: {call.code}
                        </span>
                      </div>
                      <div className="d-flex gap-2 mt-3 mt-md-0">
                        <span
                          className={`badge badge-light-${call.status === "Open" ? "success" : "danger"
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
                    </>
                  )}
                </div>

                {!isEditing && (
                  <>
                    <div className="separator separator-dashed my-5"></div>
                    <div className="row mb-7">
                      <div className="col-md-6">
                        <div className="d-flex flex-column">
                          <span className="text-muted fs-7 mb-1">
                            تاریخ شروع
                          </span>
                          <span className="text-dark fw-bold fs-6">
                            {new Date(call.startDate).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex flex-column">
                          <span className="text-muted fs-7 mb-1">
                            تاریخ پایان
                          </span>
                          <span className="text-dark fw-bold fs-6">
                            {new Date(call.endDate).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {isEditing && (
                  <>
                    <div className="separator separator-dashed my-5"></div>
                    <div className="row mb-7">
                      <div className="col-md-6">
                        <div className="mb-5">
                          <label className="form-label required">
                            تاریخ شروع
                          </label>
                          <input
                            type="datetime-local"
                            className={`form-control ${formik.touched.startDate &&
                                formik.errors.startDate
                                ? "is-invalid"
                                : ""
                              }`}
                            {...formik.getFieldProps("startDate")}
                          />
                          {formik.touched.startDate &&
                            formik.errors.startDate && (
                              <div className="invalid-feedback">
                                {formik.errors.startDate}
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-5">
                          <label className="form-label required">
                            تاریخ پایان
                          </label>
                          <input
                            type="datetime-local"
                            className={`form-control ${formik.touched.endDate && formik.errors.endDate
                                ? "is-invalid"
                                : ""
                              }`}
                            {...formik.getFieldProps("endDate")}
                          />
                          {formik.touched.endDate && formik.errors.endDate && (
                            <div className="invalid-feedback">
                              {formik.errors.endDate}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {isEditing && (
                  <>
                    <div className="separator separator-dashed my-5"></div>
                    <div className="row mb-7">
                      <div className="col-md-6">
                        <div className="mb-5">
                          <label className="form-label required">
                            حوزه‌های تخصصی
                          </label>
                          <div className="d-flex flex-wrap gap-2">
                            {[
                              { id: 1, name: "شیمی" },
                              { id: 2, name: "پلیمر" },
                              { id: 3, name: "برق" },
                              { id: 4, name: "بازاریابی" },
                              { id: 5, name: "نرم‌افزار" },
                              { id: 6, name: "سخت‌افزار" }
                            ].map((area) => (
                              <div key={area.id} className="form-check form-check-custom form-check-solid">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`expertise-${area.id}`}
                                  checked={formik.values.expertiseAreas.includes(area.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      formik.setFieldValue('expertiseAreas', [...formik.values.expertiseAreas, area.id]);
                                    } else {
                                      formik.setFieldValue('expertiseAreas', formik.values.expertiseAreas.filter(id => id !== area.id));
                                    }
                                  }}
                                />
                                <label className="form-check-label" htmlFor={`expertise-${area.id}`}>
                                  {area.name}
                                </label>
                              </div>
                            ))}
                          </div>
                          {formik.touched.expertiseAreas && formik.errors.expertiseAreas && (
                            <div className="invalid-feedback d-block">
                              {formik.errors.expertiseAreas}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-5">
                          <label className="form-label required">
                            معیارهای ارزیابی
                          </label>
                          <div className="d-flex flex-wrap gap-2">
                            {[
                              { id: 1, name: "نوآوری" },
                              { id: 2, name: "کاربردپذیری" },
                              { id: 3, name: "هزینه" },
                              { id: 4, name: "زمان اجرا" },
                              { id: 5, name: "کیفیت" }
                            ].map((criteria) => (
                              <div key={criteria.id} className="form-check form-check-custom form-check-solid">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`criteria-${criteria.id}`}
                                  checked={formik.values.evaluationCriteria.includes(criteria.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      formik.setFieldValue('evaluationCriteria', [...formik.values.evaluationCriteria, criteria.id]);
                                    } else {
                                      formik.setFieldValue('evaluationCriteria', formik.values.evaluationCriteria.filter(id => id !== criteria.id));
                                    }
                                  }}
                                />
                                <label className="form-check-label" htmlFor={`criteria-${criteria.id}`}>
                                  {criteria.name}
                                </label>
                              </div>
                            ))}
                          </div>
                          {formik.touched.evaluationCriteria && formik.errors.evaluationCriteria && (
                            <div className="invalid-feedback d-block">
                              {formik.errors.evaluationCriteria}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-5">
                          <label className="form-label required">
                            سطح پشتیبانی
                          </label>
                          <div className="d-flex flex-wrap gap-2">
                            {[
                              { id: 1, name: "مالی" },
                              { id: 2, name: "تجهیزات" },
                              { id: 3, name: "فضای کار" },
                              { id: 4, name: "شبکه‌سازی" }
                            ].map((level) => (
                              <div key={level.id} className="form-check form-check-custom form-check-solid">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`support-${level.id}`}
                                  checked={formik.values.supportLevel.includes(level.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      formik.setFieldValue('supportLevel', [...formik.values.supportLevel, level.id]);
                                    } else {
                                      formik.setFieldValue('supportLevel', formik.values.supportLevel.filter(id => id !== level.id));
                                    }
                                  }}
                                />
                                <label className="form-check-label" htmlFor={`support-${level.id}`}>
                                  {level.name}
                                </label>
                              </div>
                            ))}
                          </div>
                          {formik.touched.supportLevel && formik.errors.supportLevel && (
                            <div className="invalid-feedback d-block">
                              {formik.errors.supportLevel}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {!isEditing && (
                  <>
                    <div className="separator separator-dashed my-5"></div>
                    <div className="row mb-7">
                      <div className="col-md-6">
                        <div className="d-flex flex-column">
                          <span className="text-muted fs-7 mb-1">
                            حوزه‌های تخصصی
                          </span>
                          <div className="d-flex flex-wrap gap-2">
                            {call.expertiseAreas.map((area) => (
                              <span
                                key={area}
                                className="badge badge-light-primary"
                              >
                                {getExpertiseAreaText(area)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex flex-column">
                          <span className="text-muted fs-7 mb-1">
                            معیارهای ارزیابی
                          </span>
                          <div className="d-flex flex-wrap gap-2">
                            {call.evaluationCriteria.map((criteria) => (
                              <span
                                key={criteria}
                                className="badge badge-light-info"
                              >
                                {getEvaluationCriteriaText(criteria)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex flex-column">
                          <span className="text-muted fs-7 mb-1">
                            سطح پشتیبانی
                          </span>
                          <div className="d-flex flex-wrap gap-2">
                            {call.supportLevel.map((level) => (
                              <span
                                key={level}
                                className="badge badge-light-success"
                              >
                                {getSupportLevelText(level)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="separator separator-dashed my-5"></div>

                <div className="mb-7">
                  <h4 className="fw-bold mb-3">توضیحات</h4>
                  {isEditing ? (
                    <div className="mb-5">
                      <CKEditor
                        editor={ClassicEditor}
                        data={formik.values.description}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          formik.setFieldValue("description", data);
                        }}
                        config={{
                          toolbar: [
                            "heading",
                            "|",
                            "bold",
                            "italic",
                            "link",
                            "bulletedList",
                            "numberedList",
                            "|",
                            "outdent",
                            "indent",
                            "|",
                            "blockQuote",
                            "insertTable",
                            "undo",
                            "redo",
                          ],
                          language: "fa",
                        }}
                      />
                      {formik.touched.description &&
                        formik.errors.description && (
                          <div className="invalid-feedback d-block">
                            {formik.errors.description}
                          </div>
                        )}
                    </div>
                  ) : (
                    <div
                      className="text-gray-600 fs-6"
                      dangerouslySetInnerHTML={{ __html: call.description }}
                    />
                  )}
                </div>

                <div className="mb-7">
                  <h4 className="fw-bold mb-3">شرح مسئله</h4>
                  {isEditing ? (
                    <div className="mb-5">
                      <CKEditor
                        editor={ClassicEditor}
                        data={formik.values.problemDescription}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          formik.setFieldValue("problemDescription", data);
                        }}
                        config={{
                          toolbar: [
                            "heading",
                            "|",
                            "bold",
                            "italic",
                            "link",
                            "bulletedList",
                            "numberedList",
                            "|",
                            "outdent",
                            "indent",
                            "|",
                            "blockQuote",
                            "insertTable",
                            "undo",
                            "redo",
                          ],
                          language: "fa",
                        }}
                      />
                      {formik.touched.problemDescription &&
                        formik.errors.problemDescription && (
                          <div className="invalid-feedback d-block">
                            {formik.errors.problemDescription}
                          </div>
                        )}
                    </div>
                  ) : (
                    <div
                      className="text-gray-600 fs-6"
                      dangerouslySetInnerHTML={{
                        __html: call.problemDescription,
                      }}
                    />
                  )}
                </div>

                <div className="mb-7">
                  <h4 className="fw-bold mb-3">اهداف مورد انتظار</h4>
                  {isEditing ? (
                    <div className="mb-5">
                      <CKEditor
                        editor={ClassicEditor}
                        data={formik.values.expectedGoals}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          formik.setFieldValue("expectedGoals", data);
                        }}
                        config={{
                          toolbar: [
                            "heading",
                            "|",
                            "bold",
                            "italic",
                            "link",
                            "bulletedList",
                            "numberedList",
                            "|",
                            "outdent",
                            "indent",
                            "|",
                            "blockQuote",
                            "insertTable",
                            "undo",
                            "redo",
                          ],
                          language: "fa",
                        }}
                      />
                      {formik.touched.expectedGoals &&
                        formik.errors.expectedGoals && (
                          <div className="invalid-feedback d-block">
                            {formik.errors.expectedGoals}
                          </div>
                        )}
                    </div>
                  ) : (
                    <div
                      className="text-gray-600 fs-6"
                      dangerouslySetInnerHTML={{
                        __html: call.expectedGoals,
                      }}
                    />
                  )}
                </div>

                {/* پارتیشن حرفه‌ای برای بخش ویرایش */}
                {isEditing && (
                  <>
                    <div className="separator separator-dashed my-10"></div>

                    {/* کارت ویرایش */}
                    <div className="card card-flush border-primary border-2 bg-light-primary bg-opacity-10">
                      <div className="card-header bg-primary bg-opacity-10 border-bottom border-primary">
                        <div className="card-title">
                          <div className="d-flex align-items-center">
                            <div className="symbol symbol-40px me-4">
                              <div className="symbol-label bg-primary">
                                <KTIcon iconName="pencil" className="fs-2x text-white" />
                              </div>
                            </div>
                            <div>
                              <h3 className="fw-bold text-primary mb-1">بخش ویرایش فراخوان</h3>
                              <p className="text-muted fs-7 mb-0">تمام تغییرات خود را در این بخش اعمال کنید</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card-body p-8">
                        <div className="alert alert-info d-flex align-items-center p-5 mb-8">
                          <KTIcon iconName="information-5" className="fs-2x text-info me-4" />
                          <div className="d-flex flex-column">
                            <h5 className="mb-1">راهنمای ویرایش</h5>
                            <span className="fs-7">
                              • فیلدهای قرمز رنگ الزامی هستند<br />
                              • پس از ویرایش، روی "ذخیره تغییرات" کلیک کنید<br />
                              • برای انصراف، روی "انصراف" کلیک کنید
                            </span>
                          </div>
                        </div>

                        {/* دکمه‌های عملیات */}
                        <div className="d-flex justify-content-end gap-3">
                          <button
                            type="button"
                            className="btn btn-light btn-lg px-8"
                            onClick={() => {
                              Swal.fire({
                                title: "انصراف از ویرایش",
                                text: "آیا از انصراف از ویرایش اطمینان دارید؟ تمام تغییرات ذخیره نشده از بین خواهند رفت.",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonText: "بله، انصراف",
                                cancelButtonText: "خیر، ادامه ویرایش",
                                confirmButtonColor: "#F64E60",
                                cancelButtonColor: "#3699FF",
                                customClass: {
                                  popup: "animated fadeInDown",
                                  title: "text-warning",
                                  confirmButton: "btn btn-danger",
                                  cancelButton: "btn btn-primary",
                                },
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  setIsEditing(false);
                                  formik.resetForm();
                                  showSuccessAlert("انصراف", "ویرایش لغو شد و تغییرات بازگردانی شد");
                                }
                              });
                            }}
                          >
                            <KTIcon iconName="cross" className="fs-2 me-2" />
                            انصراف از ویرایش
                          </button>

                          <button
                            type="submit"
                            className="btn btn-primary btn-lg px-8"
                            disabled={formik.isSubmitting || !formik.isValid}
                          >
                            {formik.isSubmitting ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                در حال ذخیره...
                              </>
                            ) : (
                              <>
                                <KTIcon iconName="check" className="fs-2 me-2" />
                                ذخیره تغییرات
                              </>
                            )}
                          </button>
                        </div>

                        {/* نمایش وضعیت فرم */}
                        <div className="mt-6">
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <div className={`symbol symbol-20px me-3 ${formik.isValid ? 'bg-success' : 'bg-warning'}`}>
                                <KTIcon
                                  iconName={formik.isValid ? "check" : "warning"}
                                  className="fs-1 text-white"
                                />
                              </div>
                              <span className={`fw-semibold ${formik.isValid ? 'text-success' : 'text-warning'}`}>
                                {formik.isValid ? 'فرم معتبر است' : 'لطفا خطاهای فرم را برطرف کنید'}
                              </span>
                            </div>

                            <div className="d-flex align-items-center">
                              <span className="badge badge-light-primary fs-7 px-3 py-2 me-2">
                                {Object.keys(formik.touched).length} فیلد ویرایش شده
                              </span>
                              <span className="badge badge-light-info fs-7 px-3 py-2">
                                {Object.keys(formik.errors).length} خطا
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="separator separator-dashed my-5"></div>

                <div className="separator separator-dashed my-5"></div>

                <div className="mb-7">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="fw-bold mb-0">سوالات متداول</h4>
                    <div className="d-flex gap-2">
                      <span className="badge badge-light-primary fs-7 px-3 py-2">
                        {faqs.length} سوال
                      </span>
                      {hasSuperAccess && (
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={handleAddFaq}
                        >
                          <KTIcon iconName="plus" className="fs-2" />
                          افزودن سوال
                        </button>
                      )}
                    </div>
                  </div>
                  {faqs.length > 0 ? (
                    <div className="accordion" id="faqAccordion">
                      {faqs.map((item, index) => (
                        <div key={index} className="accordion-item mb-3">
                          <h2
                            className="accordion-header"
                            id={`heading${index}`}
                          >
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
                                dangerouslySetInnerHTML={{
                                  __html: item.answer,
                                }}
                              />
                              {hasSuperAccess && (
                                <div className="d-flex justify-content-end gap-2 mt-3">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light-primary"
                                    onClick={() => handleEditFaq(item)}
                                  >
                                    <KTIcon
                                      iconName="pencil"
                                      className="fs-2"
                                    />
                                    ویرایش
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light-danger"
                                    onClick={() => handleDeleteFaq(item.id)}
                                  >
                                    <KTIcon iconName="trash" className="fs-2" />
                                    حذف
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted">
                      هیچ سوال متداولی ثبت نشده است
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
                </div>

                <div className="separator separator-dashed my-5"></div>

                <div className="card mb-7">
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <h4 className="fw-bold mb-0">فایل‌های پیوست</h4>
                      <div className="d-flex align-items-center">
                        <span className="badge badge-light-primary fs-7 px-3 py-2 ms-3">
                          {attachments.length} فایل
                        </span>
                        {hasSuperAccess && (
                          <button
                            className="btn btn-sm btn-primary"
                            type="button"
                            onClick={() => setShowAttachmentModal(true)}
                          >
                            <KTIcon iconName="plus" className="fs-2" /> افزودن
                            فایل پیوست
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    {attachments.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table align-middle table-row-dashed fs-6 gy-5">
                          <thead>
                            <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                              <th className="min-w-125px text-center">
                                نام فایل
                              </th>
                              <th className="min-w-125px text-center">
                                نوع فایل
                              </th>
                              <th className="min-w-125px text-center">حجم</th>
                              <th className="min-w-125px text-center">
                                عملیات
                              </th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-600 fw-semibold">
                            {attachments.map((attachment) => (
                              <tr key={attachment.id}>
                                <td className="text-center">
                                  <div className="d-flex align-items-center justify-content-center">
                                    <KTIcon
                                      iconName={getFileIcon(
                                        attachment.fileType
                                      )}
                                      className="fs-2 me-2 text-primary"
                                    />
                                    <span className="text-dark fw-bold">
                                      {attachment.fileName}
                                    </span>
                                  </div>
                                </td>
                                <td className="text-center">
                                  <span className="badge badge-light-primary fs-7 px-3 py-2">
                                    {attachment.fileType}
                                  </span>
                                </td>
                                <td className="text-center">
                                  <span className="text-muted fw-semibold">
                                    {formatFileSize(attachment.fileSize)}
                                  </span>
                                </td>
                                <td className="text-center">
                                  <div className="d-flex justify-content-center gap-2">
                                    <a
                                      href={API_ENDPOINTS.INNOVATION.ATTACHMENTS.DOWNLOAD(
                                        attachment.id
                                      )}
                                      className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="دانلود"
                                    >
                                      <KTIcon
                                        iconName="download"
                                        className="fs-2"
                                      />
                                    </a>
                                    {hasSuperAccess && (
                                      <button
                                        type="button"
                                        className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                                        title="حذف فایل"
                                        onClick={async () => {
                                          const result = await showConfirmAlert(
                                            "حذف فایل پیوست",
                                            "آیا از حذف این فایل اطمینان دارید؟"
                                          );
                                          if (result.isConfirmed) {
                                            await handleDeleteAttachment(
                                              attachment.id
                                            );
                                            showSuccessAlert(
                                              "موفق",
                                              "فایل با موفقیت حذف شد"
                                            );
                                          }
                                        }}
                                      >
                                        <KTIcon
                                          iconName="trash"
                                          className="fs-2"
                                        />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="alert alert-light-primary d-flex align-items-center p-5">
                        <KTIcon
                          iconName="document"
                          className="fs-2x text-primary me-4"
                        />
                        <div className="d-flex flex-column">
                          <h4 className="mb-1">هیچ فایل پیوستی ثبت نشده است</h4>
                          <span>
                            برای افزودن فایل پیوست، روی دکمه "افزودن فایل پیوست"
                            کلیک کنید.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {showAttachmentModal && (
                  <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    dir="rtl"
                    style={{ zIndex: 1056, fontFamily: "sans" }}
                  >
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">
                            افزودن فایل پیوست جدید
                          </h5>
                          <div
                            className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                            onClick={() => setShowAttachmentModal(false)}
                          >
                            <KTIcon iconName="cross" className="fs-2x" />
                          </div>
                        </div>
                        <div className="modal-body">
                          <div className="mb-3">
                            <label className="form-label required">فایل</label>
                            <div className="dropzone dropzone-multi px-8 py-4">
                              <div className="dropzone-items">
                                {attachmentForm.file && (
                                  <div className="dropzone-item">
                                    <div className="dropzone-file">
                                      <div
                                        className="dropzone-filename"
                                        title={attachmentForm.file.name}
                                      >
                                        <span>{attachmentForm.file.name}</span>
                                        <strong>
                                          (
                                          <span>
                                            {formatFileSize(
                                              attachmentForm.file.size
                                            )}
                                          </span>
                                          )
                                        </strong>
                                      </div>
                                    </div>
                                    <div className="dropzone-toolbar">
                                      <span className="dropzone-delete">
                                        <button
                                          type="button"
                                          className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                                          onClick={() =>
                                            setAttachmentForm({ file: null })
                                          }
                                        >
                                          <KTIcon
                                            className="fs-1"
                                            iconName="cross"
                                          />
                                        </button>
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="dropzone-input">
                                <input
                                  type="file"
                                  className="form-control"
                                  onChange={handleAttachmentFormChange}
                                  accept="*/*"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => setShowAttachmentModal(false)}
                          >
                            انصراف
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleAttachmentFormSubmit}
                            disabled={!attachmentForm.file}
                          >
                            <KTIcon iconName="upload" className="fs-2 me-2" />
                            آپلود
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="separator separator-dashed my-5"></div>

                <div className="mb-7">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="fw-bold mb-0">مراحل فراخوان</h4>
                    {hasSuperAccess && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAddStage}
                      >
                        <KTIcon iconName="plus" className="fs-2" />
                        افزودن مرحله جدید
                      </button>
                    )}
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <div className="card-toolbar">
                        <div
                          className="d-flex justify-content-end"
                          data-kt-user-table-toolbar="base"
                        >
                          <div className="btn-group">
                            <button
                              type="button"
                              className={`btn btn-sm ${stageFilter === "all"
                                  ? "btn-primary"
                                  : "btn-light-primary"
                                }`}
                              onClick={() => setStageFilter("all")}
                            >
                              همه
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${stageFilter === "active"
                                  ? "btn-primary"
                                  : "btn-light-primary"
                                }`}
                              onClick={() => setStageFilter("active")}
                            >
                              فعال
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${stageFilter === "completed"
                                  ? "btn-primary"
                                  : "btn-light-primary"
                                }`}
                              onClick={() => setStageFilter("completed")}
                            >
                              تکمیل شده
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${stageFilter === "inactive"
                                  ? "btn-primary"
                                  : "btn-light-primary"
                                }`}
                              onClick={() => setStageFilter("inactive")}
                            >
                              غیرفعال
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-body">
                      {callStages && callStages.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table align-middle table-row-dashed fs-6 gy-5">
                            <thead>
                              <tr className="text-center text-muted fw-bold fs-7 text-uppercase gs-0">
                                <th className="min-w-50px">ترتیب</th>
                                <th className="min-w-125px">نام مرحله</th>
                                <th className="min-w-125px">توضیحات</th>
                                <th className="min-w-125px">تاریخ شروع</th>
                                <th className="min-w-125px">تاریخ پایان</th>
                                <th className="min-w-125px">وضعیت</th>
                                <th className="min-w-125px">عملیات</th>
                              </tr>
                            </thead>
                            <tbody className="text-gray-600 fw-semibold">
                              {callStages
                                .slice()
                                .sort((a, b) => a.order - b.order)
                                .filter((stage) => {
                                  const matchesFilter =
                                    stageFilter === "all" ||
                                    (stageFilter === "active" &&
                                      stage.status === "Active") ||
                                    (stageFilter === "completed" &&
                                      stage.status === "Completed") ||
                                    (stageFilter === "inactive" &&
                                      stage.status === "Inactive");
                                  return matchesFilter;
                                })
                                .map((stage) => (
                                  <tr key={stage.id}>
                                    <td className="text-center">
                                      {stage.order}
                                    </td>
                                    <td className="text-center">
                                      <div className="d-flex flex-column">
                                        <span className="text-dark fw-bold mb-1">
                                          {stage.name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="text-center">
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: stage.description,
                                        }}
                                      />
                                    </td>
                                    <td className="text-center">
                                      {stage.startDate
                                        ? new Date(
                                          stage.startDate
                                        ).toLocaleDateString("fa-IR")
                                        : "-"}
                                    </td>
                                    <td className="text-center">
                                      {stage.endDate
                                        ? new Date(
                                          stage.endDate
                                        ).toLocaleDateString("fa-IR")
                                        : "-"}
                                    </td>
                                    <td className="text-center">
                                      <span
                                        className={`badge badge-light-${stage.status === "Active"
                                            ? "success"
                                            : stage.status === "Completed"
                                              ? "info"
                                              : "warning"
                                          } fs-7 fw-semibold px-3 py-2`}
                                      >
                                        {stage.status === "Active"
                                          ? "فعال"
                                          : stage.status === "Completed"
                                            ? "تکمیل شده"
                                            : "غیرفعال"}
                                      </span>
                                    </td>
                                    <td className="text-center">
                                      <div className="d-flex justify-content-center gap-2">
                                        {hasSuperAccess && (
                                          <>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-light-primary"
                                              onClick={() =>
                                                handleEditStage(stage)
                                              }
                                            >
                                              <KTIcon
                                                iconName="pencil"
                                                className="fs-2"
                                              />
                                              ویرایش
                                            </button>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-light-danger"
                                              onClick={() =>
                                                handleDeleteStage(stage.id)
                                              }
                                            >
                                              <KTIcon
                                                iconName="trash"
                                                className="fs-2"
                                              />
                                              حذف
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-muted">
                          هیچ مرحله‌ای ثبت نشده است
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="separator separator-dashed my-5"></div>

                <div className="mb-7">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="fw-bold mb-0">ایده‌های ثبت شده</h4>
                    {call?.status === "Open" && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAddIdea}
                      >
                        <KTIcon iconName="plus" className="fs-2" />
                        ثبت ایده جدید
                      </button>
                    )}
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <div className="card-toolbar">
                        <div
                          className="d-flex justify-content-end"
                          data-kt-user-table-toolbar="base"
                        >
                          <div className="btn-group">
                            <button
                              type="button"
                              className={`btn btn-sm ${ideaFilter === "all"
                                  ? "btn-primary"
                                  : "btn-light-primary"
                                }`}
                              onClick={() => setIdeaFilter("all")}
                            >
                              همه
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${ideaFilter === "pending"
                                  ? "btn-primary"
                                  : "btn-light-primary"
                                }`}
                              onClick={() => setIdeaFilter("pending")}
                            >
                              در انتظار بررسی
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${ideaFilter === "Accepted"
                                  ? "btn-primary"
                                  : "btn-light-primary"
                                }`}
                              onClick={() => setIdeaFilter("Accepted")}
                            >
                              تایید شده
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${ideaFilter === "Deleted"
                                  ? "btn-primary"
                                  : "btn-light-primary"
                                }`}
                              onClick={() => setIdeaFilter("rejected")}
                            >
                              رد شده
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-body">
                      {ideas && ideas.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table align-middle table-row-dashed fs-6 gy-5">
                            <thead>
                              <tr className="text-center text-muted fw-bold fs-7 text-uppercase gs-0">
                                <th className="min-w-125px">عنوان</th>
                                <th className="min-w-125px">ایجاد کننده</th>
                                <th className="min-w-125px">وضعیت</th>
                                <th className="min-w-125px">مرحله فعلی</th>
                                <th className="min-w-125px">تاریخ ثبت</th>
                                <th className="min-w-125px">عملیات</th>
                              </tr>
                            </thead>
                            <tbody className="text-gray-600 fw-semibold">
                              {ideas
                                .filter((idea) => {
                                  if (ideaFilter === "all") return true;
                                  return (
                                    idea?.accuracy?.toLowerCase() ===
                                    ideaFilter.toLowerCase()
                                  );
                                })
                                .map((idea) => (
                                  <tr key={idea.id}>
                                    <td className="text-center">
                                      <div className="d-flex flex-column">
                                        <span className="text-dark fw-bold mb-1">
                                          {idea.title}
                                        </span>
                                        <span
                                          className="text-muted"
                                          dangerouslySetInnerHTML={{
                                            __html: idea.description,
                                          }}
                                        />
                                      </div>
                                    </td>
                                    <td className="text-center">
                                      {idea.createdByUserName}
                                    </td>
                                    <td className="text-center">
                                      <span
                                        className={`badge badge-light-${idea.status === 2
                                            ? "success"
                                            : idea.status === 3
                                              ? "danger"
                                              : "warning"
                                          } fs-7 fw-semibold px-3 py-2`}
                                      >
                                        {idea.status === 2
                                          ? "تایید شده"
                                          : idea.status === 3
                                            ? "رد شده"
                                            : "در انتظار بررسی"}
                                      </span>
                                    </td>
                                    <td className="text-center">
                                      {idea.currentStageName}
                                    </td>
                                    <td className="text-center">
                                      {new Date(
                                        idea.entryDate
                                      ).toLocaleDateString("fa-IR")}
                                    </td>
                                    <td className="text-center">
                                      <div className="d-flex justify-content-center gap-2">
                                        {hasSuperAccess && (
                                          <>
                                            {/* <button
                                              type="button"
                                              className="btn btn-sm btn-light-primary"
                                              onClick={() =>
                                                handleEditIdea(idea)
                                              }
                                            >
                                              <KTIcon
                                                iconName="pencil"
                                                className="fs-2"
                                              />
                                              ویرایش
                                            </button> */}
                                            {idea.status !== 3 && (
                                              <div className="d-flex align-items-center">
                                                {idea.currentStage?.order ===
                                                  call?.stages?.length ? (
                                                  <span className="badge badge-light-success fs-7 fw-semibold px-3 py-2">
                                                    <KTIcon
                                                      iconName="check-circle"
                                                      className="fs-2 me-1"
                                                    />
                                                    موفق
                                                  </span>
                                                ) : idea.move ? (
                                                  <button
                                                    type="button"
                                                    className="btn btn-sm btn-light-success"
                                                    onClick={() => {
                                                      setSelectedIdeaForStage(
                                                        idea
                                                      );
                                                      setShowIdeaStageModal(
                                                        true
                                                      );
                                                    }}
                                                  >
                                                    <KTIcon
                                                      iconName="arrow-right"
                                                      className="fs-2"
                                                    />
                                                    انتقال
                                                  </button>
                                                ) : (
                                                  <span className="badge badge-light-warning fs-7 fw-semibold px-3 py-2">
                                                    <KTIcon
                                                      iconName="clock"
                                                      className="fs-2 me-1"
                                                    />
                                                    در انتظار
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                            {idea.status === 3 && (
                                              <span className="badge badge-light-danger fs-7 fw-semibold px-3 py-2">
                                                <KTIcon
                                                  iconName="cross-circle"
                                                  className="fs-2 me-1"
                                                />
                                                رد شده
                                              </span>
                                            )}
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-light-danger"
                                              onClick={() => {
                                                setSelectedIdeaForStage(idea);
                                                setShowIdeaRejectModal(true);
                                              }}
                                            >
                                              <KTIcon
                                                iconName="cross"
                                                className="fs-2"
                                              />
                                              رد
                                            </button>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-light-warning"
                                              onClick={() => {
                                                setSelectedIdeaForStage(idea);
                                                fetchIdeaDetails(idea.id);
                                                setShowIdeaTagModal(true);
                                              }}
                                            >
                                              <KTIcon
                                                iconName="tag"
                                                className="fs-2"
                                              />
                                              برچسب‌ها
                                            </button>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-light-danger"
                                              onClick={() =>
                                                handleDeleteIdea(idea.id)
                                              }
                                            >
                                              <KTIcon
                                                iconName="trash"
                                                className="fs-2"
                                              />
                                              حذف
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-muted">
                          هیچ ایده‌ای ثبت نشده است
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="d-flex justify-content-end mt-10">
                    <button
                      type="button"
                      className="btn btn-light me-3"
                      onClick={() => {
                        Swal.fire({
                          title: "انصراف از ویرایش",
                          text: "آیا از انصراف از ویرایش اطمینان دارید؟ تغییرات ذخیره نشده از بین خواهند رفت.",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonText: "بله",
                          cancelButtonText: "خیر",
                          confirmButtonColor: "#3699FF",
                          cancelButtonColor: "#F64E60",
                          customClass: {
                            popup: "animated fadeInDown",
                            title: "text-warning",
                            confirmButton: "btn btn-primary",
                            cancelButton: "btn btn-danger",
                          },
                        }).then((result) => {
                          if (result.isConfirmed) {
                            setIsEditing(false);
                            formik.resetForm();
                          }
                        });
                      }}
                    >
                      <KTIcon iconName="cross" className="fs-2 me-2" />
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={formik.isSubmitting}
                    >
                      {formik.isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          در حال ذخیره...
                        </>
                      ) : (
                        <>
                          <KTIcon iconName="check" className="fs-2 me-2" />
                          ذخیره تغییرات
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
      {showFaqModal && (
        <FaqModal
          show={showFaqModal}
          onClose={() => setShowFaqModal(false)}
          faqFormData={faqFormData}
          setFaqFormData={setFaqFormData}
          selectedFaq={selectedFaq}
          onSave={handleSaveFaq}
        />
      )}
      {showStageModal && (
        <StageModal
          show={showStageModal}
          onClose={() => setShowStageModal(false)}
          stageFormData={stageFormData}
          setStageFormData={setStageFormData}
          selectedStage={selectedStage}
          onSave={handleSaveStage}
        />
      )}
      {showIdeaModal && <IdeaModal />}
      {showIdeaStageModal && <IdeaStageModal />}
      {showIdeaRejectModal && <IdeaRejectModal />}
      {showIdeaTagModal && <IdeaTagModal />}
      {showMoveIdeaModal && selectedIdeaId && (
        <MoveIdeaModal
          show={showMoveIdeaModal}
          onClose={() => {
            setShowMoveIdeaModal(false);
            setSelectedIdeaId(null);
          }}
          ideaId={selectedIdeaId}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}
    </>
  );
};

export default CallDetail;
