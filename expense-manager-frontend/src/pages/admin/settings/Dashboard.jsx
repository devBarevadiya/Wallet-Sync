import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import SettingLayout from "./Layout";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setChartOrder } from "../../../store/dashboard/slice";
import { Table } from "react-bootstrap";

const Dashboard = () => {
  const { chartOrder } = useSelector((store) => store.Dashboard);
  const [items, setItems] = useState(chartOrder);

  const dispatch = useDispatch();

  const onDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) return;

    const updatedItems = Array.from(items);
    const [movedItem] = updatedItems.splice(source.index, 1);
    updatedItems.splice(destination.index, 0, movedItem);
    dispatch(setChartOrder(updatedItems));
    setItems(updatedItems);
  };

  const toggleIsShow = (index) => {
    const updatedItems = items?.map((item, i) => {
      if (i == index) {
        return { ...item, isShow: !item.isShow };
      }
      return item;
    });
    dispatch(setChartOrder(updatedItems));
    setItems(updatedItems);
  };

  return (
    <SettingLayout
      pageTitleData={{
        isButton: false,
      }}
      layoutHeight="settings-layout-big"
      className="pt-2 pt-sm-3"
    >
      <div className={`p-3 pt-0`}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <Table responsive>
                <tbody
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="mt-2"
                >
                  {items.map((item, index) => (
                    <Draggable
                      key={item.enum}
                      draggableId={item.enum}
                      index={index}
                    >
                      {(provided) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${items?.length == index+1 ? "" : "border-bottom"}  border-dark-white-color py-3 d-flex align-items-center justify-content-between`}
                        >
                          <td className="text-capitalize border-0 text-nowrap me-3 fs-18 responsive">
                            {item.title}
                          </td>
                          <td className="d-flex align-items-center gap-3 responsive border-0">
                            <i
                              onClick={() => toggleIsShow(index)}
                              className={`${
                                item.isShow ? "ri-eye-line" : "ri-eye-off-line"
                              } fs-18`}
                            ></i>
                            <i
                              className="ri-align-justify text-color-light-gray fs-18"
                              {...provided.dragHandleProps}
                            ></i>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              </Table>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      {/* <div className={`p-3 pt-0`}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="mt-2"
              >
                {items.map((item, index) => (
                  <Draggable
                    key={item.enum}
                    draggableId={item.enum}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="border-bottom border-dark-white-color py-3 d-flex align-items-center justify-content-between "
                      >
                        <div className="text-capitalize">{item.title}</div>
                        <div className="d-flex align-items-center gap-3 responsive">
                          <i
                            onClick={() => toggleIsShow(index)}
                            className={`${
                              item.isShow ? "ri-eye-line" : "ri-eye-off-line"
                            } fs-18`}
                          ></i>
                          <i
                            className="ri-align-justify text-color-light-gray fs-18"
                            {...provided.dragHandleProps}
                          ></i>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div> */}
    </SettingLayout>
  );
};

export default Dashboard;
