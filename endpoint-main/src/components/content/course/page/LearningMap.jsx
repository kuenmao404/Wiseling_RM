import React, { Fragment, useState } from 'react'
import { Box, Tooltip, FormControl, InputLabel, Select, MenuItem, Avatar, Divider, Autocomplete, TextField } from '@mui/material'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { useQuery } from '@tanstack/react-query'
import { getMemberCalender, getCourseCalender, getCourseCalenderMember, getCourseMember, getCourseCalenderMemberDes } from 'apis'
import { TabGroup } from '../../../elements/tabs'
import { stringAvatar } from '../../../Header'
import { sec2date } from '../../../../lib/time'
import LoadingWrapper from '../../../elements/wrapper/LoadingWrapper'
import { CalendarBlockItem } from '../../member'
import LearningMapTable from '../../../elements/table/LearningMapTable'

const MemberLearningMap = (props) => {
  const { mid, onClick, since } = props
  const [year, setYear] = useState((new Date()).getFullYear())

  const getMemberCalenderApi = useQuery({ queryKey: ['getMemberCalender'], queryFn: () => getMemberCalender({ mid, year }), enabled: !!mid && !!year })

  const data = JSON.parse(getMemberCalenderApi?.data?.data || '[]') || []

  return (
    <Fragment>
      <Box className="flex jcc" sx={{ mt: 2 }}>
        <YearSelect date={since} year={year} onChange={setYear} />
      </Box>
      <LearningMap
        data={data}
        year={year}
        onClick={onClick}
      />
    </Fragment>
  )
}

const CourseLearningMap = (props) => {
  const { mid, cid, since, CourseCID } = props
  const [year, setYear] = useState((new Date()).getFullYear())
  const [select_mid, setSelectMID] = useState(null)
  const [mapID_data, setMapIDData] = useState(null)

  const getCourseCalenderApi = useQuery({
    queryKey: ['getCourseCalender', cid, year, CourseCID, select_mid],
    queryFn: () => getCourseCalender({ CourseCID, cid, year, mid: select_mid }),
    enabled: !!year && !!cid && !!CourseCID
  })

  const data = (getCourseCalenderApi?.data || [])

  const getCourseCalenderMemberApi = useQuery({
    queryKey: ['getCourseCalenderMember', mapID_data?.mapID],
    queryFn: () => getCourseCalenderMember({ mapID: mapID_data?.mapID }),
    enabled: !!mapID_data?.mapID && !select_mid
  })

  const getCourseMemberApi = useQuery({ queryKey: ["getCourseMember", CourseCID], queryFn: () => getCourseMember({ courseCID: CourseCID }) })

  const getCourseCalenderMemberDesApi = useQuery({
    queryKey: ["getCourseCalenderMemberDes", CourseCID, cid, mapID_data?.mapID, select_mid, mapID_data?.date],
    queryFn: () => getCourseCalenderMemberDes({ courseCID: CourseCID, cid, mapID: mapID_data?.mapID, ownerMID: select_mid, date: mapID_data?.date }),
    enabled: !!mapID_data?.mapID && !!select_mid && !!mapID_data?.date
  })

  return (
    <Fragment>
      <Box className="flex jcc" sx={{ mt: 2 }}>
        <YearSelect date={since} year={year} onChange={setYear} />
        <MemberSelect mid={select_mid} data={getCourseMemberApi?.data?.data || null} onChange={setSelectMID} />
      </Box>
      <LearningMap
        data={data}
        year={year}
        onClick={(data) => { setMapIDData(data) }}
      />
      {!!mapID_data && !!select_mid &&
        <Box sx={{ pl: 2, pb: 2, pr: 2 }}>
          <Box sx={{ mt: 2 }}>
            {mapID_data?.date}
          </Box>
          <LoadingWrapper query={getCourseCalenderMemberDesApi || {}}>
            <LearningMapTable
              data={getCourseCalenderMemberDesApi?.data}
            />
          </LoadingWrapper>
        </Box>
      }
      {!!mapID_data && !select_mid &&
        <Box sx={{ pl: 2, pb: 2, pr: 2 }}>
          <TabGroup
            tabs={
              [`筆記 (${getCourseCalenderMemberApi?.data?.filter(f => f.type == 5)?.length || "0"})`,
              `影片 (${getCourseCalenderMemberApi?.data?.filter(f => f.type == 18)?.length || "0"})`]
            }
            id="crouse_learningmap_tabs"
          >
            <Fragment>
              <Box sx={{ mt: 2 }}>
                {mapID_data?.date}
              </Box>
              {getCourseCalenderMemberApi?.data?.filter(f => f.type == 5)?.map((d, idx) =>
                <Box key={`${d?.mid}_${idx}`} sx={{ mt: 2 }}>
                  {idx !== 0 && <Divider sx={{ mt: 1, mb: 1 }} />}
                  <Box className="flex" onClick={() => setSelectMID(d?.ownerMID)}>
                    <Avatar {...stringAvatar(d?.name)} src={d?.img} sx={{ ...(stringAvatar(d?.name).sx), height: '50px', width: '50px' }} />
                    <Box sx={{ ml: 2 }}>
                      <Box>
                        <b>{d?.name}</b>&ensp;<span style={{ color: "#038aed" }}>({d?.sso})</span>
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        筆記編輯數量：{d?.nC}
                      </Box>
                      {d?.duration !== null &&
                        <Box sx={{ mt: 1 }}>
                          總筆記編輯時間：{sec2date(d?.duration || 0)}
                        </Box>
                      }
                    </Box>
                  </Box>
                </Box>
              )}
            </Fragment>
            <Fragment>
              <Box sx={{ mt: 2 }}>
                {mapID_data?.date}
              </Box>
              {getCourseCalenderMemberApi?.data?.filter(f => f.type == 18)?.map((d, idx) =>
                <Box key={`${d?.mid}_${idx}`} sx={{ mt: 2 }}>
                  {idx !== 0 && <Divider sx={{ mt: 1, mb: 1 }} />}
                  <Box className="flex" onClick={() => setSelectMID(d?.ownerMID)}>
                    <Avatar {...stringAvatar(d?.name)} src={d?.img} sx={{ ...(stringAvatar(d?.name).sx), height: '50px', width: '50px' }} />
                    <Box sx={{ ml: 2 }}>
                      <Box>
                        <b>{d?.name}</b>&ensp;<span style={{ color: '#038aed' }}>({d?.sso})</span>
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        影片觀看數量：{d?.nC}
                      </Box>
                      {d?.duration !== null &&
                        <Box sx={{ mt: 1 }}>
                          總影片觀看時間：{sec2date(d?.duration || 0)}
                        </Box>
                      }
                    </Box>
                  </Box>
                </Box>
              )}
            </Fragment>
          </TabGroup>
        </Box>
      }
    </Fragment >
  )
}

export { MemberLearningMap, CourseLearningMap, YearSelect }

export default function LearningMap({ data, onClick, year }) {


  // const data = [
  //   {
  //     date: "2024-02-20",
  //     count: 16,
  //     level: 3
  //   }
  // ]

  const countLevel = (value = 0) => {
    if (value < 1) {
      return 0;
    } else if (value < 4) {
      return 1;
    } else if (value < 7) {
      return 2;
    } else if (value < 10) {
      return 3;
    } else if (value < 13) {
      return 4;
    } else if (value < 16) {
      return 5;
    } else {
      return 6;
    }
  }

  return (
    <Fragment>
      <Box className="flex jce" sx={{ mr: 2, mb: 2 }}>
        <Box className='map'>
          <div className='map-0'><div>1</div></div>
          <div className='map-1'><div>4</div></div>
          <div className='map-2'><div>7</div></div>
          <div className='map-3'><div>10</div></div>
          <div className='map-4'><div>13</div></div>
          <div className='map-5'><div>16</div></div>
          <div className='map-6'><div>...</div></div>
        </Box>
      </Box>
      <Box sx={{ p: 1 }} className="flex jcc">
        <CalendarHeatmap
          startDate={new Date(`${year}-01-01`)}
          endDate={new Date(`${year}-12-31`)}
          values={data?.map(d => { return ({ ...d, count: d?.nC }) })} //  { date: '2024-01-30', count: 38 },
          showWeekdayLabels={true}
          tooltipDataAttrs={value => {
            return {
              'data-tooltip-content': value?.date ? `${(value?.date || '')} 擁有 ${value?.count || 0} 個紀錄` : "",
              'data-tooltip-id': 'data-tip'
            };
          }}
          classForValue={(value) => {
            if (!value) {
              return 'color-empty';
            }
            return `color-scale-${countLevel(value.count)}`;
          }}
          onClick={value => !!onClick ? onClick(value) : alert(`Clicked on value with count: ${value?.count || 0}`)}
        />
        <ReactTooltip id="data-tip" />
      </Box>
    </Fragment>
  )
}

const YearSelect = ({ year, date, onChange }) => {
  const getYear = (d) => {
    const date = new Date(d)
    return date.getFullYear()
  }

  let nowyear = new Date();
  nowyear = nowyear.getFullYear();

  return (
    <FormControl>
      <InputLabel id="select-year">年分</InputLabel>
      <Select
        labelId="select-year"
        value={year}
        label="年分"
        onChange={(e) => onChange(e.target.value)}
        size='small'
      >
        {!!date &&
          Array(nowyear - getYear(date) + 1).fill().map((m, index) =>
            <MenuItem key={nowyear - index} value={nowyear - index}>{nowyear - index}</MenuItem>)
        }
      </Select>
    </FormControl>
  )
}

const MemberSelect = ({ mid, data, onChange }) => {

  return (
    <Autocomplete
      disablePortal
      sx={{ ml: 2, width: "150px" }}
      size='small'
      onChange={(e) => onChange(e.target.id == "" ? null : e.target.id)}
      options={(data || [])?.map((m, index) => { return { label: m.name, id: m.mid } }) || []}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <Box
            key={key}
            component="li"
            // sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
            {...optionProps}
            id={option.id}
          >
            {option.label}
          </Box>
        );
      }}
      renderInput={(params) => <TextField {...params} label="成員" />}
    />
  )
}