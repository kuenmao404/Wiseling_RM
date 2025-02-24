import React, { Fragment, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Courses from './Courses'
import RwdWrapper from '../../elements/wrapper/RwdWrapper'
import Course from './Course'
import CourseWatch from './watch'

export default function index(props) {
  const { setTitle } = props

  return (
    <Routes>
      <Route index element={<RwdWrapper><Courses /></RwdWrapper>} />
      <Route path=":cid/watch" element={<CourseWatch></CourseWatch>} />
      <Route path=":cid/*" element={<RwdWrapper content_sx={{ flex: "1 1 auto" }}><Course setTitle={setTitle} /></RwdWrapper>} />
    </Routes>
  )
}
