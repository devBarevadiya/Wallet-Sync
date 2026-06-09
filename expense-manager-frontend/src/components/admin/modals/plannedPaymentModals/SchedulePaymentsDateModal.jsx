import ModelWrapper from "../../../ModelWrapper";
import PropTypes from "prop-types";
import { memo, useCallback, useMemo, useState } from "react";
import { Button, Form, Modal, Tab, Tabs } from "react-bootstrap";
import Calendar from "react-calendar/dist/cjs/Calendar.js";
import "react-calendar/dist/Calendar.css";
import { everyTypeEnum, scheduleTypeEnum } from "../../../../helpers/enum";
import InputField from "../../../inputFields/InputField";
import { Swiper, SwiperSlide } from "swiper/react";
import * as yup from "yup";
import { useFormik } from "formik";
import EndDateModal from "./EndDateModal";
import { useModalScroll } from "../../../../helpers/customHooks";

const SchedulePaymentsDateModal = ({
  isOpen,
  onClose,
  onSelectValue,
  editData = {},
  closeDirectly,
  open,
}) => {
  const [isModal, setIsModal] = useState(false);
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const weekday = useMemo(
    () => [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    []
  );

  const ordinalSuffix = (num) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  const generateOrdinalData = (count) => {
    return Array.from({ length: count }, (_, i) => ordinalSuffix(i + 1));
  };

  const everyType = useMemo(
    () => [
      {
        title: "Day",
        value: everyTypeEnum.DAY,
      },
      {
        title: "Week",
        value: everyTypeEnum.WEEK_DAY,
      },
      {
        title: "Month",
        value: everyTypeEnum.MONTH,
      },
      {
        title: "Year",
        value: everyTypeEnum.YEAR,
      },
    ],
    []
  );

  const initialValues = useMemo(
    () => ({
      every: editData?.every || 2,
      everyType: editData?.everyType || everyTypeEnum.DAY,
      weekday: editData?.weekday || weekday?.[new Date()?.getDay()] || "",
      scheduleDate: editData?.scheduleDate || new Date() || "",
      scheduleType: editData?.scheduleType || scheduleTypeEnum.ONE_TIME || "",
      stopDate: editData?.stopDate || null,
      maxRepetitions: editData?.maxRepetitions || null,
    }),
    [editData, weekday]
  );

  const validationSchema = yup.object({
    every: yup.number().required(),
    everyType: yup.string().required(),
  });

  const validation = useFormik({
    name: "schedule-repeat-validation",
    initialValues,
    validationSchema,
    enableReinitialize: true,
  });

  const handleTabChange = (tab) => {
    validation.setFieldValue("scheduleType", tab);
  };
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    let filteredObj = {};
    console.log(validation.values, "<<<<<<<<<<<<<");

    if (validation.values.scheduleType == scheduleTypeEnum.ONE_TIME) {
      filteredObj = Object.fromEntries(
        Object.entries(validation.values)?.filter(
          ([key]) => key == "scheduleDate"
        )
      );
    } else {
      if (validation.values.everyType == everyTypeEnum.DAY) {
        const keyRequired = [
          "every",
          "everyType",
          "scheduleType",
          "stopDate",
          "maxRepetitions",
        ];
        filteredObj = Object.fromEntries(
          Object.entries(validation.values)?.filter(([key]) =>
            keyRequired?.includes(key)
          )
        );
      } else if (validation.values.everyType == everyTypeEnum.WEEK_DAY) {
        const keyRequired = [
          "every",
          "everyType",
          "weekday",
          "scheduleType",
          "stopDate",
          "maxRepetitions",
        ];
        filteredObj = Object.fromEntries(
          Object.entries(validation.values)?.filter(([key]) =>
            keyRequired?.includes(key)
          )
        );
      } else if (
        validation.values.everyType == everyTypeEnum.MONTH ||
        validation.values.everyType == everyTypeEnum.YEAR
      ) {
        const keyRequired = [
          "every",
          "everyType",
          "scheduleDate",
          "scheduleType",
          "stopDate",
          "maxRepetitions",
        ];
        filteredObj = Object.fromEntries(
          Object.entries(validation.values)?.filter(([key]) =>
            keyRequired?.includes(key)
          )
        );
      }

      // filteredObj = Object.fromEntries(
      //   Object.entries(validation.values)?.filter(([key, value]) => value)
      // );
    }

    onSelectValue({
      ...filteredObj,
      scheduleType: validation.values.scheduleType,
    });
    onClose();
  }, [validation, onClose, onSelectValue]);

  // const

  const handleWeekdayValue = useCallback((value) => {
    validation.setFieldValue("weekday", value);
  }, []);

  const handleDate = useCallback((date) => {
    validation.setFieldValue("scheduleDate", date);
  }, []);

  const [filterCurrentEveryType] = useMemo(() => {
    const filterData = everyType
      ?.map((item, index) => ({ item, index }))
      ?.filter(({ item }) => item?.value == validation.values.everyType);
    return filterData || [];
  }, [validation, everyType]);

  const scheduleDateFormate = () => {
    if (validation.values?.everyType == everyTypeEnum.WEEK_DAY) {
      return (
        <span>
          {`Every ${
            validation?.values?.every > 1
              ? ordinalSuffix(validation.values?.every)
              : ""
          }`}{" "}
          {validation.values?.weekday}
        </span>
      );
    } else if (
      validation.values?.everyType == everyTypeEnum.MONTH ||
      validation.values?.everyType == everyTypeEnum.YEAR
    ) {
      return (
        <span className="text-lowercase">{validation.values?.everyType}ly</span>
      );
    } else {
      return (
        <span className="text-lowercase">
          {`Every ${
            validation?.values?.every > 1
              ? ordinalSuffix(validation.values?.every)
              : ""
          }`}{" "}
          {validation.values.everyType}
        </span>
      );
    }
  };

  const handleOpenEndDateModal = useCallback(() => {
    setIsModal(true);
    closeDirectly();
  }, [closeDirectly]);

  const handleCloseEndDateModal = useCallback(
    (values) => {
      validation.setValues({ ...validation.values, ...values });
      setIsModal(false);
      open();
    },
    [validation, open]
  );

  // const endDateContent = useCallback(() => {
  //   console.log(validation.values?.maxRepetitions, validation.values.every);
  //   if (
  //     !validation.values?.maxRepetitions &&
  //     (validation.values.stopDate == "" || validation.values.stopDate == null)
  //   ) {
  //     return "Never";
  //   } else if (validation.values?.maxRepetitions == validation.values.every) {
  //     return "After Number Of Events";
  //   } else if (validation.values.stopDate == validation.values.scheduleDate) {
  //     return "Until A Date";
  //   }
  // }, [
  //   validation.values.stopDate,
  //   validation.values?.maxRepetitions,
  //   validation.values.every,
  // ]);

  return (
    <>
      <ModelWrapper
        show={isOpen}
        onHide={handleClose}
        // onHide={() => {
        //   onClose(), onSelectValue(date);
        // }}
        className="modal-650px responsive"
        title={`Date & Time`}
        backButton
      >
        <Modal.Body ref={modalBodyRef}>
          <Tabs
            activeKey={validation.values.scheduleType}
            // defaultActiveKey={currentTab}
            onSelect={handleTabChange}
            transition={true}
            id="noanim-tab-example"
            className="mb-3 main-tab-design"
          >
            <Tab eventKey={scheduleTypeEnum.ONE_TIME} title="One  - Time">
              <Calendar
                onChange={handleDate}
                value={validation.values.scheduleDate}
              />
            </Tab>
            <Tab eventKey={scheduleTypeEnum.REPEAT} title="Repeat">
              <InputField
                type="clickOnly"
                name="account"
                id="account"
                label=""
                placeholder="Enter Name"
                value={scheduleDateFormate()}
                // postIcon={<i className="ri-arrow-right-s-line fs-21"></i>}
                // onClick={() => handleOpenSubModal("selectAccount")}
                // invalid={validation.touched.account && validation.errors.account}
                // errorMessage={validation.errors.account}
              />
              <div className="border border-dark-white-color br-10 mt-4">
                <div className="d-flex align-items-center justify-content-between p-3">
                  <span className="text-color-monsoon fs-16">Every</span>
                </div>
                <span>
                  <div className="py-2 border-top border-bottom border-dark-white-color">
                    <Swiper spaceBetween={20} slidesPerView={3}>
                      {generateOrdinalData(100)?.map((item, index) => {
                        return (
                          <SwiperSlide
                            key={index}
                            className="text-center cursor-pointer"
                            onClick={() =>
                              validation.setFieldValue("every", index + 1)
                            }
                          >
                            <span
                              className={`${
                                validation.values.every == index + 1
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
                  </div>
                  <div className="d-flex align-items-center justify-content-between p-3">
                    <span>
                      <i
                        onClick={() =>
                          filterCurrentEveryType?.index > 0 &&
                          validation.setFieldValue(
                            "everyType",
                            everyType?.[filterCurrentEveryType?.index - 1]
                              ?.value
                          )
                        }
                        className={`ri-arrow-left-s-line fs-30 cursor-pointer ${
                          filterCurrentEveryType?.index > 0
                            ? ""
                            : "text-color-light-gray"
                        }`}
                      ></i>
                    </span>
                    <h6 className="m-0 p-0">
                      {filterCurrentEveryType?.item?.title}{" "}
                    </h6>
                    <span>
                      <i
                        onClick={() =>
                          filterCurrentEveryType?.index + 1 !==
                            everyType?.length &&
                          validation.setFieldValue(
                            "everyType",
                            everyType?.[filterCurrentEveryType?.index + 1]
                              ?.value
                          )
                        }
                        className={`ri-arrow-right-s-line fs-30 cursor-pointer ${
                          filterCurrentEveryType?.index + 1 == everyType?.length
                            ? "text-color-light-gray"
                            : ""
                        }`}
                      ></i>
                    </span>
                  </div>
                  {validation.values.everyType == everyTypeEnum.WEEK_DAY && (
                    <ul className="m-0 p-0 px-4 d-flex flex-column gap-3">
                      {weekday?.map((item, index) => {
                        return (
                          <li
                            key={index}
                            className={`${
                              index + 1 == weekday?.length
                                ? ""
                                : "border-bottom"
                            }  border-dark-white-color d-flex justify-content-between align-items-center cursor-pointer pb-3`}
                          >
                            <label
                              htmlFor={`weekday${index + 1}`}
                              className="text-capitalize p-0 m-0 cursor-pointer user-select-none"
                            >
                              {item}
                            </label>
                            <Form.Check
                              id={`weekday${index + 1}`}
                              checked={validation.values.weekday == item}
                              className="square-check text-color-light-gray fs-18"
                              type={"checkbox"}
                              // label={`select all account`}
                              // checked={isAccountChecked}
                              onChange={() => handleWeekdayValue(item)}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {(validation.values.everyType == everyTypeEnum.MONTH ||
                    validation.values.everyType == everyTypeEnum.YEAR) && (
                    <Calendar
                      onChange={handleDate}
                      value={validation.values.scheduleDate}
                      className={`${
                        validation.values.everyType == everyTypeEnum.MONTH
                          ? "navigation-none"
                          : ""
                      } `}
                    />
                  )}
                </span>
              </div>
              <span className="d-block mt-4">
                <InputField
                  type="clickOnly"
                  name="account"
                  id="account"
                  label="End date"
                  placeholder="Enter Name"
                  className=""
                  value={
                    validation.values?.stopDate &&
                    validation.values?.stopDate !== null
                      ? "Until A Date"
                      : validation.values?.maxRepetitions > 0
                      ? "After Number Of Events"
                      : "Never"
                  }
                  postIcon={<i className="ri-arrow-right-s-line fs-21"></i>}
                  onClick={handleOpenEndDateModal}
                  // invalid={validation.touched.account && validation.errors.account}
                  // errorMessage={validation.errors.account}
                />
              </span>
            </Tab>
          </Tabs>
          <Button onClick={handleSubmit} className="primary-btn w-100 mt-2">
            Submit
          </Button>
        </Modal.Body>
      </ModelWrapper>

      <EndDateModal
        isOpen={isModal}
        onClose={handleCloseEndDateModal}
        value={validation.values}
      />
    </>
  );
};

SchedulePaymentsDateModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSelectValue: PropTypes.func,
  currentTab: PropTypes.string,
  editData: PropTypes.object,
  closeDirectly: PropTypes.func,
  open: PropTypes.func,
};

export default memo(SchedulePaymentsDateModal);
