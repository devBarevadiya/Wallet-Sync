import { memo, useCallback } from "react";
import ModelWrapper from "../../../ModelWrapper";
import PropTypes from "prop-types";
import { paymentTypeEnum } from "../../../../helpers/enum";
import { Form, Modal } from "react-bootstrap";

const PaymentTypeModal = ({ isOpen, onClose, onSelectValue, value = "" }) => {
  const data = [
    paymentTypeEnum.CASH,
    paymentTypeEnum.DEBIT_CARD,
    paymentTypeEnum.CREDIT_CARD,
    paymentTypeEnum.BANK_TRANFER,
    paymentTypeEnum.MOBILE_PATMENT,
    paymentTypeEnum.WEB_TRANSFER,
    paymentTypeEnum.AUTO_CONFIRM,
    paymentTypeEnum.MANUAL_CONFIRM,
  ];

  const formateTitle = (value) => {
    const splitted = value?.split("_");
    return splitted?.join(" ");
  };

  const handleSelectValue = useCallback((value) => {
    onSelectValue(value);
    onClose();
  },[onClose, onSelectValue]);

  return (
    <ModelWrapper
      show={isOpen}
      onHide={onClose}
      className="modal-650px responsive"
      title={`Payment Type`}
      backButton
    >
      <Modal.Body>
        <ul className="p-0 m-0 d-flex flex-column gap-3">
          {data?.map((item, index) => {
            return (
              <li
                key={index}
                className="pb-3 border-bottom border-dark-white-color d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => handleSelectValue(item)}
              >
                <h6 className="text-capitalize p-0 m-0">
                  {formateTitle(item)}
                </h6>
                <Form.Check
                  checked={value == item}
                  className="square-check text-color-light-gray fs-18"
                  type={"checkbox"}
                  // label={`select all account`}
                  // checked={isAccountChecked}
                  // onChange={handleAccountCheckbox}
                />
              </li>
            );
          })}
        </ul>
      </Modal.Body>
    </ModelWrapper>
  );
};

PaymentTypeModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSelectValue: PropTypes.func,
  value: PropTypes.string,
};

export default memo(PaymentTypeModal);
