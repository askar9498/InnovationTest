
import React from 'react'
import { Card5 } from '../../../../_metronic/partials/content/cards/Card5'
import { Link } from 'react-router-dom'

export function Campaigns() {
  return (
    <>
      <div className='row g-6 g-xl-9' style={{ fontFamily: 'sans' }} >
        <div className='col-sm-6 col-xl-4'>
          <Link to="/MyBlogManage">
            <Card5
              image='media/svg/brand-logos/twitch.svg'
              title='تعداد پست ها'
              description='451'
              status='down'
              statusValue={40.5}
              statusDesc='وضعیت خوب'
              progress={0.5}
              progressType='MRR'
            />
          </Link>
        </div>
        <div className='col-sm-6 col-xl-4'>
          <Card5
            image='media/svg/brand-logos/twitter.svg'
            title='فراخوان ها'
            description='11'
            status='up'
            statusValue={17.62}
            statusDesc='وضعیت خوب'
            progress={5}
            progressType='New trials'
          />
        </div>
        <div className='col-sm-6 col-xl-4'>
          <Link to="/MyUserManage">
            <Card5
              image='media/svg/brand-logos/spotify.svg'
              title='کاربران '
              description='1,073'
              status='up'
              statusValue={10.45}
              statusDesc='وضعیت خوب'
              progress={40}
              progressType='Impressions'
            />
          </Link>
        </div>
      </div>
    </>
  )
}
