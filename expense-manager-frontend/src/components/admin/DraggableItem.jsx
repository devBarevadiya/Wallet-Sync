import { useDraggable } from "@dnd-kit/core";
import React from "react";

const DraggableItem = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = {
    transform: `translate3d(${transform?.x}px, ${transform?.y}px, 0)`,
    cursor: "grab",
    padding: "10px",
    margin: "10px",
    background: "#f0f0f0",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
};

export default DraggableItem;
