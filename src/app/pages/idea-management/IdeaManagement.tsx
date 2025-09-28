import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KTIcon } from '../../../_metronic/helpers';
import { toast } from 'react-toastify';
import {
  getCallStages,
  getIdeaStages,
  moveIdeaToNextStage,
  rejectIdea,
  getAllTags,
  getIdeaTags,
  addTagToIdea,
  removeTagFromIdea,
  CallStage,
  IdeaStage,
  IdeaTag,
} from '../../modules/auth/core/_requests';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const IdeaManagement: FC = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const [callStages, setCallStages] = useState<CallStage[]>([]);
  const [ideaStages, setIdeaStages] = useState<IdeaStage[]>([]);
  const [tags, setTags] = useState<IdeaTag[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMoveStageModal, setShowMoveStageModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (callId) {
          const [stagesData, tagsData] = await Promise.all([
            getCallStages(parseInt(callId)),
            getAllTags(),
          ]);
          setCallStages(stagesData);
          setTags(tagsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('خطا در دریافت اطلاعات', {
          position: 'top-center',
          autoClose: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [callId]);

  const handleMoveStage = async () => {
    if (!selectedIdeaId || !selectedStageId) return;

    try {
      await moveIdeaToNextStage(selectedIdeaId, selectedStageId, 'Accepted', comment);
      toast.success('ایده با موفقیت به مرحله بعد منتقل شد', {
        position: 'top-center',
        autoClose: 3000,
      });
      setShowMoveStageModal(false);
      setComment('');
      // Refresh idea stages
      const stages = await getIdeaStages(selectedIdeaId);
      setIdeaStages(stages);
    } catch (error) {
      console.error('Error moving stage:', error);
      toast.error('خطا در انتقال به مرحله بعد', {
        position: 'top-center',
        autoClose: 4000,
      });
    }
  };

  const handleReject = async () => {
    if (!selectedIdeaId || !selectedStageId) return;

    try {
      await rejectIdea(selectedIdeaId, selectedStageId, comment);
      toast.success('ایده با موفقیت رد شد', {
        position: 'top-center',
        autoClose: 3000,
      });
      setShowRejectModal(false);
      setComment('');
      // Refresh idea stages
      const stages = await getIdeaStages(selectedIdeaId);
      setIdeaStages(stages);
    } catch (error) {
      console.error('Error rejecting idea:', error);
      toast.error('خطا در رد ایده', {
        position: 'top-center',
        autoClose: 4000,
      });
    }
  };

  const handleAddTag = async (tagId: number) => {
    if (!selectedIdeaId) return;

    try {
      await addTagToIdea(selectedIdeaId, tagId);
      toast.success('برچسب با موفقیت اضافه شد', {
        position: 'top-center',
        autoClose: 3000,
      });
      // Refresh idea tags
      const ideaTags = await getIdeaTags(selectedIdeaId);
      setTags(ideaTags);
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('خطا در افزودن برچسب', {
        position: 'top-center',
        autoClose: 4000,
      });
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    if (!selectedIdeaId) return;

    try {
      await removeTagFromIdea(selectedIdeaId, tagId);
      toast.success('برچسب با موفقیت حذف شد', {
        position: 'top-center',
        autoClose: 3000,
      });
      // Refresh idea tags
      const ideaTags = await getIdeaTags(selectedIdeaId);
      setTags(ideaTags);
    } catch (error) {
      console.error('Error removing tag:', error);
      toast.error('خطا در حذف برچسب', {
        position: 'top-center',
        autoClose: 4000,
      });
    }
  };

  const MoveStageModal = () => (
    <div className="modal fade show d-block" tabIndex={-1} dir="rtl" style={{ zIndex: 1056 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">انتقال به مرحله بعد</h5>
            <div
              className="btn btn-icon btn-sm btn-active-light-primary ms-2"
              onClick={() => setShowMoveStageModal(false)}
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
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setShowMoveStageModal(false)}
            >
              انصراف
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleMoveStage}
            >
              تایید
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const RejectModal = () => (
    <div className="modal fade show d-block" tabIndex={-1} dir="rtl" style={{ zIndex: 1056 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">رد ایده</h5>
            <div
              className="btn btn-icon btn-sm btn-active-light-primary ms-2"
              onClick={() => setShowRejectModal(false)}
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
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setShowRejectModal(false)}
            >
              انصراف
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleReject}
            >
              رد ایده
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const TagModal = () => (
    <div className="modal fade show d-block" tabIndex={-1} dir="rtl" style={{ zIndex: 1056 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">مدیریت برچسب‌ها</h5>
            <div
              className="btn btn-icon btn-sm btn-active-light-primary ms-2"
              onClick={() => setShowTagModal(false)}
            >
              <KTIcon iconName="cross" className="fs-2x" />
            </div>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">برچسب‌های موجود</label>
              <div className="d-flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="badge badge-light-primary fs-7 fw-semibold px-3 py-2"
                  >
                    {tag.name}
                    <button
                      type="button"
                      className="btn btn-icon btn-sm btn-active-light-danger ms-2"
                      onClick={() => handleRemoveTag(tag.id)}
                    >
                      <KTIcon iconName="cross" className="fs-2" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">افزودن برچسب جدید</label>
              <select
                className="form-select"
                onChange={(e) => handleAddTag(parseInt(e.target.value))}
              >
                <option value="">انتخاب برچسب</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setShowTagModal(false)}
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card" dir="rtl" style={{ fontFamily: "sans" }}>
      <div className="card-header border-0 pt-6">
        <div className="card-title">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-3"
              onClick={() => navigate(-1)}
              title="بازگشت"
            >
              <KTIcon iconName="arrow-right" className="fs-2" />
            </button>
            <h2 className="fw-bold">مدیریت مراحل ایده‌ها</h2>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="table-responsive">
          <table className="table align-middle table-row-dashed fs-6 gy-5">
            <thead>
              <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                <th>مرحله</th>
                <th>وضعیت</th>
                <th>نظر کارشناس</th>
                <th>تاریخ</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 fw-semibold">
              {ideaStages.map((stage) => (
                <tr key={stage.id}>
                  <td>
                    {callStages.find((s) => s.id === stage.stageId)?.title}
                  </td>
                  <td>
                    <span
                      className={`badge badge-light-${
                        stage.status === 'Accepted'
                          ? 'success'
                          : stage.status === 'Rejected'
                          ? 'danger'
                          : 'warning'
                      } fs-7 fw-semibold px-3 py-2`}
                    >
                      {stage.status === 'Accepted'
                        ? 'تایید شده'
                        : stage.status === 'Rejected'
                        ? 'رد شده'
                        : 'در انتظار بررسی'}
                    </span>
                  </td>
                  <td>{stage.comment}</td>
                  <td>{new Date(stage.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="d-flex gap-2">
                      {stage.status === 'Pending' && (
                        <>
                          <button
                            className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
                            onClick={() => {
                              setSelectedStageId(stage.stageId);
                              setShowMoveStageModal(true);
                            }}
                            title="انتقال به مرحله بعد"
                          >
                            <KTIcon iconName="arrow-right" className="fs-2" />
                          </button>
                          <button
                            className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                            onClick={() => {
                              setSelectedStageId(stage.stageId);
                              setShowRejectModal(true);
                            }}
                            title="رد ایده"
                          >
                            <KTIcon iconName="cross" className="fs-2" />
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-icon btn-bg-light btn-active-color-info btn-sm"
                        onClick={() => {
                          setSelectedIdeaId(stage.ideaId);
                          setShowTagModal(true);
                        }}
                        title="مدیریت برچسب‌ها"
                      >
                        <KTIcon iconName="tag" className="fs-2" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showMoveStageModal && <MoveStageModal />}
      {showRejectModal && <RejectModal />}
      {showTagModal && <TagModal />}
    </div>
  );
};

export default IdeaManagement; 