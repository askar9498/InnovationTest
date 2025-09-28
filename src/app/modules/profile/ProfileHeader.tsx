import React from "react";
import { KTIcon, toAbsoluteUrl } from "../../../_metronic/helpers";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../modules/auth/core/Auth";

const ProfileHeader: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  return (
    <>
      <div style={{ fontFamily: "sans" }} dir={"rtl"}>
        <div className="card mb-5 mb-xl-10">
          <div className="card-body pt-9 pb-0">
            <div className="d-flex flex-wrap flex-sm-nowrap mb-3">
              <div className="me-7 mb-4">
                <div className="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative">
                  <img
                    src={toAbsoluteUrl("/media/avatars/300-1.jpg")}
                    alt="تصویر پروفایل"
                  />
                  <div className="position-absolute translate-middle bottom-0 start-100 mb-6 bg-success rounded-circle border border-4 border-white h-20px w-20px"></div>
                </div>
              </div>

              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                  <div className="d-flex flex-column">
                    <div className="d-flex align-items-center mb-2">
                      <a
                        href="#"
                        className="text-gray-800 text-hover-primary fs-2 fw-bolder me-1"
                      >
                        {currentUser?.firstName} {currentUser?.lastName}
                      </a>
                      <a href="#">
                        <KTIcon
                          iconName="verify"
                          className="fs-1 text-primary"
                        />
                      </a>
                    </div>

                    <div className="d-flex flex-wrap fw-bold fs-6 mb-4 pe-2">
                      <a
                        href="#"
                        className="d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2"
                      >
                        <KTIcon
                          iconName="profile-circle"
                          className="fs-4 me-1"
                        />
                        {currentUser?.educationLevel || "کاربر"}
                      </a>
                      <a
                        href="#"
                        className="d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2"
                      >
                        <KTIcon iconName="geolocation" className="fs-4 me-1" />
                        ایران
                      </a>
                      <a
                        href="#"
                        className="d-flex align-items-center text-gray-500 text-hover-primary mb-2"
                      >
                        <KTIcon iconName="sms" className="fs-4 me-1" />
                        {currentUser?.email}
                      </a>
                    </div>
                  </div>

                  <div className="d-flex my-4">
                    <Link
                      to="/complete-profile"
                      className="btn btn-sm btn-light me-2"
                    >
                      <KTIcon iconName="pencil" className="fs-3 me-1" />
                      تکمیل پروفایل
                    </Link>
                  </div>
                </div>

                <div className="d-flex flex-wrap flex-stack">
                  <div className="d-flex flex-column flex-grow-1 pe-8">
                    <div className="d-flex flex-wrap">
                      <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                        <div className="d-flex align-items-center">
                          <KTIcon
                            iconName="document"
                            className="fs-3 text-primary me-2"
                          />
                          <div className="fs-2 fw-bolder">۰</div>
                        </div>

                        <div className="fw-bold fs-6 text-gray-500">
                          پروپوزال‌های ارسالی
                        </div>
                      </div>

                      <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                        <div className="d-flex align-items-center">
                          <KTIcon
                            iconName="check-circle"
                            className="fs-3 text-success me-2"
                          />
                          <div className="fs-2 fw-bolder">۰</div>
                        </div>

                        <div className="fw-bold fs-6 text-gray-500">
                          پروپوزال‌های تایید شده
                        </div>
                      </div>

                      <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                        <div className="d-flex align-items-center">
                          <KTIcon
                            iconName="star"
                            className="fs-3 text-warning me-2"
                          />
                          <div className="fs-2 fw-bolder">۰</div>
                        </div>

                        <div className="fw-bold fs-6 text-gray-500">
                          امتیاز کل
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center w-200px w-sm-300px flex-column mt-3">
                    <div className="d-flex justify-content-between w-100 mt-auto mb-2">
                      <span className="fw-bold fs-6 text-gray-500">
                        تکمیل پروفایل
                      </span>
                      <span className="fw-bolder fs-6">۵۰٪</span>
                    </div>
                    <div className="h-5px mx-3 w-100 bg-light mb-3">
                      <div
                        className="bg-success rounded h-5px"
                        role="progressbar"
                        style={{ width: "50%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card mb-5 mb-xl-10" id="kt_profile_details_view">
          <div className="card-header cursor-pointer bg-secondary">
            <div className="card-title m-0">
              <h3 className="fw-bolder m-0">جزئیات پروفایل</h3>
            </div>
          </div>

          <div className="card-body p-9">
            <div className="row mb-7">
              <label className="col-lg-4 fw-bold text-muted">نام و نام خانوادگی</label>

              <div className="col-lg-8">
                <span className="fw-bolder fs-6 text-gray-900">
                  {currentUser?.firstName} {currentUser?.lastName}
                </span>
              </div>
            </div>

            <div className="row mb-7">
              <label className="col-lg-4 fw-bold text-muted">مدرک تحصیلی</label>

              <div className="col-lg-8 fv-row">
                <span className="fw-bold fs-6">{currentUser?.educationLevel || "ثبت نشده"}</span>
              </div>
            </div>

            <div className="row mb-7">
              <label className="col-lg-4 fw-bold text-muted">
                شماره موبایل
                <i
                  className="fas fa-exclamation-circle ms-1 fs-7"
                  data-bs-toggle="tooltip"
                  title="شماره موبایل باید فعال باشد"
                ></i>
              </label>

              <div className="col-lg-8 d-flex align-items-center">
                <span className="fw-bolder fs-6 me-2">{currentUser?.phoneNumber || "ثبت نشده"}</span>

                <span className="badge badge-success">تایید شده</span>
              </div>
            </div>

            <div className="row mb-7">
              <label className="col-lg-4 fw-bold text-muted">
                ایمیل
              </label>

              <div className="col-lg-8">
                <a
                  href="#"
                  className="fw-bold fs-6 text-gray-900 text-hover-primary"
                >
                  {currentUser?.email}
                </a>
              </div>
            </div>

            <div className="row mb-7">
              <label className="col-lg-4 fw-bold text-muted">
                تخصص‌ها
              </label>

              <div className="col-lg-8">
                <span className="fw-bolder fs-6 text-gray-900">
                  {Array.isArray(currentUser?.expertise) ? currentUser.expertise.join("، ") : "ثبت نشده"}
                </span>
              </div>
            </div>

            <div className="row mb-7">
              <label className="col-lg-4 fw-bold text-muted">
                علاقه‌مندی‌ها
              </label>

              <div className="col-lg-8">
                <span className="fw-bolder fs-6 text-gray-900">
                  {Array.isArray(currentUser?.interests) ? currentUser.interests.join("، ") : "ثبت نشده"}
                </span>
              </div>
            </div>

            <div className="notice d-flex bg-light-warning rounded border-warning border border-dashed p-6">
              <KTIcon
                iconName="information-5"
                className="fs-2tx text-warning me-4"
              />
              <div className="d-flex flex-stack flex-grow-1">
                <div className="fw-bold">
                  <h4 className="text-gray-800 fw-bolder">
                    نیاز به توجه شما!
                  </h4>
                  <div className="fs-6 text-gray-600">
                    جهت ارسال پروپوزال میبایست پروفایل خود را تکمیل نمایید.
                    <Link className="fw-bolder" to="/complete-user-info">
                      {" "}
                      تکمیل پروفایل
                    </Link>
                    .
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { ProfileHeader };
