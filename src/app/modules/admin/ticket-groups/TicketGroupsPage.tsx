import React, { FC, useEffect, useState, FormEvent } from 'react';
import Swal from 'sweetalert2';
import { getAllTicketGroups, createTicketGroup, updateTicketGroup, deleteTicketGroup, TicketGroupDto, CreateTicketGroupDto, UpdateTicketGroupDto, PermissionEnums, decryptToJwt, getToken } from '../../auth/core/_requests';

const TicketGroupsPage: FC = () => {
  const [ticketGroups, setTicketGroups] = useState<TicketGroupDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<TicketGroupDto | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTicketGroups = async () => {
    try {
      setLoading(true);
      const groups = await getAllTicketGroups();
      setTicketGroups(groups);
    } catch (error) {
      console.error('Failed to fetch ticket groups:', error);
      Swal.fire({
        icon: 'error',
        title: 'خطا',
        text: 'خطا در بارگذاری گروه‌های تیکت.',
        confirmButtonText: 'باشه'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (event: FormEvent) => {
    event.preventDefault();
    if (!newGroupName.trim() || isCreating) return;

    setIsCreating(true);
    const createDto: CreateTicketGroupDto = { name: newGroupName };

    try {
      const createdGroup = await createTicketGroup(createDto);
      setTicketGroups([...ticketGroups, createdGroup]);
      setNewGroupName('');
      Swal.fire({
        icon: 'success',
        title: 'موفقیت',
        text: 'گروه تیکت با موفقیت ایجاد شد.',
        confirmButtonText: 'باشه'
      });
    } catch (error) {
      console.error('Failed to create ticket group:', error);
      Swal.fire({
        icon: 'error',
        title: 'خطا',
        text: 'خطا در ایجاد گروه تیکت.',
        confirmButtonText: 'باشه'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (group: TicketGroupDto) => {
    setEditingGroup(group);
    setNewGroupName(group.name); // Use newGroupName for the input field during edit
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
    setNewGroupName(''); // Clear the input field
  };

  const handleUpdateGroup = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingGroup || !newGroupName.trim() || isUpdating) return;

    setIsUpdating(true);
    const updateDto: UpdateTicketGroupDto = { id: editingGroup.id, name: newGroupName };

    try {
      const updatedGroup = await updateTicketGroup(editingGroup.id, updateDto);
      setTicketGroups(ticketGroups.map(group => group.id === updatedGroup.id ? updatedGroup : group));
      setEditingGroup(null);
      setNewGroupName('');
      Swal.fire({
        icon: 'success',
        title: 'موفقیت',
        text: 'گروه تیکت با موفقیت به‌روزرسانی شد.',
        confirmButtonText: 'باشه'
      });
    } catch (error) {
      console.error(`Failed to update ticket group ID ${editingGroup.id}:`, error);
      Swal.fire({
        icon: 'error',
        title: 'خطا',
        text: 'خطا در به‌روزرسانی گروه تیکت.',
        confirmButtonText: 'باشه'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (isDeleting) return;

    Swal.fire({
      title: 'آیا مطمئن هستید؟',
      text: "شما نمی‌توانید این مورد را برگردانید!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'بله، حذف کن!',
      cancelButtonText: 'لغو'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsDeleting(true);
        try {
          const success = await deleteTicketGroup(id);
          if (success) {
            setTicketGroups(ticketGroups.filter(group => group.id !== id));
            Swal.fire(
              'حذف شد!',
              'گروه تیکت با موفقیت حذف شد.',
              'success'
            );
          } else {
             Swal.fire(
              'خطا',
              'گروه تیکت یافت نشد.',
              'error'
            );
          }
        } catch (error) {
          console.error(`Failed to delete ticket group ID ${id}:`, error);
           Swal.fire(
            'خطا',
            'خطا در حذف گروه تیکت.',
            'error'
          );
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const userHasAccess = (permission: number) => {
    try {
      const token = getToken();
      if (!token) return false;
      const data = decryptToJwt(token.toString());
      return data?.Permissions?.includes(permission) || false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    fetchTicketGroups();
  }, []);

  return (
    <div className="card" dir="rtl" style={{ fontFamily: "sans" }}>
      <div className="card-header">
        <h3 className="card-title">مدیریت گروه‌های تیکت</h3>
      </div>
      <div className="card-body py-5">
        {/* Create/Edit Form */}
        <div className="mb-10">
          <h4>{editingGroup ? 'ویرایش گروه تیکت' : 'ایجاد گروه تیکت جدید'}</h4>
          <form onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup}>
            <div className="mb-4">
              <label htmlFor="groupName" className="form-label">نام گروه</label>
              <input
                type="text"
                className="form-control form-control-solid"
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
                disabled={isCreating || isUpdating}
              />
            </div>
            <div className="d-flex">
              {(!editingGroup && userHasAccess(PermissionEnums.CreateTicketGroupButton)) && (
                <button
                  type="submit"
                  className="btn btn-primary me-2"
                  disabled={!newGroupName.trim() || isCreating || isUpdating}
                >
                  {isCreating ? 'در حال ایجاد...' : 'ایجاد گروه'}
                </button>
              )}
              {(editingGroup && userHasAccess(PermissionEnums.EditTicketGroupButton)) && (
                <button
                  type="submit"
                  className="btn btn-primary me-2"
                  disabled={!newGroupName.trim() || isCreating || isUpdating}
                >
                  {isUpdating ? 'در حال به‌روزرسانی...' : 'به‌روزرسانی'}
                </button>
              )}
              {editingGroup && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  لغو
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Separator */}
        <div className="separator separator-dashed my-10"></div>

        {/* Ticket Groups List */}
        <h4>گروه‌های موجود ({ticketGroups.length})</h4> {/* Added count */}
        {loading ? (
          <p>در حال بارگذاری گروه‌ها...</p>
        ) : ticketGroups.length === 0 ? (
          <p>گروهی یافت نشد.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {ticketGroups.map(group => (
              <li
                key={group.id}
                className={`list-group-item d-flex justify-content-between align-items-center ${editingGroup?.id === group.id ? 'active' : ''}`}
              >
                <span className="fw-bold">{group.name}</span> {/* Make group name bold */}
                <div>
                  {userHasAccess(PermissionEnums.EditTicketGroupButton) && (
                    <button
                      className="btn btn-icon btn-light-primary btn-sm me-2"
                      onClick={() => handleEditClick(group)}
                      disabled={isDeleting || isUpdating}
                    >
                      <i className="bi bi-pencil fs-4"></i> {/* Use Bootstrap icon for edit */}
                    </button>
                  )}
                  {userHasAccess(PermissionEnums.DeleteTicketGroupButton) && (
                    <button
                      className="btn btn-icon btn-light-danger btn-sm"
                      onClick={() => handleDeleteGroup(group.id)}
                      disabled={isDeleting || isUpdating}
                    >
                      <i className="bi bi-trash fs-4"></i> {/* Use Bootstrap icon for delete */}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TicketGroupsPage;