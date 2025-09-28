import { FC, useEffect, useState } from "react";
import { KTIcon } from "../../../helpers";
import {
  getUserByEmail,
  getUserRole,
  updateUserRole,
  getUserLoginLogs,
  UserLoginLogDto
} from "../../../../app/modules/auth/core/_requests";
import Modal from "bootstrap/js/dist/modal";
import { ListsWidget5 } from "../../widgets";

type Permission = {
  permissionEnums: number;
  name: string;
  code: string;
  accuracy: number;
  lastModifiedDate: string;
  entryDate: string;
};

type UserRole = {
  name: string;
  permissions: Permission[];
};

const UserView: FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole[]>([]);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loginLogs, setLoginLogs] = useState<UserLoginLogDto[]>([]);

  useEffect(() => {
    const modalEl = document.getElementById("kt_modal_UserView");

    const handleShow = async (event: any) => {
      const button = event.relatedTarget;
      const userEmail = button?.getAttribute("data-user-email");
      const { data: user } = await getUserByEmail(userEmail);
      setUser(user);
      if (user && user.id) {
        try {
          const logsResponse = await getUserLoginLogs(user.id);
          setLoginLogs(logsResponse.items);
        } catch (error) {
          console.error("Failed to fetch login logs:", error);
        }
      }
    };

    modalEl?.addEventListener("show.bs.modal", handleShow);

    return () => {
      modalEl?.removeEventListener("show.bs.modal", handleShow);
    };
  }, []);

  const handleModify = async () => {
    const selectedRole = userRole[selectedRoleIndex];
    try {
      console.log(user.id, selectedRole.name),
        await updateUserRole(user.id, selectedRole.name);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  return (
    <div
      className="modal fade "
      id="kt_modal_UserView"
      aria-hidden="true"
      style={{ fontFamily: "sans" }}
      dir="rtl"
    >
      <div className="modal-dialog mw-650px">
        <div className="modal-content">
          <div className="modal-header pb-0 border-0 justify-content-end">
            <div
              className="btn btn-sm btn-icon btn-active-color-primary"
              data-bs-dismiss="modal"
            >
              <KTIcon iconName="cross" className="fs-1" />
            </div>
          </div>

          <div className="text-center mb-13">
            <h1 className="mb-3">
              اطلاعات کاربر: {user?.firstName} {user?.lastName}
            </h1>
            <div className="text-muted fw-bold fs-6 mb-5">{user?.email}</div>
          </div>

          <div className="card p-8 shadow-sm mb-8">
            <div className="d-flex align-items-center mb-8">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="profile"
                  className="rounded-circle me-5"
                  width={80}
                  height={80}
                />
              ) : (
                <div className="symbol symbol-80px me-5">
                  <div className="symbol-label fs-2 fw-semibold bg-light-primary text-primary">
                    {user?.firstName?.charAt(0)}
                  </div>
                </div>
              )}
              <div>
                <div className="fs-3 fw-bold text-gray-800">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-muted fw-semibold">{user?.email}</div>
              </div>
            </div>

            <div className="separator separator-dashed mb-5"></div>

            <div className="row g-5 mb-5">
              <div className="col-sm-6">
                <div className="fw-bold text-gray-600 mb-1">کد ملی:</div>
                <div className="text-gray-800 fw-semibold">{user?.nationalCode}</div>
              </div>
              <div className="col-sm-6">
                <div className="fw-bold text-gray-600 mb-1">شماره تلفن:</div>
                <div className="text-gray-800 fw-semibold">{user?.phoneNumber}</div>
              </div>
              <div className="col-sm-6">
                <div className="fw-bold text-gray-600 mb-1">نقش کاربر:</div>
                <div className="text-gray-800 fw-semibold">{user?.userGroup?.name}</div>
              </div>
              <div className="col-sm-6">
                <div className="fw-bold text-gray-600 mb-1">تاریخ ورود:</div>
                <div className="text-gray-800 fw-semibold">
                  {user?.entryDate ? new Date(user?.entryDate).toLocaleDateString('fa-IR') : 'N/A'}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="mb-4">تاریخچه‌ی ورود کاربر:</h4>
              {
                loginLogs && loginLogs.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {loginLogs.map((log, index) => {
                      try {
                        const date = new Date(log.loginTime);
                        
                        if (isNaN(date.getTime())) {
                          console.error("Invalid date string received:", log.loginTime);
                          const parts = log.loginTime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?/);
                          if (parts) {
                              date.setFullYear(parseInt(parts[1]));
                              date.setMonth(parseInt(parts[2]) - 1);
                              date.setDate(parseInt(parts[3]));
                              date.setHours(parseInt(parts[4]));
                              date.setMinutes(parseInt(parts[5]));
                              date.setSeconds(parseInt(parts[6]));
                              if (parts[7]) {
                                  date.setMilliseconds(parseInt(parts[7].substring(0, 3)));
                              }
                          }

                          if (isNaN(date.getTime())) {
                            return (
                              <li key={index} className="list-group-item text-danger">
                                تاریخ نامعتبر: {log.loginTime}
                              </li>
                            );
                          }
                        }
                        
                        return (
                          <li key={index} className="list-group-item d-flex align-items-center py-3">
                            <KTIcon iconName="time" className="fs-4 ms-3 badge-success" />
                            <div className="flex-grow-1">
                                {date.toLocaleString('fa-IR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false })}
                            </div>
                          </li>
                        );
                      } catch (parseError) {
                        console.error("Error processing date string:", log.loginTime, parseError);
                        return (
                          <li key={index} className="list-group-item text-danger">
                            خطا در نمایش تاریخ: {log.loginTime}
                          </li>
                        );
                      }
                    })}
                  </ul>
                ) : (
                  <p>لاگ ورود برای این کاربر یافت نشد.</p>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { UserView };

