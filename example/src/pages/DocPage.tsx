import React from 'react'
import { useAppContext } from '../context/AppContext'
import EnDocContent from './_EN_Doc'
import ZhDocContent from './_ZH_Doc'

const DocPage: React.FC = () => {
  const { locale } = useAppContext()
  if (locale === 'en-US') {
    return <EnDocContent />
  }
  return <ZhDocContent />
}
export default DocPage
