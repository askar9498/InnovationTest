import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetBlogByTitle } from "../modules/auth/core/_requests";
import { BlogDto } from "../../_metronic/partials/widgets/tables/TablesWidget9";
import { KTIcon } from "../../_metronic/helpers";
import { getApiUrl } from "../../config/api";

const BlogPreview: FC = () => {
  const { title } = useParams<{ title: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (title) {
          const response = await GetBlogByTitle(decodeURIComponent(title));
          if (response?.data) {
            console.log(response.data);
            setBlog(response.data);
          }
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [title]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="alert alert-danger">Blog post not found</div>
      </div>
    );
  }

  return (
    <div
      className="bg-light min-vh-100 d-flex justify-content-center align-items-center py-5 py-md-10"
      dir="rtl"
      style={{ fontFamily: "sans" }}
    >
      <div
        className="card shadow-sm position-relative"
        style={{ 
          width: "95%", 
          maxWidth: "1200px",
          margin: "0 auto"
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => window.close()}
          className="btn btn-icon btn-sm btn-light-danger position-absolute"
          style={{ 
            top: '0.5rem', 
            right: '0.5rem', 
            zIndex: 1,
          }}
        >
          <KTIcon iconName="cross" className="fs-2" />
        </button>

        {/* Post Header */}
        <div className="card-header border-0 pt-5 pt-md-5 bg-secondary">
          <div className="d-flex align-items-center">
            <div className="symbol symbol-35px symbol-md-45px me-3 me-md-5">
              <div className="symbol-label bg-light-primary text-primary fs-6 fw-bold">
                {blog.AcceptMember?.charAt(0) || "A"}
              </div>
            </div>
            <div className="d-flex flex-column">
              <span className="text-gray-800 fw-bold fs-6 fs-md-6">
                {blog.AcceptMember || "نویسنده ناشناس"}
              </span>
              <span className="text-gray-500 fs-7">
                {new Date(blog.publishTime).toLocaleDateString("fa-IR")}
              </span>
            </div>
          </div>
        </div>

        {/* Post Image */}
        {blog.postImage && (
          <div className="card-body p-0">
            <img
              src={`${getApiUrl("")}${typeof blog.postImage !== 'string' && blog.postImage ? blog.postImage.fileName : blog.postImage}`}
              alt={blog.title}
              className="img-fluid rounded"
            />
          </div>
        )}

        {/* Post Content */}
        <div className="card-body p-4 p-md-10">
          {/* Title and Subtitle */}
          <div className="mb-4 mb-md-5">
            <h1 className="fs-2hx fw-bold mb-2">{blog.title}</h1>
            <h2 className="fs-4 text-gray-600 mb-4">{blog.subTitle}</h2>
          </div>

          {/* Category and View Count */}
          <div className="d-flex align-items-center gap-3 mb-4 mb-md-5">
            <span className="badge badge-light-primary fs-7 px-3 py-2">
              {blog.postCategoryType}
            </span>
            <span className="text-gray-500 fs-7">بازدید: {blog.viewCount}</span>
          </div>

          {/* Main Content */}
          <div 
            className="fs-6 fw-normal text-gray-800 blog-content mb-4 mb-md-5"
            dangerouslySetInnerHTML={{ __html: blog.Content }}
          />

          {/* Status Badges */}
          <div className="d-flex flex-wrap gap-2 pt-4 pt-md-5 border-top">
            <span className="badge badge-light-success fs-7 px-3 py-2">
              {blog.Status}
            </span>
            <span className="badge badge-light-info fs-7 px-3 py-2">
              {blog.PublicRelationsUnit === "true"
                ? "تایید شده"
                : "در انتظار تایید"}
            </span>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>
        {`
          .blog-content {
            line-height: 1.8;
          }
          .blog-content img {
            max-width: 100%;
            height: auto;
            border-radius: 0.475rem;
            margin: 1rem 0;
          }
          .blog-content p {
            margin-bottom: 1.5rem;
          }
          .blog-content h1, 
          .blog-content h2, 
          .blog-content h3, 
          .blog-content h4, 
          .blog-content h5, 
          .blog-content h6 {
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-weight: 600;
          }
          .blog-content blockquote {
            border-right: 4px solid #009ef7;
            padding: 1rem;
            background-color: #f5f8fa;
            margin: 1.5rem 0;
            border-radius: 0.475rem;
          }
          .blog-content ul, 
          .blog-content ol {
            padding-right: 1.5rem;
            margin-bottom: 1.5rem;
          }
          .blog-content li {
            margin-bottom: 0.5rem;
          }
          .blog-content a {
            color: #009ef7;
            text-decoration: none;
          }
          .blog-content a:hover {
            text-decoration: underline;
          }
          .blog-content code {
            background-color: #f5f8fa;
            padding: 0.2rem 0.4rem;
            border-radius: 0.475rem;
            font-size: 0.9em;
          }
          .blog-content pre {
            background-color: #f5f8fa;
            padding: 1rem;
            border-radius: 0.475rem;
            overflow-x: auto;
            margin: 1.5rem 0;
          }

          /* Responsive Styles */
          @media (max-width: 1200px) {
            .card {
              width: 90% !important;
            }
          }

          @media (max-width: 992px) {
            .card {
              width: 95% !important;
            }
            .fs-2hx {
              font-size: 2rem !important;
            }
          }

          @media (max-width: 768px) {
            .card {
              width: 95% !important;
            }
            .fs-2hx {
              font-size: 1.5rem !important;
            }
            .fs-4 {
              font-size: 1.1rem !important;
            }
            .card-body {
              padding: 1rem !important;
            }
            .blog-content {
              font-size: 0.9rem !important;
            }
            .position-absolute[style*="top: 0.5rem"] {
              top: 0.25rem !important;
              right: 0.25rem !important;
            }
          }

          @media (max-width: 576px) {
            .card {
              width: 100% !important;
              margin: 0 !important;
              border-radius: 0 !important;
            }
            .fs-2hx {
              font-size: 1.25rem !important;
            }
            .fs-4 {
              font-size: 1rem !important;
            }
            .card-body {
              padding: 0.75rem !important;
            }
            .blog-content {
              font-size: 0.85rem !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default BlogPreview;
