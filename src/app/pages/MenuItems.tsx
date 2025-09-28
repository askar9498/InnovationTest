import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { KTIcon } from '../../_metronic/helpers';
import { getApiUrl } from '../../config/api';
import { getToken } from '../modules/auth/core/_requests';
import "@fontsource/lalezar";
import '../../assets/css/custom-buttons.css';

interface MenuItem {
  id: number;
  title: string;
  url?: string;
  icon?: string;
  parentId?: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  children?: MenuItem[];
}

const MenuItems: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
  }, []);

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

  const buildMenuHierarchy = (items: MenuItem[]): MenuItem[] => {
    const itemMap = new Map<number, MenuItem>();
    const rootItems: MenuItem[] = [];

    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    items.forEach(item => {
      const menuItem = itemMap.get(item.id)!;
      if (!item.parentId) {
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

  const handleDelete = async (id: number) => {
    if (window.confirm('آیا از حذف این آیتم منو اطمینان دارید؟')) {
      try {
        await axios.delete(getApiUrl(`/api/MenuItem/Delete/${id}`), {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          withCredentials: true
        });
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const renderMenuItemTree = (items: MenuItem[], level = 0, isLastChild = false) => {
    return items.map((item, index) => {
      const isLast = index === items.length - 1;
      return (
        <div key={item.id} className="menu-item-tree position-relative">
          {/* Vertical line for children */}
          {item.children && item.children.length > 0 && (
            <div 
              className="position-absolute"
              style={{
                right: '1.5rem',
                top: '3rem',
                bottom: '-1.5rem',
                width: '2px',
                background: 'linear-gradient(180deg, #BBDEFB 0%, rgba(187, 222, 251, 0.3) 100%)',
                zIndex: 0,
                borderRadius: '2px',
                boxShadow: '0 0 8px rgba(187, 222, 251, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: 0.8
              }}
            />
          )}
          
          {/* Horizontal line for child items */}
          {level > 0 && (
            <div 
              className="position-absolute"
              style={{
                right: '1.5rem',
                top: '1.5rem',
                width: '3rem',
                height: '2px',
                background: 'linear-gradient(90deg, rgba(187, 222, 251, 0.3) 0%, #BBDEFB 100%)',
                zIndex: 0,
                borderRadius: '2px',
                boxShadow: '0 0 8px rgba(187, 222, 251, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: 0.8
              }}
            />
          )}

          <div
            className="d-flex align-items-center p-3 rounded mb-2 position-relative"
            style={{
              marginRight: `${level * 3}rem`,
              backgroundColor: level === 0 ? '#ffffff' : '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 1,
              boxShadow: level === 0 
                ? '0 4px 12px rgba(187, 222, 251, 0.08), 0 8px 24px rgba(187, 222, 251, 0.08)'
                : '0 2px 8px rgba(187, 222, 251, 0.05)',
              transform: 'translateX(0)',
              borderLeft: level > 0 ? '4px solid #BBDEFB' : 'none',
              marginBottom: level > 0 ? '1.5rem' : '1rem',
              backdropFilter: 'blur(10px)',
              background: level === 0 
                ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = level === 0 ? '#f8fafc' : '#f1f5f9';
              e.currentTarget.style.transform = 'translateX(-4px) scale(1.02)';
              e.currentTarget.style.boxShadow = level === 0 
                ? '0 8px 24px rgba(187, 222, 251, 0.12), 0 16px 48px rgba(187, 222, 251, 0.12)'
                : '0 4px 12px rgba(187, 222, 251, 0.08)';
              
              // Enhance connection wires on hover
              const verticalLine = e.currentTarget.parentElement?.querySelector('.position-absolute:first-child');
              const horizontalLine = e.currentTarget.parentElement?.querySelector('.position-absolute:last-child');
              
              if (verticalLine instanceof HTMLElement) {
                verticalLine.style.opacity = '1';
                verticalLine.style.boxShadow = '0 0 12px rgba(187, 222, 251, 0.3)';
              }
              if (horizontalLine instanceof HTMLElement) {
                horizontalLine.style.opacity = '1';
                horizontalLine.style.boxShadow = '0 0 12px rgba(187, 222, 251, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = level === 0 ? '#ffffff' : '#f8fafc';
              e.currentTarget.style.transform = 'translateX(0) scale(1)';
              e.currentTarget.style.boxShadow = level === 0 
                ? '0 4px 12px rgba(187, 222, 251, 0.08), 0 8px 24px rgba(187, 222, 251, 0.08)'
                : '0 2px 8px rgba(187, 222, 251, 0.05)';
              
              // Reset connection wires
              const verticalLine = e.currentTarget.parentElement?.querySelector('.position-absolute:first-child');
              const horizontalLine = e.currentTarget.parentElement?.querySelector('.position-absolute:last-child');
              
              if (verticalLine instanceof HTMLElement) {
                verticalLine.style.opacity = '0.8';
                verticalLine.style.boxShadow = '0 0 8px rgba(187, 222, 251, 0.2)';
              }
              if (horizontalLine instanceof HTMLElement) {
                horizontalLine.style.opacity = '0.8';
                horizontalLine.style.boxShadow = '0 0 8px rgba(187, 222, 251, 0.2)';
              }
            }}
          >
            <div className="d-flex align-items-center flex-grow-1">
              {item.children && item.children.length > 0 && (
                <div className="d-flex align-items-center me-3">
                  <div style={{ 
                    color: '#BBDEFB', 
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'scale(1.2)',
                    filter: 'drop-shadow(0 2px 4px rgba(187, 222, 251, 0.2))'
                  }}>
                    <KTIcon iconName="arrow-right" className="fs-2" />
                  </div>
                </div>
              )}
              {item.icon && (
                <div className="d-flex align-items-center me-3">
                  <div style={{ 
                    color: level === 0 ? '#BBDEFB' : '#64748b',
                    transform: 'scale(1.1)',
                    transition: 'all 0.3s ease',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                  }}>
                    <KTIcon iconName={item.icon} className="fs-2" />
                  </div>
                </div>
              )}
              <div className="d-flex flex-column">
                <span style={{ 
                  fontFamily: 'Lalezar', 
                  fontSize: level === 0 ? '1.2rem' : '1.1rem',
                  fontWeight: level === 0 ? 'bold' : 'normal',
                  color: level === 0 ? '#1e293b' : '#475569',
                  transition: 'all 0.3s ease',
                  textShadow: level === 0 ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                }}>
                  {item.title}
                </span>
                {item.url && (
                  <small className="text-muted" style={{ 
                    fontFamily: 'Lalezar',
                    fontSize: '0.85rem',
                    opacity: 0.8,
                    transition: 'all 0.3s ease',
                    textShadow: '0 1px 1px rgba(0,0,0,0.05)',
                    color: '#64748b'
                  }}>
                    {item.url}
                  </small>
                )}
              </div>
            </div>
            <div className="d-flex align-items-center">
              <div className={`badge badge-light-${item.isActive ? 'success' : 'warning'} fw-bold me-3`} 
                style={{ 
                  fontFamily: 'Lalezar',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  backgroundColor: item.isActive ? '#dcfce7' : '#fef3c7',
                  color: item.isActive ? '#166534' : '#92400e'
                }}>
                {item.isActive ? 'فعال' : 'غیرفعال'}
              </div>
              <div className="d-flex">
                <button
                  className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                  onClick={() => navigate(`/menu-item-editor/${item.id}`)}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="ویرایش"
                  style={{
                    boxShadow: '0 2px 4px rgba(187, 222, 251, 0.1)',
                    transition: 'all 0.3s ease',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    color: '#BBDEFB'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(187, 222, 251, 0.15)';
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(187, 222, 251, 0.1)';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                >
                  <KTIcon iconName="pencil" className="fs-2" />
                </button>
                <button
                  className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                  onClick={() => handleDelete(item.id)}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="حذف"
                  style={{
                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.1)',
                    transition: 'all 0.3s ease',
                    borderRadius: '8px',
                    backgroundColor: '#fef2f2',
                    color: '#ef4444'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.15)';
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                  }}
                >
                  <KTIcon iconName="trash" className="fs-2" />
                </button>
              </div>
            </div>
          </div>
          {item.children && item.children.length > 0 && (
            <div className="menu-item-children position-relative">
              {renderMenuItemTree(item.children, level + 1, isLast)}
            </div>
          )}
        </div>
      );
    });
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
          <h2 className="fw-bold" style={{ fontFamily: 'Lalezar' }}>مدیریت منو</h2>
        </div>
        <div className="card-toolbar">
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
              onClick={() => navigate('/menu-item-editor')}
            >
              <div className="btn-content">
                <div className="icon-wrapper">
                  <KTIcon 
                    iconName="plus" 
                    className="fs-2"
                  />
                </div>
                <span className="btn-text">
                  ایجاد آیتم جدید
                </span>
              </div>
              <div className="ripple"></div>
            </button>
          </div>
        </div>
      </div>
      <div className="card-body py-4">
        <div className="menu-tree-container">
          {renderMenuItemTree(menuItems)}
        </div>
      </div>
    </div>
  );
};

export default MenuItems; 