import { memo, useCallback, useEffect, useMemo, useState } from "react";
import ModelWrapper from "../../../ModelWrapper";
import PropTypes from "prop-types";
import { Button, Form, Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import { getLabelThunk } from "../../../../store/actions";
import { useDispatch } from "react-redux";
import { useModalScroll } from "../../../../helpers/customHooks";

const SelectLabelModal = ({
  onClose,
  isOpen,
  onSelectValue,
  value = [],
  dispatchFunc,
  filterData = [],
  filterKey = "",
}) => {
  const { data: labelData, loading } = useSelector((store) => store.Label);
  const dispatch = useDispatch();

  const isShowSelectAllOption = useMemo(
    () => (labelData?.length > 1 ? true : false),
    [labelData]
  );

  const [labels, setLabels] = useState([]);

  const handleSelect = useCallback(
    (value) => {
      const ids = value?.map((item) => item?._id);
      onSelectValue
        ? onSelectValue(value)
        : dispatch(dispatchFunc({ [filterKey]: ids }));
    },
    [dispatchFunc, onSelectValue, dispatch, filterKey]
  );

  const handleClose = useCallback(() => {
    // handleSelect();
    onClose();
  }, [onClose]);

  const handleChange = (value) => {
    const isExist = labels?.some((item) => item?._id == value?._id);
    if (isExist) {
      const filterdata = labels?.filter((item) => item?._id !== value?._id);
      setLabels(filterdata);
      // handleSelect(filterdata);
    } else {
      setLabels((pre) => [...pre, value]);
      // handleSelect([...labels, value]);
    }
  };

  const handleApply = useCallback(() => {
    handleSelect(labels);
    onClose();
  }, [handleSelect, labels, onClose]);

  const handleSelectAll = useCallback(() => {
    if (labelData?.length == labels?.length) setLabels([]);
    else setLabels(labelData || []);
  }, [labelData, labels]);

  useEffect(() => {
    if (isOpen && !labelData?.length > 0) {
      dispatch(getLabelThunk());
    }
    setLabels([...value, ...filterData.map((item) => ({ _id: item }))]);
  }, [isOpen]);

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  return (
    <ModelWrapper
      show={isOpen}
      onHide={handleClose}
      className="modal-650px responsive"
      title={`Labels`}
      backButton
    >
      <Modal.Body ref={modalBodyRef} className={!isShowSelectAllOption ? "" : "pt-0"}>
        {labelData?.length > 0 ? (
          <>
            {isShowSelectAllOption && (
              <div
                className="d-flex position-sticky top-0 bg-white align-items-center justify-content-between py-3 mb-3 border-bottom border-dark-white-color cursor-pointer"
                onClick={handleSelectAll}
              >
                <span className="user-select-none">Select All</span>
                <Form.Check
                  onChange={handleSelectAll}
                  checked={labels?.length == labelData?.length}
                  id={"select-all-account"}
                  className="square-check text-color-light-gray fs-18 ms-4"
                />
              </div>
            )}
            <ul className="p-0 m-0 d-flex flex-column gap-3">
              {labelData?.map((item, index) => {
                const title = item?.title;
                const color = item?.color;
                const id = item?._id;
                return (
                  <li
                    key={index}
                    className={`pb-3 border-bottom border-dark-white-color d-flex justify-content-between align-items-center cursor-pointer`}
                    // onChange={() => handleChange(id)}
                  >
                    <Form.Label
                      id="labels"
                      className="d-flex align-items-center gap-3 w-100 cursor-pointer m-0"
                    >
                      <span
                        className={`h-45 w-45 d-block p-3 br-8`}
                        style={{ backgroundColor: color }}
                      ></span>
                      <h6 className="text-capitalize p-0 m-0 text-break text-wrap truncate-line-1">
                        {title}
                      </h6>
                      <Form.Check
                        checked={labels?.some((item) => item?._id == id)}
                        className="square-check text-color-light-gray fs-18 ms-auto ms-4"
                        type={"checkbox"}
                        // label={`select all account`}
                        onChange={() => handleChange(item)}
                      />
                    </Form.Label>
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
          <span className="d-block text-center client-section-bg-color text-color-gray p-2 br-10">
            {loading ? "Fetching..." : "Oops! No Labels Yet!"}
          </span>
        )}
      </Modal.Body>
    </ModelWrapper>
  );
};

SelectLabelModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  value: PropTypes.array,
  onSelectValue: PropTypes.func,
  dispatchFunc: PropTypes.func,
  filterData: PropTypes.array,
};

export default memo(SelectLabelModal);
