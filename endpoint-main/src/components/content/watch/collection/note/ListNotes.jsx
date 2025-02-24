import React, { useState, useEffect } from 'react'
import { getNoteListNote, editNote, getNotes } from 'apis'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Box } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import LoadingWrapper from '../../../../elements/wrapper/LoadingWrapper'
import Notes from '../../../../elements/note/Notes'

export default function ListNotes(props) {
  const { cid, vid, nid, data, current_note, refetch, player } = props
  const [end_note, setEndNote] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  let params = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  });

  const getNotesApi = useQuery({
    queryKey: ['getNotes', current_note?.notebookCID, vid],
    queryFn: () => getNotes({ cid: current_note?.notebookCID, vid }),
    enabled: !!current_note?.notebookCID
  })
  const editNoteApi = useMutation({ mutationFn: editNote, onSuccess: () => refetch() })

  const handleEditNote = (data, callback = () => { }) => {
    editNoteApi.mutate({ ...data, cid: data?.notebookCID }, { onSuccess: () => callback() })
  }

  useEffect(() => {
    if (Array.isArray(getNotesApi?.data) && !getNotesApi?.isFetching && !!current_note) {
      let index = getNotesApi?.data?.indexOf(getNotesApi?.data?.find(d => d?.nid == current_note.nid));
      let end_time = current_note.endTime || getNotesApi?.data?.[index + 1]?.startTime || null;
      setEndNote({ endTime: end_time, nid: current_note.nid })
    }
  }, [current_note, getNotesApi?.data, getNotesApi?.isFetching])

  React.useEffect(() => {
    // console.log(`initializing interval`);
    const interval = setInterval(() => {
      checkTime();
    }, 1000);

    return () => {
      // console.log(`clearing interval`);
      clearInterval(interval);
    };
  }, [current_note, end_note, data, player]);

  const checkTime = () => {
    if (current_note?.nid == end_note?.nid && !!player && !!player?.getCurrentTime) {
      let now_time = player?.getCurrentTime();
      let end_time = end_note?.endTime;
      // console.log(now_time, end_time, end_note);
      
      if (parseFloat(end_time) <= parseFloat(now_time)) {
        let index = data?.indexOf(data?.find(d => d?.nid == current_note.nid))
        let next_data = data?.[index + 1]
        if (!!next_data) {
          setSearchParams({ ...params, v: next_data?.vid, n: next_data?.nid, t: next_data?.startTime })
        }
      }
    }
  }

  return (
    <Box className="flex flex-1-1">
      <Notes
        data={data}
        title={(d) =>
          <Box sx={{ fontSize: "18px", whiteSpace: "pre-wrap" }}>
            <b>{d?.notebookName} - </b><span style={{ color: "#606060" }}>{d?.title}</span>
          </Box>
        }
        editNote={handleEditNote}
        nid={nid}
      />
    </Box>
  )
}
