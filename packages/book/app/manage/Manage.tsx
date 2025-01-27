import { useCallback, useEffect, useMemo } from 'react'
import { ClientOnly } from '../ui/ClientOnly'
import { api } from '../.client/api'
import { useGetSetState } from 'react-use'
import { Button, ConfigProvider, Modal, Table, theme } from 'antd'
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from 'dayjs'
import {
  ArrowUpOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { localdb } from '../.client/db'
import { Link, useNavigate } from '@remix-run/react'
import { sleep, useClientLayoutEffect } from '../utils/common'
import { Settings } from './Settings'
import { useUpdate } from './update'
import { isDark } from '../utils/theme'
dayjs.extend(relativeTime)
export function Manage() {
  const [modal, context] = Modal.useModal()
  const navigate = useNavigate()
  const update = useUpdate()
  const [state, setState] = useGetSetState({
    page: 1,
    pageSize: 10,
    name: '',
    loading: false,
    openCreateDialog: false,
    selectedBookId: '',
    theme: '',
    ready: false,
    sort: {
      field: 'created' as 'created' | 'updated',
      mode: 'desc' as 'asc' | 'desc'
    },
    total: 0,
    openSettings: false,
    list: [] as {
      id: string
      name: string
      lasteUpdateMode: string
      created: string
      updated: string
    }[]
  })
  const themeObject = useMemo(() => {
    return state().theme === 'dark'
      ? theme.darkAlgorithm
      : theme.defaultAlgorithm
  }, [state().theme])
  const getBooks = useCallback(() => {
    setState({ loading: true })
    api.getBooks
      .query({
        page: state().page,
        pageSize: state().pageSize,
        name: state().name,
        sort: [state().sort.field, state().sort.mode]
      })
      .then((res) => {
        setState({
          list: res.books,
          total: res.total
        })
      })
      .finally(() => {
        setState({ loading: false })
      })
  }, [])
  useEffect(() => {
    getBooks()
  }, [])
  useClientLayoutEffect(() => {
    let theme = localStorage.getItem('theme')
    if (!theme) {
      theme = isDark() ? 'dark' : ''
    }
    setState({ theme: theme || '', ready: true })
  }, [])
  if (!state().ready) {
    return null
  }
  return (
    <ClientOnly>
      <ConfigProvider
        theme={{
          algorithm: themeObject
        }}
      >
        {context}
        <div className={'max-w-[1200px] mx-auto py-10 px-5'}>
          <div className={'flex justify-between items-center mb-4'}>
            <div
              className={
                'text-gray-800 text-xl font-medium dark:text-white/80 flex items-center'
              }
            >
              <img src={'/icon.png'} className={'w-7 h-7 mr-2'} />
              <span>Inkdown Book</span>
            </div>
            <div className={'space-x-3'}>
              {/* <Button
                type={'primary'}
                icon={<BookOutlined />}
                onClick={() => {
                  setState({ selectedBookId: '', openCreateDialog: true })
                }}
              >
                Create Book
              </Button> */}
              {update && (
                <Button
                  color={'orange'}
                  variant={'outlined'}
                  icon={<ArrowUpOutlined />}
                  onClick={() => {
                    modal.confirm({
                      title: 'A new version is available',
                      content: 'Do you want to update Inkdown Book now?',
                      okText: 'Update',
                      onOk: async () => {
                        await api.upgrade.mutate()
                        while (true) {
                          try {
                            await api.getEnv.query()
                            setTimeout(() => {
                              window.location.reload()
                            }, 2000)
                            break
                          } finally {
                            await sleep(1000)
                          }
                        }
                      }
                    })
                  }}
                />
              )}
              <Button
                icon={<SettingOutlined />}
                onClick={() => {
                  setState({ openSettings: true })
                }}
              />
              <Button
                icon={<LogoutOutlined />}
                onClick={() => {
                  modal.confirm({
                    title: 'Note',
                    content: 'Do you want to log out?',
                    onOk: () => {
                      localStorage.removeItem('inkdown-token')
                      navigate('/inkdown-login')
                    }
                  })
                }}
              />
            </div>
          </div>
          <Table
            rowKey={'id'}
            size={'middle'}
            bordered={true}
            loading={state().loading}
            dataSource={state().list}
            pagination={{
              pageSize: state().pageSize,
              current: state().page,
              total: state().total,
              onChange: (page) => {
                setState({ page })
                getBooks()
              }
            }}
            columns={[
              {
                title: 'ID',
                dataIndex: 'id',
                render: (v) => (
                  <Link
                    to={`/doc/${v}`}
                    className={'underline'}
                    target={'_blank'}
                  >
                    {v}
                  </Link>
                )
              },
              {
                title: 'Name',
                dataIndex: 'name'
              },
              {
                title: 'Created',
                dataIndex: 'created',
                render: (v) => dayjs(v).fromNow()
              },
              {
                title: 'Updated',
                dataIndex: 'updated',
                render: (v) => dayjs(v).fromNow()
              },
              {
                title: 'Action',
                key: 'action',
                render: (_, record) => (
                  <div className={'space-x-3'}>
                    <Button
                      size={'small'}
                      danger={true}
                      onClick={() => {
                        modal.confirm({
                          title: 'Note',
                          content:
                            'All files associated with the book will be deleted and will be inaccessible after deletion',
                          okType: 'danger',
                          okText: 'Delete',
                          onOk: () => {
                            return api.deleteBook
                              .mutate({ bookId: record.id })
                              .then(() => {
                                getBooks()
                                localdb.book.delete(record.id)
                              })
                          }
                        })
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                )
              }
            ]}
          />
        </div>
        {/* <CreateBook
          open={state().openCreateDialog}
          onClose={() => setState({ openCreateDialog: false })}
          bookId={state().selectedBookId}
          onUpdate={() => {
            setState({ openCreateDialog: false })
          }}
        /> */}
        <Settings
          open={state().openSettings}
          onClose={() => {
            setState({ openSettings: false })
          }}
        />
      </ConfigProvider>
    </ClientOnly>
  )
}
