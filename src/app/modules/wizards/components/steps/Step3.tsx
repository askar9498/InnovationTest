import React, {FC} from 'react'
import {Field, ErrorMessage} from 'formik'

const Step3: FC = () => {
  return (
    <div className='w-100' dir="rtl">
      <div className='pb-10 pb-lg-12'>
        <h2 className='fw-bolder text-gray-900'>جزئیات کسب و کار</h2>

        <div className='text-gray-500 fw-bold fs-6'>
          برای اطلاعات بیشتر، لطفا به
          <a href='/dashboard' className='link-primary fw-bolder'>
            {' '}
            صفحه راهنما
          </a>
          مراجعه کنید.
        </div>
      </div>

      <div className='fv-row mb-10'>
        <label className='form-label required'>نام کسب و کار</label>

        <Field name='businessName' className='form-control form-control-lg form-control-solid' />
        <div className='text-danger mt-2'>
          <ErrorMessage name='businessName' />
        </div>
      </div>

      <div className='fv-row mb-10'>
        <label className='d-flex align-items-center form-label'>
          <span className='required'>توضیحات کوتاه</span>
        </label>

        <Field
          name='businessDescriptor'
          className='form-control form-control-lg form-control-solid'
        />
        <div className='text-danger mt-2'>
          <ErrorMessage name='businessDescriptor' />
        </div>

        <div className='form-text'>
          مشتریان این نسخه کوتاه شده از توضیحات شما را خواهند دید
        </div>
      </div>

      <div className='fv-row mb-10'>
        <label className='form-label required'>نوع شرکت</label>

        <Field
          as='select'
          name='businessType'
          className='form-select form-select-lg form-select-solid'
        >
          <option></option>
          <option value='1'>شرکت S</option>
          <option value='1'>شرکت C</option>
          <option value='2'>مالکیت انفرادی</option>
          <option value='3'>غیرانتفاعی</option>
          <option value='4'>مسئولیت محدود</option>
          <option value='5'>شراکت عمومی</option>
        </Field>
        <div className='text-danger mt-2'>
          <ErrorMessage name='businessType' />
        </div>
      </div>

      <div className='fv-row mb-10'>
        <label className='form-label'>توضیحات کسب و کار</label>

        <Field
          as='textarea'
          name='businessDescription'
          className='form-control form-control-lg form-control-solid'
          rows={3}
        ></Field>
      </div>

      <div className='fv-row mb-0'>
        <label className='fs-6 fw-bold form-label required'>ایمیل تماس</label>

        <Field name='businessEmail' className='form-control form-control-lg form-control-solid' />
        <div className='text-danger mt-2'>
          <ErrorMessage name='businessEmail' />
        </div>
      </div>
    </div>
  )
}

export {Step3}
