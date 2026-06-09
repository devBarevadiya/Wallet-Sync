import { memo, useCallback, useEffect, useState } from "react";
import ModelWrapper from "../../../../ModelWrapper";
import { Modal } from "react-bootstrap";
import {
  plannedPaymentEnum,
  transactionTypeEnum,
} from "../../../../../helpers/enum";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  clearFilterOption,
  removeOptionByKey,
  setFilterOption,
} from "../../../../../store/planned/slice";
import ScheduleTypeModal from "./ScheduleTypeModal";
import RepeatModal from "./RepeatModal";
import AccountFilterModal from "./AccountFilterModal";
import CurrenciesFilterModal from "./CurrenciesFilterModal";
import SelectLabelModal from "../SelectLabelModal";
import SortingFilter from "./SortingFilter";
import HeadcategorySelectModal from "./HeadcategorySelectModal";
import { getPlannedByFiltersThunk } from "../../../../../store/planned/thunk";
import { capitalizeFirstLetter } from "../../../../../helpers/commonFunctions";
import { useModalScroll } from "../../../../../helpers/customHooks";

const FilterModal = ({ isOpen, onClose, open, onSuccess }) => {
  const { filterOptions } = useSelector((store) => store.Planned);

  const dispatch = useDispatch();
  const [subModal, setSubModal] = useState("");
  const closeModal = useCallback(() => {
    onClose();
    // onSuccess();
  }, [onClose, onSuccess]);
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const transactionTypeData = [
    {
      title: "Income",
      value: transactionTypeEnum.INCOME,
    },
    {
      title: "Expense",
      value: transactionTypeEnum.EXPENSE,
    },
  ];

  const filterTitlesData = [
    {
      title: "schedule type",
      value: plannedPaymentEnum.SCHEDULE_TYPE,
      appliedLabel: filterOptions?.[plannedPaymentEnum.SCHEDULE_TYPE],
    },
    {
      title: "repeat",
      value: plannedPaymentEnum.EVERY_TYPE,
      appliedLabel:
        filterOptions?.[plannedPaymentEnum.EVERY_TYPE] &&
        filterOptions?.[plannedPaymentEnum.EVERY_TYPE]?.length + " selected",
    },
    {
      title: "accounts",
      value: plannedPaymentEnum.ACCOUNTS,
      appliedLabel:
        filterOptions?.[plannedPaymentEnum.ACCOUNTS] &&
        filterOptions?.[plannedPaymentEnum.ACCOUNTS]?.length + " Selected",
    },
    {
      title: "currencies",
      value: plannedPaymentEnum.CURRENCIES,
      appliedLabel:
        filterOptions?.[plannedPaymentEnum.CURRENCIES] &&
        filterOptions?.[plannedPaymentEnum.CURRENCIES]?.length + " Selected",
    },
    {
      title: "labels",
      value: plannedPaymentEnum.LABELS,
      appliedLabel:
        filterOptions?.[plannedPaymentEnum.LABELS] &&
        filterOptions?.[plannedPaymentEnum.LABELS]?.length + " Selected",
    },
    {
      title: "categories",
      value: plannedPaymentEnum.CATEGORIES,
      appliedLabel:
        filterOptions?.[plannedPaymentEnum.CATEGORIES] &&
        filterOptions?.[plannedPaymentEnum.CATEGORIES]?.length + " Selected",
    },
    {
      title: "sorting",
      value: plannedPaymentEnum.SORT_BY,
      appliedLabel:
        filterOptions?.[plannedPaymentEnum.SORT_BY] &&
        "Sort by: " +
          (Object?.keys(filterOptions?.[plannedPaymentEnum.SORT_BY])?.[0] ==
          "scheduleDate"
            ? filterOptions?.[plannedPaymentEnum.SORT_BY]?.["scheduleDate"] == 1
              ? "Newest"
              : "Oldest"
            : Object?.values(
                filterOptions?.[plannedPaymentEnum.SORT_BY]
              )?.[0] == 1
            ? "A to Z"
            : "Z to A"),
    },
  ];

  const handleChangeTab = useCallback(
    (value) => {
      dispatch(setFilterOption({ ...filterOptions, type: value }));
    },
    [filterOptions, dispatch]
  );

  const removeKeyFromFilterOptions = useCallback(() => {
    dispatch(removeOptionByKey("type"));
    // handleOnSelectValues()
  }, [dispatch]);

  const handleOpenSubModal = useCallback(
    (value) => {
      setSubModal(value);
      onClose();
    },
    [onClose]
  );

  const handleCloseSubModal = useCallback(() => {
    setSubModal("");
    open();
  }, [open]);

  const handleCloseSubModalDirectly = useCallback(() => {
    setSubModal("");
  }, []);

  const handleOpenSubModalDirectly = useCallback((value) => {
    setSubModal(value);
  }, []);

  const handleSelectLabel = useCallback((value) => {
    const ids = value?.map((item) => item?._id);
    if (ids?.length > 0) {
      dispatch(setFilterOption({ ...filterOptions, labels: ids }));
    } else {
      dispatch(removeOptionByKey("labels"));
    }
  }, []);

  const clearFilter = useCallback(() => {
    dispatch(clearFilterOption());
  }, []);

  // useEffect(() => {
  //   dispatch(getPlannedByFiltersThunk({ ...filterOptions, page: 1 }));
  // }, [filterOptions, dispatch]);

  return (
    <>
      <Modal
        show={isOpen}
        onHide={closeModal}
        className="modal-650px responsive"
        centered
      >
        <Modal.Header
          closeButton
          className="border-bottom common-border-color py-4 model-close-btn-m-0"
        >
          <Modal.Title className="text-capitalize max-w-300px d-block text-truncate fs-21 responsive w-100 me-3">
            Planned payment
          </Modal.Title>
          <span className="ms-auto">
            {Object.keys(filterOptions)?.length ? (
              <span
                className="text-color-primary  fs-16 me-3 cursor-pointer"
                onClick={clearFilter}
              >
                Clear Filter
              </span>
            ) : (
              ""
            )}
          </span>
        </Modal.Header>
        <Modal.Body ref={modalBodyRef}>
          <ul className="mb-3 gap-2 text-center fs-16 w-100 user-select-none fw-medium client-section-bg-color d-flex w-fit br-5 overflow-hidden p-2">
            <li
              onClick={() => removeKeyFromFilterOptions()}
              className={`w-100 py-2 px-3  ${
                !filterOptions?.type
                  ? "bg-white br-5 common-border-color border dark-text-color"
                  : "text-color-dusty-gray"
              } d-block cursor-pointer`}
            >
              All
            </li>
            {transactionTypeData?.map((item, index) => {
              const title = item?.title;
              const value = item?.value;
              return (
                <li
                  onClick={
                    () =>
                      // value
                      // ?
                      handleChangeTab(value)
                    // : removeKeyFromFilterOptions()
                  }
                  key={index}
                  className={`w-100 py-2 px-3  ${
                    filterOptions?.type == value
                      ? "bg-white br-5 common-border-color border dark-text-color"
                      : "text-color-dusty-gray"
                  } d-block cursor-pointer`}
                >
                  {title}
                </li>
              );
            })}
          </ul>
          <ul className="m-0 p-0 d-flex flex-column gap-3 pt-2">
            {filterTitlesData?.map((item, index) => {
              const title = item?.title;
              const value = item?.value;
              const appliedLabel = item?.appliedLabel || "";
              return (
                <li
                  onClick={() => handleOpenSubModal(value)}
                  key={index}
                  className={`d-flex align-items-center justify-content-between text-capitalize cursor-pointer ${
                    index + 1 == filterTitlesData?.length
                      ? ""
                      : "border-bottom border-dark-white-color pb-3"
                  }`}
                >
                  {title}
                  <span>
                    {appliedLabel ? (
                      <span className="text-color-monsoon fs-14">
                        {capitalizeFirstLetter(appliedLabel)}{" "}
                        <i className="ri-arrow-right-s-line"></i>
                      </span>
                    ) : (
                      <span className="text-color-light-gray fs-14">
                        All <i className="ri-arrow-right-s-line"></i>
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Modal.Body>
      </Modal>

      <ScheduleTypeModal
        isOpen={subModal == plannedPaymentEnum.SCHEDULE_TYPE}
        filterKey={plannedPaymentEnum.SCHEDULE_TYPE}
        onClose={handleCloseSubModal}
        dispatchFunc={setFilterOption}
        filterData={filterOptions?.[plannedPaymentEnum.SCHEDULE_TYPE]}
      />

      <RepeatModal
        isOpen={subModal == plannedPaymentEnum.EVERY_TYPE}
        filterKey={plannedPaymentEnum.EVERY_TYPE}
        onClose={handleCloseSubModal}
        dispatchFunc={setFilterOption}
        filterData={filterOptions?.[plannedPaymentEnum.EVERY_TYPE]}
      />

      <AccountFilterModal
        isOpen={subModal == plannedPaymentEnum.ACCOUNTS}
        filterKey={plannedPaymentEnum.ACCOUNTS}
        onClose={handleCloseSubModal}
        dispatchFunc={setFilterOption}
        filterData={filterOptions?.[plannedPaymentEnum.ACCOUNTS]}
      />

      <CurrenciesFilterModal
        isOpen={subModal == plannedPaymentEnum.CURRENCIES}
        filterKey={plannedPaymentEnum.CURRENCIES}
        onClose={handleCloseSubModal}
        dispatchFunc={setFilterOption}
        filterData={filterOptions?.[plannedPaymentEnum.CURRENCIES]}
      />

      <SelectLabelModal
        isOpen={subModal == plannedPaymentEnum.LABELS}
        onClose={handleCloseSubModal}
        filterKey={plannedPaymentEnum.LABELS}
        // onSelectValue={handleSelectLabel}
        dispatchFunc={setFilterOption}
        filterData={filterOptions?.[plannedPaymentEnum.LABELS]}
      />

      <HeadcategorySelectModal
        isOpen={subModal == plannedPaymentEnum.CATEGORIES}
        filterKey={plannedPaymentEnum.CATEGORIES}
        onClose={handleCloseSubModal}
        onSelectValue={handleSelectLabel}
        open={() => handleOpenSubModalDirectly(plannedPaymentEnum.CATEGORIES)}
        close={handleCloseSubModalDirectly}
        dispatchFunc={setFilterOption}
        filterData={filterOptions?.[plannedPaymentEnum.CATEGORIES]}
      />

      <SortingFilter
        isOpen={subModal == plannedPaymentEnum.SORT_BY}
        filterKey={plannedPaymentEnum.SORT_BY}
        onClose={handleCloseSubModal}
        dispatchFunc={setFilterOption}
        filterData={filterOptions?.[plannedPaymentEnum.SORT_BY]}
      />
    </>
  );
};

export default memo(FilterModal);
