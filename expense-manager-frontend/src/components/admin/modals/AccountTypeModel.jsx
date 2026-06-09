import { Col, Modal, Row } from "react-bootstrap";
import ModelWrapper from "../../ModelWrapper";
import { accountTypeData } from "../../../data/admin/dashboard";
import PropTypes from "prop-types";
import { memo } from "react";
import { useModalScroll } from "../../../helpers/customHooks";

const AccountTypeModel = ({ isOpen, onHide, onSelectValue }) => {
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });
  return (
    <>
      <ModelWrapper
        show={isOpen}
        onHide={onHide}
        title={"add account"}
        className="modal-650px"
      >
        <Modal.Body ref={modalBodyRef} className="pb-2">
          <Row className={`px-1`}>
            {accountTypeData?.map((item, index) => {
              const enumTitle = item?.enumTitle || "";
              return (
                <Col key={index} sm={12} className={`px-2`}>
                  <div
                    className="admin-primary-bg p-3 br-10 d-flex align-items-center gap-2 mb-3 cursor-pointer"
                    onClick={() => {
                      onSelectValue(enumTitle), onHide(false);
                    }}
                  >
                    <span className="w-50px h-50px d-block p-12px bg-color-white-smoke br-10">
                      <img className="w-100 h-100" src={item.img} alt="" />
                    </span>
                    <span>
                      <h6 className="m-0 p-0 fs-15 fw-semibold mb-1 text-capitalize">
                        {item.title}
                      </h6>
                      <p className="p-0 m-0 fs-12 text-color-monsoon truncate-line-1">
                        {item.description}
                      </p>
                    </span>
                  </div>
                </Col>
              );
            })}
          </Row>
        </Modal.Body>
      </ModelWrapper>
    </>
  );
};

AccountTypeModel.propTypes = {
  isOpen: PropTypes.bool,
  onHide: PropTypes.func,
  onSelectValue: PropTypes.func,
};

export default memo(AccountTypeModel);
