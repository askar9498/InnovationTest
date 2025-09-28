import {FC} from 'react'
import {KTIcon, toAbsoluteUrl} from '../../../helpers'
import {Dropdown1} from '../dropdown/Dropdown1'

type Props = {
  image: string
  title: string
  description: string
  status: 'up' | 'down'
  statusValue: number
  statusDesc: string
  progress: number
  progressType: string
}

const Card5: FC<Props> = ({
  image,
  title,
  description,
  status,
  statusValue,
  statusDesc,
  progress,
  progressType,
}) => {
  return (
    <div className='card h-100 text-center align-items-center' dir={"rtl"}>
      <div className='card-header flex-nowrap border-0 pt-0'>
        <div className='card-title m-0'>
          <div className='symbol symbol-45px w-45px bg-light me-5'>
            <img src={toAbsoluteUrl(image)} alt='Metronic' className='p-3' />
          </div>

          <div className='fs-4 text-hover-primary text-gray-600 m-0 px-3'>
            {title}
          </div>
        </div>
      </div>

      <div className='card-body d-flex flex-row px-9 pt-0 pb-0'>
        <div className='fs-2tx fw-bolder mb-3 text-center'>{description}</div>

        <div className='d-flex align-items-center flex-wrap mb-5 mx-6  fs-6'>
          {status === 'up' && (
            <KTIcon iconName='arrow-up-right' className='fs-3 me-1 text-success' />
          )}

          {status === 'down' && <KTIcon iconName='black-left' className='fs-3 me-1 text-danger' />}

          <div className={`me-2 px-5  ` + (status === 'up' ? 'text-success' : 'text-danger')}>
            {status === 'up' ? '+' : '-'}
            {statusValue}%
          </div>

          <div className=' text-gray-500'>{statusDesc}</div>
        </div>
      </div>
    </div>
  )
}

export {Card5}
