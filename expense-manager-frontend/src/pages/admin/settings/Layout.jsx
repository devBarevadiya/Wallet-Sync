import PropTypes from "prop-types";
import PageTitle from "../../../components/admin/pageTitle/PageTitle";
import { SettingSideBarMenus } from "../../../data/admin/setting";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Collapse, Form, Offcanvas } from "react-bootstrap";
import { useEffect, useState } from "react";
import { setCategoriesOfHeadCategory } from "../../../store/category/slice";
import { useDispatch } from "react-redux";
import HeadCategory from "./modals/HeadCategory";
import {
  setDocumentTitle,
  setIsSettingsSidbarCanvas,
} from "../../../store/filters/slice";
import { useSelector } from "react-redux";
import { authRoleEnum, subscriptionTypeEnum } from "../../../helpers/enum";
import PremiumModal from "../../../components/admin/modals/PremiumModal";
import {
  countCustomCategory,
  isPremium,
} from "../../../helpers/commonFunctions";

const SettingLayout = ({
  children,
  onSearch,
  onClick,
  buttonContent = "add account",
  pageTitleData = {},
  layoutHeight = "settings-layout",
  className = "pt-3",
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.Auth);
  const { totalCounts, accessLimit } = useSelector((store) => store.Category);
  const [editHeadCategory, setEditHeadCategory] = useState({});
  const { documentTitle, isSettingsSidbarCanvas } = useSelector(
    (store) => store.Filters
  );
  const settingSideBarNavItems = SettingSideBarMenus();
  const location = useLocation();
  const pageTitle = location.pathname.split("/");
  const pageTitleValue =
    pageTitle[
      pageTitle.length === 4 ? pageTitle.length - 1 : pageTitle.length - 2
    ];
  const [searchValue, setSearchValue] = useState("");
  const [canvas, setCanvas] = useState(false);
  const [isParentId, setIsParentId] = useState(pageTitleValue);
  const [modal, setModal] = useState(false);
  const [premiumModal, setPremiumModal] = useState(false);

  const handleActiveNavItem = (path, id) => {
    if (location.pathname === path || isParentId === id) {
      return true;
    } else {
      return false;
    }
  };

  const toggleNavItem = (id) => {
    if (isParentId === id) {
      setIsParentId("");
    } else {
      setIsParentId(id);
    }
  };

  useEffect(() => {
    settingSideBarNavItems.forEach((ele) => {
      const navList = ele.navList;
      for (let item of navList) {
        if (item.subItems && item.subItems.length > 0) {
          for (let subItem of item.subItems) {
            if (subItem.path === location.pathname) {
              setIsParentId(subItem.parentId);
            }
          }
        }
      }
    });
  }, [location.pathname]);

  return (
    <div className={`pt-4`}>
      <PageTitle
        setCanvas={setCanvas}
        filterButton={false}
        filterIcon="ri-settings-line"
        title="Settings"
        subTitle="Optimize your settings for efficiency"
        {...pageTitleData}
      />
      <div className={`${layoutHeight} d-flex gap-20px ${className}`}>
        <div
          className={`d-none d-lg-block rounded-4 border common-border-color settings-navbar bg-white min-w-300px w-300px overflow-auto overflow-scroll-design p-3 pb-0`}
        >
          <ul className={`p-0 m-0`}>
            {settingSideBarNavItems.map((ele) => {
              const id = ele.id;
              const title = ele.title;
              return (
                <li key={id} className={`nav-list`}>
                  <span
                    className={`text-capitalize fs-21 text-dark fw-medium lh-base mb-2 d-block title`}
                  >
                    {title}
                  </span>
                  <ul className={`p-0 m-0`}>
                    {ele.navList.map((items) => {
                      const id = items.id;
                      const path = items.path;
                      const icon = items.icon;
                      const label = items.label;
                      const subItems = items.subItems;
                      const isActive = handleActiveNavItem(path, id);
                      const isPathMatch = location.pathname === path;
                      const shouldDisplayRoute = items.admin
                        ? user?.role === authRoleEnum.ADMIN
                          ? true
                          : false
                        : true;
                      return !shouldDisplayRoute ? null : (
                        <li key={id} className={`pb-0`}>
                          <div
                            className={`cursor-pointer mb-2 transition ${
                              isActive || isPathMatch
                                ? "bg-color-primary text-white"
                                : "bg-white text-dark"
                            } py-6px ps-3 pe-2 br-8 px-0 text-capitalize  overflow-hidden d-flex align-items-center hover-bg-color-primary hover-text-color-white`}
                          >
                            <div
                              className={`w-100 p-0 bg-transparent border-0 d-flex align-items-center`}
                              onClick={() => {
                                {
                                  !subItems && dispatch(setDocumentTitle(""));
                                }
                                navigate(path);
                                toggleNavItem(id);
                              }}
                            >
                              <i className={`fs-21 fw-light ${icon}`}></i>
                              <span
                                className={`text-truncate fs-15 fw-normal ms-2`}
                              >
                                {label}
                              </span>
                            </div>
                            {subItems && (
                              <div
                                className={`ms-auto d-flex align-items-center gap-1`}
                              >
                                <i
                                  onClick={() => {
                                    navigate(path);
                                    toggleNavItem(id);
                                  }}
                                  className={`transition-hover-transform ${
                                    isParentId === id ? "rotate--180deg" : ""
                                  } fs-21 fw-light ri-arrow-down-s-line`}
                                ></i>
                                <i
                                  onClick={() => {
                                    if (
                                      isPremium() ||
                                      countCustomCategory() < accessLimit
                                    ) {
                                      setModal(true);
                                    } else {
                                      setPremiumModal(true);
                                    }
                                  }}
                                  className={`br-5 transition-hover-transform fs-5 fw-light ri-add-line bg-color-white-10 h-23px aspect-square d-flex align-items-center justify-content-center`}
                                ></i>
                              </div>
                            )}
                          </div>
                          <Collapse in={isParentId === id}>
                            <ul className={`mb-0`}>
                              {subItems &&
                                subItems?.length > 0 &&
                                subItems.map((subItems) => {
                                  const id = subItems.id;
                                  const path = subItems.path;
                                  const label = subItems.label;
                                  const categories = subItems.categories;
                                  const headData = subItems.headData;
                                  const isPathMatch =
                                    location.pathname === path;
                                  return (
                                    <li className={`mb-2`} key={id}>
                                      <Link
                                        onClick={() => {
                                          dispatch(
                                            setDocumentTitle(
                                              label +
                                                " - Wallet Sync - Budget Planner and Expense Tracker"
                                            )
                                          );
                                          dispatch(
                                            setCategoriesOfHeadCategory(
                                              categories
                                            )
                                          );
                                        }}
                                        to={path}
                                        className={`hover-translate--0-span hover-opacity-1-i ps-12px d-flex align-items-center gap-0 ${
                                          isPathMatch
                                            ? "text-dark-primary"
                                            : "hover-color-dark text-table-head-color"
                                        } text-capitalize fs-15 fw-normal lh-base`}
                                      >
                                        <i
                                          className={`transition-0_2s ${
                                            isPathMatch
                                              ? "opacity-100"
                                              : "opacity-0"
                                          } ri-subtract-fill`}
                                        ></i>
                                        <span
                                          className={`max-w-300px text-truncate transition-0_2s ${
                                            isPathMatch ? "" : "translate--14px"
                                          }`}
                                          // style={{
                                          //   transform: "translateX(-18px)",
                                          // }}
                                        >
                                          {label}
                                        </span>
                                        <i
                                          onClick={() => {
                                            setModal(true);
                                            setEditHeadCategory(headData);
                                          }}
                                          className={`fs-17 ms-auto transition-0_2s ${
                                            isPathMatch
                                              ? "opacity-100"
                                              : "opacity-0"
                                          } ri-pencil-line`}
                                        ></i>
                                      </Link>
                                    </li>
                                  );
                                })}
                            </ul>
                          </Collapse>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
        <div
          className={`settings-right-part rounded-4 border common-border-color bg-white w-100 overflow-scroll-design overflow-auto`}
        >
          <div
            className={`border-bottom common-border-color p-3 gap-2 d-flex align-items-center justify-content-between flex-wrap`}
          >
            <div className="py-1">
              <span className={`fs-5 fw-medium lh-base text-capitalize`}>
                {documentTitle ? documentTitle.split("-")[0] : pageTitleValue}
              </span>
            </div>
            {onSearch || onClick ? (
              <div
                className={`filters-div d-flex flex-wrap align-items-center gap-3`}
              >
                {onSearch && (
                  <Form.Group className="position-relative flex-grow-1">
                    <i className="position-absolute ps-12px start-0 top-50 translate-middle-y ri-search-line fs-18 text-color-gray"></i>
                    <Form.Control
                      value={searchValue}
                      placeholder={`search ${pageTitleValue}...`}
                      name="search"
                      onChange={(e) => {
                        onSearch(e.target.value);
                        setSearchValue(e.target.value);
                      }}
                      className="min-h-40px br-8 common-border-color text-color-dusty-gray pe-5 ps-40px fs-16 responsive"
                    />
                    {searchValue && (
                      <i
                        onClick={() => {
                          onSearch("");
                          setSearchValue("");
                        }}
                        className="ri-close-fill fw-medium fs-18 cursor-pointer position-absolute top-50 translate-middle end-0 text-end"
                      ></i>
                    )}
                  </Form.Group>
                )}
                {onClick && (
                  <Button
                    className="primary-white-btn order-1 order-sm-0 order-lg-1  v-fit py-1 br-8 hover-bg-color-primary hover-text-color-white hover-text-color-white-i text-dark-primary d-flex align-items-center justify-content-center border common-border-color px-3 gap-1 text-capitalize"
                    // className="text-truncate primary-white-btn focus-bg-color-primary v-fit min-h-40px py-1 br-8 bg-white hover-bg-color-primary hover-text-color-white-i hover-text-color-white-span text-dark-primary d-flex align-items-center justify-content-center border common-border-color px-3 gap-0 text-capitalize"
                    onClick={onClick}
                  >
                    <i className="transition ri-add-line fs-22 text-table-head-color"></i>
                    <span className={`fs-15`}>{buttonContent}</span>
                  </Button>
                )}
              </div>
            ) : null}
          </div>
          {children}
        </div>
      </div>

      <Offcanvas
        className={`max-w-300px`}
        show={isSettingsSidbarCanvas}
        onHide={() => dispatch(setIsSettingsSidbarCanvas(false))}
      >
        <Offcanvas.Header
          className={`border-bottom common-border-color`}
          closeButton
        >
          <Offcanvas.Title>Settings</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className={`overflow-scroll-design`}>
          <>
            <ul className={`p-0 m-0`}>
              {settingSideBarNavItems.map((ele) => {
                const id = ele.id;
                const title = ele.title;

                return (
                  <li key={id} className={`nav-list`}>
                    <span
                      className={`text-capitalize fs-21 text-dark fw-medium lh-base mb-2 d-block title`}
                    >
                      {title}
                    </span>
                    <ul className={`p-0 m-0`}>
                      {ele.navList.map((items) => {
                        const id = items.id;
                        const path = items.path;
                        const icon = items.icon;
                        const label = items.label;
                        const subItems = items.subItems;
                        const isActive = handleActiveNavItem(path, id);
                        const isPathMatch = location.pathname === path;
                        const shouldDisplayRoute = items.admin
                          ? user?.role === authRoleEnum.ADMIN
                            ? true
                            : false
                          : true;
                        return !shouldDisplayRoute ? null : (
                          <li key={id} className={`pb-0`}>
                            <div
                              className={`cursor-pointer mb-2 transition ${
                                isActive || isPathMatch
                                  ? "bg-color-primary text-white"
                                  : "bg-white text-dark"
                              } py-6px ps-3 pe-2 br-8 px-0 text-capitalize  overflow-hidden d-flex align-items-center hover-bg-color-primary hover-text-color-white`}
                            >
                              <div
                                className={`w-100 p-0 bg-transparent border-0`}
                                onClick={() => {
                                  navigate(path);
                                  toggleNavItem(id);
                                  !subItems &&
                                    dispatch(setIsSettingsSidbarCanvas(false));
                                }}
                              >
                                <i className={`fs-21 fw-light ${icon}`}></i>
                                <span
                                  className={`text-truncate fs-15 fw-normal ms-2`}
                                >
                                  {label}
                                </span>
                              </div>
                              {subItems && (
                                <div
                                  className={`ms-auto d-flex align-items-center gap-1`}
                                >
                                  <i
                                    onClick={() => {
                                      navigate(path);
                                      toggleNavItem(id);
                                    }}
                                    className={`transition-hover-transform ${
                                      isParentId === id ? "rotate--180deg" : ""
                                    } fs-21 fw-light ri-arrow-down-s-line`}
                                  ></i>
                                  <i
                                    onClick={() => setModal(true)}
                                    className={`br-5 transition-hover-transform fs-5 fw-light ri-add-line bg-color-white-10 h-23px aspect-square d-flex align-items-center justify-content-center`}
                                  ></i>
                                </div>
                              )}
                            </div>
                            <Collapse in={isParentId === id}>
                              <ul className={`mb-0`}>
                                {subItems &&
                                  subItems?.length > 0 &&
                                  subItems.map((subItems) => {
                                    const id = subItems.id;
                                    const path = subItems.path;
                                    const label = subItems.label;
                                    const categories = subItems.categories;
                                    const isPathMatch =
                                      location.pathname === path;
                                    return (
                                      <li className={`mb-2`} key={id}>
                                        <Link
                                          onClick={() => {
                                            dispatch(
                                              setDocumentTitle(
                                                label +
                                                  " - Wallet Sync - Budget Planner and Expense Tracker"
                                              )
                                            );
                                            dispatch(
                                              setCategoriesOfHeadCategory(
                                                categories
                                              )
                                            );
                                            dispatch(
                                              setIsSettingsSidbarCanvas(false)
                                            );
                                          }}
                                          to={path}
                                          className={`hover-translate--0-span hover-opacity-1-i ps-12px d-flex align-items-center gap-0 ${
                                            isPathMatch
                                              ? "text-dark-primary"
                                              : "hover-color-dark text-table-head-color"
                                          } text-capitalize fs-15 fw-normal lh-base`}
                                        >
                                          <i
                                            className={`transition-0_2s ${
                                              isPathMatch
                                                ? "opacity-100"
                                                : "opacity-0"
                                            } ri-subtract-fill`}
                                          ></i>
                                          <span
                                            className={`max-w-300px text-truncate transition-0_2s ${
                                              isPathMatch
                                                ? ""
                                                : "translate--14px"
                                            }`}
                                            // style={{
                                            //   transform: "translateX(-18px)",
                                            // }}
                                          >
                                            {label}
                                          </span>
                                        </Link>
                                      </li>
                                    );
                                  })}
                              </ul>
                            </Collapse>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </>
        </Offcanvas.Body>
      </Offcanvas>
      <HeadCategory
        data={editHeadCategory}
        isOpen={modal}
        onHide={() => {
          setModal(false), setEditHeadCategory({});
        }}
      />
      <PremiumModal
        isShow={premiumModal}
        onHide={() => setPremiumModal(false)}
      />
    </div>
  );
};

SettingLayout.propTypes = {
  children: PropTypes.node,
  buttonContent: PropTypes.any,
  onSearch: PropTypes.any,
  onClick: PropTypes.any,
};

export default SettingLayout;
