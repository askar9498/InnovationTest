
import React from 'react'
import {Card3} from '../../../../_metronic/partials/content/cards/Card3'

export function Connections() {
  return (
    <>
      <div className='d-flex flex-wrap flex-stack mb-6'>
        <h3 className='fw-bolder my-2'>
          My Contacts
          <span className='fs-6 text-gray-500 fw-bold ms-1'>(59)</span>
        </h3>

        <div className='d-flex my-2'>
          <select
            name='status'
            data-control='select2'
            data-hide-search='true'
            className='form-select form-select-white form-select-sm w-125px'
            defaultValue='Online'
          >
            <option value='Online'>Online</option>
            <option value='Pending'>Pending</option>
            <option value='Declined'>Declined</option>
            <option value='Accepted'>Accepted</option>
          </select>
        </div>
      </div>

      <div className='row g-6 g-xl-9'>
        <div className='col-md-6 col-xxl-4'>
          <Card3
            avatar='media/avatars/300-6.jpg'
            name='Emma Smith'
            job='Art Director'
            avgEarnings='$14,560'
            totalEarnings='$236,400'
          />
        </div>
        <div className='col-md-6 col-xxl-4'>
          <Card3
            color='danger'
            name='Melody Macy'
            job='Marketing Analytic'
            avgEarnings='$14,560'
            totalEarnings='$236,400'
            online={true}
          />
        </div>
        <div className='col-md-6 col-xxl-4'>
          <Card3
            avatar='media/avatars/300-1.jpg'
            name='Max Smith'
            job='Software Enginer'
            avgEarnings='$14,560'
            totalEarnings='$236,400'
          />
        </div>
        <div className='col-md-6 col-xxl-4'>
          <Card3
            avatar='media/avatars/300-5.jpg'
            name='Sean Bean'
            job='Web Developer'
            avgEarnings='$14,560'
            totalEarnings='$236,400'
          />
        </div>
        <div className='col-md-6 col-xxl-4'>
          <Card3
            avatar='media/avatars/300-25.jpg'
            name='Brian Cox'
            job='UI/UX Designer'
            avgEarnings='$14,560'
            totalEarnings='$236,400'
          />
        </div>
        <div className='col-md-6 col-xxl-4'>
          <Card3
            color='warning'
            name='Mikaela Collins'
            job='Head Of Marketing'
            avgEarnings='$14,560'
            totalEarnings='$236,400'
            online={true}
          />
        </div>
        <div className='col-md-6 col-xxl-4'>
          <Card3
            avatar='media/avatars/300-9.jpg'
            name='Francis Mitcham'
            job='Software Arcitect'
            avgEarnings='$14,560'
            totalEarnings='$236,400'
          />
        </div>
        <div className='col-md-6 col-xxl-4'>
          <Card3
            color='danger'
            name='Olivia Wild'
            job='System Admin'
            avgEarnings='$14,560'
            totalEarnings='$236,400'
            online={true}
          />
        </div>
        <div className='col-md-6 col-xxl-4'>
          <Card3
            color='primary'
            name='Neil Owen'
            job='Account Manager'
            avgEarnings='$14,560'
            totalEarnings='$236,400'
            online={true}
          />
        </div>
        <div className='col-md-6 col-xxl-4'>
          <Card3
            avatar='media/avatars/300-23.jpg'
            name='Dan Wilson'
            job='Web Desinger'
            avgEarnings='$14,560'
            totalEarnings='$236,400'
          />
        </div>
        <div className='col-md-6 col-xxl-4'>
          <Card3
            color='danger'
            name='Emma Bold'
            job='Corporate Finance'
            avgEarnings='$14,560'
            totalEarnings='$236,400'
            online={true}
          />
        </div>
        <div className='col-md-6 col-xxl-4'>
          <Card3
            avatar='media/avatars/300-12.jpg'
            name='Ana Crown'
            job='Customer Relationship'
            avgEarnings='$14,560'
            totalEarnings='$236,400'
          />
        </div>
      </div>

    </>
  )
}
