import React, { Fragment, useEffect } from 'react'
import { Avatar, Box, Typography } from '@mui/material'
import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import MdTextArea from './MdTextArea'
import { addVideoComment, getVideoComment, editVideoComment, delVideoComment, feedbackComment } from 'apis'
import { stringAvatar } from '../../../Header'
import Comments from './Comments'
import useAccountStore from '../../../../store/account'

const counts = 10;

export default function index(props) {
  const { vid } = props
  const { mid } = useAccountStore()

  const { ref, inView } = useInView()

  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['getVideoComment', vid],
    queryFn: ({ pageParam: page }) => getVideoComment({ oid: vid, start: (page) * counts + 1, counts }),
    initialPageParam: 0,
    getPreviousPageParam: (firstPage) => firstPage.previousId ?? undefined,
    getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
      let now_page = allPageParams[allPageParams?.length - 1]
      let total = lastPage?.body?.total
      let next_page = undefined
      if ((now_page + 1) * counts <= total)
        next_page = now_page + 1
      return next_page ?? undefined
    },
  })

  const addVideoCommentApi = useMutation({ mutationFn: addVideoComment, onSuccess: () => refetch() })
  const editVideoCommentApi = useMutation({ mutationFn: editVideoComment, onSuccess: () => refetch() })
  const delVideoCommentApi = useMutation({ mutationFn: delVideoComment, onSuccess: () => refetch() })
  const feedbackCommentApi = useMutation({ mutationFn: feedbackComment, onSuccess: () => refetch() })

  useEffect(() => {
    if (inView) {
      fetchNextPage()
    }
  }, [fetchNextPage, inView])

  return (
    <Box sx={{ m: 2 }}>
      <Box sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
          討論區
        </Typography>
      </Box>
      <MdTextArea
        onSubmit={(content, callback) => addVideoCommentApi.mutate({ oid: vid, text: content }, { onSuccess: (d) => callback(!!d?.ok) })}
      />
      {data?.pages?.map((page, idx) => (
        <Fragment key={idx}>
          {page?.data?.map(d => (
            <Comments
              key={d?.fid}
              sx={{ mt: 2 }}
              data={d}
              onSubmit={(content, callback) => addVideoCommentApi.mutate({ oid: vid, text: content, fid: d?.fid }, { onSuccess: (d) => callback(!!d?.ok) })}
              onEdit={({ content, fid }, callback) => editVideoCommentApi.mutate({ oid: vid, text: content, fid }, { onSuccess: (d) => callback(!!d?.ok) })}
              onDel={({ pfid, fid }, callback) => delVideoCommentApi.mutate({ pfid: pfid || null, fid, oid: vid }, { onSuccess: () => callback() })}
              onFeedback={({ pfid, fid, mode }, callback) => feedbackCommentApi.mutate({ pfid: pfid || null, fid, mode, oid: vid }, { onSuccess: () => callback() })}
              isAuthor={mid == d?.mid}
            />
          ))
          }
        </Fragment>
      ))
      }
      <Box ref={ref} sx={{ fontSize: "12px", color: "#919191", mt: 2 }}>
        {isFetchingNextPage
          ? '載入更多留言中...'
          : hasNextPage
            ? '載入更多'
            : '沒有更多留言了...'}
      </Box>
    </Box>
  )
}
