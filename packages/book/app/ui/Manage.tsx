import { useCallback, useEffect } from 'react'
import { ClientOnly } from './ClientOnly'
import { api } from '../.client/api'
import { useGetSetState } from 'react-use'
import { Button, Modal, Table } from 'antd'
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from 'dayjs'
import {BookOutlined} from '@ant-design/icons'
import { CreateBook } from './CreateBook'
import { localdb } from '../.client/db'
import { Link } from '@remix-run/react'
dayjs.extend(relativeTime)
export function Manage() {
  const [modal, context] = Modal.useModal()
  const [state, setState] = useGetSetState({
    page: 1,
    pageSize: 10,
    name: '',
    loading: false,
    openCreateDialog: false,
    selectedBookId: '',
    sort: {
      field: 'created' as 'created' | 'updated',
      mode: 'desc' as 'asc' | 'desc'
    },
    total: 0,
    list: [] as {
      id: string
      name: string
      lasteUpdateMode: string
      created: string
      updated: string
    }[]
  })
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
  return (
    <ClientOnly>
      {context}
      <div className={'max-w-[1200px] mx-auto py-10 px-5'}>
        <div className={'flex justify-between items-center mb-4'}>
          <div className={'text-gray-800 text-xl font-medium'}>
            Inkdown Book
          </div>
          <div>
            <Button 
              type={'primary'} icon={<BookOutlined />}
              onClick={() => {
                setState({selectedBookId: '', openCreateDialog: true})
              }}
            >
              Create Book
            </Button>
          </div>
        </div>
        <Table
          rowKey={'id'}
          size={'middle'}
          loading={state().loading}
          dataSource={state().list}
          pagination={{
            pageSize: state().pageSize,
            current: state().page,
            total: state().total,
            onChange: page => {
              setState({page})
              getBooks()
            }
          }}
          columns={[
            {
              title: 'ID',
              dataIndex: 'id',
              render: v => <Link to={`/doc/${v}`} className={'underline'} target={'_blank'}>{v}</Link>
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
                  <Button size={'small'} onClick={() => {
                    setState({openCreateDialog: true, selectedBookId: record.id})
                  }}>Settings</Button>
                  <Button size={'small'} danger={true} onClick={() => {
                    modal.confirm({
                      title: 'Note',
                      content: 'All files associated with the book will be deleted and will be inaccessible after deletion',
                      okType: 'danger',
                      okText: 'Delete',
                      onOk: () => {
                        return api.deleteBook.mutate({bookId: record.id}).then(() => {
                          getBooks()
                          localdb.book.delete(record.id)
                        })
                      }
                    })
                  }}>Delete</Button>
                </div>
              )
            }
          ]}
        />
      </div>
      <CreateBook
        open={state().openCreateDialog}
        onClose={() => setState({openCreateDialog: false})}
        bookId={state().selectedBookId}
        onUpdate={() => {
          setState({openCreateDialog: false})
        }}
      />
    </ClientOnly>
  )
}
