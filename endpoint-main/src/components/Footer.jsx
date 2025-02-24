import React from 'react'
import { Link } from 'react-router-dom'

export default function index(props) {
  const { title } = props
  return (
    <footer className='footer'>
      <div className='footer-content flex aic'>
        <Link to="/" className='reset-link flex aic jcc'>
          {title}
        </Link>
      </div>
      <div className='footer-content footer-info flex aic'>
        <div className='flex rowTitle'>© 2024 Web Knowledge Extraction (WKE) Lab. All rights reserved.&ensp;<Link to="/policy" style={{color: "#c4e9ff"}}>Policy</Link>.</div>
      </div>
    </footer>

  )
}
