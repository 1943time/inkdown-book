import { redirect } from "@remix-run/node";
import { useNavigate } from '@remix-run/react'
import { useEffect } from 'react'


export default function Index() {
  const navigate = useNavigate()
  useEffect(() => {
    if (localStorage.getItem('inkdown-token')) {
      navigate('/manage', {replace: true})
    } else {
      navigate('/inkdown-login', {replace: true})
    }
  }, [])
  return null
}
