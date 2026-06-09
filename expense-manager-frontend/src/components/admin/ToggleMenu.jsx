import { memo, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useClickOUtside } from "../../helpers/customHooks";

const ToggleMenu = ({
  children,
  onClick,
  onClose,
  isOpen,
  rootClass = "body",
  margin = "mx-auto",
  iconColor = "text-color-primary",
} = {}) => {
  const [isTopMenu, setIsTopMenu] = useState(false);

  useClickOUtside([".menu-popup-parent", ".menu-popup"], () => {
    onClose();
  });

  // Memoize the handlePopup function using useCallback
  const handlePopup = (event) => {
    event.preventDefault();
    const clickY = event?.clientY;
    const rootH = document?.querySelector(rootClass);
    const classRect = clickY - rootH?.getBoundingClientRect()?.top;
    const menuH = document?.querySelector(".menu-popup")?.clientHeight;
    const yPos = classRect + menuH > rootH?.clientHeight;
    setIsTopMenu(menuH <= rootH?.clientHeight ? yPos : false);
    onClick(event);
  }; // Include dependencies used in handlePopup

  // Example of using useMemo for computed class name
  const menuPopupClass = useMemo(() => {
    if (!isOpen) return "invisible";
    return isTopMenu ? "visible active-top" : "visible active-bottom";
  }, [isOpen, isTopMenu]);

  return (
    <div
      className={`menu-popup-parent max-w-fit cursor-pointer user-select-none ${margin}`}
      onClick={(e) => handlePopup(e)}
    >
      {/* <i className="ri-more-2-fill fs-19"></i> */}
      <i className="ri-more-2-fill fs-21 fw-medium"></i>
      <div
        className={`menu-popup bg-white br-5 border common-border-color py-2 ${menuPopupClass}`}
      >
        {children}
      </div>
    </div>
  );
};

ToggleMenu.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
  rootClass: PropTypes.string,
  margin: PropTypes.string,
  iconColor: PropTypes.string,
};

export default ToggleMenu;
