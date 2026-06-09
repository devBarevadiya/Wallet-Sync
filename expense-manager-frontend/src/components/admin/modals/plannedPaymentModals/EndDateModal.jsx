import { Button, Form, Modal } from "react-bootstrap";
import ModelWrapper from "../../../ModelWrapper";
import { memo, useCallback } from "react";
import { useFormik } from "formik";
import { formatDate } from "../../../../helpers/commonFunctions";
import Calendar from "react-calendar/dist/cjs/Calendar.js";
import { Swiper, SwiperSlide } from "swiper/react";
import PropTypes from "prop-types";

const EndDateModal = ({ isOpen, onClose, value = {} }) => {
  const initialValues = {
    stopDate: value?.stopDate || null,
    maxRepetitions: value?.maxRepetitions || null,
  };

  const validation = useFormik({
    name: "enddate-validation",
    initialValues,
    enableReinitialize: true,
  });

  const handleChangeStopDate = (value) => {
    validation.setFieldValue("maxRepetitions", null);
    validation.setFieldValue("stopDate", value);
  };

  const handleChangeRepetition = (value = 1) => {
    validation.setFieldValue("maxRepetitions", value);
    validation.setFieldValue("stopDate", null);
  };

  const ordinalSuffix = (num) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  const generateOrdinalData = (count) => {
    return Array.from({ length: count }, (_, i) => ordinalSuffix(i + 1));
  };

  const handleClose = useCallback(() => {
    validation.resetForm();
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    onClose(validation.values);
  }, [validation, onClose]);

  return (
    <ModelWrapper
      show={isOpen}
      onHide={handleClose}
      className="modal-650px responsive"
      title={`Confirmation`}
      backButton
    >
      <Modal.Body>
        <ul className="p-0 m-0 d-flex flex-column gap-3">
          <li
            className="pb-3 border-bottom border-dark-white-color d-flex justify-content-between align-items-center cursor-pointer"
            onClick={() => handleChangeStopDate(null)}
          >
            <h6 className="text-capitalize p-0 m-0">Never</h6>
            <Form.Check
              checked={
                !validation.values.maxRepetitions > 0 &&
                validation.values.stopDate == null
              }
              className="square-check text-color-light-gray fs-18"
            />
          </li>
          <li
            className="pb-3 border-bottom border-dark-white-color cursor-pointer"
            onClick={() => handleChangeStopDate(new Date())}
          >
            <span className="d-flex justify-content-between align-items-center">
              <h6 className="text-capitalize p-0 m-0">Until a Date</h6>
              <Form.Check
                checked={validation.values.stopDate !== null}
                className="square-check text-color-light-gray fs-18"
              />
            </span>
            {validation.values.stopDate ? (
              <Calendar
                onChange={(value) =>
                  validation.setFieldValue(
                    "stopDate",
                    formatDate(value, "YYYY-MM-DD")
                  )
                }
                value={validation.values.stopDate}
              />
            ) : null}
          </li>
          <li
            className="pb-3 cursor-pointer border-bottom border-dark-white-color"
            
          >
            <span className="d-flex justify-content-between align-items-center" onClick={() => handleChangeRepetition(2)}>
              <h6 className="text-capitalize p-0 m-0">
                After Number Of Events
              </h6>
              <Form.Check
                checked={validation.values.maxRepetitions > 0}
                className="square-check text-color-light-gray fs-18"
              />
            </span>
            {validation.values.maxRepetitions ? (
              <Swiper spaceBetween={20} slidesPerView={3} className="mt-3">
                {generateOrdinalData(100)?.map((item, index) => {
                  return (
                    <SwiperSlide
                      key={index}
                      className="text-center cursor-pointer"
                      onClick={() => handleChangeRepetition(index + 1)}
                    >
                      <span
                        className={`${
                          validation.values.maxRepetitions == index + 1
                            ? ""
                            : "text-color-light-gray"
                        } fs-18 py-2 d-block`}
                      >
                        {item}
                      </span>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            ) : (
              ""
            )}
          </li>
        </ul>

        <Button
          onClick={handleSubmit}
          className="primary-btn w-100 text-center mt-4"
        >
          Submit
        </Button>
      </Modal.Body>
    </ModelWrapper>
  );
};

EndDateModal.propTypes = {
  value: PropTypes.object,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default memo(EndDateModal);
