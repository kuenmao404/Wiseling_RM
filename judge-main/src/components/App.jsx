import React, { useEffect, useState } from 'react';
import Snackbar from './elements/snackbar/Snackbar';
import Header from './header';
import Main from './Main';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAccount, logoutAccount } from '@/apis';
import Alert from './elements/alert/Alert';
import Dialog from './elements/dialog/Dialog';
import Config from 'Config';
import useDialogStore from '../store/dialog';
import { atom, useAtom } from 'jotai';

const accountAtom = atom({ isLogin: false, isLoading: null });
export { accountAtom }

const App = () => {
  const [account, setAccount] = useAtom(accountAtom);
  const dialog_props = useDialogStore();

  const query = useQuery({ queryKey: ['getAccount'], queryFn: () => getAccount(), refetchOnWindowFocus: true });
  const logoutAccountApi = useMutation({ mutationFn: logoutAccount, onSuccess: () => query.refetch() });
  const { name = '訪客', img = null, mid } = query?.data || {};
  const isLogin = mid == 0 || !mid ? false : true;

  useEffect(() => {
    if (!!query?.data) {
      setAccount({ ...account, ...query?.data, isLogin: query?.data?.mid ? true : false, isLoading: query?.isFetching });
    }
    if (query?.data?.mid === 0) {
      localStorage.removeItem('editor');
    }
  }, [query?.data, query?.isFetching]);

  return (
    <>
      <Header
        title={Config?.title || 'Wiseling Judge'}
        isLoading={query.isLoading}
        isLogin={isLogin}
        name={name}
        img={img}
        logout={logoutAccountApi.mutate}
      />
      <Main />
      <Alert />
      <Snackbar />
      <Dialog {...dialog_props} />
    </>
  );
};

export default App;
