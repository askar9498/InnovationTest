import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KTIcon } from '../../../_metronic/helpers';
import { toast } from 'react-toastify';
import {
  getCallStages,
  createCallStage,
  updateCallStage,
  deleteCallStage,
  CallStage,
} from '../../modules/auth/core/_requests';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const CallStages: FC = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const [stages, setStages] = useState<CallStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<CallStage | null>(null);
  const [formData, setFormData] = useState<Partial<CallStage>>({
    title: '',
    description: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchStages();
  }, [callId]);

  const fetchStages = async () => {
    try {
      setLoading(true);
      if (callId) {
        const data = await getCallStages(parseInt(callId));
        setStages(data);
      }
    } catch (error) {
      console.error('Error fetching stages:', error);
      toast.error('خطا در دریافت مراحل', {
        position: 'top-center',
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!callId) return;
      await createCallStage(parseInt(callId), formData as Omit<CallStage, 'id' | 'createdAt' | 'updatedAt'>);
      toast.success('مرحله با موفقیت ایجاد شد', {
        position: 'top-center',
        autoClose: 3000,
      });
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        order: 0,
        isActive: true,
      });
      fetchStages();
    } catch (error) {
      console.error('Error creating stage:', error);
      toast.error('خطا در ایجاد مرحله', {
        position: 'top-center',
        autoClose: 4000,
      });
    }
  };

  const handleUpdate = async () => {
    try {
      if (!selectedStage) return;
      await updateCallStage(selectedStage.id, formData);
      toast.success('مرحله با موفقیت بروزرسانی شد', {
        position: 'top-center',
        autoClose: 3000,
      });
      setShowEditModal(false);
      setSelectedStage(null);
      setFormData({
        title: '',
        description: '',
        order: 0,
        isActive: true,
      });
      fetchStages();
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error('خطا در بروزرسانی مرحله', {
        position: 'top-center',
        autoClose: 4000,
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedStage || !callId) return;
      await deleteCallStage(parseInt(callId), selectedStage.id);
      toast.success('مرحله با موفقیت حذف شد', {
        position: 'top-center',
        autoClose: 3000,
      });
      setShowDeleteModal(false);
      setSelectedStage(null);
      fetchStages();
    } catch (error) {
      console.error('Error deleting stage:', error);
      toast.error('خطا در حذف مرحله', {
        position: 'top-center',
        autoClose: 4000,
      });
    }
  };

  const CreateModal = () => (
    <div className="modal fade show d-block" tabIndex={-1} dir="rtl" style={{ fontFamily: "sans"}} >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" style={{ fontFamily: "sans"}}>ایجاد مرحله جدید</h5>
            <div
              className="btn btn-icon btn-sm btn-active-light-primary ms-2"
              onClick={() => setShowCreateModal(false)}
            >
              <KTIcon iconName="cross" className="fs-2x" />
            </div>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label required">عنوان</label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label required">توضیحات</label>
              <CKEditor
                editor={ClassicEditor}
                data={formData.description}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setFormData({ ...formData, description: data });
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
            <div className="mb-3">
              <label className="form-label required">ترتیب</label>
              <input
                type="number"
                className="form-control"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              />
            </div>
            <div className="mb-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label className="form-check-label">فعال</label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setShowCreateModal(false)}
            >
              انصراف
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreate}
            >
              ایجاد
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const EditModal = () => (
    <div className="modal fade show d-block" tabIndex={-1} dir="rtl" style={{ zIndex: 1056 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">ویرایش مرحله</h5>
            <div
              className="btn btn-icon btn-sm btn-active-light-primary ms-2"
              onClick={() => setShowEditModal(false)}
            >
              <KTIcon iconName="cross" className="fs-2x" />
            </div>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label required">عنوان</label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label required">توضیحات</label>
              <CKEditor
                editor={ClassicEditor}
                data={formData.description}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setFormData({ ...formData, description: data });
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
            <div className="mb-3">
              <label className="form-label required">ترتیب</label>
              <input
                type="number"
                className="form-control"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              />
            </div>
            <div className="mb-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label className="form-check-label">فعال</label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setShowEditModal(false)}
            >
              انصراف
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpdate}
            >
              بروزرسانی
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const DeleteModal = () => (
    <div className="modal fade show d-block" tabIndex={-1} dir="rtl" style={{ zIndex: 1056 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">تایید حذف</h5>
            <div
              className="btn btn-icon btn-sm btn-active-light-primary ms-2"
              onClick={() => setShowDeleteModal(false)}
            >
              <KTIcon iconName="cross" className="fs-2x" />
            </div>
          </div>
          <div className="modal-body">
            <p>آیا از حذف مرحله "{selectedStage?.title}" اطمینان دارید؟</p>
            <p className="text-danger">این عملیات غیرقابل بازگشت است.</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setShowDeleteModal(false)}
            >
              انصراف
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
            >
              حذف
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
            <h2 className="fw-bold">مدیریت مراحل فراخوان</h2>
          </div>
        </div>
        <div className="card-toolbar">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <KTIcon iconName="plus" className="fs-2" />
            ایجاد مرحله جدید
          </button>
        </div>
      </div>

      <div className="card-body">
        <div className="table-responsive">
          <table className="table align-middle table-row-dashed fs-6 gy-5">
            <thead>
              <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                <th>ترتیب</th>
                <th>عنوان</th>
                <th>توضیحات</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 fw-semibold">
              {stages.map((stage) => (
                <tr key={stage.id}>
                  <td>{stage.order}</td>
                  <td>{stage.title}</td>
                  <td>
                    <div
                      dangerouslySetInnerHTML={{ __html: stage.description }}
                      className="text-truncate"
                      style={{ maxWidth: '300px' }}
                    />
                  </td>
                  <td>
                    <span
                      className={`badge badge-light-${
                        stage.isActive ? 'success' : 'danger'
                      } fs-7 fw-semibold px-3 py-2`}
                    >
                      {stage.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
                        onClick={() => {
                          setSelectedStage(stage);
                          setFormData({
                            title: stage.title,
                            description: stage.description,
                            order: stage.order,
                            isActive: stage.isActive,
                          });
                          setShowEditModal(true);
                        }}
                        title="ویرایش"
                      >
                        <KTIcon iconName="pencil" className="fs-2" />
                      </button>
                      <button
                        className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                        onClick={() => {
                          setSelectedStage(stage);
                          setShowDeleteModal(true);
                        }}
                        title="حذف"
                      >
                        <KTIcon iconName="trash" className="fs-2" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && <CreateModal />}
      {showEditModal && <EditModal />}
      {showDeleteModal && <DeleteModal />}
    </div>
  );
};

export default CallStages; 