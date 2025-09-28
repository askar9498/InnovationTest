import { FC, useEffect, useState } from "react";
import { KTIcon } from "../../../helpers";
import {
  getUserByEmail,
  getUserRole,
  updateUserRole,
} from "../../../../app/modules/auth/core/_requests";
import { toast } from "react-toastify";

type Permission = {
  permissionEnums: number;
  name: string;
  code: string;
  accuracy: number;
  lastModifiedDate: string;
  entryDate: string;
  email: string;
};

type UserRole = {
  name: string;
  permissions: Permission[];
};

// Define a type for the user data needed in this modal
type TargetUser = {
    id: string; // Assuming user id is string based on updateUserRole call and API response
    firstName: string;
    lastName: string;
    userGroup: {
        name: string;
    };
    email: string;
};

type Props = {
  show: boolean;
  handleClose: () => void;
  userId: number | undefined;
};

const UserPermission: FC<Props> = ({ show, handleClose }) => {
  const [targetUser, setTargetUser] = useState<TargetUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole[]>([]);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      console.log("useEffect triggered, show:", show);
      if (show) {
        setLoading(true);
        try {
          // Fetch roles first
          const rolesResponse = await getUserRole();
          setUserRole(rolesResponse.data.items);

          // --- Fetch Target User Data from Data Attribute ---
          const modalElement = document.getElementById('kt_modal_UserPermission');
          if (modalElement) {
            modalElement.addEventListener('shown.bs.modal', async (event: any) => {
                const button = event.relatedTarget;
                const userEmail = button?.getAttribute('data-user-email');

                if (userEmail) {
                    try {
                        const userResponse = await getUserByEmail(userEmail);
                        const userData: TargetUser = userResponse.data;
                        setTargetUser(userData);

                        // Set initial role based on fetched user data
                        if (userData?.userGroup?.name && rolesResponse.data?.items) {
                            const initialRoleIndex = rolesResponse.data.items.findIndex((role: UserRole) => role.name === userData.userGroup.name);
                            if(initialRoleIndex !== -1) {
                                setSelectedRoleIndex(initialRoleIndex);
                            } else {
                                setSelectedRoleIndex(0); // Default to first role if user's role not found
                                console.warn("User's current role not found in the fetched roles list.");
                            }
                        } else {
                            setSelectedRoleIndex(0); // Default to first role if user data is incomplete
                        }
                    } catch (error) {
                        toast.error(`Failed to load user data for email ${userEmail}.`);
                        setTargetUser(null);
                        setSelectedRoleIndex(0);
                    } finally {
                         setLoading(false);
                    }
                } else {
                    toast.error("User email not available to load data.");
                    setTargetUser(null);
                    setSelectedRoleIndex(0);
                    setLoading(false);
                }
            }, { once: true });
          } else {
              setLoading(false);
          }
        } catch (error) {
          toast.error("Failed to load roles data.");
          setLoading(false);
        }
      } else if (!show) {
          setTargetUser(null);
          setUserRole([]);
          setSelectedRoleIndex(0);
      }
    };

    fetchData();
  }, [show, handleClose]);

  const handleModify = async () => {
    const selectedRole = userRole[selectedRoleIndex];

    if (!targetUser || !selectedRole) {
        toast.error("User or role data not loaded.");
        return;
    }
    setLoading(true);
    try {
      await updateUserRole(targetUser.id, selectedRole.name);
      toast.success("User permissions updated successfully!");
      handleClose;
    } catch (error) {
      toast.error(
        "An error occurred while updating user permissions. Please try again."
      );
    } finally {
        setLoading(false);
        console.log("Setting loading to false after update.");
        handleClose;
    }
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : ""}`}
      id="kt_modal_UserPermission"
      tabIndex={-1}
      aria-hidden={!show}
      dir="rtl"
      style={{
        fontFamily: "sans",
        display: show ? "block" : "none",
        backgroundColor: show ? "rgba(0, 0, 0, 0.5)" : "unset",
      }}
    >
      <div className="modal-dialog mw-650px">
        <div className="modal-content">
          <div className="modal-header pb-0 border-0 justify-content-end">
            <div
              className="btn btn-sm btn-icon btn-active-color-primary"
              data-bs-dismiss="modal"
              onClick={handleClose}
            >
              <KTIcon iconName="cross" className="fs-1" />
            </div>
          </div>
          <div className="modal-body scroll-y mx-5 mx-xl-18 pt-0 pb-15">
            <div className="text-center mb-13">
              <h1 className="mb-3">
                دسترسی برای: {targetUser?.firstName} {targetUser?.lastName}
              </h1>
              <div className="text-muted fw-bold fs-5">
                نقش فعلی: {targetUser?.userGroup?.name}
              </div>
            </div>

            <div className="btn fw-bolder w-100 mb-8">
              <div className="mb-10">
                <label className="form-label fw-bold">نقش:</label>

                <div>
                  <select
                    className="form-select form-select-solid"
                    data-kt-select2="true"
                    data-placeholder="انتخاب نقش"
                    data-allow-clear="true"
                    value={selectedRoleIndex}
                    onChange={(e) =>
                      setSelectedRoleIndex(Number(e.target.value))
                    }
                    disabled={loading || !targetUser}
                  >
                     {userRole.length > 0 ?
                      userRole.map((role, index) => (
                        <option key={index} value={index}>
                          {role.name}
                        </option>
                      ))
                      : <option value={0} disabled>Loading roles...</option>
                      }
                  </select>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleModify}
                disabled={loading || !targetUser || userRole.length === 0}
              >
                {loading ? (
                  <>
                    <span className="indicator-label">بروزرسانی شد</span>
                    <span className="indicator-progress d-block">
                      لطفا صبر کنید...
                      <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                    </span>
                  </>
                ) : (
                  "بروزرسانی نقش"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { UserPermission };
