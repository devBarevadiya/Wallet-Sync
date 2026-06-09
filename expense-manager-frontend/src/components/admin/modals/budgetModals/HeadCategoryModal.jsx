import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ModelWrapper from "../../../ModelWrapper";
import PropTypes from "prop-types";
import { Button, Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import {
  addNewHeadCatgoryThunk,
  budgetDetailsThunk,
  createBugetThunk,
  getBudgetThunk,
  getCategoryThunk,
} from "../../../../store/actions";
import { useDispatch } from "react-redux";
import BudgetLimitType from "./BudgetLimitType";
import CategoryModal from "./CategoryModal";
import {
  clearCategoryData,
  setAmountToHeadCategory,
  setHeadCategoryAmounts,
  setSelectHeadCategory,
} from "../../../../store/budget/slice";
import { debounce } from "lodash";
import { budgetLimitTypeEnum, eventEnum } from "../../../../helpers/enum";
import { toastError } from "../../../../config/toastConfig";
import { capitalizeFirstLetter } from "../../../../helpers/commonFunctions";
import CommonDeleteModal from "../deleteModals/CommonDeleteModal";
import { handleFirebaseEvent } from "../../../../firebase/config";
import { useModalScroll } from "../../../../helpers/customHooks";

const HeadCategoryModal = ({
  isOpen,
  onClose,
  open,
  close,
  method = "",
  onSuccess,
}) => {
  const { data, loading } = useSelector((state) => state.Category) || "";
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });
  const {
    categoryData,
    values,
    detailsData,
    actionLoading,
    loading: budgetLoading,
    headCategoryAmounts,
    subCategoryAmounts,
  } = useSelector((store) => store.Budget);

  // const [headData, setHeadData] = useState({});
  const [isModal, setIsModal] = useState(false);
  const [isTypeModal, setIsTypeModal] = useState(false);
  const [errorArr, setErrorArr] = useState([]);
  const [isAlert, setIsAlert] = useState(false);
  const inputRefs = useRef([]);

  const isExtra = useMemo(() => method == "addExtra", [method]);
  const setId = new Set(
    detailsData?.headCategories?.map((item) => item?.headCategory?._id)
  );

  const notInArray = data?.filter((item) => !setId.has(item?._id));

  const dispatch = useDispatch();

  const closeModal = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleOpenModal = useCallback(() => {
    setIsModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    open();
    setIsModal(false);
  }, [open]);

  const handleDirectClose = useCallback(() => {
    setIsModal(false);
  }, []);

  const handleOpenTypeModal = useCallback(
    ({ e, value }) => {
      e && e.stopPropagation();
      value && dispatch(setSelectHeadCategory(value));
      close();
      setIsTypeModal(true);
    },
    [close, dispatch]
  );

  const handleCloseTypeModal = useCallback(() => {
    dispatch(setSelectHeadCategory({}));
    open();
    setIsTypeModal(false);
  }, [open, dispatch]);

  const openAlert = useCallback(() => setIsAlert(true), []);
  const closeAlert = useCallback(() => {
    setIsAlert(false), setErrorArr([]);
  }, []);

  const handleSetHeadData = useCallback(
    (value) => {
      // setHeadData((prev) => ({
      //   ...prev,
      //   [value._id]: value.maxAmount,
      // }));
      dispatch(
        setHeadCategoryAmounts({
          ...headCategoryAmounts,
          [value._id]: value.maxAmount,
        })
      );
      dispatch(setSelectHeadCategory(value));
      if (!isExtra && value?.spendLimitType !== "") {
        handleOpenModal();
      } else {
        handleOpenTypeModal({ value });
      }
      close();
    },
    [
      close,
      isExtra,
      handleOpenTypeModal,
      handleOpenModal,
      dispatch,
      headCategoryAmounts,
    ]
  );

  // const removeHeadData = useCallback(() => {
  //   setHeadData({});
  //   open();
  // }, [open]);

  const mergedCategories = useMemo(() => {
    return (isExtra ? notInArray : data)?.map((item) => {
      const match = categoryData.find(
        (value) => value?.headCategory == item?._id
      );

      return {
        ...item,
        headCategory: item?._id,
        spendLimitType: match?.spendLimitType || "",
        // maxAmount: match?.maxAmount || 0,
        maxAmount: headCategoryAmounts[item?._id] || 0,
        categories: item?.categories?.map((ele) => {
          const matchCategory = match?.categories.find(
            (value) => value?.category == ele?._id
          );

          return {
            ...ele,
            category: ele?._id,
            maxAmount: subCategoryAmounts?.[ele?._id] || "",
            // maxAmount: matchCategory?.maxAmount || "",
            spendLimitType:
              matchCategory?.spendLimitType || budgetLimitTypeEnum.NO_LIMIT,
          };
        }),
      };
    });
  }, [
    data,
    categoryData,
    isExtra,
    notInArray,
    headCategoryAmounts,
    subCategoryAmounts,
  ]);

  const handleSubmit = async (e) => {
    let errors = [];
    let noLimitCalc = 0;
    e.preventDefault();
    const datas = mergedCategories?.map((item) => {
      const headAmount = headCategoryAmounts[item?._id] || item?.maxAmount || 0;
      const totalCategoryAmount = item?.categories?.reduce(
        (acc, curr) => Number(curr?.maxAmount) + acc,
        0
      );
      if (
        totalCategoryAmount > headAmount &&
        item?.spendLimitType == budgetLimitTypeEnum.LIMIT
      ) {
        errors.push({ item, totalCategoryAmount });
      }
      return {
        headCategory: item?.headCategory,
        spendLimitType: item?.spendLimitType || budgetLimitTypeEnum.NO_LIMIT,
        maxAmount:
          item?.spendLimitType == budgetLimitTypeEnum.LIMIT
            ? headAmount || 0
            : 0,
        categories: item?.categories?.map((ele) => {
          if (item?.spendLimitType !== budgetLimitTypeEnum.LIMIT) {
            noLimitCalc += Number(ele?.maxAmount);
          }
          return {
            category: ele?.category,
            spendLimitType: ele?.spendLimitType || budgetLimitTypeEnum.NO_LIMIT,
            maxAmount:
              ele?.spendLimitType == budgetLimitTypeEnum.LIMIT
                ? ele?.maxAmount || 0
                : 0,
          };
        }),
      };
    });

    const totalAmount = datas?.reduce((acc, curr) => {
      return acc + Number(curr.maxAmount); // Only add the maxAmount for the head category
    }, 0);

    if (errors?.length > 0) {
      const { item, totalCategoryAmount } = errors[0];

      setErrorArr((pre) => [
        ...pre,
        `Subcategory total ${totalCategoryAmount} is too high for '${capitalizeFirstLetter(
          item.title
        )}'`,
      ]);

      openAlert();

      // toastError(
      //   `Subcategory total ${totalCategoryAmount} is too high for '${capitalizeFirstLetter(
      //     item.title
      //   )}'`
      // );
      // toastError(
      //   `${item.title}'s max amount exceeded. Please adjust the sub category within total ${item.maxAmount}.`
      // );
      return;
    }

    if (totalAmount + noLimitCalc > values?.maxAmount) {
      setErrorArr((pre) => [
        ...pre,
        `Your total amount exceeds the maximum limit of ${values?.maxAmount}. Please adjust the values to stay within the allowed limit.`,
      ]);

      openAlert();

      // toastError(
      //   `Your total amount exceeds the maximum limit of ${values?.maxAmount}. Please adjust the values to stay within the allowed limit.`
      // );
      return;
    }

    if (noLimitCalc > 0 && totalAmount + noLimitCalc > values?.maxAmount) {
      setErrorArr((pre) => [
        ...pre,
        "The head category is set to 'No Limit', but the total of subcategory limits exceeds",
      ]);

      openAlert();

      // toastError(
      //   "The head category is set to 'No Limit', but the total of subcategory limits exceeds"
      // );
      return;
    }

    if (isExtra) {
      const response = await dispatch(
        addNewHeadCatgoryThunk({
          id: detailsData?._id,
          value: datas?.map(({ categories, ...rest }) => rest),
        })
      );
      if (addNewHeadCatgoryThunk.fulfilled.match(response)) {
        await dispatch(budgetDetailsThunk(detailsData?._id));
        dispatch(setSelectHeadCategory({}));
        dispatch(clearCategoryData());
        onSuccess && onSuccess();
        close();
      }
    } else {
      const response = await dispatch(
        createBugetThunk({ ...values, headCategories: datas })
      );
      if (createBugetThunk.fulfilled.match(response)) {
        handleFirebaseEvent(eventEnum.BUDGET_CREATED);
        await dispatch(getBudgetThunk());
        dispatch(setSelectHeadCategory({}));
        dispatch(clearCategoryData());
        onSuccess && onSuccess();
        close();
      }
    }
  };

  const handleAmount = useCallback(
    debounce((index, id, e) => {
      e.stopPropagation();
      const input = inputRefs.current[index];
      const value = e.target.value;
      if (input) {
        // input.style.width = `${Math.min(input.scrollWidth, 300)}px`;
        // input.style.width = `${Math.max(100)}px`;
      }
      dispatch(
        setAmountToHeadCategory({
          headCategoryId: id,
          maxAmount: Number(value),
        })
      );
    }, 500),
    [dispatch]
  );

  const handleFormate = (value) => {
    return value.split("_").join(" ");
  };

  useEffect(() => {
    if (isOpen && !data?.length > 0) {
      dispatch(getCategoryThunk());
    }
  }, [isOpen]);

  return (
    <>
      <ModelWrapper
        show={isOpen}
        onHide={closeModal}
        className="modal-650px responsive"
        title={`Category`}
        backButton
      >
        <Modal.Body ref={modalBodyRef}>
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
                      className="d-flex align-items-center cursor-pointer justify-content-between client-section-bg-color p-20px br-10"
                    >
                      <div
                        className="d-flex gap-3 align-items-center w-100"
                        onClick={
                          spendLimitType == budgetLimitTypeEnum.NONE
                            ? (e) => handleOpenTypeModal({ e, value: item })
                            : () => handleSetHeadData(item)
                        }
                      >
                        <img
                          onClick={
                            spendLimitType == budgetLimitTypeEnum.NONE
                              ? (e) => handleOpenTypeModal({ e, value: item })
                              : () => handleSetHeadData(item)
                          }
                          src={
                            import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                            icon
                          }
                          className="w-40px h-40px br-8"
                        />
                        <span>
                          <span
                            onClick={
                              spendLimitType == budgetLimitTypeEnum.NONE
                                ? (e) => handleOpenTypeModal({ e, value: item })
                                : () => handleSetHeadData(item)
                            }
                            className="responsive d-block fs-16 text-capitalize mt-2 fw-medium text-break truncate-line-2"
                          >
                            {title}
                          </span>
                          {spendLimitType == budgetLimitTypeEnum.LIMIT && (
                            <span
                              onClick={(e) =>
                                handleOpenTypeModal({ e, value: item })
                              }
                              className="fs-15 text-color-primary"
                            >
                              <i className="ri-pencil-line fs-15 me-1"></i>
                              Edit
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="d-flex align-items-center">
                        {!isExtra &&
                        spendLimitType == budgetLimitTypeEnum.LIMIT ? (
                          <span>
                            <span
                              className={` ${
                                spendLimitType
                                  ? "fw-medium"
                                  : "text-color-light-gray"
                              } `}
                            >
                              <input
                                min={0}
                                placeholder="0"
                                className="bg-white border common-border-color px-2 br-5 fs-14 py-1 focus-visible-color-gray"
                                // ref={(el) => (inputRefs.current[index] = el)}
                                onInput={(e) => {
                                  const value = e.target.value.slice(0, 12); // Limit input to 16 characters
                                  e.target.value = value; // Truncate the value in the input
                                  handleAmount(index, id, e); // Handle the truncated value
                                  // setHeadData((prev) => ({
                                  //   ...prev,
                                  //   [id]: value,
                                  // }));
                                  dispatch(
                                    setHeadCategoryAmounts({
                                      ...headCategoryAmounts,
                                      [id]: Number(value),
                                    })
                                  );
                                }}
                                value={headCategoryAmounts[id] || ""} // Use the updated state value
                                inputMode="numeric" // For numeric input on mobile devices
                                type="number"
                              />
                            </span>
                          </span>
                        ) : (
                          <span
                            onClick={(e) =>
                              handleOpenTypeModal({ e, value: item })
                            }
                            // onClick={() => handleSetHeadData(item)}
                            className={`bg-white border common-border-color px-2 py-1 ${
                              spendLimitType
                                ? "fw-medium"
                                : "text-color-light-gray"
                            } br-5 fs-14 text-lowercase text-nowrap`}
                          >
                            {handleFormate(spendLimitType) || "Select"}
                          </span>
                        )}
                        <i
                          onClick={
                            spendLimitType == budgetLimitTypeEnum.NONE
                              ? (e) => handleOpenTypeModal({ e, value: item })
                              : () => handleSetHeadData(item)
                          }
                          className="ri-arrow-right-s-line fs-24 text-color-light-gray"
                        ></i>
                      </div>
                    </li>
                  );
                })
              : null}
            {!(isExtra ? notInArray : data)?.length && (
              <span className="d-block text-center client-section-bg-color text-color-gray p-2 br-10">
                {loading ? "Fetching..." : "Oops! No Category Yet!"}
              </span>
            )}
          </ul>
          {(isExtra ? notInArray : data)?.length ? (
            <Modal.Footer className="p-0 mt-4">
              <Button
                disabled={
                  actionLoading ||
                  budgetLoading ||
                  !(isExtra ? notInArray : data)?.length
                }
                onClick={handleSubmit}
                type="submit"
                className="primary-btn w-100 m-0"
              >
                {actionLoading || budgetLoading ? "Loading..." : "Continue"}
              </Button>
            </Modal.Footer>
          ) : (
            ""
          )}
        </Modal.Body>
      </ModelWrapper>

      {isTypeModal && (
        <BudgetLimitType
          isOpen={isTypeModal}
          onClose={handleCloseTypeModal}
          value={headCategoryAmounts}
          key={"2"}
        />
      )}

      <CategoryModal
        isOpen={isModal}
        onClose={handleCloseModal}
        data={headCategoryAmounts?.categories}
        open={handleOpenModal}
        close={handleDirectClose}
      />

      <CommonDeleteModal
        isOpen={isAlert && errorArr?.length > 0}
        onClose={closeAlert}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Over-Budget Limit Reached",
          description: errorArr[0],
          confirmText: "Okay!",
          cancelText: "Close",
        }}
        onConfirm={closeAlert}
        loading={loading}
      />
    </>
  );
};

HeadCategoryModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  open: PropTypes.func,
  close: PropTypes.func,
  method: PropTypes.string,
  onSuccess: PropTypes.func,
};

export default memo(HeadCategoryModal);
