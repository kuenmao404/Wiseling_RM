import React, { Fragment, useEffect } from 'react'
import { Button, Box } from '@mui/material'
import Config from 'Config'
const { apiurl } = Config

export default function Login(props) {
  const { state } = props

  const handleLogin = (sso) => {
    window.location.href = `${apiurl}/api/Auth/login?state=${encodeURIComponent(`https://judge.wke.csie.ncnu.edu.tw${state}`)}&sso=${sso}`
  }

  return (
    <Fragment>
      <Box>
        <Button
          variant="contained"
          onClick={() => handleLogin('wkesso')}
          sx={{ width: "300px" }}
          color='info'
          autoFocus
        >
          {/* <div style={{ backgroundImage: `url(${wkeimg})` }}></div> */}
          WKE SSO
        </Button>
      </Box>
      <Box>
        <Button
          variant="contained"
          onClick={() => handleLogin('google')}
          sx={{ width: "300px", mt: 2 }}
          color='error'
          autoFocus
        >
          {/* <div style={{ backgroundImage: `url(${wkeimg})` }}></div> */}
          Google登入
        </Button>
      </Box>
    </Fragment>
  )
}
