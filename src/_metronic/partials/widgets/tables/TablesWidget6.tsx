import { FC, useEffect, useState, ReactNode } from "react";
import { KTIcon } from "../../../helpers";
import { UsersListSearchComponent } from "../../../../app/modules/apps/user-management/users-list/components/header/UsersListSearchComponent";
import {
  getAllPermissions,
  GetAllRoles,
  getAllUsers,
  getToken,
  SaveRolePermissions,
  searchUser,
  SetAccuracy,
  updateUserRole,
  PermissionEnums,
  decryptToJwt
} from "../../../../app/modules/auth/core/_requests";
import { toast } from "react-toastify";
// Import the new AssignRoleModal
// Remove imports for the old permission modals
// import { UserPermissionModal } from "../../modals/user-permissions/UserPermissionModal";
// import { UserPermission } from "../../modals/invite-users/UserPermission";
import Swal from "sweetalert2"; // Import SweetAlert2
import { UserPermissionModal } from "../../modals/user-permissions/UserPermissionModal";
import { AddRoleModal } from '../../modals/add-role/AddRoleModal';

export interface BaseDto {
  accuracy: number;
  lastModifiedDate: string;
  entryDate: string;
}

export interface RolesDto {
  name: string;
  permissions: PermissionDto[];
}

export interface PermissionDto extends BaseDto {
  permissionEnums: number;
  name: string;
  code: string;
}

export interface FilterPagingDto {
  totalRecords: number;
  totalPage: number;
  currentPage: number;
  pageSize: number;
}

export interface ListDto<T> {
  filterPagingDto: FilterPagingDto;
  items: T[];
}

export type GetRoleResponse = ListDto<RolesDto>;
export type PermissionDtoList = ListDto<PermissionDto>;

export interface UserDto extends BaseDto {
  userGroupName: ReactNode;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userGroup: {
    name: string;
  };
  userGroupId?: number;
}

export type UserResponse = ListDto<UserDto>;

export enum Accuracy {
  Accepted = 2,
  Pending = 1,
  Deleted = 3,
}

interface Props {
  className: string;
  selectedRoleFilter?: string;
}

const TablesWidget6: FC<Props> = ({ className, selectedRoleFilter }) => {
  const [users, setUsers] = useState<UserResponse | null>(null);
  const [showRolePermissionsModal, setShowRolePermissionsModal] = useState(false);
  // State for the new Assign Role modal
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  // State for the new Add Role modal
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  // Remove state for the old UserPermission modal
  // const [showUserPermissionModal, setShowUserPermissionModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState<FilterPagingDto>({
    totalRecords: 0,
    totalPage: 0,
    currentPage: 1,
    pageSize: 10,
  });
  // state کمکی برای ریست سلکت افزودن دسترسی
  const [addPermissionSelectValue, setAddPermissionSelectValue] = useState<string>("");

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers(getToken()!.toString());
      setUsers(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("خطا در بارگیری کاربران"); // Add error toast
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // به‌روزرسانی فیلتر شده کاربران وقتی فیلتر تغییر می‌کند
  useEffect(() => {
    // این useEffect برای به‌روزرسانی UI وقتی فیلتر تغییر می‌کند استفاده می‌شود
  }, [selectedRoleFilter]);

  const handleToggleAccuracy = async (
    email: string,
    currentAccuracy: Accuracy
  ) => {
    if (currentAccuracy === Accuracy.Deleted) {
      toast.info("نمی‌توان وضعیت کاربر حذف شده را تغییر داد.");
      return;
    }

    const newStatus = currentAccuracy === Accuracy.Pending; // true for Accepted, false for Pending
    const newStatusText = newStatus ? "تایید شده" : "در انتظار تایید";

    // Show SweetAlert confirmation
    Swal.fire({
      title: "آیا مطمئن هستید?",
      text: `وضعیت کاربر ${email} به "${newStatusText}" تغییر خواهد کرد.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "بله، تغییر وضعیت",
      cancelButtonText: "انصراف",
      customClass: {
        popup: "swal2-rtl-container", // Apply custom class to the popup
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Show loading SweetAlert
        Swal.fire({
          title: "در حال تغییر وضعیت...",
          text: "لطفا صبر کنید",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          await SetAccuracy(email, newStatus);

          // Update SweetAlert to show success
          Swal.fire({
            title: "موفقیت!",
            text: `وضعیت کاربر ${email} با موفقیت به ${newStatusText} تغییر یافت.`, // Use newStatusText
            icon: "success",
            customClass: {
              popup: "swal2-rtl-container", // Apply custom class
            },
          });
          // Refresh the user list after successful update
          // fetchUsers(); // Remove fetchUsers

          // Update the specific user in the local state
          setUsers((prevUsers) => {
            if (!prevUsers) return null;
            const updatedItems = prevUsers.items.map((user) => {
              if (user.email === email) {
                return {
                  ...user,
                  accuracy: newStatus ? Accuracy.Accepted : Accuracy.Pending,
                };
              }
              return user;
            });
            return { ...prevUsers, items: updatedItems };
          });
        } catch (error) {
          console.error("Error updating user accuracy:", error);
          // toast.error("خطا در تغییر وضعیت کاربر"); // Add error toast
          // Update SweetAlert to show error
          Swal.fire({
            title: "خطا!",
            text: "خطا در تغییر وضعیت کاربر رخ داد.",
            icon: "error",
            customClass: {
              popup: "swal2-rtl-container", // Apply custom class
            },
          });
        }
      }
    });
  };

  const getAccuracyText = (accuracy: Accuracy) => {
    switch (accuracy) {
      case Accuracy.Accepted:
        return "تایید شده";
      case Accuracy.Pending:
        return "در انتظار تایید";
      case Accuracy.Deleted:
        return "حذف شده";
      default:
        return "نامشخص";
    }
  };

  const getAccuracyClass = (accuracy: Accuracy) => {
    switch (accuracy) {
      case Accuracy.Accepted:
        return "badge badge-light-success";
      case Accuracy.Pending:
        return "badge badge-light-warning";
      case Accuracy.Deleted:
        return "badge badge-light-danger";
      default:
        return "badge badge-light-primary";
    }
  };

  const handleOpenRolePermissionsModal = () => {
    setShowRolePermissionsModal(true);
  };

  const handleCloseRolePermissionsModal = () => {
    setShowRolePermissionsModal(false);
  };

  // Handlers for the new Assign Role modal
  const handleOpenAssignRoleModal = (email: string) => {
    setEditingUserId(email);
    setShowAssignRoleModal(true);
  };

  const handleCloseAssignRoleModal = () => {
    setEditingUserId(undefined);
    setShowAssignRoleModal(false);
    // Optionally refresh user list after assigning role
    fetchUsers();
  };

  // Handlers for the new Add Role modal
  const handleOpenAddRoleModal = () => {
    setShowAddRoleModal(true);
  };

  const handleCloseAddRoleModal = () => {
    setShowAddRoleModal(false);
    // Optionally refresh roles list after adding a role
    // You might need a fetchRoles function and call it here
  };

  // Remove handlers for the old UserPermission modal
  // const handleOpenUserPermissionModal = (userId: number) => {
  //   setEditingUserId(userId);
  //   setShowUserPermissionModal(true);
  // };

  // const handleCloseUserPermissionModal = () => {
  //   setEditingUserId(undefined);
  //   setShowUserPermissionModal(false);
  // };

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

  // فیلتر کردن کاربران بر اساس نقش انتخاب شده
  const filteredUsers = users?.items.filter((user) => {
    if (!selectedRoleFilter) {
      return true; // نمایش همه کاربران اگر هیچ نقشی انتخاب نشده
    }
    
    // بررسی نقش کاربر
    const userRoleId = user.userGroupId;
    return userRoleId?.toString() === selectedRoleFilter;
  }) || [];

  // به‌روزرسانی تعداد کل رکوردها برای فیلتر شده
  const filteredUserResponse = users ? {
    ...users,
    items: filteredUsers,
    filterPagingDto: {
      ...users.filterPagingDto,
      totalRecords: filteredUsers.length
    }
  } : null;

  return (
    <>
      <div className={`card ${className}`}>
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold fs-3 mb-1">مدیریت کاربران</span>
            <span className="text-muted mt-1 fw-semibold fs-7">\n              {filteredUserResponse?.filterPagingDto.totalRecords || users?.filterPagingDto.totalRecords} کاربران یافت شدند
            </span>
          </h3>
          <div className="card-toolbar">
            <div
              className="d-flex justify-content-end"
              data-kt-user-table-toolbar="base"
            >
              <UsersListSearchComponent
                placeHolder="جستجو کاربران"
                onSearchResult={(users) => setUsers(users)}
              />
              {userHasAccess(PermissionEnums.ManageRolePermissionsButton) && (
                <button
                  type="button"
                  className="btn btn-light-primary ms-3"
                  onClick={handleOpenRolePermissionsModal}
                >
                  <KTIcon iconName="abstract-10" className="fs-2" />
                  مدیریت دسترسی نقش‌ها
                </button>
              )}
              {userHasAccess(PermissionEnums.AddNewRoleButton) && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOpenAddRoleModal}
                >
                  <KTIcon iconName="plus" className="fs-2" />
                  افزودن نقش جدید
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card-body py-3">
          <div className="tab-content">
            <div
              className="tab-pane fade show active"
              id="kt_table_widget_6_tab_1"
            >
              <div className="table-responsive">
                <table className="table align-middle gs-0 gy-3">
                  <thead>
                    <tr>
                      <th className="p-0 w-50px"></th>
                      <th className="p-0 min-w-150px">نام</th>
                      <th className="p-0 min-w-100px">نقش</th>
                      <th className="p-0 min-w-140px">آخرین ورود</th>
                      <th className="p-0 min-w-120px">وضعیت</th>
                      <th className="p-0 min-w-100px text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredUserResponse?.items || users?.items || []).map((user, i) => (
                      <tr key={i}>
                        <td>
                          <div className="symbol symbol-50px me-2">
                            <span className="symbol-label bg-light-primary">
                              <KTIcon
                                iconName="user"
                                className="fs-2x text-primary"
                              />
                            </span>
                          </div>
                        </td>
                        <td>
                          <a
                            href="#"
                            className="text-gray-900 fw-bold text-hover-primary mb-1 fs-6"
                          >
                            {user.email}
                          </a>
                          <span className="text-muted fw-semibold d-block fs-7">
                            {user.firstName} {user.lastName}
                          </span>
                        </td>
                        <td>
                          <span className="text-gray-900 fw-bold d-block fs-7">
                            {user.userGroup?.name || user.userGroupName}
                          </span>
                        </td>
                        <td className="text-end">
                          <span className="text-muted fw-semibold d-block fs-8">
                            آخرین ورود
                          </span>
                          <span className="text-gray-900 fw-bold d-block fs-7">
                            {new Date(user.lastModifiedDate).toLocaleDateString(
                              "fa-IR"
                            )}
                          </span>
                        </td>
                        <td className="text-end">
                          <span
                            className={`${getAccuracyClass(
                              user.accuracy
                            )} fs-7 fw-bold`}
                          >
                            {getAccuracyText(user.accuracy)}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-3 flex-shrink-0 text-start">
                            {userHasAccess(PermissionEnums.ViewUserInfoButton) && (
                              <a
                                href="#"
                                className="btn btn-sm btn-light-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#kt_modal_UserView"
                                data-user-email={user.email}
                                title="مشاهده اطلاعات کاربر"
                              >
                                <KTIcon iconName="user-square" className="fs-3" />
                              </a>
                            )}
                            {userHasAccess(PermissionEnums.AssignRoleToUserButton) && (
                              <a
                                href="#"
                                className="btn btn-sm btn-light-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#kt_modal_assign_role"
                                data-user-email={user.email}
                                onClick={() => handleOpenAssignRoleModal(user.email)}
                                title="تخصیص نقش کاربر"
                              >
                                <KTIcon iconName="user-edit" className="fs-3" />
                              </a>
                            )}
                            {user.accuracy !== Accuracy.Deleted && userHasAccess(PermissionEnums.ChangeUserStatusButton) && (
                              <button
                                type="button"
                                className="btn btn-sm btn-light-primary"
                                onClick={() => handleToggleAccuracy(user.email, user.accuracy)}
                              >
                                تغییر وضعیت
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RolePermissionsModal
        show={showRolePermissionsModal}
        handleClose={handleCloseRolePermissionsModal}
      />
      {/* Use the new AssignRoleModal */}
      <UserPermissionModal
        show={showAssignRoleModal}
        handleClose={handleCloseAssignRoleModal}
        email={editingUserId}
      />
      {/* New Add Role Modal */}
      <AddRoleModal
        show={showAddRoleModal}
        handleClose={handleCloseAddRoleModal}
      />
      {/* Remove the old UserPermissionModal and UserPermission components */}
      {/* <UserPermissionModal
        show={showUserPermissionModal}
        handleClose={handleCloseUserPermissionModal}
        userId={editingUserId}
      /> */}
      {/* <UserPermission
        show={showUserPermissionModal}
        handleClose={handleCloseUserPermissionModal}
        userId={editingUserId}
      /> */}
    </>
  );
};

interface RolePermissionsModalProps {
  show: boolean;
  handleClose: () => void;
}

const RolePermissionsModal: FC<RolePermissionsModalProps> = ({
  show,
  handleClose,
}) => {
  const [roles, setRoles] = useState<RolesDto[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionDto[]>([]);
  const [selectedRole, setSelectedRole] = useState<RolesDto | null>(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<
    PermissionDto[]
  >([]);
  const [availablePermissionsToAdd, setAvailablePermissionsToAdd] = useState<
    PermissionDto[]
  >([]);
  const [loading, setLoading] = useState(false); // Loading state
  // state کمکی برای ریست سلکت افزودن دسترسی
  const [addPermissionSelectValue, setAddPermissionSelectValue] = useState<string>("");

  useEffect(() => {
    // Fetch roles and permissions when the modal is shown
    if (show) {
      const fetchRolesAndPermissions = async () => {
        setLoading(true);
        try {
          const rolesResponse = await GetAllRoles(); // Implement this function in _requests.ts
          setRoles(rolesResponse.items);
          const permissionsResponse = await getAllPermissions(); // Implement this function in _requests.ts
          setAllPermissions(permissionsResponse.items);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoading(false);
          // Handle error (e.g., show error message)
        }
      };

      fetchRolesAndPermissions();
    } else {
      // Reset state when modal is hidden
      setRoles([]);
      setAllPermissions([]);
      setSelectedRole(null);
      setSelectedRolePermissions([]);
      //setAvailablePermissionsToAdd([]);
    }
  }, [show]);

  useEffect(() => {
    if (selectedRole) {
      setSelectedRolePermissions(selectedRole.permissions || []);
      const currentlyAssignedCodes = new Set((selectedRole.permissions || []).map((p) => p.code));
      const permissionsToAddToDropdown = allPermissions.filter(
        (permission) => !currentlyAssignedCodes.has(permission.code)
      );
      setAvailablePermissionsToAdd(allPermissions);
    } else {
      setSelectedRolePermissions([]);
      //setAvailablePermissionsToAdd([]);
    }
  }, [selectedRole, allPermissions]);

  const handleRoleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const roleName = event.target.value;
    console.log(roleName);
    const role = roles.find((r) => r.name === roleName) || null;
    console.log(role);
    setSelectedRole(role);
  };

  const handleAddPermission = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const permissionId = parseInt(event.target.value, 10);
    const permissionToAdd = availablePermissionsToAdd.find(
      (p) => p.permissionEnums === permissionId
    );
    if (permissionToAdd && selectedRole) {
      const updatedPermissions = [...selectedRolePermissions, permissionToAdd];
      setSelectedRolePermissions(updatedPermissions);
      setAddPermissionSelectValue(""); // ریست سلکت بعد از افزودن
    }
  };

  const handleRemovePermission = (permissionCode: string) => {
    const permissionToRemove = selectedRolePermissions.find(
      (p) => p.name === permissionCode
    );
    if (permissionToRemove && selectedRole) {
      const updatedPermissions = selectedRolePermissions.filter(
        (p) => p.name !== permissionCode
      );
      setSelectedRolePermissions(updatedPermissions);
      // بازگرداندن دسترسی حذف‌شده به لیست قابل افزودن
      //setAvailablePermissionsToAdd([...availablePermissionsToAdd, permissionToRemove]);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) {
      console.warn("No role selected to save permissions.");
      return;
    }

    setLoading(true);

    // Prepare data for the save request - ensure this matches your backend's expected format
    const permissionsToSave = selectedRolePermissions.map((p) => ({
      // Include necessary fields for your backend
      permissionEnums: p.permissionEnums,
      name: p.name,
      code: p.code,
      accuracy: p.accuracy,
      lastModifiedDate: p.lastModifiedDate,
      entryDate: p.entryDate,
    }));

    const dataToSave = {
      UserGroupName: selectedRole.name,
      permissions: permissionsToSave,
    };

    try {
      // TODO: Implement the actual backend API endpoint for saving role permissions in _requests.ts
      console.log(dataToSave);
      await SaveRolePermissions(dataToSave);
      toast.success("Permissions saved successfully!"); // Placeholder success message
      setLoading(false);
      handleClose(); // Close modal on success
    } catch (error) {
      toast.error("Error saving permissions:");
      setLoading(false);
    }
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : ""}`}
      id="kt_modal_role_permissions" // Matching ID from the button in TablesWidget6
      tabIndex={-1}
      aria-hidden="true"
      // style={{
      //   display: show ? "block" : "none",
      //   backgroundColor: "rgba(0, 0, 0, 0.5)",
      // }} // Add background overlay
    >
      <div className="modal-dialog modal-dialog-centered mw-650px">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="fw-bold">مدیریت دسترسی نقش‌ها</h2>
            <div
              className="btn btn-icon btn-sm btn-active-icon-primary"
              data-kt-users-modal-action="close"
              onClick={handleClose}
            >
              <KTIcon iconName="cross" className="fs-1" />
            </div>
          </div>
          <div className="modal-body scroll-y mx-5 mx-xl-15 pb-10">
            {loading && !roles.length && !allPermissions.length ? ( // Show initial loading spinner
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
                id="kt_modal_role_permissions_form"
                className="form"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="mb-7">
                  <label className="fs-6 fw-semibold mb-2">
                    <span>نقش را انتخاب کنید</span>
                    <i
                      className="fas fa-exclamation-circle ms-1 fs-7"
                      data-bs-toggle="tooltip"
                      title="نقشی که می‌خواهید دسترسی‌های آن را ویرایش کنید انتخاب کنید"
                    ></i>
                  </label>
                  <select
                    name="role"
                    className="form-select form-select-solid fw-bold"
                    data-kt-select2="true" // Assuming you have Select2 initialized or a similar library
                    data-placeholder="نقش را انتخاب کنید"
                    data-allow-clear="true"
                    data-kt-user-table-filter="role"
                    data-hide-search="true"
                    onChange={handleRoleSelect}
                    value={selectedRole?.name || ""}
                    disabled={loading}
                  >
                    <option value="">نقش را انتخاب کنید</option>
                    {roles.map((role, i) => (
                      <option key={i} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRole && (
                  <>
                    <div className="mb-7">
                      <label className="fs-6 fw-semibold mb-2">
                        دسترسی‌های فعلی نقش:
                      </label>
                      <div className="border border-dashed border-gray-300 rounded p-3">
                        {selectedRolePermissions.length > 0 ? (
                          <ul className="list-group">
                            {selectedRolePermissions.map((permission, i) => (
                              <li
                                key={i}
                                className="list-group-item d-flex justify-content-between align-items-center"
                              >
                                {permission.code} ({permission.name})
                                <button
                                  type="button"
                                  className="btn btn-sm btn-light-danger"
                                  onClick={() =>
                                    handleRemovePermission(permission.name)
                                  }
                                  disabled={loading}
                                >
                                  حذف
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted">
                            این نقش هیچ دسترسی ندارد.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-10">
                      <label className="fs-6 fw-semibold mb-2">
                        <span>افزودن دسترسی جدید</span>
                        <i
                          className="fas fa-exclamation-circle ms-1 fs-7"
                          data-bs-toggle="tooltip"
                          title="دسترسی جدید برای این نقش انتخاب کنید"
                        ></i>
                      </label>
                      <select
                        name="add_permission"
                        className="form-select form-select-solid fw-bold"
                        data-kt-select2="true"
                        data-placeholder="دسترسی برای افزودن انتخاب کنید"
                        data-allow-clear="true"
                        data-hide-search="true"
                        onChange={handleAddPermission}
                        value={addPermissionSelectValue}
                        disabled={
                          availablePermissionsToAdd.length === 0 || loading
                        }
                      >
                        <option value="">دسترسی برای افزودن انتخاب کنید</option>
                        {availablePermissionsToAdd.map((permission, i) => (
                          <option key={i} value={permission.permissionEnums}>
                            {permission.name} ({permission.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

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
                    onClick={handleSavePermissions}
                    disabled={!selectedRole || loading} // Disable save button if no role is selected or loading
                  >
                    <span className="indicator-label">
                      {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
                    </span>
                    {loading && ( // Show spinner if loading
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

interface AssignRoleModalProps {
  show: boolean;
  handleClose: () => void;
  userId: string | undefined;
}

// Placeholder for AssignRoleModal - Replace with actual component
const AssignRoleModal: FC<AssignRoleModalProps> = ({
  show,
  handleClose,
  userId,
}) => {
  // Implement assign role logic here

  return (
    <div
      className={`modal fade ${show ? "show d-block" : ""}`}
      id="kt_modal_assign_role"
      tabIndex={-1}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered mw-650px">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="fw-bold">Assign Role to User</h2>
            <div
              className="btn btn-icon btn-sm btn-active-icon-primary"
              data-kt-users-modal-action="close"
              onClick={handleClose}
            >
              <KTIcon iconName="cross" className="fs-1" />
            </div>
          </div>
          <div className="modal-body scroll-y mx-5 mx-xl-15 pb-10">
            <p>Assign role form for user ID: {userId}</p>
            {/* Add your assign role form here */}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-light"
              onClick={handleClose}
            >
              Close
            </button>
            {/* Add save button here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export { TablesWidget6, RolePermissionsModal, AssignRoleModal };
