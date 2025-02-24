import React, { useState, Fragment } from 'react'

const Searchbar = ({
  placeholder = '搜尋...',
  onClick,
  autoFocus = false,
}) => {
  const [text, setText] = useState("")
  const [search, setSearch] = useState("")

  const resetText = () => {
    setText("")
    setSearch("")
    onClick("")
  }

  return (
    <Fragment>
      <form className="w-full mx-auto">
        <div className="flex">
          <label htmlFor="search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">{placeholder}</label>
          <div className="relative w-full">
            <input
              type="search"
              id="search"
              className="focus:outline-none focus:ring-1 focus:border-gray-950 rounded-s-lg block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-2 border border-gray-300 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-s-gray-700  dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-gray-500"
              placeholder={placeholder}
              value={text}
              onChange={e => setText(e.target.value)}
              autoFocus={autoFocus}
              required
            />
            <button
              type="submit"
              className="absolute top-0 end-0 h-full p-2.5 text-sm font-medium text-white bg-gray-700 rounded-e-lg border border-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
              onClick={e => (e.preventDefault(), onClick?.(text), setSearch(text))}
              title="搜尋"
            >
              <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
              <span className="sr-only">搜尋</span>
            </button>
          </div>
        </div>
      </form>
      {!!search &&
        <div className='mt-2 flex jcsb aic'>
          <div>
            搜尋「{search}」的結果...
          </div>
          <button
            className='bg-gray-700 rounded-lg p-1 px-2 text-white text-xs hover:bg-gray-800 focus:ring-4 focus:ring-gray-300'
            onClick={e => (e.preventDefault(), resetText(""))}
          >
            清除
          </button>
        </div>
      }
    </Fragment>
  )
}

export default Searchbar