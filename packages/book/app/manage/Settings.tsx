import { CopyOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, Modal, Space } from 'antd'
import { useEffect } from 'react'
import { api } from '../.client/api'
import { useGetSetState } from 'react-use'
import { copyToClipboard } from '../.client/utils'

export function Settings(props: { open: boolean; onClose: () => void }) {
  const [state, setState] = useGetSetState({
    id: '',
    secret: ''
  })
  const [msg, ctx] = message.useMessage()
  useEffect(() => {
    if (props.open) {
      api.getEnv.query().then(res => {
        setState({id: res.ACCESS_KEY_ID, secret: res.ACCESS_KEY_SECRET})
      })
    }
  }, [props.open])
  return (
    <Modal
      title={'Settings'}
      width={460}
      open={props.open}
      onCancel={props.onClose}
      footer={null}
    >
      {ctx}
      <Form layout={'vertical'}>
        <Form.Item label={'AccessKeyId'}>
          <Space.Compact style={{ width: '100%' }}>
            <Input disabled={true} value={state().id}/>
            <Button icon={<CopyOutlined />} onClick={() => {
              copyToClipboard(state().id)
              msg.success('Copied to clipboard')
            }}/>
          </Space.Compact>
        </Form.Item>
        <Form.Item label={'AccessKeySecret'}>
          <Space.Compact style={{ width: '100%' }}>
            <Input disabled={true} value={state().secret}/>
            <Button icon={<CopyOutlined />} onClick={() => {
              copyToClipboard(state().secret)
              msg.success('Copied to clipboard')
            }}/>
          </Space.Compact>
        </Form.Item>
      </Form>
    </Modal>
  )
}
