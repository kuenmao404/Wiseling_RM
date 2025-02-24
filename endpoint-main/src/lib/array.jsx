import React, { Fragment } from 'react'
import { arrayMoveImmutable } from 'array-move'
import { sortableContainer, sortableElement, sortableHandle, } from 'react-sortable-hoc'
import { DragHandle as DragHandleIcon } from '@mui/icons-material'
import { Box, IconButton } from '@mui/material'

export const removeAtIndex = (array, index) => {
  return [...array.slice(0, index), ...array.slice(index + 1)];
};

export const insertAtIndex = (array, index, item) => {
  return [...array.slice(0, index), item, ...array.slice(index)];
};

export const arrayMove = (array, oldIndex, newIndex) => {
  return arrayMoveImmutable(array, oldIndex, newIndex);
};

export const moveBetweenContainers = (items, activeContainer, activeIndex, overContainer, overIndex, item) => {
  return {
    ...items,
    [activeContainer]: removeAtIndex(items[activeContainer], activeIndex),
    [overContainer]: insertAtIndex(items[overContainer], overIndex, item)
  };
};

// react-sortable-hoc
const SortableContainer = sortableContainer(({ children, ...props }) => {
  return <Box {...props} sx={{overflow: "hidden"}}>{children}</Box>;
});

const DragHandle = sortableHandle(({ disabled = false, ...props }) =>
  <IconButton color="warning" size="small" disabled={disabled} {...props}>
    <DragHandleIcon fontSize="inherit" />
  </IconButton>);

const SortableItem = sortableElement(({ children, ...props }) =>
  props.component == Fragment ? (
    <Fragment>
      {children}
    </Fragment>
  ) : (
    <Box className='draggable-item' {...props}>
      {children}
    </Box>
  )
);

const onSortEnd = ({ oldIndex, newIndex, items }, setItems = () => { }, callback = () => { }) => {
  if (oldIndex !== newIndex) {
    const newArr = arrayMove(items, oldIndex, newIndex)
    setItems?.(newArr)
    callback?.(newArr, { oldIndex, newIndex })
  }
}

export { SortableContainer, DragHandle, SortableItem, onSortEnd }
// ------ end ------ //

export const handleDragOver = ({ over, active }, setItems) => {
  const overId = over?.id;

  if (!overId) {
    return;
  }

  const activeContainer = active.data.current.sortable.containerId;
  const overContainer = over.data.current?.sortable.containerId;

  if (!overContainer) {
    return;
  }

  if (activeContainer !== overContainer) {
    setItems((items) => {
      const activeIndex = active.data.current.sortable.index;
      const overIndex = over.data.current?.sortable.index || 0;

      return moveBetweenContainers(
        items,
        activeContainer,
        activeIndex,
        overContainer,
        overIndex,
        active.id
      );
    });
  }
};

export const handleDragEnd = ({ active, over }, setItems, finishFn = () => { }) => {
  if (!over) {
    return;
  }

  if (active.id !== over.id) {
    const activeContainer = active.data.current.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId || over.id;
    const activeIndex = active.data.current.sortable.index;
    const overIndex = over.data.current?.sortable.index || 0;

    setItems((items) => {
      let newItems;
      if (activeContainer === overContainer) {
        newItems = {
          ...items,
          [overContainer]: arrayMove(
            items[overContainer],
            activeIndex,
            overIndex
          )
        };
      } else {
        newItems = moveBetweenContainers(
          items,
          activeContainer,
          activeIndex,
          overContainer,
          overIndex,
          active.id
        );
      }

      finishFn(newItems[overContainer], overIndex)

      return newItems;
    });
  }
};