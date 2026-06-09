import { memo } from "react";
import ModelWrapper from "../../../ModelWrapper";
import PropTypes from "prop-types";
import { Form, Modal } from "react-bootstrap";
import { confirmationTypeEnum } from "../../../../helpers/enum";
import { useModalScroll } from "../../../../helpers/customHooks";

const SelectConfirmationModal = ({ isOpen, onClose, onSelectValue, value }) => {
  const data = [
    {
      title: "manual",
      value: confirmationTypeEnum.MANUAL,
    },
    {
      title: "automatically",
      value: confirmationTypeEnum.AUTOMATICALLY,
    },
  ];

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  return (
    <ModelWrapper
      show={isOpen}
      onHide={onClose}
      className="modal-650px responsive"
      title={`Confirmation`}
      backButton
    >
      <Modal.Body ref={modalBodyRef} className="p-4 pb-1">
        <ul className="p-0 m-0 d-flex flex-column gap-3">
          {data?.map((item, index) => {
            const title = item?.title;
            const enumValue = item?.value;
            return (
              <li
                key={index}
                className={`pb-3  ${
                  data?.length == index + 1 ? "border-0" : "border-bottom"
                } border-dark-white-color d-flex justify-content-between align-items-center cursor-pointer`}
                onClick={() => {
                  onSelectValue(enumValue), onClose();
                }}
              >
                <h6 className="text-capitalize p-0 m-0">{title}</h6>
                <Form.Check
                  checked={value == enumValue}
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

SelectConfirmationModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  value: PropTypes.any,
  onSelectValue: PropTypes.func,
};

export default memo(SelectConfirmationModal);
