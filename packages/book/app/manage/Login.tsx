import { Button, ConfigProvider, Form, Input, message, Tabs } from 'antd'
import { ClientOnly } from '../ui/ClientOnly'
import { useAntdTheme } from '../utils/theme'
import { useGetSetState } from 'react-use'
import { useCallback } from 'react'
import { api } from '../.client/api'
import { useNavigate } from '@remix-run/react'
import { useClientLayoutEffect } from '../utils/common'
export function Login(props: {token: null | string}) {
  const navigate = useNavigate()
  const [state, setState] = useGetSetState({
    id: '',
    secret: ''
  })
  const [msg, ctx] = message.useMessage()
  const login = useCallback(() => {
    api.login.mutate({
      id: state().id,
      secret: state().secret
    }).then(res => {
      if (res.token) {
        localStorage.setItem('inkdown-token', res.token)
        navigate('/manage', {replace: true})
      } else {
        msg.warning(`The id or secret is incorrect`)
      }
    })
  }, [])
  const theme = useAntdTheme()
  useClientLayoutEffect(() => {
    if (props.token) {
      localStorage.setItem('inkdown-token', props.token)
      navigate('/manage', {replace: true})
    }
  }, [])
  return (
    <ClientOnly>
      <ConfigProvider
        theme={{
          algorithm: theme
        }}
      >
        {ctx}
        <div className={'pt-20 w-[360px] mx-auto'}>
          <div className={'flex items-center justify-center text-xl font-medium mb-8 space-x-3'}>
            <img src={'/icon.png'} className={'w-8 h-8'}/>
            <span>Inkdown Book</span>
          </div>
          <Form layout={'vertical'}>
            <Form.Item label={'AccessKeyId'}>
              <Input value={state().id} onChange={e => setState({id: e.target.value})}/>
            </Form.Item>
            <Form.Item label={'AccessKeySecret'}>
              <Input value={state().secret} onChange={e => setState({secret: e.target.value})}/>
            </Form.Item>
            <Form.Item label={''}>
              <Button type={'primary'} block={true} onClick={login}>Login</Button>
            </Form.Item>
          </Form>
        </div>
      </ConfigProvider>
    </ClientOnly>
  )
}
