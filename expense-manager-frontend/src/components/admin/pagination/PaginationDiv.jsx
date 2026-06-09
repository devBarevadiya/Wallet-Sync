import PropTypes from "prop-types";
import { Col, Pagination, Row } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";

const PaginationDiv = ({
  active,
  size,
  step,
  onClickHandler,
  limit,
  totalItems,
  isPagesNumberDisplay = true,
  icons = false,
  onlyPagination = false,
  showingClassName = "",
}) => {
  const showingNumbers = step * 1 + 1;
  let startNumber = 2;
  let startArrayNumber = step;
  let needStartDots = false;
  let needEndDots = false;

  const md = useMediaQuery({ query: "(max-width: 991px)" });

  if (active > step) {
    startArrayNumber = active - step;
    needStartDots = active > step + startNumber;
  }

  if (size > showingNumbers) {
    needEndDots = size > active + step + 1;
    if (size < active + step + 1) {
      if (md) {
        startArrayNumber = size - showingNumbers + 1;
      } else {
        startArrayNumber = size - showingNumbers;
      }
    }
  }

  // Tooltip Setup
  // const Link = ({ id, children, title }) => (
  //   <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
  //     <button className={`btn p-0 border-0`}>{children}</button>
  //   </OverlayTrigger>
  // );

  return (
    <>
      {size > 1 ? (
        <Row className={`g-0 align-items-center justify-content-between`}>
          <Col md={6}>
            <div className={`text-center text-md-start ${showingClassName}`}>
              <p className={`mb-0 fs-14 lh-base fw-medium `}>
                Showing
                <span className="fw-semibold transition-none">
                  {" "}
                  {limit * active - limit + 1}
                </span>{" "}
                to{" "}
                <span className="fw-semibold transition-none">
                  {Math.min(active * limit - limit + limit, totalItems)}
                  &nbsp;
                </span>
                of{" "}
                <span className="fw-semibold transition-none text-decoration-underline">
                  &nbsp;{totalItems}&nbsp;
                </span>{" "}
                entries
              </p>
            </div>
          </Col>
          <Col md={6} className={`mt-2 mt-md-0`}>
            <Pagination className="mb-0 justify-content-center justify-content-md-end">
              <Pagination.Item
                className={`prev d-flex align-items-center justify-content-center br-5 border common-border-color mx-1 ${
                  active > 1 ? "cursor-pointer" : "disabled"
                }`}
                onClick={() => onClickHandler(Number(active - 1))}
              >
                <span
                  className={`transition-none select-none fw-medium ${
                    icons ? "px-2" : "px-3"
                  }`}
                >
                  {icons ? (
                    <i className="ri-arrow-left-s-line fs-18"></i>
                  ) : (
                    <span className={`fs-14`}>Previous</span>
                  )}
                </span>
              </Pagination.Item>

              {!onlyPagination &&
                size > showingNumbers + startNumber &&
                isPagesNumberDisplay && (
                  <>
                    <Pagination.Item
                      onClick={(e) =>
                        active === 1
                          ? null
                          : onClickHandler(Number(e.currentTarget.textContent))
                      }
                      className={`border common-border-color d-none d-sm-flex align-items-center justify-content-center px-1 br-5 mx-1 ${
                        active === 1 ? "active" : ""
                      }`}
                    >
                      <span className={`select-none fs-14 fw-medium`}>1</span>
                    </Pagination.Item>

                    {needStartDots && (
                      <span
                        className={`d-none d-lg-flex text-color-primary align-items-center justify-content-center mx-1 border common-border-color w-40px br-5 select-none fs-14 fw-medium`}
                      >
                        ...
                      </span>
                    )}

                    {[...Array(showingNumbers)].map((_, i) => {
                      const contentNumber = needStartDots
                        ? startArrayNumber
                        : startNumber;
                      startNumber++;
                      startArrayNumber++;

                      return (
                        <Pagination.Item
                          key={contentNumber}
                          onClick={(e) =>
                            active === contentNumber
                              ? null
                              : onClickHandler(
                                  Number(e.currentTarget.textContent)
                                )
                          }
                          className={`border common-border-color d-none d-sm-flex align-items-center justify-content-center px-1 br-5 mx-1 ${
                            active === contentNumber ? "active" : ""
                          }`}
                        >
                          <span className={`select-none fs-14 fw-medium`}>
                            {contentNumber}
                          </span>
                        </Pagination.Item>
                      );
                    })}

                    {needEndDots && (
                      <span
                        className={`d-none d-lg-flex text-color-primary align-items-center justify-content-center mx-1 border common-border-color w-40px br-5 select-none fs-14 fw-medium`}
                      >
                        ...
                      </span>
                    )}

                    <Pagination.Item
                      onClick={(e) =>
                        active === size
                          ? null
                          : onClickHandler(Number(e.currentTarget.textContent))
                      }
                      className={`border common-border-color d-none d-lg-flex align-items-center justify-content-center px-1 br-5 mx-1 ${
                        active === size ? "active" : ""
                      }`}
                    >
                      <span className={`select-none fs-14 fw-medium`}>
                        {size}
                      </span>
                    </Pagination.Item>
                  </>
                )}

              <Pagination.Item
                className={`next d-flex align-items-center justify-content-center br-5 border common-border-color mx-1 ${
                  active < size ? "cursor-pointer" : "disabled"
                }`}
                onClick={() =>
                  active < size && onClickHandler(Number(active + 1))
                }
              >
                <span
                  className={`transition-none select-none fw-medium ${
                    icons ? "px-2" : "px-3"
                  }`}
                >
                  {icons ? (
                    <i className="ri-arrow-right-s-line fs-18"></i>
                  ) : (
                    <span className={`fs-14`}>Next</span>
                  )}
                </span>
              </Pagination.Item>
            </Pagination>
          </Col>
        </Row>
      ) : null}
    </>
  );
};

PaginationDiv.propTypes = {
  onClickHandler: PropTypes.any,
  active: PropTypes.any,
  size: PropTypes.any,
  step: PropTypes.any,
  limit: PropTypes.any,
  totalItems: PropTypes.any,
  isPagesNumberDisplay: PropTypes.any,
  icons: PropTypes.any,
  text: PropTypes.any,
  onlyPagination: PropTypes.any,
};

export default PaginationDiv;
