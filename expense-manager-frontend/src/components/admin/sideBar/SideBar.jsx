import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ADMIN } from "../../../constants/routes";
import { Image } from "../../../data/images";
import { SideBarMenus } from "../../../data/admin/sideBar";
import { Offcanvas } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setIsSidebarCanvas } from "../../../store/filters/slice";

const SideBar = () => {
  const { isSidebarCanvas } = useSelector((store) => store.Filters);
  const sideBarMenus = SideBarMenus();
  const dispatch = useDispatch();
  const handleSideCanvas = () => dispatch(setIsSidebarCanvas(!isSidebarCanvas));
  const navigate = useNavigate();

  const handleActiveNavItem = (path) => {
    // if (
    //   location.pathname
    //     .split("-")
    //     .join("")
    //     .includes(path?.split("-").join("")) ||
    //   isParentId === id
    // ) {
    if (location.pathname.includes(path)) {
      // if (location.pathname === path) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      <div
        className={`side-navbar open border-end common-border-color d-none d-lg-block`}
      >
        <div className={`position-sticky h-100 hover-open top-0 start-0`}>
          <div
            className={`bg-white side-bar vh-100 overflow-y-auto overflow-scroll-design position-sticky w-100 start-0 top-0`}
          >
            <Link
              className={`position-sticky z-2 top-0`}
              to={ADMIN.DASHBOARD.PATH}
            >
              <div className="h-70px d-flex align-items-center justify-content-center z-5 bg-white">
                <img
                  src={Image.blackLogo}
                  alt="logo"
                  className="h-45px w-auto d-block mx-auto"
                />
              </div>
            </Link>

            <div className={`position-relative`}>
              <ul className={`px-3 pt-3 p-0 pb-4 m-0 side-navbar-items`}>
                {/* common nav inside app */}
                {sideBarMenus.map((ele) => {
                  const id = ele.id;
                  const path = ele.path;
                  const icon = ele.icon;
                  const label = ele.label;
                  const isActive = handleActiveNavItem(path);
                  return (
                    <React.Fragment key={id}>
                      <div className={`nav-item-div position-relative pb-2`}>
                        <Link to={path}>
                          <li
                            className={`transition nav-list ${
                              isActive
                                ? "bg-color-primary text-white"
                                : "bg-white text-dark"
                            } py-1 ps-3 pe-2 br-8 px-0 text-capitalize mx-auto`}
                          >
                            <div className="overflow-hidden d-flex align-items-center">
                              <i className={`fs-21 fw-light ${icon}`}></i>
                              <span
                                className={`text-truncate fs-15 fw-normal ms-2`}
                              >
                                {label}
                              </span>
                            </div>
                          </li>
                        </Link>
                      </div>
                    </React.Fragment>
                  );
                })}
                {/* for other flow */}
                <div className="pb-2">
                  <li
                    className={`${
                      location.pathname?.includes("/settings")
                        ? "bg-color-primary text-white"
                        : "bg-white text-dark"
                    } transition nav-list bg-white text-dark py-1 ps-3 pe-2 br-8 px-0 text-capitalize mx-auto cursor-pointer`}
                    onClick={() => navigate(ADMIN.SETTINGS.ACCOUNTS.PATH)}
                  >
                    <div className="overflow-hidden d-flex align-items-center">
                      <i className={`fs-21 fw-light ri-settings-4-line`}></i>
                      <span className={`text-truncate fs-15 fw-normal ms-2`}>
                        Settings
                      </span>
                    </div>
                  </li>
                </div>
                {/* <div className={`nav-item-div position-relative pb-2`}>
                  <Link
                    target="_blank"
                    to="https://walletsyncexpensetracker.featurebase.app/"
                  >
                    <li
                      className={`transition nav-list bg-white text-dark py-1 ps-3 pe-2 br-8 px-0 text-capitalize mx-auto`}
                    >
                      <div className="overflow-hidden d-flex align-items-center">
                        <i className={`fs-21 fw-light ri-feedback-line`}></i>
                        <span className={`text-truncate fs-15 fw-normal ms-2`}>
                          Feature Request
                        </span>
                      </div>
                    </li>
                  </Link>
                </div> */}
              </ul>
            </div>
          </div>
        </div>

        {/* ================================= 
                      drawer 
         ================================= */}

        <Offcanvas
          className="max-w-300px"
          show={isSidebarCanvas}
          onHide={handleSideCanvas}
        >
          <Offcanvas.Header closeButton className="py-0 border-bottom">
            <Offcanvas.Title>
              <Link
                className={`position-sticky z-2 top-0`}
                to={ADMIN.DASHBOARD.PATH}
              >
                <div className="bg-white h-60px d-flex align-items-center justify-content-center">
                  <img
                    src={Image.blackLogo}
                    alt="logo"
                    className="h-40px w-auto d-block mx-auto"
                  />
                </div>
              </Link>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="pt-0">
            <div className={` side-bar position-sticky w-100 start-0 top-0`}>
              <div className={`position-relative`}>
                <ul className={`px-1 mt-3 p-0 pb-3 m-0 side-navbar-items`}>
                  {sideBarMenus.map((ele) => {
                    const id = ele.id;
                    const path = ele.path;
                    const icon = ele.icon;
                    const label = ele.label;
                    const isActive = handleActiveNavItem(path);
                    return (
                      <React.Fragment key={id}>
                        <div className={`nav-item-div position-relative pb-2`}>
                          <Link to={path}>
                            <li
                              className={`transition nav-list ${
                                isActive
                                  ? "bg-color-primary text-white"
                                  : "bg-white text-dark"
                              } py-6px ps-3 pe-2 br-8 px-0 text-capitalize  overflow-hidden d-flex align-items-center hover-bg-color-primary hover-text-color-white`}
                            >
                              <div className="overflow-hidden d-flex align-items-center">
                                <i className={`fs-21 fw-light ${icon}`}></i>
                                <span
                                  className={`text-truncate fs-15 fw-normal ms-2`}
                                >
                                  {label}
                                </span>
                              </div>
                            </li>
                          </Link>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div className={`nav-item-div position-relative pb-2`}>
                    <Link
                      target="_blank"
                      to="https://walletsyncexpensetracker.featurebase.app/"
                    >
                      <li
                        className={`transition nav-list bg-white text-dark py-6px ps-3 pe-2 br-8 px-0 text-capitalize  overflow-hidden d-flex align-items-center hover-bg-color-primary hover-text-color-white`}
                      >
                        <div className="overflow-hidden d-flex align-items-center">
                          <i className={`fs-21 fw-light ri-feedback-line`}></i>
                          <span
                            className={`text-truncate fs-15 fw-normal ms-2`}
                          >
                            Feature Request
                          </span>
                        </div>
                      </li>
                    </Link>
                  </div>
                </ul>
              </div>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </>
  );
};

export default SideBar;
