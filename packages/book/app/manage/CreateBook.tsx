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
import { sortTree, DataTree } from '@inkdown/client'
import {sha1} from 'js-sha1'
import { useNavigate } from '@remix-run/react'
export function CreateBook(props: {
  open: boolean
  onClose: () => void
  onUpdate: () => void
  bookId?: string
}) {
  const navicate = useNavigate()
  const [notif, contextHolder] = notification.useNotification()
  const dirHanndle = useRef<FileSystemDirectoryHandle>()
  const filesMap = useRef(new Map<string, FileSystemFileHandle>())
  const [form] = Form.useForm()
  const [state, setState] = useGetSetState({
    folderName: '',
    submitting: false,
    settings: {} as Record<string, any>
  })

  const readDir = useCallback(
    async (dir: FileSystemDirectoryHandle, parentPath: string[] = []) => {
      const tree: DataTree[] = []
      for await (const [name, handle] of dir.entries()) {
        const path = [...parentPath, name].join('/')
        if (handle.kind === 'directory') {
          tree.push({
            name,
            realPath: path,
            children: await readDir(handle, [...parentPath, name])
          })
        } else if (name.endsWith('.md')) {
          const file = await handle.getFile()
          const md = await file.text()
          tree.push({
            name,
            md,
            realPath: path
          })
        }
        if (handle.kind === 'file') {
          filesMap.current.set([...parentPath, name].join('/'), handle)
        }
      }
      return sortTree(tree) as DataTree[]
    },
    []
  )
  const getSettings = useCallback(async () => {
    try {
      const dir = await dirHanndle.current!.getDirectoryHandle('.inkdown')
      const json = await dir.getFileHandle('settings.json')
      const file = await json.getFile()
      const text = await file.text()
      return JSON.parse(text)
    } catch (e) {
      return null
    }
  }, [])

  const getMapBySettings = useCallback(
    async (docs: any[]) => {
      const tree: DataTree[] = []
      for (const item of docs) {
        if (item.path) {
          const file = filesMap.current.get(item.path)
          if (!file) {
            message.error(`The path ${item.path} does not exist`)
            throw new Error()
          }
          tree.push({
            name: item.name,
            realPath: item.path,
            md: await file.getFile().then((file) => file.text())
          })
        } else if (item.children) {
          tree.push({
            name: item.name,
            realPath: item.path,
            children: await getMapBySettings(item.children)
          })
        }
      }
      return tree
    },
    []
  )
  const getFiles = useCallback(
    async (data: { id: string; name: string }): Promise<DataTree[]> => {
      return new Promise((resolve, reject) => {
        readDir(dirHanndle.current!).then(async (res) => {
          if (!state().settings.id) {
            Modal.confirm({
              title: 'Note',
              content:
                'There is no inkdown/settings.json file in this folder. Should it be generated automatically?',
              onCancel: () => reject(),
              onOk: async () => {
                const dir = await dirHanndle.current!.getDirectoryHandle(
                  '.inkdown',
                  { create: true }
                )
                const json = await dir.getFileHandle('settings.json', {
                  create: true
                })
                const text = await (await json.getFile()).text()
                const settings = JSON.parse(text || '{}')
                settings.name = data.name
                settings.id = data.id
                const writer = await json.createWritable()
                writer.write(JSON.stringify(settings, null, 2))
                writer.close()
                resolve(res)
              }
            })
          } else {
            if (
              state().settings.docs &&
              state().settings.docs instanceof Array
            ) {
              const tree = await getMapBySettings(state().settings.docs)
              resolve(tree)
            } else {
              resolve(res)
            }
          }
        })
      })
    },
    []
  )
  const createBook = useCallback(() => {
    form.validateFields().then(async (v) => {
      const settings = await getSettings()
      if (settings) {
        setState({ settings })
      }
      const tree = await getFiles(v)
      try {
        const client = new IApi({
          url: '',
          getFileData: async (path: string) => {
            return filesMap.current.get(path)?.getFile() || null
          },
          mode: 'manual',
          token: localStorage.getItem('inkdown-token')!,
          sha1,
          fetch: window.fetch.bind(window)
        })
        await client.syncBook({
          id: v.id,
          name: v.name,
          data: tree,
          settings: {
            nav: settings.nav
          }
        })
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
                window.open(`${location.origin}/doc/${v.id}`)
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
        localdb.book.get(props.bookId!).then(async (res) => {
          if (res) {
            dirHanndle.current = res.handle
            const settings = await getSettings()
            setState({ folderName: res.handle.name, settings: settings || {} })
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
        <Form.Item
          shouldUpdate={(pre, cur) => pre.mode !== cur.mode}
          noStyle={true}
        >
          {() => (
            <>
              {form.getFieldValue('mode') === 'manual' && (
                <Form.Item
                  label={'Select Folder'}
                  tooltip={
                    'Clear browser history or folder is moved, need to reselect'
                  }
                >
                  <Button
                    onClick={() => {
                      window
                        .showDirectoryPicker({ mode: 'readwrite' })
                        .then(async (h) => {
                          dirHanndle.current = h
                          const settings = await getSettings()
                          if (settings.id) {
                            form.setFieldValue('id', settings.id)
                          }
                          if (settings.name) {
                            form.setFieldValue('name', settings.name)
                          }
                          setState({
                            folderName: h.name,
                            settings: settings || {}
                          })
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
              {form.getFieldValue('mode') === 'github' && (
                <>
                  <Form.Item label={'Repository'} required={true}>
                    <div className={'flex justify-between space-x-3'}>
                      <Form.Item noStyle={true} name={'owner'}>
                        <Input placeholder={'Owner'} />
                      </Form.Item>
                      <Form.Item noStyle={true}>
                        <Input placeholder={'Repo'} />
                      </Form.Item>
                      <Form.Item noStyle={true}>
                        <Input placeholder={'Branch'} />
                      </Form.Item>
                    </div>
                  </Form.Item>
                  <Form.Item
                    label={'Token'}
                    name={'token'}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </>
              )}
            </>
          )}
        </Form.Item>
        <Form.Item
          label={'ID'}
          name={'id'}
          rules={[{ required: true }]}
          tooltip={
            'The id determines the access path of the url. If the id conflicts, the content will be overwritten.'
          }
        >
          <Input max={50} />
        </Form.Item>
        <Form.Item label={'Name'} name={'name'} rules={[{ required: true }]}>
          <Input maxLength={100} />
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
