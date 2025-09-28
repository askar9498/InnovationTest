import { FC, useState, useEffect } from 'react';
import { KTIcon } from '../../../../_metronic/helpers';
import { PermissionDto } from '../../../../_metronic/partials/widgets/tables/TablesWidget6';
import { AddRole, getAllPermissions } from '../../../../app/modules/auth/core/_requests';
import { toast } from 'react-toastify';

interface AddRoleModalProps {
  show: boolean;
  handleClose: () => void;
}

const AddRoleModal: FC<AddRoleModalProps> = ({ show, handleClose }) => {
  const [roleName, setRoleName] = useState('');
  const [allPermissions, setAllPermissions] = useState<PermissionDto[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      const fetchPermissions = async () => {
        setLoading(true);
        try {
          const permissionsResponse = await getAllPermissions();
          setAllPermissions(permissionsResponse.items);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching permissions:', error);
          setLoading(false);
          toast.error('Failed to load permissions.');
        }
      };

      fetchPermissions();
    } else {
      // Reset state when modal is hidden
      setRoleName('');
      setAllPermissions([]);
      setSelectedPermissions([]);
    }
  }, [show]);

  const handlePermissionSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const permissionId = parseInt(event.target.value, 10);
    if (!selectedPermissions.includes(permissionId)) {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    }
  };

  const handleRemovePermission = (permissionId: number) => {
    setSelectedPermissions(selectedPermissions.filter(id => id !== permissionId));
  };

  const handleAddRole = async () => {
    if (!roleName.trim()) {
      toast.error('نام نقش نمی‌تواند خالی باشد');
      return;
    }

    setLoading(true);
    try {
      await AddRole(roleName, selectedPermissions);
      toast.success(`نقش "${roleName}" با موفقیت اضافه شد!`);
      handleClose();
    } catch (error) {
      toast.error('افزودن نقش با شکست مواجه شد.');
      setLoading(false);
    }
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : ""}`}
      id="kt_modal_add_role"
      tabIndex={-1}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered mw-650px">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="fw-bold">افزودن نقش جدید</h2>
            <div
              className="btn btn-icon btn-sm btn-active-icon-primary"
              data-kt-users-modal-action="close"
              onClick={handleClose}
            >
              <KTIcon iconName="cross" className="fs-1" />
            </div>
          </div>
          <div className="modal-body scroll-y mx-5 mx-xl-15 pb-10">
            {loading && allPermissions.length === 0 ? ( // Show initial loading spinner
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "200px" }}
              >
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="form" onSubmit={(e) => e.preventDefault()}>
                <div className="mb-7">
                  <label className="fs-6 fw-semibold mb-2">نام نقش</label>
                  <input
                    type="text"
                    className="form-control form-control-solid"
                    placeholder="نام نقش را وارد کنید"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                  />
                </div>

                <div className="mb-7">
                  <label className="fs-6 fw-semibold mb-2">دسترسی‌ها</label>
                  <select
                    className="form-select form-select-solid mb-2"
                    onChange={handlePermissionSelect}
                    value=""
                  >
                    <option value="" disabled>دسترسی را برای افزودن انتخاب کنید</option>
                    {allPermissions.map(permission => (
                      <option key={permission.permissionEnums} value={permission.permissionEnums}>
                        {permission.name} ({permission.code})
                      </option>
                    ))}
                  </select>
                  <div className="d-flex flex-wrap">
                    {selectedPermissions.map(permissionId => {
                      const permission = allPermissions.find(p => p.permissionEnums === permissionId);
                      return permission ? (
                        <span
                          key={permissionId}
                          className="badge badge-light-primary fs-7 m-1 cursor-pointer"
                          onClick={() => handleRemovePermission(permissionId)}
                        >
                          {permission.name} <KTIcon iconName="cross" className="fs-9" />
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>

                <div className="text-center pt-15">
                  <button
                    type="reset"
                    className="btn btn-light me-3"
                    data-kt-users-modal-action="cancel"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-kt-users-modal-action="submit"
                    onClick={handleAddRole}
                    disabled={loading}
                  >
                    <span className="indicator-label">{loading ? "در حال افزودن..." : "افزودن نقش"}</span>
                    {loading && (
                      <span className="indicator-progress">
                        لطفا صبر کنید...
                        <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                      </span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { AddRoleModal }; 