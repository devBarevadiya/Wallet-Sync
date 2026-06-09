import PropTypes from "prop-types";
import ModelWrapper from "../../ModelWrapper";
import { Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ADMIN } from "../../../constants/routes";
import { Image } from "../../../data/images";
import { useCallback } from "react";

const PremiumModal = ({
  isShow,
  onHide,
  title,
  message = "You will need to upgrade your plan to get unlimited access.",
  onUpgrade,
}) => {
  const handleUpgrade = useCallback(() => {
    onUpgrade && onUpgrade();
  }, [onUpgrade]);

  return (
    <ModelWrapper
      show={isShow}
      onHide={onHide}
      title={title || "Premium feature"}
      className="modal-650px"
    >
      <Modal.Body>
        <img
          src={Image.crown}
          // src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDQiIGhlaWdodD0iMTA0Ij48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImEiIGZ4PSI1MCUiIGZ5PSI1MCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMyNjkxRkUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMyQzg0RjMiLz48L3JhZGlhbEdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iYiIgeDE9IjUwJSIgeDI9IjUwJSIgeTE9IjAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZEQzkwOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGQUMwNyIvPjwvbGluZWFyR3JhZGllbnQ+PGZpbHRlciBpZD0iYyIgd2lkdGg9IjEwMiUiIGhlaWdodD0iMTA2LjElIiB4PSItLjglIiB5PSItMS40JSIgZmlsdGVyVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94Ij48ZmVPZmZzZXQgZHk9IjEiIGluPSJTb3VyY2VBbHBoYSIgcmVzdWx0PSJzaGFkb3dPZmZzZXRPdXRlcjEiLz48ZmVDb2xvck1hdHJpeCBpbj0ic2hhZG93T2Zmc2V0T3V0ZXIxIiByZXN1bHQ9InNoYWRvd01hdHJpeE91dGVyMSIgdmFsdWVzPSIwIDAgMCAwIDAuMjMzMDU4MDQ1IDAgMCAwIDAgMC41MjU2MDY0MjMgMCAwIDAgMCAwLjg2NjcwOTE4NCAwIDAgMCAxIDAiLz48ZmVNZXJnZT48ZmVNZXJnZU5vZGUgaW49InNoYWRvd01hdHJpeE91dGVyMSIvPjxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPjwvZmVNZXJnZT48L2ZpbHRlcj48L2RlZnM+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyIDIpIj48Y2lyY2xlIGN4PSI1MC4zODgiIGN5PSI0OS42MTIiIHI9IjQ1LjczNiIgZmlsbD0idXJsKCNhKSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBzdHJva2U9InVybCgjYikiIHN0cm9rZS13aWR0aD0iNCIvPjwvZz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTguMDE0IDBDOC42NSAwIDEuMjA1IDYuODguNTM0IDE1Ljg3MnYuNDU0Yy0uMDEzLjI5LS4wNC41NzEtLjA0Ljg2NSAwIC4yMTQuMDM0LjQyLjA4Mi42MTlDLjg4NCAyNy4yNTcgOC4xOTcgMzQuMyAxNy44NSAzNC4zYzcuMDk0IDAgMTAuNzM2LTQuNTY2IDEzLjM0NS05LjQ0YTk5LjQ5OCA5OS40OTggMCAwMS0zLjA3LTUuNDAxYy0yLjU4MiA1LjcxNC00Ljk4OCA5LjY4OC0xMC4yNzUgOS42ODgtNi44NjUgMC0xMS44OTktNC43OC0xMi4xNTctMTEuNDIuMDM0LS4xNzEuMDQtLjM1My4wNC0uNTM2IDAtNi43ODggNS4yODItMTEuOTE0IDEyLjI4MS0xMS45MTQgNS4xNjQgMCA4LjAyIDQuNjY4IDEyLjExNyAxMi4zNjggNC4xNCA3Ljc4IDguODM3IDE2LjYxNCAxOS4wNzYgMTYuNjE0IDguNzE0IDAgMTYuMDk1LTcuMDgxIDE2Ljc4My0xNS43NDguMDEyLS4xNS4wMzMtLjMwNC4wNDEtLjQ1NC4wMTUtLjI4Ni4wNDEtLjU3Ni4wNDEtLjg2NmEyLjYzIDIuNjMgMCAwMC0uMDgyLS42MThDNjUuNjcgNy4yMzcgNTguMjY4IDAgNDguODM4IDBjLTcuMTkyIDAtMTEuMDkzIDQuODQzLTEzLjg3NyAxMC4wMTguNzM4IDEuMjk4IDEuNDA0IDIuNjI5IDIuMDg4IDMuOTE3LjMwNy41NzYuNjA3IDEuMTA4LjkgMS42NDkgMi41OTQtNS43MTEgNS4yMzMtMTAuNDMgMTAuODktMTAuNDMgNi44NiAwIDExLjg1NCA0LjkgMTIuMDM0IDExLjY2Ni0uMDE2LjEyMS0uMDQuMjQ2LS4wNC4zNzEgMCA2LjI4My01LjQyNiAxMS43OTEtMTEuNjI2IDExLjc5MS03LjEwMyAwLTEwLjY2OS02LjcwNC0xNC40NS0xMy44MUMzMC43OSA3LjcxNSAyNi42ODcgMCAxOC4wMTQgMHoiIGZpbHRlcj0idXJsKCNjKSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTkuMDU0IDM0LjU1OCkiLz48L2c+PC9zdmc+"
          alt="premium-logo"
          className={`min-w-100px w-100px aspect-square object-fit-cover mx-auto d-block`}
        />
        <h6 className={`text-center fs-17 fw-semibold mt-4  pt-1 mb-2`}>
          Upgrade to Premium
        </h6>
        <p className={` text-center fs-14 text-color-monsoon`}>{message}</p>
        <Link to={ADMIN.SUBSCRIPTION.PATH} onClick={handleUpgrade}>
          <Button className="mx-auto d-block primary-btn d-flex align-items-center">
            <i className="ri-star-fill text-color-supernova fs-21 me-2 lh-0"></i>
            <span className="fs-15">Upgrade</span>
          </Button>
        </Link>
      </Modal.Body>
    </ModelWrapper>
  );
};

PremiumModal.propTypes = {
  isShow: PropTypes.any,
  onHide: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  onUpgrade: PropTypes.func,
};

export default PremiumModal;
