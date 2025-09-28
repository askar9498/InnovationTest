import { FC, useEffect, useState } from "react";
import { KTIcon } from "../../../helpers";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  GetAllRoles,
  updateUserRole,
} from "../../../../app/modules/auth/core/_requests";
import { RolesDto } from "../../widgets/tables/TablesWidget6";

interface UserPermissionModalProps {
  show: boolean;
  handleClose: () => void;
  email: string | undefined;
}

const UserPermissionModal: FC<UserPermissionModalProps> = ({
  show,
  handleClose,
  email,
}) => {
  const [roles, setRoles] = useState<RolesDto[]>([]);
  const [selectedRoleName, setSelectedRoleName] = useState<string>("");
  const [loading, setLoading] = useState(false);;
  useEffect(() => {
    if (show) {
      const fetchRoles = async () => {
        setLoading(true);
        try {
          const rolesResponse = await GetAllRoles();
          setRoles(rolesResponse.items);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching roles:", error);
          setLoading(false);
          toast.error("خطا در بارگیری نقش‌ها");
        }
      };

      fetchRoles();
    } else {
      // Reset state when modal is hidden
      setRoles([]);
      setSelectedRoleName("");
    }
  }, [show]);

  const handleRoleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRoleName(event.target.value);
  };

  const handleSaveRole = async () => {
    if (email === undefined || selectedRoleName === "") {
      console.warn("User or role not selected.");
      return;
    }

    setLoading(true);

    try {
      // Call the existing updateUserRole function
      // Note: Assuming updateUserRole expects userId as string and roleName as string
      await updateUserRole(email.toString(), selectedRoleName);
      toast.success("نقش کاربر با موفقیت تغییر یافت!");
      setLoading(false);
      handleClose(); // Close modal on success
      // The parent component (TablesWidget6) should handle refreshing the user list after closing the modal.
    } catch (error) {
      console.error("Error saving user role:", error);
      setLoading(false);
      toast.error("خطا در تغییر نقش کاربر");
    }
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : ""}`}
      id="kt_modal_user_permission" // Keep the original ID or update if needed in TablesWidget6
      tabIndex={-1}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered mw-650px">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="fw-bold">تخصیص نقش کاربر</h2> {/* Updated title */}
            <div
              className="btn btn-icon btn-sm btn-active-icon-primary"
              data-kt-users-modal-action="close"
              onClick={handleClose}
            >
              <KTIcon iconName="cross" className="fs-1" />
            </div>
          </div>
          <div className="modal-body scroll-y mx-5 mx-xl-15 pb-10">
            {loading && !roles.length ? ( // Show initial loading spinner
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "200px" }}
              >
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form
                id="kt_modal_user_permission_form" // Keep the original ID or update if needed
                className="form"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="mb-7">
                  <label className="fs-6 fw-semibold mb-2">
                    <span>نقش را برای کاربر انتخاب کنید</span>{" "}
                    {/* Updated label */}
                    <i
                      className="fas fa-exclamation-circle ms-1 fs-7"
                      data-bs-toggle="tooltip"
                      title="نقشی که می‌خواهید به کاربر تخصیص دهید انتخاب کنید" // Updated tooltip
                    ></i>
                  </label>
                  <select
                    name="role"
                    className="form-select form-select-solid fw-bold"
                    data-kt-select2="true"
                    data-placeholder="نقش را انتخاب کنید"
                    data-allow-clear="true"
                    data-hide-search="true"
                    onChange={handleRoleSelect}
                    value={selectedRoleName}
                    // disabled={loading}
                  >
                    <option value="">نقش را انتخاب کنید</option>
                    {roles.map((role, i) => (
                      <option key={i} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-center pt-10">
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
                    type="button" // Use type="button" to prevent form submission
                    className="btn btn-primary"
                    data-kt-users-modal-action="submit"
                    onClick={handleSaveRole}
                    disabled={
                      email === undefined || selectedRoleName === "" || loading
                    } // Disable save button if no user, no role selected, or loading
                  >
                    <span className="indicator-label">
                      {loading ? "در حال ذخیره..." : "ذخیره نقش"}{" "}
                      {/* Updated button text */}
                    </span>
                    {loading && (
                      <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
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

export { UserPermissionModal };
