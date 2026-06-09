import { memo, useCallback, useEffect, useState } from "react";
import ModelWrapper from "../../../ModelWrapper";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Button, Form, Modal } from "react-bootstrap";
import { formateAmount } from "../../../../helpers/commonFunctions";
import { useModalScroll } from "../../../../helpers/customHooks";

const SelectAccountModal = ({
  isOpen,
  onClose,
  onSelectValue,
  multivalue = false,
  value = [],
}) => {
  const { data } = useSelector(
    (store) => store.Account,
    (prev, next) => prev === next
  );
  const [accounts, setAccounts] = useState(value);
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const handleConfirm = useCallback(() => {
    onSelectValue && onSelectValue(accounts);
    onClose();
  }, [accounts, onSelectValue, onClose]);

  const handleChange = useCallback((value) => {
    setAccounts((prev) => {
      const isExist = prev.some((item) => item._id === value._id);
      return isExist
        ? prev.filter((item) => item._id !== value._id)
        : [...prev, value];
    });
  }, []);

  const handleClose = useCallback(() => {
    // if (multivalue) {
    //   onSelectValue && onSelectValue(accounts);
    // }
    onClose();
  }, [onClose]);

  const handleSelectAll = useCallback(
    (isCheck) => {
      isCheck ? setAccounts(data) : setAccounts([]);
    },
    [data]
  );

  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(accounts)) {
      setAccounts(value);
    }
  }, [value, isOpen]);

  return (
    <ModelWrapper
      show={isOpen}
      onHide={handleClose}
      className="modal-650px responsive"
      title="Accounts"
      backButton
    >
      <Modal.Body ref={modalBodyRef} className="">
        {multivalue && data?.length > 1 && (
          <span className="pb-4 ms-1 d-flex align-items-center gap-2 user-select-none">
            <Form.Check
              id="all-account"
              checked={accounts?.length == data?.length}
              className="square-check text-color-light-gray fs-18"
              type="checkbox"
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <label
              htmlFor="all-account"
              className="fs-14 cursor-pointer text-color-monsoon"
            >
              Select all Accounts
            </label>
          </span>
        )}
        <ul className="m-0 p-0 d-flex flex-column gap-3 cursor-pointer">
          {data?.map((item, index) => {
            const title = item?.title;
            const balance = item?.balance;
            const icon = `${
              import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL
            }${item?.accountType?.icon}`;
            const currencySymbol = item?.currency?.symbol;
            const isGreater = balance > 0;
            const id = item?._id;

            return (
              <li
                key={index}
                className="d-flex align-items-center justify-content-between pb-2 cursor-pointer border-bottom border-dark-white-color"
                onClick={() => {
                  if (!multivalue) {
                    onSelectValue(item);
                    onClose();
                  }
                }}
              >
                <Form.Label className="d-flex justify-content-between w-100 gap-3 align-items-center">
                  <div className="d-flex gap-3">
                    <img className="w-45px h-45px br-8" src={icon} alt="" />
                    <span>
                      <h6 className="mb-1 fs-18 max-w-300px truncate-line-1 text-break text-wrap">
                        {title}
                      </h6>
                      <span
                        className={`${
                          isGreater
                            ? "text-color-light-green"
                            : "text-color-invalid"
                        } fs-16 fw-medium text-nowrap`}
                      >
                        {isGreater ? "+ " : ""}
                        {currencySymbol + formateAmount({ price: balance })}
                      </span>
                    </span>
                  </div>

                  {multivalue ? (
                    <Form.Check
                      checked={accounts.some((item) => item._id === id)}
                      className="square-check text-color-light-gray fs-18 ms-auto ms-4"
                      type="checkbox"
                      onChange={() => handleChange(item)}
                    />
                  ) : (
                    <i className="ri-arrow-right-s-line fs-21"></i>
                  )}
                </Form.Label>
              </li>
            );
          })}
        </ul>
        <Modal.Footer className="p-0 mt-4">
          <Button className="primary-btn fs-16 w-100 m-0" onClick={handleConfirm}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal.Body>
      {/* <div className="mt-4"> */}
      {/* </div> */}
    </ModelWrapper>
  );
};

SelectAccountModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSelectValue: PropTypes.func,
  multivalue: PropTypes.bool,
  value: PropTypes.array,
};

export default memo(SelectAccountModal);
