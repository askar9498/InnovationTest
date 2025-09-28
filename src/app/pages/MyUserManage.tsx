import { TablesWidget6 } from "../../_metronic/partials/widgets";
import React, { useState, useEffect } from 'react';
import { AddRole, GetAllRoles } from '../modules/auth/core/_requests';
import { KTIcon } from "../../_metronic/helpers";

export function MyUserManage() {
  const [roleName, setRoleName] = useState('');
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // بارگیری لیست نقش‌ها
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await GetAllRoles();
      setRoles(response.items || []);
    } catch (error) {
      console.error('خطا در بارگیری نقش‌ها:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = async () => {
    if (!roleName.trim()) {
      alert('Role name cannot be empty');
      return;
    }
    try {
      await AddRole(roleName);
      alert(`Role "${roleName}" added successfully!`);
      setRoleName(''); // Clear the input after successful submission
      // بارگیری مجدد لیست نقش‌ها
      fetchRoles();
    } catch (error) {
      alert('Failed to add role.');
    }
  };

  const handleRoleFilterChange = (roleId: string) => {
    setSelectedRole(roleId);
    // ارسال فیلتر به کامپوننت TablesWidget6
    // این کار از طریق props یا context انجام می‌شود
  };

  return (
    <>
      <div dir="rtl" style={{ fontFamily: "sans" }}>
        {/* فیلتر نقش */}
        <div className="card mb-5">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-label fw-bold fs-3 mb-1">فیلتر بر اساس نقش</span>
            </h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <label className="form-label fw-bold">انتخاب نقش:</label>
                <select
                  className="form-select"
                  value={selectedRole}
                  onChange={(e) => handleRoleFilterChange(e.target.value)}
                  disabled={loading}
                >
                  <option value="">همه نقش‌ها</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">افزودن نقش جدید:</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="نام نقش جدید"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleAddRole}
                    disabled={!roleName.trim()}
                  >
                    <KTIcon iconName="plus" className="fs-2" />
                    افزودن
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* جدول کاربران */}
        <TablesWidget6 className={''} selectedRoleFilter={selectedRole} />
      </div>
    </>
  );
}
