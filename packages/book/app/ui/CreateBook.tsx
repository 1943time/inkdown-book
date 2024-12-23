import {
  Button,
  Form,
  Input,
  message,
  Modal,
  notification,
  Radio,
  Space
} from 'antd'
import { useCallback, useEffect, useRef } from 'react'
import { api } from '../.client/api'
import { useGetSetState } from 'react-use'
import { IApi } from '@inkdown/client'
import { localdb } from '../.client/db'
type Tree = {
  md?: string
  name: string
  children?: Tree[]
}
export function CreateBook(props: {
  open: boolean
  onClose: () => void
  onUpdate: () => void
  bookId?: string
}) {
  const [notif, contextHolder] = notification.useNotification()
  const dirHanndle = useRef<FileSystemDirectoryHandle>()
  const filesMap = useRef(new Map<string, FileSystemFileHandle>())
  const [form] = Form.useForm()
  const [state, setState] = useGetSetState({
    folderName: '',
    submitting: false
  })

  const readDir = useCallback(
    async (dir: FileSystemDirectoryHandle, parentPath: string[] = []) => {
      const tree: Tree[] = []
      for await (const [name, handle] of dir.entries()) {
        if (handle.kind === 'directory') {
          tree.push({
            name,
            children: await readDir(handle, [...parentPath, name])
          })
        } else if (name.endsWith('.md')) {
          const file = await handle.getFile()
          const md = await file.text()
          tree.push({
            name,
            md
          })
        } else {
          filesMap.current.set([...parentPath, name].join('/'), handle)
        }
      }
      return tree
    },
    []
  )

  const createBook = useCallback(() => {
    form.validateFields().then(async (v) => {
      try {
        const tree = await readDir(dirHanndle.current!)
        const client = new IApi({
          url: '',
          getFileData: async (path: string) => {
            return filesMap.current.get(path)?.getFile() || null
          },
          mode: 'manual'
        })
        await client.syncBook(v.id, v.name, tree)
        localdb.book.put(
          {
            bookId: v.id,
            handle: dirHanndle.current!
          },
          v.id
        )
        const btn = (
          <Space>
            <Button type='link' size='small' onClick={() => notif.destroy()}>
              Cancel
            </Button>
            <Button
              type='primary'
              size='small'
              onClick={() => {
                notif.destroy()
                window.open(`${location.host}/docs/${v.id}`)
              }}
            >
              Open
            </Button>
          </Space>
        )
        notif.open({
          message: 'Synchronization successful',
          description:
            'The content has been synchronized. Do you want to open it now?',
          btn,
          key: `open${Date.now()}`,
          duration: 2
        })
      } catch (e: any) {
        console.error(e)
        message.error(e?.message || 'Create Error')
      }
    })
  }, [])
  useEffect(() => {
    if (props.open) {
      if (props.bookId) {
        localdb.book.get(props.bookId!).then((res) => {
          if (res) {
            setState({ folderName: res.handle.name })
            dirHanndle.current = res.handle
          }
        })
        api.getBook
          .query({
            id: props.bookId
          })
          .then((res) => {
            form.setFieldsValue({
              id: res?.id,
              name: res?.name,
              mode: res?.lasteUpdateMode
            })
          })
      } else {
        setState({ folderName: '' })
        form.resetFields()
      }
      filesMap.current.clear()
    }
  }, [props.open, props.bookId])
  return (
    <Modal
      title={'Create Book'}
      footer={null}
      onCancel={props.onClose}
      width={500}
      open={props.open}
    >
      {contextHolder}
      <Form layout={'vertical'} form={form}>
        <Form.Item
          label={'ID'}
          name={'id'}
          tooltip={
            'The id determines the access path of the url. If the id conflicts, the content will be overwritten.'
          }
        >
          <Input max={50} />
        </Form.Item>
        <Form.Item label={'Name'} name={'name'}>
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item
          label={'Data Source'}
          tooltip={
            'Can also upload data via vscode and inkdown, please see the documentation for details.'
          }
          name={'mode'}
          initialValue={'manual'}
        >
          <Radio.Group>
            <Radio value={'manual'}>Manual</Radio>
            <Radio value={'github'}>Github</Radio>
            <Radio value={'gitlab'}>GitLab</Radio>
            <Radio value={'vscode'} disabled={true}>
              Vscode
            </Radio>
            <Radio value={'inkdown'} disabled={true}>
              Inkdown
            </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item shouldUpdate={(pre, cur) => pre.mode !== cur.mode} noStyle={true}>
          {() => (
            <>
              {form.getFieldValue('mode') === 'manual' && (
                <Form.Item label={'Select Folder'} tooltip={'Clear browser history or folder is moved, need to reselect'}>
                  <Button
                    onClick={() => {
                      window
                        .showDirectoryPicker({ mode: 'readwrite' })
                        .then((h) => {
                          dirHanndle.current = h
                          setState({ folderName: h.name })
                        })
                    }}
                  >
                    Select Folder
                  </Button>
                  <span className={'ml-2 text-blue-500 font-medium'}>
                    {state().folderName}
                  </span>
                </Form.Item>
              )}
            </>
          )}
        </Form.Item>
        <div className={'flex space-x-5 pt-5'}>
          <Button block={true} onClick={props.onClose}>
            Cancel
          </Button>
          <Button
            block={true}
            type={'primary'}
            onClick={createBook}
            loading={state().submitting}
          >
            {props.bookId ? 'Update' : 'Create Book'}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
