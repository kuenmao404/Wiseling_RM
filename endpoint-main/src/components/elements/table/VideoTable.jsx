import React, { Fragment, useState, useEffect } from 'react'
import { Paper, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Rating, IconButton, Chip, Tooltip, Box, CardMedia } from '@mui/material'

export default function VideoTable(props) {
  const { head, body } = props

  return (
    <TableContainer component={Paper} sx={{ mt: 1 }}>
      <Table sx={{ minWidth: 200 }}>
        <TableHead>
          {Array.isArray(head) &&
            <TableRow sx={{ borderTop: "5px solid #1f1f1f;" }}>
              {head?.map(d =>
                <TableCell key={d} sx={{ fontWeight: "bolder" }}>{d}</TableCell>
              )}
            </TableRow>
          }
        </TableHead>
        <TableBody>
          {body}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export { ImgCell }

const ImgCell = ({ src }) => {
  return (
    <TableCell>
      <CardMedia
        component="img"
        sx={{ height: "50px", width: "auto" }}
        image={src}
      />
    </TableCell>
  )
}