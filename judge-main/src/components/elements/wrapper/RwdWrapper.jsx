import React, { cloneElement, Fragment } from 'react';
import { useMediaQuery, Box } from '@mui/material';
import useAppStore from '../../../store/app';

export default function RwdWrapper(props) {
  const { children, margin = 15, sx = {}, content_sx = {}, data = null, onlyProps = false, noDrawer = false } = props;
  
  const isDrawerOpen = useAppStore()?.isDrawerOpen && !noDrawer;

  const mediaQueryOptions = {
    lg: useMediaQuery(!isDrawerOpen ? '(min-width:1200px)' : '(min-width:1440px)'),
    md: useMediaQuery(!isDrawerOpen ? '(min-width:992px)' : '(min-width:1232px)'),
    xs: useMediaQuery(!isDrawerOpen ? '(min-width:768px)' : '(min-width:1008px)'),
  };

  const contentWidth = mediaQueryOptions.lg ? "1170px" : mediaQueryOptions.md ? "970px" : mediaQueryOptions.xs ? "750px" : "100%";
  
  const calculateWidth = () => {
    if (data && data.length < 3) {
      return `${100 / data.length}%`;
    } else {
      return mediaQueryOptions.lg ? "390px" : mediaQueryOptions.md ? "323.33px" : mediaQueryOptions.xs ? "375px" : contentWidth;
    }
  };

  const width = calculateWidth();

  const nextProps = {
    content_width: contentWidth,
    margin: `${margin}px`,
    width,
    width_margin: typeof width === "string" ? `calc(${width} - ${margin * 2}px)` : width - margin * 2,
    ...mediaQueryOptions,
  };

  if (onlyProps) {
    return (
      <Fragment>
        {cloneElement(children, { ...nextProps })}
      </Fragment>
    );
  }

  return (
    <Box className="flex flex-1-1 jcsb flex-col aic" sx={{ ...sx }}>
      <Box sx={{ width: contentWidth, display: "flex", flexWrap: "wrap", ...content_sx }}>
        {cloneElement(children, { ...nextProps })}
      </Box>
    </Box>
  );
}
