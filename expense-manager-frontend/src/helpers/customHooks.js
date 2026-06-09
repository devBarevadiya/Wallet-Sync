import { useEffect, useRef } from "react";

export const useClickOUtside = (classNames = [""], callback) => {
  useEffect(() => {
    const handleClick = (e) => {
      const clickOutside = classNames.some((className) =>
        e.target.closest(className)
      );
      if (!clickOutside) {
        callback();
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => {
      window.removeEventListener("mousedown", handleClick);
    };
  }, [classNames, callback]);
};

export const useModalScroll = ({ scrollStep = 50, enabled } = {}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    
    const handleKeyDown = (e) => {
      if (!modalRef.current || !enabled) return;

      if (e.key == "ArrowDown") {
        modalRef.current.scrollBy({ top: scrollStep, behavior: "smooth" });
      } else if (e.key == "ArrowUp") {
        modalRef.current.scrollBy({ top: -scrollStep, behavior: "smooth" });
      }
    };

    const handleWheel = (e) => {
      if (!modalRef.current || !enabled) return;
      
      // Prevent default to avoid page scrolling when modal is open
      e.preventDefault();
      
      // Use the deltaY value from the wheel event for natural scrolling
      modalRef.current.scrollBy({ 
        top: e.deltaY, 
        behavior: "auto" 
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    
    // Add wheel event listener to the modal itself
    if (modalRef.current && enabled) {
      modalRef.current.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (modalRef.current) {
        modalRef.current.removeEventListener("wheel", handleWheel);
      }
    };
  }, [scrollStep, enabled]);

  return modalRef;
};
