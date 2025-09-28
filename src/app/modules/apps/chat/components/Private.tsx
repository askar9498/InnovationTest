import { FC, useEffect, useState } from "react";
import { KTIcon, toAbsoluteUrl } from "../../../../../_metronic/helpers";
import { ChatInner } from "../../../../../_metronic/partials";
import {
  UserDto,
  UserResponse,
} from "../../../../../_metronic/partials/widgets/tables/TablesWidget6";
import axios from "axios";
import { getToken } from "../../../auth/core/_requests";
import { getApiUrl } from "../../../../../config/api";

const Private: FC = () => {
  const [users, setUsers] = useState<UserResponse>();
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

  const getUsers = async (token: string) => {
    try {
      const res = await axios.get(getApiUrl("/api/user/GetAll"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.error("خطا در دریافت لیست کاربران:", error);
      return;
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const token = getToken();
      if (token) {
        const userData = await getUsers(token);
        if (userData) {
          setUsers(userData);
        } else {
          console.error("داده‌ای از کاربران دریافت نشد");
        }
      } else {
        console.error("توکن یافت نشد");
      }
    };

    fetchUsers();
  }, []);

  return (
    <>
      <div className="d-flex flex-column flex-lg-row" dir="rtl" style={{fontFamily : "sans"}}>
        {users?.items && users.items.length > 0 && (
          <div className="flex-column flex-lg-row-auto w-100 w-lg-300px w-xl-400px mb-10 mb-lg-0">
            <div className="card card-flush">
              <div className="card-header pt-7 bg-secondary" id="kt_chat_contacts_header">
                <form className="w-100 position-relative" autoComplete="off">
                  <KTIcon
                    iconName="magnifier"
                    className="fs-2 text-lg-1 text-gray-500 position-absolute top-50 ms-5 translate-middle-y"
                  />

                  <input
                    type="text"
                    className="form-control form-control-solid px-15"
                    name="search"
                    placeholder="جستجو بر اساس نام کاربری یا ایمیل..."
                  />
                </form>
              </div>

              <div className="card-body pt-5" id="kt_chat_contacts_body">
                <div
                  className="scroll-y me-n5 pe-5 h-200px h-lg-auto"
                  data-kt-scroll="true"
                  data-kt-scroll-activate="{default: false, lg: true}"
                  data-kt-scroll-max-height="auto"
                  data-kt-scroll-dependencies="#kt_header, #kt_toolbar, #kt_footer, #kt_chat_contacts_header"
                  data-kt-scroll-wrappers="#kt_content, #kt_chat_contacts_body"
                  data-kt-scroll-offset="0px"
                >
                  {users.items.map((user, i) => (
                    <UserRowForChat 
                      key={i} 
                      user={user} 
                      isSelected={selectedUser?.id === user.id}
                      onClick={() => setSelectedUser(user)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`flex-lg-row-fluid ${users?.items && users.items.length > 0 ? 'ms-lg-7 ms-xl-10' : ''}`}>
          <div className="card" id="kt_chat_messenger">
            <div className="card-header" id="kt_chat_messenger_header">
              <div className="card-title">
                <div className="symbol-group symbol-hover"></div>
                <div className="d-flex justify-content-center flex-column me-3">
                  {selectedUser ? (
                    <>
                      <a
                        href="#"
                        className="fs-4 fw-bolder text-gray-900 text-hover-primary me-1 mb-2 lh-1"
                      >
                        {selectedUser.firstName} {selectedUser.lastName}
                      </a>

                      <div className="mb-0 lh-1">
                        <span className="badge badge-success badge-circle w-10px h-10px me-1"></span>
                        <span className="fs-7 fw-bold text-gray-500">آنلاین</span>
                      </div>
                    </>
                  ) : (
                    <div className="fs-4 fw-bolder text-gray-900 me-1 mb-2 lh-1">
                      برای شروع گفتگو، لطفاً از لیست کاربران، مخاطب مورد نظر خود را انتخاب کنید
                    </div>
                  )}
                </div>
              </div>

              <div className="card-toolbar">
              </div>
            </div>
            <ChatInner />
          </div>
        </div>
      </div>
    </>
  );
};

interface UserRowValue {
  user: UserDto;
  isSelected?: boolean;
  onClick?: () => void;
}

export const UserRowForChat: FC<UserRowValue> = ({ user, isSelected, onClick }) => {
  return (
    <>
      <div 
        className={`d-flex flex-stack py-4 cursor-pointer ${isSelected ? 'bg-light-primary' : ''}`}
        onClick={onClick}
      >
        <div className="d-flex align-items-center">
          <div className="symbol symbol-45px symbol-circle">
            <img alt="تصویر پروفایل" src={toAbsoluteUrl("/media/svg/avatars/001-boy.svg")} />
          </div>

          <div className="ms-5">
            <a
              href="#"
              className="fs-5 fw-bolder text-gray-900 text-hover-primary mb-2"
            >
              {user.firstName} {user.lastName}
            </a>
            <div className="fw-bold text-gray-500">{user.email}</div>
          </div>
        </div>

        <div className="d-flex flex-column align-items-end ms-2">
          <span className="text-muted fs-7 mb-1">۲ ساعت پیش</span>
          <span className="badge badge-sm badge-circle badge-light-success">
            ۶
          </span>
        </div>
      </div>

      <div className="separator separator-dashed d-none"></div>
    </>
  );
};

export { Private };
