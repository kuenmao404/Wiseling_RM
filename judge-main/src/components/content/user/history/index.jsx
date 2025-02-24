import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useBasicInfiniteQuery } from '@/lib/infiniteQuery'

import { getProblemSolveHistory } from '@/apis'

import HistoryTable from './HistoryTable'

const counts = 20;

const Index = () => {

  const { InViewQuery, ...getProblemSolveHistoryApi } = useBasicInfiniteQuery({
    queryKey: ['getProblems'],
    queryFn: ({ pageParam: page }) => getProblemSolveHistory({ start: (page) * counts + 1, counts, order: "since_d", bTotal: true }),
    keyName: 'getProblems',
    counts
  })

  const { data_arr } = getProblemSolveHistoryApi

  return (
    <div className='w-full'>
      <h1 className="text-3xl font-bold pt-4">
        解題紀錄
      </h1>
      <hr className='mt-2 mb-3' />
      <HistoryTable data={data_arr} isLoading={getProblemSolveHistoryApi?.isLoading} />
      <br />
      <InViewQuery />
      <br />
    </div>
  )
}

export default Index