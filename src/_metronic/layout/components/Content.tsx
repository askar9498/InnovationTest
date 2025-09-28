import {FC, useEffect, useState} from 'react'
import {useLocation} from 'react-router'
import clsx from 'clsx'
import {useLayout} from '../core'
import {DrawerComponent} from '../../assets/ts/components'
import {WithChildren} from '../../helpers'

const Content: FC<WithChildren> = ({children}) => {
  const {classes} = useLayout()
  const location = useLocation()
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 768)

  useEffect(() => {
    DrawerComponent.hideAll()
  }, [location])

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div 
      id='kt_content_container' 
      className={clsx(classes.contentContainer.join(' '))}
      style={{
        marginRight: isWideScreen ? '20%' : '0',
        width: isWideScreen ? '80%' : '100%'
      }}
    >
      {children}
    </div>
  )
}

export {Content}
