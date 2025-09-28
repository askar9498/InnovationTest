import { FC, useEffect, useRef, useState } from "react";
import SunEditor from "suneditor-react";
import SunEditorCore from "suneditor/src/lib/core";
import "suneditor/dist/css/suneditor.min.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  GetBlogByTitle,
  RegisterBlog,
  UpdateBlog,
  getUserRole,
} from "../../../app/modules/auth/core/_requests";
import {
  showErrorToast,
  showSuccessToast,
} from "../widgets/tables/TablesWidget9";
import { Modal } from "bootstrap";
import { useNavigate } from "react-router-dom";
import { GetBaseUrl, GetWebSiteUrl } from "../../../config/api";
import axios from "axios"; // Import axios for fetching images

interface AddBlogProps {
  onSuccess: () => void;
  defaultCategory?: string;
}

interface BlogData {
  title: string;
  subTitle: string;
  postCategoryType: string;
  publishTime: string;
  content: string;
  status: string;
  publicRelationsUnit: string;
  publicRelationsUnitId: number;
  acceptMember: string;
  isPublished: string;
  postImage: string | { fileName: string } | null;
  id?: number;
}

const categoryList = [
  { value: "News", label: "خبر" },
  { value: "Educations", label: "آموزش" },
  { value: "Events", label: "رویداد" },
  { value: "Notices", label: "اطلاعیه" },
];

const AddBlog: FC<AddBlogProps> = ({ onSuccess, defaultCategory }) => {
  const [submitValue, setSubmitValue] = useState("ارسال پست");
  const [editData, setEditData] = useState<Partial<BlogData>>({});
  const [roles, setRoles] = useState<Array<{ value: number; label: string }>>(
    []
  );
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const editorRef = useRef<SunEditorCore>();

  // // Fetch roles when component mounts
  // useEffect(() => {
  //   const fetchRoles = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await getUserRole();
  //       console.log("Raw roles response:", response);
  //       if (response?.data?.items) {
  //         const roleOptions = response.data.items.map((role: any) => ({
  //           value: role.id,
  //           label: role.name,
  //         }));
  //         console.log("Processed role options:", roleOptions);
  //         setRoles(roleOptions);
  //       } else {
  //         console.error("Invalid roles response format:", response);
  //         showErrorToast("خطا در دریافت لیست نقش‌ها");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching roles:", error);
  //       showErrorToast("خطا در دریافت لیست نقش‌ها");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchRoles();
  // }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: editData.title || "",
      subTitle: editData.subTitle || "",
      postCategoryType: editData.postCategoryType || defaultCategory || "",
      publishTime: editData.publishTime || "",
      content: editData.content || "",
      Status: editData.status || "Draft",
      PublicRelationsUnit: editData.publicRelationsUnit?.toString() || "",
      AcceptMember: editData.acceptMember || "ندارد",
      IsPublished: editData.isPublished || "false",
      postImage: editData.postImage || null,
    },
    validationSchema: Yup.object({
      title: Yup.string().required("عنوان الزامی است"),
      subTitle: Yup.string().required("زیر عنوان الزامی است"),
      postCategoryType: Yup.string().required("گروه پست الزامی است"),
      publishTime: Yup.string().required("زمان انتشار الزامی است"),
      content: Yup.string().required("محتوا الزامی است"),
      postImage: Yup.mixed().nullable(),
      PublicRelationsUnit: Yup.string().required("نقش تایید کننده الزامی است"),
    }),
    onSubmit: async (values) => {
      const form = new FormData();
      form.append("Title", values.title);
      form.append("SubTitle", values.subTitle);
      form.append("PostCategoryType", values.postCategoryType);
      form.append("PostCategoryName", values.postCategoryType);
      form.append("ViewCount", "10");
      form.append("Status", values.Status);
      form.append("PublicRelationsUnit", values.PublicRelationsUnit);
      form.append("AcceptMember", values.AcceptMember);
      form.append("IsPublished", values.IsPublished);
      form.append("Tags", "8");
      form.append("content", values.content);
      form.append("PublishTime", values.publishTime);
      if (values.postImage instanceof File) {
        form.append("PostImage", values.postImage);
      }

      const blogData = {
        Id: editData.id!,
        Title: values.title,
        SubTitle: values.subTitle,
        Content: values.content,
        Tags: [], // Assuming tags are not managed through this form or are empty
        Status: values.Status,
        PublicRelationsUnitId: Number(values.PublicRelationsUnit) || null,
        AcceptMember: values.AcceptMember,
        PublishTime: values.publishTime,
        IsPublished: values.IsPublished === "true",
      };

      try {
        if (submitValue === "ویرایش پست") {
          await UpdateBlog(blogData);
          showSuccessToast("پست با موفقیت ویرایش شد");
        } else {
          await RegisterBlog(form);
          showSuccessToast("پست با موفقیت ثبت شد");
        }
        onSuccess();
        const modal = Modal.getInstance(modalRef.current!);
        modal?.hide();
      } catch (error) {
        showErrorToast("خطا در ثبت پست");
      }
    },
  });

  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    const handleShow = async (event: any) => {
      const triggerEl = event.relatedTarget;
      const postTitle = triggerEl?.getAttribute("data-bs-Edit");
      console.log("Raw roles response 1 :");
      try {
        setLoading(true);
      console.log("Raw roles response 2:");

        const response = await getUserRole();
        if (response?.items) {
          const roleOptions = response.items.map((role: any) => ({
            value: role.id,
            label: role.name,
          }));
          console.log("Processed role options:", roleOptions);
          setRoles(roleOptions);
        } else {
          console.error("Invalid roles response format:", response);
          showErrorToast("خطا در دریافت لیست نقش‌ها");
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        showErrorToast("خطا در دریافت لیست نقش‌ها");
      } finally {
        setLoading(false);
      }
      console.log("Raw roles response 3 :");

      if (postTitle) {
        const res = await GetBlogByTitle(postTitle);
        setEditData(res?.data);
        if (res?.data) {
          formik.setFieldValue("content", res.data.content || "");

          // Set the default role if publicRelationsUnitId exists
          if (res.data.publicRelationsUnitId) {
            formik.setFieldValue(
              "PublicRelationsUnit",
              res.data.publicRelationsUnitId.toString()
            );
          }

          // Handle existing post image
          if (res.data.postImage && !(res.data.postImage instanceof File)) {
            const imageUrl =
              GetBaseUrl() +
              (typeof res.data.postImage === "string"
                ? res.data.postImage.replace(/\\/g, "/")
                : res.data.postImage.fileName.replace(/\\/g, "/"));
            try {
              const imageRes = await axios.get(imageUrl, {
                responseType: "blob",
              });
              const blob = imageRes.data;
              const fileName =
                typeof res.data.postImage === "string"
                  ? res.data.postImage.substring(
                      res.data.postImage.lastIndexOf("/") + 1
                    )
                  : res.data.postImage.fileName.substring(
                      res.data.postImage.fileName.lastIndexOf("/") + 1
                    );
              const fileType = blob.type || "image/jpeg";
              const imageFile = new File([blob], fileName, { type: fileType });
              formik.setFieldValue("postImage", imageFile);
            } catch (imageError) {
              console.error(
                "Error fetching or converting existing image:",
                imageError
              );
              formik.setFieldValue("postImage", null);
            }
          }
        }
        setSubmitValue("ویرایش پست");
      } else {
        setEditData({});
        formik.setFieldValue("content", "");
        formik.setFieldValue("postImage", null);
        formik.setFieldValue("PublicRelationsUnit", ""); // Reset role selection
        setSubmitValue("ارسال پست");
      }
    };

    modalElement.addEventListener("show.bs.modal", handleShow);

    return () => {
      modalElement.removeEventListener("show.bs.modal", handleShow);
    };
  }, [formik]);

  useEffect(() => {
    if (editorRef.current) {
      if (formik.values.content !== undefined) {
        editorRef.current.setContents(formik.values.content);
      } else if (submitValue === "ارسال پست") {
        editorRef.current.setContents("");
      }
    }
  }, [formik.values.content, editorRef.current, submitValue]);

  const handlePreview = () => {
    // Collect data for PostPreviewDto
    const postData = {
      Title: formik.values.title,
      ImageUrl: editData.postImage
        ? GetBaseUrl() +
          (typeof editData.postImage === "string"
            ? editData.postImage.replace(/\\/g, "/")
            : editData.postImage.fileName.replace(/\\/g, "/"))
        : "", // Empty string if no image
      Category: formik.values.postCategoryType,
      Author: "Unknown Author", // Placeholder, as author is not in formik.values
      PublishDate: formik.values.publishTime,
      Content: formik.values.content,
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
  };

  return (
    <div
      dir="rtl"
      className="modal fade"
      id="kt_modal_AddBlog"
      ref={modalRef}
      aria-hidden="true"
      style={{ fontFamily: "sans" }}
    >
      <div className="modal-dialog mw-950px">
        <div className="modal-content">
          <div className="modal-header pb-0 border-0 justify-content-end">
            <button className="btn btn-sm btn-icon" data-bs-dismiss="modal">
              ✖
            </button>
          </div>

          <div className="modal-body scroll-y mx-5 mx-xl-18 pt-0 pb-15">
            <div className="text-center mb-13">
              <h1 className="mb-3">
                {submitValue === "ویرایش پست"
                  ? "ویرایش پست"
                  : "اضافه کردن پست جدید"}
              </h1>
            </div>

            <form onSubmit={formik.handleSubmit}>
              {/* Title */}
              <InputField label="عنوان" name="title" formik={formik} />
              {/* SubTitle */}
              <InputField label="زیر عنوان" name="subTitle" formik={formik} />
              {/* Editor */}
              <div className="mb-5">
                <label className="form-label fw-bold">محتوای صفحه</label>
                <SunEditor
                  getSunEditorInstance={(sunEditor: SunEditorCore) => {
                    editorRef.current = sunEditor;
                  }}
                  setAllPlugins={true}
                  name="content"
                  onChange={(content) => {
                    formik.setFieldValue("content", content);
                  }}
                />
                {formik.errors.content && formik.touched.content && (
                  <div className="text-danger">{formik.errors.content}</div>
                )}
              </div>
              {/* Image Upload */}
              <div className="mb-5">
                <label className="form-label fw-bold">تصویر</label>
                {editData.postImage && (
                  <div className="mb-3">
                    <img
                      src={
                        GetBaseUrl() +
                        (typeof editData.postImage === "string"
                          ? editData.postImage.replace(/\\/g, "/")
                          : editData.postImage.fileName.replace(/\\/g, "/"))
                      }
                      alt="Current Post Image"
                      className="img-fluid"
                      style={{ maxWidth: "200px" }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => {
                    if (e.target.files) {
                      formik.setFieldValue("postImage", e.target.files[0]);
                    }
                  }}
                  disabled={submitValue === "ویرایش پست"}
                />
              </div>
              {/* Category & Time */}
              <div className="d-flex flex-row">
                <SelectField
                  label="گروه پست"
                  name="postCategoryType"
                  options={categoryList}
                  formik={formik}
                  disabled={!!defaultCategory}
                />
                <InputField
                  label="زمان انتشار"
                  name="publishTime"
                  type="datetime-local"
                  formik={formik}
                />
              </div>

              {/* Disabled Fields */}
              <div className="d-flex flex-row">
                <SelectField
                  label="وضعیت"
                  name="Status"
                  options={[{ value: "Draft", label: "پیش نویس" }]}
                  formik={formik}
                  disabled
                />
                <SelectField
                  label="نقش تایید کننده"
                  name="PublicRelationsUnit"
                  options={roles}
                  formik={formik}
                  disabled={loading}
                />
              </div>
              {/* 
              <div className="d-flex flex-row">
                <InputField
                  label="تاییدیه همکار"
                  name="AcceptMember"
                  formik={formik}
                  disabled={submitValue === "ویرایش پست"}
                />
                <div className="form-check mb-5 w-50 p-3 mt-10 px-10">
                  <input
                    disabled={submitValue === "ویرایش پست"}
                    type="checkbox"
                    className="form-check-input"
                    name="IsPublished"
                    checked={false}
                    onChange={formik.handleChange}
                  />
                  <label className="form-check-label">وضعیت انتشار</label>
                </div>
              </div> */}
              <div className="d-flex flex-row gap-2">
                <button
                  type="submit"
                  className={`btn btn-primary ${
                    submitValue === "ویرایش پست" ? "w-50" : "w-100"
                  }`}
                >
                  {submitValue}
                </button>
                {submitValue === "ویرایش پست" && (
                  <button
                    type="button"
                    onClick={handlePreview}
                    className="btn btn-primary w-50"
                  >
                    پیش نمایش
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  name,
  formik,
  type = "text",
  disabled = false,
}: any) => (
  <div className="mb-5 w-100 p-3">
    <label className="form-label fw-bold">{label}</label>
    <input
      type={type}
      name={name}
      disabled={disabled}
      className="form-control"
      value={formik.values[name]}
      onChange={formik.handleChange}
    />
    {formik.errors[name] && formik.touched[name] && (
      <div className="text-danger">{formik.errors[name]}</div>
    )}
  </div>
);

const SelectField = ({
  label,
  name,
  options,
  formik,
  disabled = false,
}: any) => {
  return (
    <div className="mb-5 w-100 p-3">
      <label className="form-label fw-bold">{label}</label>
      <select
        className="form-select"
        name={name}
        disabled={disabled}
        value={formik.values[name]}
        onChange={formik.handleChange}
      >
        <option value="">انتخاب کنید</option>
        {Array.isArray(options) &&
          options.map((opt: any, index: number) => {
            const value = typeof opt === "object" ? opt.value : opt;
            const label = typeof opt === "object" ? opt.label : opt;
            return (
              <option key={`${value}-${index}`} value={value}>
                {label}
              </option>
            );
          })}
      </select>
      {formik.errors[name] && formik.touched[name] && (
        <div className="text-danger">{formik.errors[name]}</div>
      )}
    </div>
  );
};

export { AddBlog };
