import { memo, useCallback, useMemo, useState } from "react";
import ModelWrapper from "../../../../ModelWrapper";
import { Button, Form, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  removeOptionByKey,
  setFilterOption,
} from "../../../../../store/planned/slice";
import { useModalScroll } from "../../../../../helpers/customHooks";

const CategoryFilterModal = ({
  isOpen,
  onClose,
  filterKey,
  data = [],
  dispatchFunc,
  filterData = [],
}) => {
  // const { filterOptions } = useSelector((store) => store.Planned);
  const [checked, setChecked] = useState(filterData || []);
  const filter = filterData;
  const dispatch = useDispatch();

  const isShowSelectAllOption = useMemo(
    () => (data?.length > 1 ? true : false),
    [data]
  );

  const closeModal = useCallback(() => {
    onClose();
    setChecked(filter);
  }, [onClose, filter]);

  const handleCheck = (id) => {
    let data = checked || [];
    if (data?.includes(id)) {
      const filterData = data?.filter((item) => item !== id);
      data = filterData;
      setChecked(filterData);
      // dispatch(dispatchFunc({ [filterKey]: filterData }));
    } else {
      const filterData = [...data, id];
      data = filterData;
      setChecked(filterData);
      // dispatch(dispatchFunc({ [filterKey]: filterData }));
    }
    // if (!data?.length) removeOptionByKey(filterKey);
  };

  const handleSelectAll = useCallback(() => {
    if (data?.length == checked?.length) setChecked([]);
    else setChecked(data?.map((item) => item?._id || []));
  }, [data, checked?.length]);

  const handleApply = useCallback(() => {
    if (!checked?.length) dispatch(removeOptionByKey(filterKey));
    else dispatch(dispatchFunc({ [filterKey]: checked }));
    onClose();
  }, [dispatch, dispatchFunc, filterKey, onClose, checked]);

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  return (
    <ModelWrapper
      show={isOpen}
      onHide={closeModal}
      className="modal-650px responsive"
      title={`categories`}
      backButton
    >
      <Modal.Body ref={modalBodyRef} className={!isShowSelectAllOption ? "" : "pt-0"}>
        {data?.length ? (
          <>
            {isShowSelectAllOption && (
              <div
                className="d-flex position-sticky top-0 bg-white align-items-center justify-content-between py-3 mb-3 border-bottom border-dark-white-color cursor-pointer"
                onClick={handleSelectAll}
              >
                <span className="user-select-none">Select All</span>
                <Form.Check
                  onChange={handleSelectAll}
                  checked={checked?.length == data?.length}
                  id={"select-all-account"}
                  className="square-check text-color-light-gray fs-18 ms-4"
                />
              </div>
            )}
            <ul className="p-0 m-0 d-flex flex-column gap-3">
              {data?.map((item, index) => {
                const title = item?.title;
                const icon =
                  import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                  item?.icon;
                const id = item?._id;

                return (
                  <li
                    key={index}
                    className={`d-flex align-items-center justify-content-between text-capitalize cursor-pointer border-bottom border-dark-white-color pb-3`}
                    onClick={() => handleCheck(id)}
                  >
                    <span className="text-capitalize p-0 m-0 d-flex gap-3 align-items-center fw-medium">
                      <img className="w-45px h-45px br-8" src={icon} alt="" />
                      <span className="text-break text-wrap truncate-line-1">
                        {title}
                      </span>
                    </span>
                    <Form.Check
                      onChange={() => handleCheck(id)}
                      checked={checked?.includes(id)}
                      id={filterKey + "" + index + 1}
                      className="square-check text-color-light-gray fs-18 ms-4"
                    />
                  </li>
                );
              })}
            </ul>

            <Modal.Footer className="p-0 mt-4">
              <Button onClick={handleApply} className="w-100 primary-btn m-0">
                Apply
              </Button>
            </Modal.Footer>
          </>
        ) : (
          <span className="text-color-gray w-100 text-center d-block client-section-bg-color p-2 br-10">
            Oops! No Data Yet!
          </span>
        )}
      </Modal.Body>
    </ModelWrapper>
  );
};

export default memo(CategoryFilterModal);
