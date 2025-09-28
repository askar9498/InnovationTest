import React, { FC, useEffect, useState } from "react";
import { KTIcon } from "../../../helpers";
import "@fontsource/lalezar";
import { BlogSearchComponent } from "../../../../app/modules/apps/user-management/users-list/components/header/BlogSearchComponent";
import {
  getAllPosts,
  getToken,
  SearchBlog,
  RemoveBlog,
  GetAllCategories,
  decryptToJwt,
  PermissionEnums,
  SetPublicRelationsUnitRequest,
} from "../../../../app/modules/auth/core/_requests";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// Types
import { BaseDto, FilterPagingDto, UserResponse } from "./TablesWidget6";
import { AddBlog } from "../../modals/AddBlog";
import { GetBaseUrl, GetWebSiteUrl } from "../../../../config/api";

export interface BlogRowValue {
  blog: BlogDto;
  onDelete: (title: string) => void;
  fetchPosts: () => Promise<void>;
}

export interface BlogDto extends BaseDto {
  isAcceptedByPublicRelations: boolean;
  content: any;
  PublicRelationsUnit: string;
  postCategoryType: string;
  viewCount: string;
  publishTime: string;
  subTitle: string;
  title: string;
  Content: string;
  Status: string;
  publicRelationsUnit: boolean;
  publicRelationsUnitId: number | null;
  AcceptMember: string;
  IsPublished: string;
  postImage: string | { fileName: string };
  id: number;
}

export interface ListDto<T> {
  filterPagingDto: FilterPagingDto;
  items: T[];
}

export type BlogResponse = ListDto<BlogDto>;

// Toast functions
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    position: "top-center",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Constants
const BASE_URL = GetBaseUrl();

// BlogRow component
const BlogRow: FC<BlogRowValue> = ({ blog, onDelete, fetchPosts }) => {
  const [userGroupId, setUserGroupId] = useState<number | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const data = decryptToJwt(token.toString());
      console.log("data",data);
      setUserGroupId(data.userGroupId);
    }
  }, []);

  const handlePreview = () => {
    // Collect data for PostPreviewDto
    const postData = {
      Title: blog.title,
      ImageUrl: blog.postImage
        ? GetBaseUrl() +
          (typeof blog.postImage === "string"
            ? blog.postImage.replace(/\\/g, "/")
            : blog.postImage.fileName.replace(/\\/g, "/"))
        : "", // Empty string if no image
      Category: blog.postCategoryType,
      Author: "Unknown Author", // Placeholder, as author is not in formik.values
      PublishDate: blog.publishTime,
      Content: blog.content,
    };

    // Create a form element
    const form = document.createElement("form");
    form.method = "POST";
    form.action = GetWebSiteUrl() + "/Blog/preview";
    form.target = "_blank"; // Open in a new tab

    // Append hidden input fields for each data property
    for (const key in postData) {
      if (Object.prototype.hasOwnProperty.call(postData, key)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = `Post.${key}`;
        input.value = (postData as any)[key];
        form.appendChild(input);
      }
    }

    // Append the form to the body and submit
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form); // Clean up the form
    const encodedTitle = encodeURIComponent(blog.title);
    window.open(`/blog-preview/${encodedTitle}`, "_blank");
  };

  return (
    <tr>
      <td>
        <div className="d-flex align-items-center">
          <div className="symbol symbol-45px me-5">
            <p
              className={`badge ms-2 ${
                new Date(blog.publishTime) < new Date()
                  ? "badge-light-success"
                  : "badge-light-danger"
              }`}
            >
              {new Date(blog.publishTime) < new Date()
                ? "منتشر شده"
                : "عدم انتشار"}
            </p>
            <img
              src={
                BASE_URL +
                (typeof blog.postImage === "string"
                  ? blog.postImage.replace(/\\/g, "/")
                  : blog.postImage.fileName.replace(/\\/g, "/"))
              }
              alt="Post"
            />
          </div>
          <div className="d-flex justify-content-start flex-column px-7">
            <a href="#" className="text-gray-900 text-hover-primary">
              {blog.title}
            </a>
            <span className="text-muted fw-semibold d-block fs-7 w-auto pt-1">
              {blog.subTitle}
            </span>
          </div>
        </div>
      </td>

      <td>
        <span className="text-gray-900 d-block fs-6">
          {blog.postCategoryType}
        </span>
      </td>
      <td>
        <span className="text-gray-900 d-block fs-6">
          <span className={`badge ${blog.isAcceptedByPublicRelations ? "badge-light-success" : "badge-light-danger"}`}>
            {blog.isAcceptedByPublicRelations ? "بله" : "خیر"}
          </span>
        </span>
      </td>
      <td className="text-end">
        <div className="text-center mb-2">
          <span className="text-muted me-2 fs-7 fw-semibold">
            {blog.viewCount}
          </span>
        </div>
      </td>
      <td className="text-end">
        <div className="text-center mb-2">
          <span className="text-muted me-2 fs-7 fw-semibold">
            {blog.publishTime}
          </span>
        </div>
      </td>
      <td>
        <div className="d-flex justify-content-center gap-3 flex-shrink-0 text-start">
          {userHasAccess(PermissionEnums.DeletePost) && (
            <ActionButton
              icon="trash"
              onClick={() => {
                Swal.fire({
                  title: "آیا مطمئن هستید?",
                  text: "آیا از حذف این پست اطمینان دارید؟",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "بله، حذف کن",
                  cancelButtonText: "انصراف",
                  customClass: {
                    popup: "swal2-rtl-container",
                  },
                }).then(async (result) => {
                  if (result.isConfirmed) {
                    // Show loading SweetAlert
                    Swal.fire({
                      title: "در حال حذف...",
                      text: "لطفا صبر کنید",
                      allowOutsideClick: false,
                      didOpen: () => {
                        Swal.showLoading();
                      },
                    });
                    try {
                      await onDelete(blog.title);
                      Swal.close(); // Close loading alert
                      showSuccessToast("پست با موفقیت حذف شد");
                    } catch (error) {
                      Swal.close(); // Close loading alert
                      showErrorToast("خطا در حذف پست");
                    }
                  }
                });
              }}
            />
          )}
          {userHasAccess(PermissionEnums.UpdatePost) && (
            <ActionEditButton icon="pencil" postTitle={blog.title} />
          )}
          <ActionButton icon="eye" onClick={handlePreview} />
          {userGroupId?.toString() === blog.publicRelationsUnitId?.toString() && (
            <ActionButton
              icon={blog.isAcceptedByPublicRelations ? "cross" : "check"}
              onClick={async () => {
                Swal.fire({
                  title: "آیا مطمئن هستید?",
                  text: `آیا می‌خواهید وضعیت  این پست را به ${blog.isAcceptedByPublicRelations ? 'خیر' : 'بله'} تغییر دهید؟`,
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "بله، تغییر وضعیت",
                  cancelButtonText: "انصراف",
                  customClass: {
                    popup: "swal2-rtl-container",
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
                      const currentValue = !!blog.isAcceptedByPublicRelations;
                      const newValue = !currentValue;
                      await SetPublicRelationsUnitRequest(
                        blog.title,
                        blog.publicRelationsUnitId,
                        newValue
                      );
                      Swal.close(); // Close loading alert
                      showSuccessToast("وضعیت  با موفقیت تغییر یافت");
                      fetchPosts(); // Refresh the list
                    } catch (error) {
                      Swal.close(); // Close loading alert
                      showErrorToast("خطا در تغییر وضعیت ");
                    }
                  }
                });
              }}
            />
          )}
        </div>
      </td>
    </tr>
  );
};

// ActionButton component
const ActionButton: FC<{ icon: string; onClick?: () => void }> = ({
  icon,
  onClick,
}) => (
  <a
    href="#"
    className="btn btn-sm btn-light-primary"
    onClick={(e) => {
      e.preventDefault();
      onClick?.();
    }}
  >
    <KTIcon iconName={icon} className="fs-3" />
  </a>
);
const userHasAccess = (permission: number) => {
  const data = decryptToJwt(getToken()?.toString()!);
  return data.Permissions.includes(permission);
};
// ActionEditButton component
const ActionEditButton: FC<{ icon: string; postTitle: string }> = ({
  icon,
  postTitle,
}) => (
  <a
    href="#"
    className="btn btn-sm btn-light-primary"
    data-bs-toggle="modal"
    data-bs-target="#kt_modal_AddBlog"
    data-bs-Edit={postTitle}
  >
    <KTIcon iconName={icon} className="fs-3" />
  </a>
);

// Main component
interface Props {
  className: string;
  title: string;
  subTitle: string;
  defaultCategory?: string;
}

const TablesWidget9: FC<Props> = ({
  className,
  title,
  subTitle,
  defaultCategory,
}) => {
  const [blogs, setBlogs] = useState<BlogResponse>();
  const [categories, setCategories] = useState<string[]>([]);

  const fetchPosts = async () => {
    const token = getToken();
    if (token) {
      try {
        const data = await getAllPosts(token);
        if (data) {
          // Filter posts by defaultCategory if provided
          if (defaultCategory) {
            data.items = data.items.filter(
              (blog: BlogDto) => blog.postCategoryType === defaultCategory
            );
          }
          setBlogs(data);
        } else {
          console.error("No posts data or data is not an array");
          showErrorToast("خطا در دریافت پست‌ها");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        showErrorToast("خطا در ارتباط با سرور");
      }
    } else {
      console.error("No token found");
      showErrorToast("توکن یافت نشد");
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await GetAllCategories();
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      showErrorToast("خطا در دریافت دسته‌بندی‌ها");
    }
  };

  const handleSearch = async (searchTerm: string) => {
    try {
      const data = await SearchBlog(searchTerm);
      if (data) {
        setBlogs(data);
      }
    } catch (error) {
      console.error("Error searching posts:", error);
      showErrorToast("خطا در جستجوی پست‌ها");
    }
  };

  const handleDelete = async (title: string) => {
    try {
      await RemoveBlog(title);
      showSuccessToast("پست با موفقیت حذف شد");
      fetchPosts(); // Refresh the list
    } catch (error) {
      console.error("Error deleting post:", error);
      showErrorToast("خطا در حذف پست");
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  return (
    <div
      className={`card ${className}`}
      style={{ fontFamily: "sans" }}
      dir="rtl"
    >
      {/* begin::Header */}
      <div className="card-header border-0 pt-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">{title}</span>
        </h3>
        <div
          className="card-toolbar"
          data-bs-toggle="tooltip"
          title="Click to add a user"
        >
          {userHasAccess(PermissionEnums.CreatePost) && (
            <a
              href="#"
              className="btn btn-sm btn-light-primary"
              data-bs-toggle="modal"
              data-bs-target="#kt_modal_AddBlog"
            >
              <KTIcon iconName="plus" className="fs-3" />
              اضافه کردن پست
            </a>
          )}

          <AddBlog onSuccess={fetchPosts} defaultCategory={defaultCategory} />
          <BlogSearchComponent
            placeHolder="جستجو پست"
            onSearchResult={handleSearch}
          />
        </div>
      </div>
      {/* end::Header */}

      {/* begin::Body */}
      <div className="card-body py-0">
        <div className="table-responsive">
          <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
            <thead>
              <tr className="fw-bold text-muted">
                <th className="min-w-150px max-w-[120px]">بلاگ و شرح پست</th>
                <th className="min-w-140px">دسته بندی</th>
                <th className="min-w-140px">تایید انتشار  </th>
                <th className="min-w-120px text-center">بازدید</th>
                <th className="min-w-120px text-center">تاریخ انتشار</th>
                <th className="min-w-100px text-center">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {blogs?.items.map((blog, index) => (
                <BlogRow key={index} blog={blog} onDelete={handleDelete} fetchPosts={fetchPosts} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* end::Body */}
    </div>
  );
};

export { TablesWidget9 };
