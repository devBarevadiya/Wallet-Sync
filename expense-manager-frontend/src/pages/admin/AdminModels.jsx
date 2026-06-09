import { useEffect, useState } from "react";
import ModelWrapper from "../../components/ModelWrapper";
import { accountType, addAccount } from "../../helpers/enum";
import { Button, Col, Modal, Row } from "react-bootstrap";
import { IconsImage } from "../../data/images";
import { accountTypeData } from "../../data/admin/dashboard";

const AdminModels = ({ title, onHide, onSelectValue }) => {
  const [value, setValue] = useState(title);

  useEffect(() => {
    setValue(title);
  }, [title]);

  return (
    <>
      {/* ======================================= 
                    account type 
      ======================================= */}

      <ModelWrapper
        show={value == accountType}
        onHide={onHide}
        title={"add account"}
        className="modal-650px"
      >
        <Modal.Body>
          <Row className={`px-1`}>
            {accountTypeData?.map((item, index) => {
              const enumTitle = item?.enumTitle || "";
              return (
                <Col key={index} sm={6} className={`px-2`}>
                  <div
                    className="admin-primary-bg p-3 br-10 d-flex align-items-center gap-2 mb-3 cursor-pointer"
                    onClick={() => onSelectValue(enumTitle)}
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

      {/* ======================================= 
                    add account
      ======================================= */}

      <ModelWrapper
        show={value == addAccount}
        onHide={onHide}
        title={"add account"}
        className="modal-650px"
      >
        <Modal.Body>
          <Row className={`px-1`}>
            {accountTypeData?.map((item, index) => {
              return (
                <Col key={index} sm={6} className={`px-2`}>
                  <div className="admin-primary-bg p-3 br-10 d-flex align-items-center gap-2 mb-3 cursor-pointer">
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

export default AdminModels;
