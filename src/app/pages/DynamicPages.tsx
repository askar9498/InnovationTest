import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { KTIcon } from '../../_metronic/helpers';
import { getApiUrl } from '../../config/api';
import { getToken } from '../modules/auth/core/_requests';
import "@fontsource/lalezar";
import '../../assets/css/custom-buttons.css';
import debounce from 'lodash/debounce';

interface DynamicPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SearchResponse {
  items: DynamicPage[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

interface DynamicPageSearchDto {
  searchText: string;
  pageNumber: number;
  pageSize: number;
}

const DynamicPages: React.FC = () => {
  const [pages, setPages] = useState<DynamicPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const fetchPages = async (searchDto: DynamicPageSearchDto) => {
    try {
      const response = await axios.post<SearchResponse>(getApiUrl('/api/DynamicPage/Search'), searchDto, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        withCredentials: true
      });
      setPages(response.data.items);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pages:', error);
      setLoading(false);
    }
  };

  // Create a debounced search function
  const debouncedSearch = useCallback(
    debounce((text: string, page: number) => {
      if (text.length >= 3 || text.length === 0) {
        fetchPages({ searchText: text, pageNumber: page, pageSize });
      }
    }, 500),
    [pageSize]
  );

  useEffect(() => {
    const savedPage = sessionStorage.getItem('dynamicPagesCurrentPage');
    const initialPage = savedPage ? parseInt(savedPage, 10) : 1;
    setCurrentPage(initialPage);
    fetchPages({ searchText: '', pageNumber: initialPage, pageSize });
    if (savedPage) {
      sessionStorage.removeItem('dynamicPagesCurrentPage'); // Clear after use
    }
  }, [pageSize]); // Depend only on pageSize for initial load

  useEffect(() => {
    debouncedSearch(searchText, currentPage);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchText, currentPage, debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('آیا از حذف این صفحه اطمینان دارید؟')) {
      try {
        await axios.delete(getApiUrl(`/api/DynamicPage/Delete/${id}`), {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          withCredentials: true
        });
        fetchPages({ searchText, pageNumber: currentPage, pageSize });
      } catch (error) {
        console.error('Error deleting page:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const handlePreview = async (id: number) => {
    try {
      const response = await axios.get(getApiUrl(`/api/DynamicPage/Get/${id}`), {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        withCredentials: true
      });
      
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(`
          <!DOCTYPE html>
          <html dir="rtl" lang="fa">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${response.data.title}</title>
              <link href="https://fonts.googleapis.com/css2?family=Lalezar&display=swap" rel="stylesheet">
              <style>
                body {
                  font-family: 'Lalezar', sans-serif;
                  padding: 20px;
                  max-width: 1200px;
                  margin: 0 auto;
                  line-height: 1.6;
                }
                h1 {
                  text-align: center;
                  margin-bottom: 30px;
                }
              </style>
            </head>
            <body>
              <h1>${response.data.title}</h1>
              <div>${response.data.content}</div>
            </body>
          </html>
        `);
        previewWindow.document.close();
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card" dir="rtl">
      <div className="card-header border-0 pt-6 bg-secondary">
        <div className="card-title d-flex justify-content-center w-100">
          <h2 className="fw-bold" style={{ fontFamily: 'Lalezar' }}>صفحات پویا</h2>
        </div>
        <div className="card-toolbar">
          <div className="d-flex align-items-center position-relative me-4">
            <KTIcon iconName="magnifier" className="fs-3 position-absolute ms-4" />
            <input
              type="text"
              className="form-control form-control-solid w-250px ps-12"
              placeholder="جستجو..."
              value={searchText}
              onChange={handleSearchChange}
              style={{ fontFamily: 'Lalezar' }}
            />
          </div>
          <div 
            className="position-fixed"
            style={{ 
              left: '2rem',
              bottom: '6rem',
              zIndex: 1000
            }}
          >
            <button
              className="material-fab primary"
              onClick={() => navigate('/dynamic-page-editor')}
            >
              <div className="btn-content">
                <div className="icon-wrapper">
                  <KTIcon iconName="plus" className="fs-2" />
                </div>
                <span className="btn-text">
                  ایجاد صفحه جدید
                </span>
              </div>
              <div className="ripple"></div>
            </button>
          </div>
        </div>
      </div>
      <div className="card-body py-4">
        <div className="table-responsive">
          <table className="table align-middle table-row-dashed fs-6 gy-5 w-100">
            <thead>
              <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                <th className="min-w-200px text-end" style={{ fontFamily: 'Lalezar' }}>عنوان</th>
                <th className="min-w-100px text-end" style={{ fontFamily: 'Lalezar' }}>وضعیت</th>
                <th className="min-w-150px text-end" style={{ fontFamily: 'Lalezar' }}>تاریخ ایجاد</th>
                <th className="min-w-100px text-end" style={{ fontFamily: 'Lalezar' }}>عملیات</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 fw-semibold">
              {pages.map((page) => (
                <tr key={page.id}>
                  <td className="text-end" style={{ fontFamily: 'Lalezar' }}>{page.title}</td>
                  <td className="text-end">
                    <div className={`badge badge-light-${page.isPublished ? 'success' : 'warning'} fw-bold`} style={{ fontFamily: 'Lalezar' }}>
                      {page.isPublished ? 'منتشر شده' : 'پیش‌نویس'}
                    </div>
                  </td>
                  <td className="text-end" style={{ fontFamily: 'Lalezar' }}>{formatDate(page.createdAt)}</td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-icon btn-bg-light btn-active-color-info btn-sm me-1"
                        onClick={() => handlePreview(page.id)}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="پیش‌نمایش"
                      >
                        <KTIcon iconName="eye" className="fs-2" />
                      </button>
                      <button
                        className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                        onClick={() => {
                          sessionStorage.setItem('dynamicPagesCurrentPage', currentPage.toString());
                          navigate(`/dynamic-page-editor/${page.id}`);
                        }}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="ویرایش"
                      >
                        <KTIcon iconName="pencil" className="fs-2" />
                      </button>
                      <button
                        className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                        onClick={() => handleDelete(page.id)}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="حذف"
                      >
                        <KTIcon iconName="trash" className="fs-2" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="d-flex flex-stack flex-wrap pt-10">
          <div className="fs-6 fw-semibold text-gray-700" style={{ fontFamily: 'Lalezar' }}>
            نمایش {((currentPage - 1) * pageSize) + 1} تا {Math.min(currentPage * pageSize, totalCount)} از {totalCount} مورد
          </div>
          <ul className="pagination">
            <li className={`page-item previous ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="previous"></i>
              </button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li className={`page-item next ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <i className="next"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DynamicPages; 