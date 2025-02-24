import React from 'react'
import { useMediaQuery } from '@mui/material'
import { Link } from 'react-router-dom'

function OtherPageLink() {

  let isDrawerOpen = false
  const mediaQueryOptions = {
    lg: useMediaQuery(!isDrawerOpen ? '(min-width:1200px)' : '(min-width:1440px)'),
    md: useMediaQuery(!isDrawerOpen ? '(min-width:992px)' : '(min-width:1232px)'),
    xs: useMediaQuery(!isDrawerOpen ? '(min-width:768px)' : '(min-width:1008px)'),
  };

  const { lg, md, xs } = mediaQueryOptions

  return (
    <div>
      <Link to={`/history`}>
        <BlackButton>解題紀錄</BlackButton>
      </Link>
      {/* <Link to={`/favorite`}>
        <BlackButton>收藏題目</BlackButton>
      </Link>
      <Link to={`/my`}>
        <BlackButton>我的題庫</BlackButton>
      </Link> */}
    </div>
  )
}

const BlackButton = ({ children }) => {
  return (
    <button
      className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
    >
      {children}
    </button>
  )
}

export default OtherPageLink