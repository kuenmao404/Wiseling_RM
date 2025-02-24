import React from 'react'
import { ResultShow } from '../Console'
import SubmitTable from './SubmitTable'
import { useBasicInfiniteQuery, } from '../../../../../lib/infiniteQuery'
import { getProblemSolveHistory } from '../../../../../apis'

const counts = 20;

export default function index({ pid, lang }) {
  const { InViewQuery, ...query } = useBasicInfiniteQuery({
    queryKey: ['getProblemSolveHistory', pid],
    queryFn: ({ pageParam: page }) => getProblemSolveHistory({ pid, start: (page) * counts + 1, counts, order: "since_d", bTotal: true }),
    enabled: !!pid,
    keyName: 'getProblemSolveHistory',
    counts
  })

  return (
    <div>
      <div className="mt-1 text-lg">
        <b>歷史提交紀錄：</b>
      </div>
      <SubmitTable
        history={query?.data_arr}
        languages={lang}
        pid={pid}
      />
      <InViewQuery
        sx={{ mt: 2 }}
      />
    </div>
  )
}
