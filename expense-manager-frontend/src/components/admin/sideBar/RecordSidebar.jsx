import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTransactionThunk,
  transactionFilterOptionsThunk,
} from "../../../store/actions";
import SelectField from "../../inputFields/SelectField";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Offcanvas } from "react-bootstrap";
import { setSearchValueState } from "../../../store/transaction/slice";
import { debounce } from "lodash";
import { capitalizeFirstLetter } from "../../../helpers/commonFunctions";

const RecordSidebar = ({ isCanvas, onCanvasHide }) => {
  const location = useLocation(); // Track URL changes
  const navigate = useNavigate();
  const [openId, setOpenId] = useState([]);
  const [filterOptionData, setFilterOptionData] = useState({});
  const { filterOptions, searchValue: searchState } = useSelector(
    (store) => store.Transaction
  );
  const { data: labelData } = useSelector((store) => store.Label);
  const [searchValue, setSearchValue] = useState(searchState || "");
  const data = Object.keys(filterOptions);
  // data.unshift("range");
  const queryParams = new URLSearchParams(location.search);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(transactionFilterOptionsThunk());
    // dispatch(getTransactionThunk({}));
  }, [labelData, dispatch]);

  const getAllValueByKey = (key) => {
    return queryParams.getAll(key);
  };

  const urlHandler = (value) => {
    const queryArray = [];
    for (let [key, val] of Object.entries(value)) {
      val.forEach((val) => {
        queryArray.push(`${key}=${val}`);
      });
    }
    const queryString = queryArray.join("&");
    const separator = queryString ? "?" : "";
    const fullUrl = location.pathname + separator + queryString;
    navigate(fullUrl);
  };

  const handleFilter = ({ key, value, isMultiple = true }) => {
    const getQueryParams = () => {
      const queryParams = new URLSearchParams(window.location.search);
      const findByKey = (key) => {
        return queryParams.getAll(key);
      };
      const filterData = {};
      for (const [key, value] of queryParams.entries()) {
        if (!filterData?.[key]) {
          filterData[key] = [];
        }
        if (findByKey(key)?.length <= 1) {
          filterData[key].push(value);
        } else {
          filterData[key].push(value);
        }
      }
      return filterData;
    };

    setFilterOptionData((pre) => {
      const updateFilterData = { ...pre, ...getQueryParams() };
      if (value && !updateFilterData?.[key]) {
        updateFilterData[key] = [];
      }
      const handlePush = (value) => {
        if (Array.isArray(value)) {
          if (
            getAllValueByKey(key)?.filter((item) => value?.includes(item))
              ?.length > 0
          ) {
            updateFilterData[key] = getAllValueByKey(key)?.filter(
              (item) => !value?.includes(item)
            );
          } else {
            updateFilterData[key] = [...updateFilterData[key], ...value];
          }
        } else {
          updateFilterData[key].push(value);
        }
      };
      if (!isMultiple) {
        if (value && !updateFilterData[key]?.includes(value)) {
          updateFilterData[key][0] = value;
        } else {
          delete updateFilterData[key];
        }
      } else {
        if (!updateFilterData[key]?.includes(value)) {
          if (updateFilterData[key]?.length == 0) {
            // updateFilterData[key].push(value);
            handlePush(value);
          } else {
            // updateFilterData[key].push(value);
            handlePush(value);
          }
        } else {
          const removerData = updateFilterData[key]?.filter(
            (item) => item !== value
          );
          if (removerData?.length) {
            updateFilterData[key] = removerData;
          } else {
            delete updateFilterData[key];
          }
        }
      }
      urlHandler(updateFilterData);
      return updateFilterData;
    });
  };

  const isActive = (key = "", value = "") => {
    const url = location.search;
    const urlParams = new URLSearchParams(url);
    const recordStatuses = urlParams.getAll(key);
    return recordStatuses.includes(value) ? true : false;
  };

  const formateTitle = (value) => {
    const split = value.split("_");
    return split.join(" ");
  };

  const SingleFilterCollapse = ({
    children,
    index,
    title,
    dropDownTitle,
    dropDownTitleClass = "fs-16 px-3 fw-medium",
    childrenClass = "mb-3 mt-2",
    onClick,
    active,
    icon,
  }) => {
    const openHandler = (id) => {
      if (openId.includes(id)) {
        const filter = openId?.filter((item) => item !== id);
        setOpenId(filter);
        return;
      }
      setOpenId((pre) => [...pre, index]);
    };

    return (
      <div className="responsive">
        <span
          className={`${dropDownTitleClass} d-flex align-items-center justify-content-between cursor-pointer user-select-none`}
        >
          <span
            onClick={() => {
              onClick && onClick(), openHandler(index);
            }}
            className="max-w-200px text-truncate text-capitalize"
          >
            {icon && (
              <span>
                <i
                  className={`${icon} me-2 ${
                    active ? "text-color-primary" : ""
                  }`}
                ></i>
              </span>
            )}
            {title}
          </span>
          <span
            className="text-color-light-gray fs-12"
            onClick={() => openHandler(index)}
          >
            {dropDownTitle}{" "}
            <i
              className={
                openId?.includes(index)
                  ? "ri-arrow-down-s-line"
                  : "ri-arrow-right-s-line"
              }
            ></i>
          </span>
        </span>
        <span className={`fs-14 d-block ${childrenClass}`}>
          {openId?.includes(index) && children}
        </span>
      </div>
    );
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
  };

  const clearSearch = () => {
    setSearchValue("");
    dispatch(setSearchValueState(""));
  };

  const Theme = () => {
    return data?.map((item, index) => {
      return (
        <div key={index}>
          {/* range */}
          {/* {item == "range" && (
            <div key={index}>
              <ReactSlider
                className="horizontal-slider"
                thumbClassName="example-thumb"
                trackClassName="example-track"
                defaultValue={[20, 80]}
                value={rangeValues}
                onChange={handleRangeChange}
                min={0}
                max={100}
                ariaLabel={["Lower thumb", "Upper thumb"]}
                ariaValuetext={(state) => `Thumb value ${state.valueNow}`}
                renderThumb={(props, state) => (
                  <div {...props}>{state.valueNow}</div>
                )}
              />
            </div>
          )} */}
          {/* account titles */}
          {item == "accountTitles" && (
            <div>
              <SingleFilterCollapse
                index={index}
                title="Accounts"
                dropDownTitle="All Accounts"
                item={filterOptions["accountTitles"]}
              >
                <ul className="p-0 m-0 transition-bg">
                  {filterOptions["accountTitles"]?.length > 0 ? (
                    filterOptions["accountTitles"]?.map((item, index1) => {
                      const active = isActive("accounts", item?._id);
                      return (
                        <li
                          onClick={() =>
                            handleFilter({ key: "accounts", value: item?._id })
                          }
                          className="hover-primary-bg py-1 px-4 cursor-pointer text-capitalize max-w-300px text-truncate"
                          key={index + index1}
                        >
                          <i
                            className={`${
                              active ? "text-color-primary" : ""
                            } ri-eye-line me-2`}
                          ></i>
                          {item?.title}
                        </li>
                      );
                    })
                  ) : (
                    <li className="px-3 d-block">
                      <span className="w-100 d-block py-1 px-2 br-5 admin-primary-bg text-center">
                        Oops! No Accounts Yet!
                      </span>
                    </li>
                  )}
                </ul>
              </SingleFilterCollapse>
            </div>
          )}
          {/* head categories and categories */}
          {item == "headCategories" && (
            <div>
              <SingleFilterCollapse
                index={index}
                title="Categories"
                dropDownTitle="All Categories"
              >
                <ul className="p-0 m-0 transition-bg ">
                  {filterOptions["headCategories"]?.length > 0 ? (
                    filterOptions["headCategories"]?.map((item, index1) => {
                      const allCategories = item?.categories?.map(
                        (item) => item?._id
                      );
                      return (
                        <li className="py-1 cursor-pointer" key={index1}>
                          <SingleFilterCollapse
                            index={index + "." + index1}
                            title={item?.title}
                            dropDownTitle="All"
                            dropDownTitleClass="px-4 "
                            childrenClass=""
                            active={
                              item?.categories?.length &&
                              item?.categories?.length ==
                                getAllValueByKey("categories")?.filter((val) =>
                                  item?.categories?.some(
                                    (value) => value?._id == val
                                  )
                                )?.length
                            }
                            icon="ri-eye-line"
                            onClick={() => {
                              handleFilter({
                                key: "categories",
                                value: allCategories,
                              });
                            }}
                          >
                            <ul className="p-0 m-0 transition-bg mt-2 mb-3">
                              {item?.categories?.length > 0 ? (
                                item?.categories?.map((item2, index2) => {
                                  const active = isActive(
                                    "categories",
                                    item2?._id
                                  );
                                  return (
                                    <li
                                      onClick={() =>
                                        handleFilter({
                                          key: "categories",
                                          value: item2?._id,
                                        })
                                      }
                                      className="max-w-300px  hover-primary-bg py-1 px-4 cursor-pointer"
                                      key={index2}
                                    >
                                      <span className="d-block ms-2 text-truncate text-capitalize">
                                        <i
                                          className={`ri-eye-line me-2 ${
                                            active ? "text-color-primary" : ""
                                          }`}
                                        ></i>
                                        {item2?.title}
                                      </span>
                                    </li>
                                  );
                                })
                              ) : (
                                <li className="px-4 d-block">
                                  <span className="w-100 d-block py-1 px-2 br-5 admin-primary-bg text-center">
                                    Oops! No category Yet!
                                  </span>
                                </li>
                              )}
                            </ul>
                          </SingleFilterCollapse>
                        </li>
                      );
                    })
                  ) : (
                    <li className="px-3 d-block">
                      <span className="w-100 d-block py-1 px-2 br-5 admin-primary-bg text-center">
                        Oops! No Head Category Yet!
                      </span>
                    </li>
                  )}
                </ul>
              </SingleFilterCollapse>
            </div>
          )}
          {/* labels */}
          {item == "labels" && (
            <div className="max-w-300px">
              <SelectField
                className="px-3 mb-3"
                label="labels"
                formClass="fs-14"
                value={queryParams.get("labels") || ""}
                onChange={(e) =>
                  handleFilter({
                    key: "labels",
                    value: e.target.value,
                    isMultiple: false,
                  })
                }
              >
                <option value="">select label</option>
                {filterOptions["labels"]?.map((item, index) => {
                  return (
                    <option value={item?._id} key={index}>
                      {item?.title}
                    </option>
                  );
                })}
              </SelectField>
            </div>
          )}
          {/* currencies */}
          {item == "currencies" && (
            <div>
              <SingleFilterCollapse
                index={index}
                title="Currencies"
                dropDownTitle="All Currencies"
                item={filterOptions["currencies"]}
              >
                <ul className="p-0 m-0 transition-bg">
                  {filterOptions["currencies"]?.length > 0 ? (
                    filterOptions["currencies"]?.map((item, index1) => {
                      const active = isActive("currencies", item?._id);
                      return (
                        <li
                          onClick={() =>
                            handleFilter({
                              key: "currencies",
                              value: item?._id,
                            })
                          }
                          className="hover-primary-bg py-1 px-4 cursor-pointer max-w-300px text-truncate"
                          key={index + index1}
                        >
                          <i
                            className={`${
                              active ? "text-color-primary" : ""
                            } ri-eye-line me-2`}
                          ></i>
                          {item?.code}
                        </li>
                      );
                    })
                  ) : (
                    <li className="px-4 d-block">
                      <span className="w-100 d-block py-1 px-2 br-5 admin-primary-bg text-center">
                        Oops! No Currencies Yet!
                      </span>
                    </li>
                  )}
                </ul>
              </SingleFilterCollapse>
            </div>
          )}
          {/* accountTypes */}
          {/* {item == "accountTypes" && (
            <div key={index}>
              <SingleFilterCollapse
                index={index}
                title="Account Types"
                dropDownTitle="All Types"
                item={filterOptions["accountTypes"]}
              >
                <ul className="p-0 m-0 transition-bg">
                  {filterOptions["accountTypes"]?.map((item, index1) => {
                    return (
                      <li
                        onClick={() => handleFilter("accounts", item._id)}
                        className="hover-primary-bg py-1 px-4 cursor-pointer text-lowercase"
                        key={index + index1}
                      >
                        {item.title}
                      </li>
                    );
                  })}
                </ul>
              </SingleFilterCollapse>
            </div>
          )} */}
          {/* recordTypes */}
          {item == "recordTypes" && (
            <div>
              <SingleFilterCollapse
                index={index}
                title="Record Types"
                dropDownTitle="All Types"
                item={filterOptions["recordTypes"]}
              >
                <ul className="p-0 m-0 transition-bg">
                  {filterOptions["recordTypes"]?.map((item, index1) => {
                    const active = isActive("recordTypes", item);
                    return (
                      <li
                        onClick={() =>
                          handleFilter({
                            key: "recordTypes",
                            value: item,
                          })
                        }
                        className="hover-primary-bg py-1 px-4 cursor-pointer max-w-300px text-truncate"
                        key={index + index1}
                      >
                        <i
                          className={`${
                            active ? "text-color-primary" : ""
                          } ri-eye-line me-2`}
                        ></i>
                        {capitalizeFirstLetter(item)}
                      </li>
                    );
                  })}
                </ul>
              </SingleFilterCollapse>
            </div>
          )}
          {/* paymentTypes */}
          {item == "paymentTypes" && (
            <div>
              <SingleFilterCollapse
                index={index}
                title="Payment Types"
                dropDownTitle="All Types"
                item={filterOptions["paymentTypes"]}
              >
                <ul className="p-0 m-0 transition-bg">
                  {filterOptions["paymentTypes"]?.map((item, index1) => {
                    const active = isActive("paymentTypes", item);
                    return (
                      <li
                        onClick={() =>
                          handleFilter({
                            key: "paymentTypes",
                            value: item,
                          })
                        }
                        className="hover-primary-bg py-1 px-4 cursor-pointer max-w-300px text-truncate"
                        key={index + index1}
                      >
                        <i
                          className={`${
                            active ? "text-color-primary" : ""
                          } ri-eye-line me-2`}
                        ></i>
                        {capitalizeFirstLetter(formateTitle(item))}
                      </li>
                    );
                  })}
                </ul>
              </SingleFilterCollapse>
            </div>
          )}
          {/* recordStatusTypes */}
          {item == "recordStatusTypes" && (
            <div>
              <SingleFilterCollapse
                index={index}
                title="Record Status"
                dropDownTitle="All Types"
                item={filterOptions["recordStatusTypes"]}
              >
                <ul className="p-0 m-0 transition-bg">
                  {filterOptions["recordStatusTypes"]?.map((item, index1) => {
                    const active = isActive("recordStatuses", item);
                    return (
                      <li
                        onClick={() =>
                          handleFilter({
                            key: "recordStatuses",
                            value: item,
                          })
                        }
                        className="hover-primary-bg py-1 px-4 cursor-pointer max-w-300px text-truncate"
                        key={index + index1}
                      >
                        <i
                          className={`${
                            active ? "text-color-primary" : ""
                          } ri-eye-line me-2`}
                        ></i>
                        {capitalizeFirstLetter(item)}
                      </li>
                    );
                  })}
                </ul>
              </SingleFilterCollapse>
            </div>
          )}
          {item == "payee" && (
            <div>
              <SingleFilterCollapse
                index={index}
                title="Payee"
                dropDownTitle="All Payee"
                item={filterOptions["payee"]}
              >
                <ul className="p-0 m-0 transition-bg">
                  {filterOptions["payee"]?.length > 0 ? (
                    filterOptions["payee"]?.map((item, index1) => {
                      const active = isActive("payee", item?._id);
                      return (
                        <li
                          onClick={() =>
                            handleFilter({
                              key: "payee",
                              value: item?._id,
                            })
                          }
                          className="hover-primary-bg py-1 px-4 cursor-pointer text-capitalize max-w-300px text-truncate"
                          key={index + index1}
                        >
                          <i
                            className={`${
                              active ? "text-color-primary" : ""
                            } ri-eye-line me-2`}
                          ></i>
                          {item?.name}
                        </li>
                      );
                    })
                  ) : (
                    <li className="px-4 d-block">
                      <span className="w-100 d-block py-1 px-2 br-5 admin-primary-bg text-center">
                        Oops! No Payee Yet!
                      </span>
                    </li>
                  )}
                </ul>
              </SingleFilterCollapse>
            </div>
          )}
        </div>
      );
    });
  };

  const debouchedSearch = useCallback(
    debounce((value) => {
      dispatch(setSearchValueState(value));
    }, 500),
    []
  );

  useEffect(() => {
    debouchedSearch(searchValue);
  }, [searchValue, debouchedSearch]);

  useEffect(() => {
    return () => {
      debouchedSearch.cancel();
    };
  }, [debouchedSearch]);

  useEffect(() => {
    setSearchValue(searchState);
  }, [searchState]);

  return (
    <>
      <div className="record-sidebar invisible-scrollbar py-3 d-none d-lg-block border common-border-color rounded-4">
        <h4 className="fs-18 px-3 mb-3">Filter</h4>
        {/* <span onClick={() => setCanvas(true)}>click</span> */}
        <div className="px-3">
          <Form.Group className={`position-relative mb-3`}>
            <i className="position-absolute ps-12px start-0 top-50 translate-middle-y ri-search-line fs-18 text-color-gray"></i>
            {searchValue && (
              <i
                onClick={clearSearch}
                className="position-absolute pe-12px end-0 top-50 translate-middle-y ri-close-fill fs-18 text-color-gray cursor-pointer"
              ></i>
            )}
            <Form.Control
              value={searchValue}
              placeholder="search..."
              name="search"
              id="search"
              onChange={(e) => setSearchValue(e.target.value)}
              // onKeyDown={(e) => {
              //   if (e.key == "Enter") {
              //     e.preventDefault();
              //     dispatch(setSearchValueState(e.target.value));
              //   }
              // }}
              className={`common-border-color text-color-dusty-gray pe-3 ps-40px fs-16 responsive pe-5`}
            />
          </Form.Group>
        </div>
        <Theme />
      </div>
      <Offcanvas
        className={`max-w-300px`}
        show={isCanvas}
        onHide={onCanvasHide}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filter</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-2">
          <Form.Group className={`position-relative mb-3 mx-3`}>
            <i className="position-absolute ps-12px start-0 top-50 translate-middle-y ri-search-line fs-18 text-color-gray"></i>
            {searchValue && (
              <i
                onClick={clearSearch}
                className="position-absolute pe-12px end-0 top-50 translate-middle-y ri-close-fill fs-18 text-color-gray cursor-pointer"
              ></i>
            )}
            <Form.Control
              value={searchValue}
              placeholder="search..."
              name="search"
              id="search"
              onChange={(e) => setSearchValue(e.target.value)}
              // onKeyDown={(e) => {
              //   if (e.key == "Enter") {
              //     e.preventDefault();
              //     dispatch(setSearchValueState(e.target.value));
              //   }
              // }}
              className={`common-border-color text-color-dusty-gray pe-3 ps-40px fs-16 responsive pe-5`}
            />
          </Form.Group>
          <Theme />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default memo(RecordSidebar);
