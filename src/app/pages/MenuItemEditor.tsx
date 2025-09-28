import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { KTIcon } from '../../_metronic/helpers';
import { getApiUrl } from '../../config/api';
import { getToken } from '../modules/auth/core/_requests';
import "@fontsource/lalezar";
import '../../assets/css/custom-buttons.css';

interface MenuItem {
  id: number;
  title: string;
  url: string;
  icon: string;
  parentId: number | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  children?: MenuItem[];
}

interface MenuItemFormData {
  title: string;
  url: string;
  icon: string;
  parentId: number | null;
  displayOrder: number;
  isActive: boolean;
}

const MenuItemEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [formData, setFormData] = useState<MenuItemFormData>({
    title: '',
    url: '',
    icon: '',
    parentId: null,
    displayOrder: 0,
    isActive: true
  });
  const [showParentSelector, setShowParentSelector] = useState(false);

  const buildMenuHierarchy = (items: MenuItem[]): MenuItem[] => {
    const itemMap = new Map<number, MenuItem>();
    const rootItems: MenuItem[] = [];

    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    items.forEach(item => {
      const menuItem = itemMap.get(item.id)!;
      if (item.parentId === null) {
        rootItems.push(menuItem);
      } else {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(menuItem);
        }
      }
    });

    return rootItems;
  };

  const getSelectedParentTitle = (parentId: number | null): string => {
    if (!parentId) return 'بدون والد (منوی اصلی)';
    const findItem = (items: MenuItem[]): string | null => {
      for (const item of items) {
        if (item.id === parentId) return item.title;
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findItem(menuItems) || 'بدون والد (منوی اصلی)';
  };

  const renderMenuItemTree = (items: MenuItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} style={{ marginRight: `${level * 20}px` }}>
        <div 
          className="d-flex align-items-center p-2 rounded cursor-pointer hover-bg-light"
          onClick={() => {
            setFormData(prev => ({ ...prev, parentId: item.id }));
            setShowParentSelector(false);
          }}
          style={{ 
            cursor: 'pointer',
            backgroundColor: formData.parentId === item.id ? '#f5f8fa' : 'transparent',
            borderRadius: '4px',
            marginBottom: '4px'
          }}
        >
          <KTIcon 
            iconName={item.children?.length ? 'arrow-right' : 'element-11'} 
            className="fs-2 me-2"
          />
          <span style={{ fontFamily: 'Lalezar' }}>{item.title}</span>
        </div>
        {item.children && renderMenuItemTree(item.children, level + 1)}
      </div>
    ));
  };

  useEffect(() => {
    fetchMenuItems();
    if (id) {
      fetchMenuItem();
    }
  }, [id]);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/MenuItem/GetAll'), {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        withCredentials: true
      });
      const hierarchicalItems = buildMenuHierarchy(response.data);
      setMenuItems(hierarchicalItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setLoading(false);
    }
  };

  const fetchMenuItem = async () => {
    try {
      const response = await axios.get(getApiUrl(`/api/MenuItem/Get/${id}`), {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        withCredentials: true
      });
      const item = response.data;
      setFormData({
        title: item.title,
        url: item.url,
        icon: item.icon,
        parentId: item.parentId,
        displayOrder: item.displayOrder,
        isActive: item.isActive,
      });
    } catch (error) {
      console.error('Error fetching menu item:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await axios.put(getApiUrl(`/api/MenuItem/Update/${id}`), formData, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          withCredentials: true
        });
      } else {
        await axios.post(getApiUrl('/api/MenuItem/Create'), formData, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          withCredentials: true
        });
      }
      navigate('/menu-items');
    } catch (error) {
      console.error('Error saving menu item:', error);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
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
          <h2 className="fw-bold" style={{ fontFamily: 'Lalezar' }}>
            {id ? 'ویرایش آیتم منو' : 'ایجاد آیتم منو جدید'}
          </h2>
        </div>
      </div>
      <div className="card-body py-4">
        <form onSubmit={handleSubmit}>
          <div className="row mb-5">
            <div className="col-md-6">
              <label className="form-label required" style={{ fontFamily: 'Lalezar' }}>عنوان</label>
              <input
                type="text"
                className="form-control form-control-solid"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                style={{ fontFamily: 'Lalezar' }}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label required" style={{ fontFamily: 'Lalezar' }}>آدرس</label>
              <input
                type="text"
                className="form-control form-control-solid"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                style={{ fontFamily: 'Lalezar' }}
              />
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-md-6">
              <label className="form-label" style={{ fontFamily: 'Lalezar' }}>آیکون</label>
              <input
                type="text"
                className="form-control form-control-solid"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                style={{ fontFamily: 'Lalezar' }}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label required" style={{ fontFamily: 'Lalezar' }}>ترتیب نمایش</label>
              <input
                type="number"
                className="form-control form-control-solid"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                required
                min="0"
                style={{ fontFamily: 'Lalezar' }}
              />
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-md-6">
              <label className="form-label" style={{ fontFamily: 'Lalezar' }}>منوی والد</label>
              <div className="position-relative">
                <div
                  className="form-control form-control-solid d-flex justify-content-between align-items-center"
                  onClick={() => setShowParentSelector(!showParentSelector)}
                  style={{ cursor: 'pointer', fontFamily: 'Lalezar' }}
                >
                  <span>{getSelectedParentTitle(formData.parentId)}</span>
                  <KTIcon iconName="arrow-down" className="fs-2" />
                </div>
                {showParentSelector && (
                  <div 
                    className="position-absolute w-100 bg-white border rounded shadow-sm mt-1 p-3"
                    style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}
                  >
                    <div 
                      className="d-flex align-items-center p-2 rounded cursor-pointer hover-bg-light mb-2"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, parentId: null }));
                        setShowParentSelector(false);
                      }}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: formData.parentId === null ? '#f5f8fa' : 'transparent',
                        borderRadius: '4px'
                      }}
                    >
                      <KTIcon iconName="element-11" className="fs-2 me-2" />
                      <span style={{ fontFamily: 'Lalezar' }}>بدون والد (منوی اصلی)</span>
                    </div>
                    {renderMenuItemTree(menuItems)}
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label" style={{ fontFamily: 'Lalezar' }}>وضعیت</label>
              <div className="form-check form-switch form-check-custom form-check-solid">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <label className="form-check-label" style={{ fontFamily: 'Lalezar' }}>
                  {formData.isActive ? 'فعال' : 'غیرفعال'}
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Floating Buttons */}
      <div 
        className="position-fixed d-flex flex-column"
        style={{ 
          left: '2rem',
          bottom: '6rem',
          zIndex: 1000,
          gap: '1rem'
        }}
      >
        <button
          type="button"
          className="material-fab primary"
          onClick={() => navigate('/menu-items')}
          style={{ position: 'relative' }}
        >
          <div className="btn-content">
            <div className="icon-wrapper">
              <KTIcon iconName="arrow-right" className="fs-2" />
            </div>
            <span className="btn-text">
              بازگشت
            </span>
          </div>
          <div className="ripple"></div>
        </button>
        <button
          type="submit"
          className="material-fab success"
          onClick={handleSubmit}
          style={{ position: 'relative' }}
        >
          <div className="btn-content">
            <div className="icon-wrapper">
              <KTIcon iconName={id ? "check" : "plus"} className="fs-2" />
            </div>
            <span className="btn-text">
              {id ? 'بروزرسانی' : 'ذخیره صفحه'}
            </span>
          </div>
          <div className="ripple"></div>
        </button>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            transition: 'opacity 0.3s ease'
          }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItemEditor; 