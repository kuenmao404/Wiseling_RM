import React from 'react';
import { Box } from '@mui/material';
import { Routes, Route } from 'react-router-dom';

import RwdWrapper from '../elements/wrapper/RwdWrapper';

import Problem from './problem';
import NotFind from './NotFind';
import Home from './home';
import Create from './create';
import CreateProblem from './create-v2';
import UserHistory from './user/history'

function index() {
  return (
    <Box
      sx={{ flex: '1 1 auto', minHeight: 'calc(100vh - 64px)', position: 'relative', display: 'flex', width: '100%', overflow: "auto" }}
    >
      <Routes>
        <Route path="/problem/:pid" element={<Problem />} />
        <Route path="/problem/:pid/*" element={<Problem />} />
        <Route path="/problem" element={<NotFind />} />

        <Route path="/create" element={<RwdWrapper sx={{ overflow: 'auto' }}><Create /></RwdWrapper>} />
        <Route path="/create-v2/" element={<CreateProblem />} />
        <Route path="/create-v2/:pid" element={<CreateProblem />} />

        <Route path="/history" element={<RwdWrapper sx={{ overflow: 'auto' }}><UserHistory /></RwdWrapper>} />
        <Route path="/favorite" element={<RwdWrapper sx={{ overflow: 'auto' }}><></></RwdWrapper>} />
        <Route path="/my" element={<RwdWrapper sx={{ overflow: 'auto' }}><></></RwdWrapper>} />

        <Route
          path="*"
          element={
            <RwdWrapper sx={{ overflow: 'auto' }}>
              <Home />
            </RwdWrapper>
          }
        />
      </Routes>
    </Box>
  );
}

export default index