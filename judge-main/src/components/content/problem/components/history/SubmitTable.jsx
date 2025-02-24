import React from 'react'
import { TableCell, TableBody, TableRow, Box, Button, duration } from '@mui/material'
import { Table, TableHeadRow, tablerow_sx } from '../../../../elements/ui/Table'
import { switchKind } from '../Console'
import useSnackbarStore from '../../../../../store/snackbar'
import useAlertStore from '../../../../../store/alert'
import { editorStorageAtom, setLanguageAtom } from '../editor/UseEditor'
import { useSetAtom } from 'jotai'

export default function SubmitTable({ history, languages, pid }) {
  const { setSnackMsg } = useSnackbarStore()
  const { setAlert } = useAlertStore()
  const setEditorStorage = useSetAtom(editorStorageAtom)
  const updateLanguage = useSetAtom(setLanguageAtom)

  const textToClipBoard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setSnackMsg({ message: "複製成功！" })
  }

  const copyToEditor = ({ code, name }) => {
    const lang = languages?.find?.(f => f.name == name)
    setAlert({
      title: "複製到編輯器",
      content: `複製到編輯器會覆蓋原本的程式碼並無法復原，確定要複製到編輯器嗎？`,
      handleAgree: (callback) => {
        if (!!lang) {
          updateLanguage({ pid, lang: languages?.find?.(f => f.name == name) })
          setEditorStorage((state) => ({ ...state, [pid]: { ...state?.[pid], code } }));
          setSnackMsg({ message: "複製到編輯器成功！" })
        } else {
          setSnackMsg({ message: `此題目已不支援「${name}」`, duration: null })
        }
        callback()
      }
    })
  }

  return (
    <Table>
      <TableHeadRow>
        <TableCell sx={{ fontWeight: "bolder" }}>狀態</TableCell>
        <TableCell sx={{ fontWeight: "bolder" }}>Language</TableCell>
        <TableCell sx={{ fontWeight: "bolder" }}>Runtime (ms)</TableCell>
        <TableCell sx={{ fontWeight: "bolder" }}>Memory (Kb)</TableCell>
        <TableCell sx={{ fontWeight: "bolder" }}>功能</TableCell>
      </TableHeadRow>
      <TableBody>
        {Array.isArray(history) &&
          history?.map(d =>
            <TableRow key={d?.jsid} sx={tablerow_sx}>
              <TableCell>
                <div>{switchKind(d?.kind)}</div>
                <Box sx={{ color: "#262626bf" }}>{d?.since?.split(' ')?.[0]}</Box>
              </TableCell>
              <TableCell>
                {d?.name}
              </TableCell>
              <TableCell>
                {d?.runTime ?? 'N/A'}
              </TableCell>
              <TableCell>
                {d?.memory ?? 'N/A'}
              </TableCell>
              <TableCell>
                <div>
                  <Button size='small' onClick={() => textToClipBoard(d?.code)}>
                    複製程式碼
                  </Button>
                </div>
                <div>
                  <Button size='small' color="secondary" onClick={() => copyToEditor({ code: d?.code, name: d?.name })}>
                    複製到編輯器
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        }
      </TableBody>

    </Table>
  )
}
