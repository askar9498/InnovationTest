import React, { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { GetBaseUrl } from '../../../config/api';
import { getToken } from '../auth/core/_requests';

// Define HeroSlide interface based on backend DTO
interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  imageData?: string;
  imageContentType?: string;
  linkUrl?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  entryDate: string;
  lastModifiedDate: string;
  entryPerson: string;
}

// API functions
const API_BASE_URL = GetBaseUrl();

const getAllHeroSlides = async (): Promise<HeroSlide[]> => {
  const token = getToken();
  console.log(token);
  const response = await fetch(`${API_BASE_URL}/api/HeroSlide/GetAll`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch hero slides');
  }
  
  return response.json();
};

const deleteHeroSlide = async (id: number): Promise<boolean> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/api/HeroSlide/Delete/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  
  return response.ok;
};

const toggleHeroSlideActive = async (id: number): Promise<boolean> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/api/HeroSlide/ToggleActive/${id}`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  
  return response.ok;
};

const HeroSlideList: FC = () => {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchHeroSlides = async () => {
    try {
      setLoading(true);
      const slides = await getAllHeroSlides();
      setHeroSlides(slides);
    } catch (error) {
      console.error('Failed to fetch hero slides:', error);
      Swal.fire({
        title: 'خطا',
        text: 'خطا در بارگذاری اسلایدها',
        icon: 'error',
        confirmButtonText: 'باشه'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroSlides();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/hero-slides/edit/${id}`);
  };

  const handleCreate = () => {
    navigate('/hero-slides/create');
  };

  const handleDelete = async (id: number, title: string) => {
    const result = await Swal.fire({
      title: 'آیا مطمئن هستید؟',
      text: `آیا می‌خواهید اسلاید "${title}" را حذف کنید؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'بله، حذف کن',
      cancelButtonText: 'لغو'
    });

    if (result.isConfirmed) {
      try {
        const success = await deleteHeroSlide(id);
        if (success) {
          Swal.fire(
            'حذف شد!',
            'اسلاید با موفقیت حذف شد.',
            'success'
          );
          fetchHeroSlides(); // Refresh the list
        } else {
          throw new Error('Failed to delete');
        }
      } catch (error) {
        console.error('Failed to delete hero slide:', error);
        Swal.fire({
          title: 'خطا',
          text: 'خطا در حذف اسلاید',
          icon: 'error',
          confirmButtonText: 'باشه'
        });
      }
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const success = await toggleHeroSlideActive(id);
      if (success) {
        Swal.fire({
          title: 'موفق',
          text: `وضعیت اسلاید ${currentStatus ? 'غیرفعال' : 'فعال'} شد`,
          icon: 'success',
          confirmButtonText: 'باشه'
        });
        fetchHeroSlides(); // Refresh the list
      } else {
        throw new Error('Failed to toggle status');
      }
    } catch (error) {
      console.error('Failed to toggle hero slide status:', error);
      Swal.fire({
        title: 'خطا',
        text: 'خطا در تغییر وضعیت اسلاید',
        icon: 'error',
        confirmButtonText: 'باشه'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
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
    <div className="card" style={{ direction: 'rtl',fontFamily: 'sans' }}>
      <div className="card-header border-0 pt-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">مدیریت اسلایدهای صفحه اصلی</span>
          <span className="text-muted mt-1 fw-semibold fs-7">مدیریت و ویرایش اسلایدهای نمایشی</span>
        </h3>
        <div className="card-toolbar">
          <button
            type="button"
            className="btn btn-sm btn-light-primary"
            onClick={handleCreate}
          >
            <i className="ki-duotone ki-plus fs-2"></i>
            افزودن اسلاید جدید
          </button>
        </div>
      </div>

      <div className="card-body py-3">
        <div className="table-responsive">
          <table className="table align-middle gs-0 gy-4">
            <thead>
              <tr className="fw-bold text-muted bg-light">
                <th className="ps-4 min-w-125px rounded-start">تصویر</th>
                <th className="min-w-125px">عنوان</th>
                <th className="min-w-125px">زیرعنوان</th>
                <th className="min-w-125px">ترتیب نمایش</th>
                <th className="min-w-125px">وضعیت</th>
                <th className="min-w-125px">تاریخ ایجاد</th>
                <th className="min-w-125px">تاریخ ویرایش</th>
                <th className="min-w-70px text-end rounded-end">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {heroSlides.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    <div className="text-muted">هیچ اسلایدی یافت نشد</div>
                  </td>
                </tr>
              ) : (
                heroSlides.map((slide) => (
                  <tr key={slide.id}>
                    <td className="ps-4">
                      <div className="symbol symbol-50px me-5">
                        <img
                          src={`${API_BASE_URL}/api/HeroSlide/Image/${slide.id}`}
                          alt={slide.title}
                          className="rounded"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.src = '/media/avatars/blank.png';
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <span className="text-dark fw-bold text-hover-primary mb-1 fs-6">
                        {slide.title || 'بدون عنوان'}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted fw-semibold text-muted d-block fs-7">
                        {slide.subtitle || 'بدون زیرعنوان'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-light-primary fs-7 fw-bold">
                        {slide.displayOrder}
                      </span>
                    </td>
                    <td>
                      <div className="form-check form-switch form-check-custom form-check-solid">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={slide.isActive}
                          onChange={() => handleToggleActive(slide.id, slide.isActive)}
                        />
                        <label className="form-check-label">
                          <span className={`badge badge-${slide.isActive ? 'success' : 'danger'} fs-7 fw-bold`}>
                            {slide.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </label>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted fw-semibold text-muted d-block fs-7">
                        {formatDate(slide.entryDate)}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted fw-semibold text-muted d-block fs-7">
                        {formatDate(slide.lastModifiedDate)}
                      </span>
                    </td>
                    <td className="text-end">
                      {/* <button
                        type="button"
                        className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                        onClick={() => handleEdit(slide.id)}
                      >
                        <i className="ki-duotone ki-pencil fs-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </button> */}
                      <button
                        type="button"
                        className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                        onClick={() => handleDelete(slide.id, slide.title)}
                      >
                        <i className="ki-duotone ki-trash fs-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                          <span className="path4"></span>
                          <span className="path5"></span>
                        </i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HeroSlideList; 