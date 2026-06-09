import { useCallback, useEffect, useMemo, useState } from "react";
import ModelWrapper from "../../../ModelWrapper";
import PropTypes from "prop-types";
import { Button, Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import CategoryBudgetLimitTypeModal from "./CategoryBudgetLimitTypeModal";
import { useDispatch } from "react-redux";
import {
  clearCategoryData,
  setSelectHeadCategory,
  setSelectedSubCategory,
  setShowSubCategories,
  setSubCategory,
  setSubCategoryAmounts,
} from "../../../../store/budget/slice";
import { budgetLimitTypeEnum } from "../../../../helpers/enum";
import { debounce } from "lodash";
import {
  addNewSubCatgoryThunk,
  budgetDetailsThunk,
} from "../../../../store/actions";
import CommonDeleteModal from "../deleteModals/CommonDeleteModal";
import { useModalScroll } from "../../../../helpers/customHooks";

const CategoryModal = ({
  onClose,
  isOpen,
  // data = [],
  open,
  close,
  method = "",
  // newCategories = [],
  headCategory = {},
}) => {
  const {
    selectedHeadCategory,
    values,
    categoryData,
    detailsData,
    subCategoryAmounts,
    headCategoryAmounts,
  } = useSelector((store) => store.Budget);
  const { baseCurrency } = useSelector((store) => store.Auth);
  const [selectedData, setSelectedData] = useState({});
  const [isModal, setIsModal] = useState(false);
  const [preAmounts, setPreAmounts] = useState({});
  const [isAlert, setIsAlert] = useState(false);
  // const [CData, setCData] = useState({});
  const dispatch = useDispatch();
  const isExtra = useMemo(() => method == "addExtra", [method]);
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const closeModal = useCallback(() => {
    setPreAmounts({});
    onClose();
  }, [onClose]);

  const typeLimitHeadTotal = useMemo(
    () =>
      categoryData?.reduce(
        (acc, curr) => acc + Number(curr?.maxAmount || 0),
        0
      ),
    [categoryData]
  );

  const typeNoLimitSubTotal = useMemo(
    () =>
      categoryData?.length > 0
        ? categoryData?.reduce(
            (acc, curr) =>
              acc +
              (curr?.spendLimitType !== budgetLimitTypeEnum.LIMIT
                ? curr?.categories?.reduce(
                    (acc2, curr2) =>
                      acc2 + Number(preAmounts[curr2?.category] || 0),
                    0
                  )
                : 0),
            0
          )
        : 0,
    [categoryData, preAmounts]
  );

  const handleOpenModal = useCallback(
    (value) => {
      setSelectedData(value);
      dispatch(setSelectedSubCategory(value));
      setIsModal(true);
      close();
    },
    [close, dispatch]
  );

  const handleCloseModal = useCallback(() => {
    setIsModal(false);
    open();
  }, [open]);

  const handleAmount = useCallback((index, id, e) => {
    e.stopPropagation();
    const value = e.target.value;
    // dispatch(
    //   setSubCategory({
    //     headCategoryId: selectedHeadCategory?._id,
    //     subCategoryId: id,
    //     data: { maxAmount: Number(value) },
    //   })
    // );
    setPreAmounts((pre) => ({ ...pre, [id]: Number(value) }));
  }, []);

  const mergedCategories = useMemo(() => {
    const headData = categoryData?.find(
      (item) => item?.headCategory == selectedHeadCategory?.headCategory
    );

    return selectedHeadCategory?.categories?.map((item) => {
      const match = headData?.categories?.find(
        (value) => value?.category == item?._id
      );

      return {
        ...item,
        category: item?._id,
        spendLimitType: match?.spendLimitType || "",
        maxAmount: Number(subCategoryAmounts[item?._id]) || 0,
      };
    });
  }, [selectedHeadCategory, categoryData, subCategoryAmounts]);

  const countAmount = useMemo(
    () =>
      Object.values(preAmounts)?.reduce((acc, curr) => Number(curr) + acc, 0),
    [preAmounts]
  );

  const handleSubmit = useCallback(async () => {
    if (isExtra) {
      const response = await dispatch(
        addNewSubCatgoryThunk({
          id: detailsData?._id,
          headId: headCategory?.headCategory,
          value: mergedCategories?.map((item) => ({
            category: item?.category,
            maxAmount: 0,
            spendLimitType:
              item?.spendLimitType || budgetLimitTypeEnum.NO_LIMIT,
          })),
        })
      );
      if (addNewSubCatgoryThunk?.fulfilled.match(response)) {
        await dispatch(budgetDetailsThunk(detailsData?._id));
        dispatch(setSelectHeadCategory({}));
        dispatch(clearCategoryData());
        dispatch(setShowSubCategories([]));
      }
    }
    if (
      (selectedHeadCategory?.spendLimitType == budgetLimitTypeEnum.LIMIT &&
        headCategoryAmounts[selectedHeadCategory?.headCategory] <
          countAmount) ||
      values?.maxAmount < typeLimitHeadTotal + typeNoLimitSubTotal
    ) {
      setIsAlert(true);
    } else {
      dispatch(setSubCategoryAmounts({ ...subCategoryAmounts, ...preAmounts }));
      onClose();
    }
  }, [
    onClose,
    mergedCategories,
    detailsData,
    headCategory,
    isExtra,
    dispatch,
    preAmounts,
    subCategoryAmounts,
    countAmount,
    headCategoryAmounts,
    selectedHeadCategory,
    typeLimitHeadTotal,
    typeNoLimitSubTotal,
    values,
  ]);

  const handleFormate = (value) => {
    return value?.split("_").join(" ");
  };

  const handleCloseAlertModal = useCallback(() => setIsAlert(false), []);

  const description = useMemo(() => {
    return values?.maxAmount < typeLimitHeadTotal + typeNoLimitSubTotal
      ? `Your total amount exceeds the maximum limit of ${values?.maxAmount}. Please adjust the values to stay within the allowed limit.`
      : `Budget Exceeded! The total allocated amount for subcategories (${
          baseCurrency?.symbol + countAmount
        }) exceeds the main category limit (${
          baseCurrency?.symbol +
          headCategoryAmounts[selectedHeadCategory?.headCategory]
        }). Please adjust your budget to proceed.`;
  }, [
    baseCurrency,
    countAmount,
    headCategoryAmounts,
    selectedHeadCategory,
    typeLimitHeadTotal,
    typeNoLimitSubTotal,
    values,
  ]);

  useEffect(() => {
    setPreAmounts((pre) => ({ ...pre, ...subCategoryAmounts }));
  }, [isOpen, subCategoryAmounts]);

  return (
    <>
      <ModelWrapper
        show={isOpen}
        onHide={closeModal}
        className="modal-650px responsive"
        title={`Category`}
        backButton
      >
        <Modal.Body ref={modalBodyRef} className="max-h-80vh">
          <ul className="m-0 p-0 d-flex flex-column gap-3">
            {mergedCategories?.length
              ? mergedCategories?.map((item, index) => {
                  const icon = item?.icon;
                  const title = item?.title;
                  const spendLimitType = item?.spendLimitType;
                  const id = item?._id;

                  return (
                    <li
                      key={index}
                      className="d-flex align-items-center justify-content-between client-section-bg-color p-20px br-10"
                    >
                      <div
                        className="d-flex gap-3 align-items-center cursor-pointer w-100"
                        onClick={() => handleOpenModal(item)}
                      >
                        <img
                          src={
                            import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                            icon
                          }
                          className="w-40px h-40px br-8"
                        />
                        <span>
                          <span className="responsive d-block fs-16 text-capitalize mt-2 fw-medium text-break truncate-line-2">
                            {title}
                          </span>
                          {spendLimitType == budgetLimitTypeEnum.LIMIT && (
                            <span className="fs-14 text-color-primary">
                              <i className="ri-pencil-line fs-14 me-1"></i>
                              Edit
                            </span>
                          )}
                        </span>
                      </div>
                      {!isExtra &&
                      spendLimitType == budgetLimitTypeEnum.LIMIT ? (
                        <span
                          className={` ${
                            spendLimitType
                              ? "fw-medium"
                              : "text-color-light-gray"
                          }`}
                        >
                          <input
                            onInput={(e) => {
                              const value = e.target.value.slice(0, 16); // Limit input to 16 characters
                              e.target.value = value; // Truncate the value in the input
                              handleAmount(index, id, e); // Handle the truncated value
                              // dispatch(
                              //   setSubCategoryAmounts({
                              //     ...subCategoryAmounts,
                              //     [id]: Number(value),
                              //   })
                              // );
                              // setCData((prev) => ({
                              //   ...prev,
                              //   [id]: value,
                              // }));
                            }}
                            className="bg-white border common-border-color px-2 py-1 br-5 fs-14 focus-visible-color-gray"
                            placeholder="0"
                            inputMode="numeric" // For numeric input on mobile devices
                            type="number"
                            value={preAmounts[id] || ""}
                          />
                        </span>
                      ) : (
                        <span
                          // onClick={() => handleSetHeadData(item)}
                          onClick={() => handleOpenModal(item)}
                          className={`bg-white border common-border-color px-2 py-1 cursor-pointer text-nowrap ${
                            spendLimitType
                              ? "fw-medium"
                              : "text-color-light-gray"
                          } br-5 fs-14 text-lowercase`}
                        >
                          {handleFormate(
                            spendLimitType || budgetLimitTypeEnum.NO_LIMIT
                          )}
                        </span>
                      )}
                    </li>
                  );
                })
              : null}
            {!selectedHeadCategory?.categories?.length && (
              <span className="d-block text-center client-section-bg-color text-color-gray p-2 br-10">
                Oops! No Category Yet!
              </span>
            )}
          </ul>
          {selectedHeadCategory?.categories?.length ? (
            <Modal.Footer className="p-0 mt-4">
              <Button className="primary-btn w-100 m-0" onClick={handleSubmit}>
                Save
              </Button>
            </Modal.Footer>
          ) : (
            ""
          )}
        </Modal.Body>
      </ModelWrapper>
      {isModal && (
        <CategoryBudgetLimitTypeModal
          isOpen={isModal}
          onClose={handleCloseModal}
          data={selectedData}
        />
      )}

      <CommonDeleteModal
        isOpen={isAlert}
        onClose={handleCloseAlertModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Over-Budget Limit Reached",
          description: description,
          confirmText: "Okay!",
          cancelText: "Close",
        }}
        onConfirm={handleCloseAlertModal}
        loading={false}
      />
    </>
  );
};

CategoryModal.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
  data: PropTypes.array,
  open: PropTypes.func,
  close: PropTypes.func,
  method: PropTypes.string,
  headCategory: PropTypes.object,
};

export default CategoryModal;
