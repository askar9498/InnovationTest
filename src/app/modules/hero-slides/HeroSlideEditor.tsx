import React, { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { GetBaseUrl } from '../../../config/api';
import { getToken } from '../auth/core/_requests';

// Define interfaces
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

interface CreateHeroSlideDto {
  title: string;
  subtitle: string;
  imageData?: string;
  imageContentType?: string;
  linkUrl?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

interface UpdateHeroSlideDto {
  title: string;
  subtitle: string;
  imageData?: string;
  imageContentType?: string;
  linkUrl?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

// API functions
const API_BASE_URL = GetBaseUrl();

const getHeroSlideById = async (id: number): Promise<HeroSlide> => {
  const token = getToken();
  console.log(token);

  const response = await fetch(`${API_BASE_URL}/api/HeroSlide/Get/${id}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch hero slide');
  }
  
  return response.json();
};

const createHeroSlide = async (data: CreateHeroSlideDto, imageFile?: File): Promise<HeroSlide> => {
  const token = getToken();
  console.log(token);
  
  const formData = new FormData();
  
  // Add form fields to match CreateHeroSlideFormDto
  formData.append('Title', data.title);
  formData.append('Subtitle', data.subtitle);
  formData.append('LinkUrl', data.linkUrl || '');
  formData.append('DisplayOrder', data.displayOrder.toString());
  formData.append('IsActive', data.isActive.toString());
  if (data.startDate) {
    formData.append('StartDate', data.startDate);
  }
  if (data.endDate) {
    formData.append('EndDate', data.endDate);
  }
  
  // Add image file if provided
  if (imageFile) {
    formData.append('ImageFile', imageFile);
  }
  
  const response = await fetch(`${API_BASE_URL}/api/HeroSlide/Create`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to create hero slide');
  }
  
  return response.json();
};

const updateHeroSlide = async (id: number, data: UpdateHeroSlideDto, imageFile?: File): Promise<HeroSlide> => {
  const token = getToken();
  
  const formData = new FormData();
  
  // Add form fields to match UpdateHeroSlideFormDto
  formData.append('Title', data.title);
  formData.append('Subtitle', data.subtitle);
  formData.append('LinkUrl', data.linkUrl || '');
  formData.append('DisplayOrder', data.displayOrder.toString());
  formData.append('IsActive', data.isActive.toString());
  if (data.startDate) {
    formData.append('StartDate', data.startDate);
  }
  if (data.endDate) {
    formData.append('EndDate', data.endDate);
  }
  
  // Add image file if provided
  if (imageFile) {
    formData.append('ImageFile', imageFile);
  }
  
  const response = await fetch(`${API_BASE_URL}/api/HeroSlide/Update/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to update hero slide');
  }
  
  return response.json();
};

const HeroSlideEditor: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<CreateHeroSlideDto>({
    title: '',
    subtitle: '',
    linkUrl: '',
    displayOrder: 0,
    isActive: true,
    startDate: '',
    endDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      fetchHeroSlide(parseInt(id));
    }
  }, [isEditMode, id]);

  const fetchHeroSlide = async (slideId: number) => {
    try {
      setLoading(true);
      const slide = await getHeroSlideById(slideId);
      setFormData({
        title: slide.title,
        subtitle: slide.subtitle,
        linkUrl: slide.linkUrl || '',
        displayOrder: slide.displayOrder,
        isActive: slide.isActive,
        startDate: slide.startDate || '',
        endDate: slide.endDate || '',
      });
      
      // Set image preview if image data exists
      if (slide.imageData && slide.imageContentType) {
        const imageUrl = `${API_BASE_URL}/api/HeroSlide/GetImage/${slideId}`;
        setImagePreview(imageUrl);
      }
    } catch (error) {
      console.error('Failed to fetch hero slide:', error);
      Swal.fire({
        title: 'خطا',
        text: 'خطا در بارگذاری اطلاعات اسلاید',
        icon: 'error',
        confirmButtonText: 'باشه'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      Swal.fire({
        title: 'خطا',
        text: 'عنوان اسلاید الزامی است',
        icon: 'error',
        confirmButtonText: 'باشه'
      });
      return;
    }

    if (!imagePreview && !imageFile) {
      Swal.fire({
        title: 'خطا',
        text: 'تصویر اسلاید الزامی است',
        icon: 'error',
        confirmButtonText: 'باشه'
      });
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        linkUrl: formData.linkUrl || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      };

      if (isEditMode && id) {
        await updateHeroSlide(parseInt(id), submitData, imageFile || undefined);
        Swal.fire({
          title: 'موفق',
          text: 'اسلاید با موفقیت ویرایش شد',
          icon: 'success',
          confirmButtonText: 'باشه'
        });
      } else {
        await createHeroSlide(submitData, imageFile || undefined);
        Swal.fire({
          title: 'موفق',
          text: 'اسلاید با موفقیت ایجاد شد',
          icon: 'success',
          confirmButtonText: 'باشه'
        });
      }

      navigate('/hero-slides');
    } catch (error) {
      console.error('Failed to save hero slide:', error);
      Swal.fire({
        title: 'خطا',
        text: 'خطا در ذخیره اسلاید',
        icon: 'error',
        confirmButtonText: 'باشه'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/hero-slides');
  };

  if (loading && isEditMode) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px', direction: 'rtl',fontFamily: 'sans' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card"  style={{ direction: 'rtl',fontFamily: 'sans' }}>
      <div className="card-header border-0 pt-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">
            {isEditMode ? 'ویرایش اسلاید' : 'افزودن اسلاید جدید'}
          </span>
          <span className="text-muted mt-1 fw-semibold fs-7">
            {isEditMode ? 'ویرایش اطلاعات اسلاید' : 'ایجاد اسلاید جدید برای صفحه اصلی'}
          </span>
        </h3>
      </div>

      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row mb-6">
            <label className="col-lg-4 col-form-label required fw-semibold fs-6">عنوان</label>
            <div className="col-lg-8">
              <input
                type="text"
                name="title"
                className="form-control form-control-solid"
                placeholder="عنوان اسلاید"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="row mb-6">
            <label className="col-lg-4 col-form-label fw-semibold fs-6">زیرعنوان</label>
            <div className="col-lg-8">
              <textarea
                name="subtitle"
                className="form-control form-control-solid"
                placeholder="زیرعنوان اسلاید"
                value={formData.subtitle}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>

          <div className="row mb-6">
            <label className="col-lg-4 col-form-label required fw-semibold fs-6">تصویر</label>
            <div className="col-lg-8">
              <input
                type="file"
                className="form-control form-control-solid"
                accept="image/*"
                onChange={handleImageChange}
                required={!isEditMode}
              />
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="rounded"
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="row mb-6">
            <label className="col-lg-4 col-form-label fw-semibold fs-6">لینک</label>
            <div className="col-lg-8">
              <input
                type="url"
                name="linkUrl"
                className="form-control form-control-solid"
                placeholder="https://example.com"
                value={formData.linkUrl}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="row mb-6">
            <label className="col-lg-4 col-form-label fw-semibold fs-6">ترتیب نمایش</label>
            <div className="col-lg-8">
              <input
                type="number"
                name="displayOrder"
                className="form-control form-control-solid"
                placeholder="0"
                value={formData.displayOrder}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="row mb-6">
            <label className="col-lg-4 col-form-label fw-semibold fs-6">تاریخ شروع</label>
            <div className="col-lg-8">
              <input
                type="datetime-local"
                name="startDate"
                className="form-control form-control-solid"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="row mb-6">
            <label className="col-lg-4 col-form-label fw-semibold fs-6">تاریخ پایان</label>
            <div className="col-lg-8">
              <input
                type="datetime-local"
                name="endDate"
                className="form-control form-control-solid"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="row mb-6">
            <label className="col-lg-4 col-form-label fw-semibold fs-6">وضعیت</label>
            <div className="col-lg-8">
              <div className="form-check form-switch form-check-custom form-check-solid">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <label className="form-check-label">
                  فعال
                </label>
              </div>
            </div>
          </div>

          <div className="card-footer d-flex justify-content-end py-6 px-9">
            <button
              type="button"
              className="btn btn-light btn-active-light-primary me-2"
              onClick={handleCancel}
              disabled={loading}
            >
              لغو
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  در حال ذخیره...
                </>
              ) : (
                isEditMode ? 'ویرایش' : 'ایجاد'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroSlideEditor; 