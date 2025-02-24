import React from "react"
import ReactDOM from 'react-dom/client'
import App from "./components/App"
import './styles/main.styl'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query"
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom"
import useSnackbarStore from "./store/snackbar"
import useAlertStore from "./store/alert"

const Index = () => {
  const { setSnackMsg } = useSnackbarStore(state => state)
  const { setAlert } = useAlertStore()

  const handleErrorAlert = (err_arr = []) => {
    let str = ''
    err_arr?.map((d, idx) => {
      str += ((idx == 0 ? "" : "\n\n") + (d?.displayName || d?.field) + '：\n' + d?.error)
    })
    setAlert({
      title: "錯誤",
      content: str,
      handleAgree: (callback) => callback()
    })
  }

  const onError = (error, variables, context) => {
    console.log('onError', error, variables)
    setSnackMsg({ message: "API發生未知錯誤" })
  }

  const onSuccess = (data) => {
    const status = (data?.body?.status !== null && data?.body?.status !== undefined) ? data?.body?.status : null
    if (status !== null && Array.isArray(data?.body?.errorArray)) {
      handleErrorAlert(data?.body?.errorArray)
    } else if (status !== null)
      setSnackMsg({ message: data?.body?.message, body_status: data?.body?.status })
    !data?.ok && status == null && !data?.pages && setSnackMsg({ message: "API發生未知錯誤！", body_status: false })
  }

  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onSuccess,
      onError
    }),
    mutationCache: new MutationCache({
      onSuccess,
      onError
    }),
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // default: true
        select: (data) => {
          const status = (data?.body?.status !== null && data?.body?.status !== undefined) ? data?.body?.status : null
          let response = (status == null ? (data.body || null) : null)
          if (Array.isArray(data?.pages)) {
            let page_data = []
            data?.pages?.map((m, idx) => {
              page_data[idx] = (m?.body || m);
            })
            response = { ...data, pages: page_data }
          }
          return response
        }
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="*" element={<App />}>
    </Route>
  )
);

const rootElement = document.getElementById('root')
ReactDOM.createRoot(rootElement).render(<Index />)
