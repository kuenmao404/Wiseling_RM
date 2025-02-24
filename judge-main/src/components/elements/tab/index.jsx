import React, { useEffect, useMemo } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { atom, useAtom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';

const storage = createJSONStorage(() => sessionStorage);
const tabAtom = atomWithStorage('tabAtom', { normal: 0 }, storage);

function TabGroup({
  tabs,
  defaultValue,
  children,
  sx,
  id,
  baseUrl,
  ...props
}) {
  const [tab, setTab] = useAtom(tabAtom);
  const idx = tab?.[(id || 'normal')];
  const navigate = useNavigate();
  const location = useLocation();
  const useRouting = typeof tabs[0] === 'object'; // 判斷 tabs 是否為 object

  useEffect(() => {
    let value = Number.isInteger(defaultValue) ? defaultValue : 0;
    console.log('onMount', value)
    setTab({ ...tab, [(id || 'normal')]: value });
  }, []);

  useEffect(() => {
    if (useRouting) {

      let currentPath = location.pathname.replace(baseUrl, '');
      currentPath = currentPath == "" ? "/" : currentPath;
      const tabIndex = tabs.findIndex(tab => currentPath.startsWith(tab.path) && tab.path !== "/" || tab.path == currentPath);
      console.log(currentPath, tabs, tabIndex)
      if (tabIndex !== -1) {
        setTab({ ...tab, [(id || 'normal')]: tabIndex });
      }
    }
  }, [location.pathname, baseUrl]);

  const handleTabChange = (event, value) => {
    setTab({ ...tab, [(id || 'normal')]: value });
    if (useRouting) {
      const newPath = `${baseUrl}${tabs[value].path}`;
      navigate(newPath);
    }
  };

  const memoizedChildren = () => {
    return children[idx];
  }

  if (!tabs.length || !children.length) {
    return null; // 簡單的錯誤處理，如果 tabs 或 children 為空，則不渲染任何內容
  }

  console.log(idx)

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', ...sx }} {...props}>
        <Tabs
          value={idx || 0}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: '32px' }}
        >
          {tabs.map((d, i) => (
            <Tab key={i} label={<b>{typeof d === 'string' ? d : d.name}</b>} />
          ))}
        </Tabs>
      </Box>
      {useRouting ? (
        <Routes>
          {tabs.map((d, i) => (
            <Route
              key={i}
              path={typeof d === 'string' ? '' : `${d.path}/*`}
              element={children[i]}
            />
          ))}
          <Route path="*" element={<Navigate to={`${baseUrl}${tabs[0].path}`} />} />
        </Routes>
      ) : (
        memoizedChildren
      )}
    </>
  );
}

export { TabGroup };
