import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {ContactUsRequestDto, ContactUsResponseDto} from '../modules/contact-us/core/_models';
import {
  createContactUs,
  deleteContactUs,
  getAllContactUs,
  searchContactUs,
  updateContactUs,
} from '../modules/contact-us/core/_requests';
import { KTSVG } from '../../_metronic/helpers/components/KTSVG';
import Swal from 'sweetalert2';

const ContactUsManage: React.FC = () => {
  const [contactUsList, setContactUsList] = useState<ContactUsResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactUsResponseDto | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const loadContactUs = async () => {
    try {
      setLoading(true);
      const response = await getAllContactUs();
      setContactUsList(response);
    } catch (error) {
      console.error('Error loading contact us messages:', error);
      await Swal.fire({
        title: 'خطا!',
        text: 'در بارگذاری لیست پیام‌ها مشکلی پیش آمد.',
        icon: 'error',
        confirmButtonText: 'باشه',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContactUs();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await searchContactUs(searchTerm);
      setContactUsList(response.items);
    } catch (error) {
      console.error('Error searching contact us messages:', error);
      await Swal.fire({
        title: 'خطا!',
        text: 'در جستجوی پیام‌ها مشکلی پیش آمد.',
        icon: 'error',
        confirmButtonText: 'باشه',
      });
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik<ContactUsRequestDto>({
    initialValues: {
      name: '',
      family: '',
      phoneNumber: '',
      email: '',
      title: '',
      content: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('نام الزامی است'),
      family: Yup.string().required('نام خانوادگی الزامی است'),
      phoneNumber: Yup.string().required('شماره تلفن الزامی است'),
      email: Yup.string().email('ایمیل نامعتبر است').required('ایمیل الزامی است'),
      title: Yup.string().required('عنوان الزامی است'),
      content: Yup.string().required('متن پیام الزامی است'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (selectedContact) {
          await updateContactUs(selectedContact.id, values);
          await Swal.fire({
            title: 'موفق!',
            text: 'پیام با موفقیت ویرایش شد.',
            icon: 'success',
            confirmButtonText: 'باشه',
          });
        } else {
          await createContactUs(values);
          await Swal.fire({
            title: 'موفق!',
            text: 'پیام با موفقیت ایجاد شد.',
            icon: 'success',
            confirmButtonText: 'باشه',
          });
        }
        setShowModal(false);
        await loadContactUs(); // Refresh the list after create/update
      } catch (error) {
        console.error('Error saving contact us message:', error);
        await Swal.fire({
          title: 'خطا!',
          text: 'در ذخیره پیام مشکلی پیش آمد.',
          icon: 'error',
          confirmButtonText: 'باشه',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleEdit = (contact: ContactUsResponseDto) => {
    setSelectedContact(contact);
    formik.setValues({
      name: contact.name,
      family: contact.family,
      phoneNumber: contact.phoneNumber,
      email: contact.email,
      title: contact.title,
      content: contact.content,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'آیا از حذف این پیام اطمینان دارید؟',
      text: 'این عملیات غیرقابل بازگشت است!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله، حذف شود',
      cancelButtonText: 'انصراف',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await deleteContactUs(id);
        await Swal.fire({
          title: 'حذف شد!',
          text: 'پیام با موفقیت حذف شد.',
          icon: 'success',
          confirmButtonText: 'باشه',
        });
        await loadContactUs(); // Refresh the list after delete
      } catch (error) {
        console.error('Error deleting contact us message:', error);
        await Swal.fire({
          title: 'خطا!',
          text: 'در حذف پیام مشکلی پیش آمد.',
          icon: 'error',
          confirmButtonText: 'باشه',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = (contact: ContactUsResponseDto) => {
    setSelectedContact(contact);
    setShowViewModal(true);
  };

  return (
    <div className='card'  dir="rtl" style={{ fontFamily: "sans" }}>
      <div className='card-header border-0 pt-6'>
        <div className='card-title'>
          <div className='d-flex align-items-center position-relative my-1'>
            <KTSVG
              path='/media/icons/duotune/general/gen021.svg'
              className='svg-icon-1 position-absolute me-6'
            />
            <input
              type='text'
              className='form-control form-control-solid w-250px pe-14'
              placeholder='جستجو'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <div className='card-toolbar'>
          <button
            type='button'
            className='btn btn-primary'
            onClick={() => {
              setSelectedContact(null);
              formik.resetForm();
              setShowModal(true);
            }}
          >
            <KTSVG path='/media/icons/duotune/arrows/arr075.svg' className='svg-icon-2' />
            افزودن پیام جدید
          </button>
        </div>
      </div>

      <div className='card-body py-4'>
        <div className='table-responsive'>
          <table className='table align-middle table-row-dashed fs-6 gy-5'>
            <thead>
              <tr className='text-center text-muted fw-bold fs-7 text-uppercase gs-0'>
                <th className='text-center'>نام</th>
                <th className='text-center'>نام خانوادگی</th>
                <th className='text-center'>شماره تلفن</th>
                <th className='text-center'>ایمیل</th>
                <th className='text-center'>عنوان</th>
                <th className='text-center'>تاریخ ایجاد</th>
                <th className='text-center'>عملیات</th>
              </tr>
            </thead>
            <tbody className='text-gray-600 fw-semibold'>
              {contactUsList.map((contact) => (
                <tr key={contact.id}>
                  <td className='text-center'>{contact.name}</td>
                  <td className='text-center'>{contact.family}</td>
                  <td className='text-center'>{contact.phoneNumber}</td>
                  <td className='text-center'>{contact.email}</td>
                  <td className='text-center'>{contact.title}</td>
                  <td className='text-center'>{new Date(contact.createdAt).toLocaleDateString('fa-IR')}</td>
                  <td className='text-center'>
                    <button
                      className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm ms-3'
                      onClick={() => handleView(contact)}
                      title='مشاهده'
                    >
                      <KTSVG path='/media/icons/duotune/general/gen019.svg' className='svg-icon-3' />
                    </button>
                    <button
                      className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm ms-3'
                      onClick={() => handleEdit(contact)}
                      title='ویرایش'
                    >
                      <KTSVG path='/media/icons/duotune/art/art005.svg' className='svg-icon-3' />
                    </button>
                    <button
                      className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
                      onClick={() => handleDelete(contact.id)}
                      title='حذف'
                    >
                      <KTSVG path='/media/icons/duotune/general/gen027.svg' className='svg-icon-3' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className='modal fade show d-block' tabIndex={-1}>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>
                  {selectedContact ? 'ویرایش پیام' : 'افزودن پیام جدید'}
                </h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={formik.handleSubmit}>
                <div className='modal-body'>
                  <div className='mb-3'>
                    <label className='form-label'>نام</label>
                    <input
                      type='text'
                      className='form-control'
                      {...formik.getFieldProps('name')}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <div className='text-danger'>{formik.errors.name}</div>
                    )}
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>نام خانوادگی</label>
                    <input
                      type='text'
                      className='form-control'
                      {...formik.getFieldProps('family')}
                    />
                    {formik.touched.family && formik.errors.family && (
                      <div className='text-danger'>{formik.errors.family}</div>
                    )}
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>شماره تلفن</label>
                    <input
                      type='text'
                      className='form-control'
                      {...formik.getFieldProps('phoneNumber')}
                    />
                    {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                      <div className='text-danger'>{formik.errors.phoneNumber}</div>
                    )}
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>ایمیل</label>
                    <input
                      type='email'
                      className='form-control'
                      {...formik.getFieldProps('email')}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <div className='text-danger'>{formik.errors.email}</div>
                    )}
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>عنوان</label>
                    <input
                      type='text'
                      className='form-control'
                      {...formik.getFieldProps('title')}
                    />
                    {formik.touched.title && formik.errors.title && (
                      <div className='text-danger'>{formik.errors.title}</div>
                    )}
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>متن پیام</label>
                    <textarea
                      className='form-control'
                      rows={4}
                      {...formik.getFieldProps('content')}
                    />
                    {formik.touched.content && formik.errors.content && (
                      <div className='text-danger'>{formik.errors.content}</div>
                    )}
                  </div>
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn btn-light'
                    onClick={() => setShowModal(false)}
                  >
                    انصراف
                  </button>
                  <button type='submit' className='btn btn-primary' disabled={loading}>
                    {loading ? 'در حال ذخیره...' : 'ذخیره'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedContact && (
        <div className='modal fade show d-block' tabIndex={-1}>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>مشاهده پیام</h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className='modal-body'>
                <div className='mb-3'>
                  <label className='form-label fw-bold'>نام:</label>
                  <p>{selectedContact.name}</p>
                </div>
                <div className='mb-3'>
                  <label className='form-label fw-bold'>نام خانوادگی:</label>
                  <p>{selectedContact.family}</p>
                </div>
                <div className='mb-3'>
                  <label className='form-label fw-bold'>شماره تلفن:</label>
                  <p>{selectedContact.phoneNumber}</p>
                </div>
                <div className='mb-3'>
                  <label className='form-label fw-bold'>ایمیل:</label>
                  <p>{selectedContact.email}</p>
                </div>
                <div className='mb-3'>
                  <label className='form-label fw-bold'>عنوان:</label>
                  <p>{selectedContact.title}</p>
                </div>
                <div className='mb-3'>
                  <label className='form-label fw-bold'>متن پیام:</label>
                  <p className='text-wrap'>{selectedContact.content}</p>
                </div>
                <div className='mb-3'>
                  <label className='form-label fw-bold'>تاریخ ایجاد:</label>
                  <p>{new Date(selectedContact.createdAt).toLocaleDateString('fa-IR')}</p>
                </div>
                {selectedContact.updatedAt && (
                  <div className='mb-3'>
                    <label className='form-label fw-bold'>آخرین ویرایش:</label>
                    <p>{new Date(selectedContact.updatedAt).toLocaleDateString('fa-IR')}</p>
                  </div>
                )}
              </div>
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn btn-light'
                  onClick={() => setShowViewModal(false)}
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactUsManage; 