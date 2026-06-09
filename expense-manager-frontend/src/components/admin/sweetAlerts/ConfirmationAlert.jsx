import { useCallback } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const useConfirmationAlert = (props = {}) => {
  const { isDarkMode } = useSelector((store) => store.Filters);
  const triggerAlert = useCallback(
    async ({
      title = "Are you sure?",
      text = "You won't be able to revert this!",
      icon = "warning",
      showCancelButton = true,
      confirmButtonText = "Yes delete it!",
      cancelButtonText = "No, keep it!",
      popup = "custom-popup",
      confirmButton = "sweet-alert-red-button focus-shadow-none",
      cancelButton = "sweet-alert-green-button focus-shadow-none",
      dispatchFunction,
      cancelDispatchFunction,

      // success swal props

      successTitle = "Success!",
      successText = "Your cart has been successfully removed",
      successConfirmButton = "sweet-alert-green-button",
      successConfirmButtonText = "OK",
      successIcon = "success",

      // // error swal props

      errorTitle = "Something went wrong!",
      errorText = "Please try again later!",
      errorIcon = "error",
      errorConfirmButtonText = "OK",
      errorConfirmButton = "sweet-alert-red-button",
    } = {}) => {
      // Normal class styling
      const customClass = {
        popup: props.popup || popup,
        confirmButton: props.confirmButton
          ? `${props.confirmButton} focus-shadow-none`
          : confirmButton,
        cancelButton: props.cancelButton || cancelButton,
      };

      // Success class styling
      const customSuccessClass = {
        popup: props.popup || popup,
        confirmButton: props.successConfirmButton
          ? `${props.successConfirmButton} focus-shadow-none`
          : successConfirmButton,
      };

      // Error class styling
      const customErrorClass = {
        popup: props.popup || popup,
        confirmButton: props.errorConfirmButton
          ? `${props.errorConfirmButton} focus-shadow-none`
          : errorConfirmButton,
      };

      if (
        location.pathname.includes("admin") &&
        (isDarkMode || isDarkMode === "true")
      ) {
        customClass.popup += " dark-layout";
        customSuccessClass.popup += " dark-layout";
        customErrorClass.popup += " dark-layout";
      }

      // Start Swal popup
      Swal.fire({
        title: props.title || title,
        text: props.text || text,
        icon: props.icon || icon,
        showCancelButton: props.showCancelButton || showCancelButton,
        confirmButtonText: props.confirmButtonText || confirmButtonText,
        cancelButtonText: props.cancelButtonText || cancelButtonText,
        customClass: customClass,
      }).then(async (result) => {
        if (result.isConfirmed && dispatchFunction) {
          const isSuccess = await dispatchFunction();
          if (isSuccess) {
            Swal.fire({
              title: props.successTitle || successTitle,
              text: props.successText || successText,
              icon: props.successIcon || successIcon,
              confirmButtonText:
                props.successConfirmButtonText || successConfirmButtonText,
              customClass: customSuccessClass,
            });
          } else {
            Swal.fire({
              title: props.errorTitle || errorTitle,
              text: props.errorText || errorText,
              icon: props.errorIcon || errorIcon,
              confirmButtonText:
                props.errorConfirmButtonText || errorConfirmButtonText,
              customClass: customErrorClass,
            });
          }
        } else if (
          result.dismiss == Swal.DismissReason.cancel &&
          cancelDispatchFunction
        ) {
          const response = await cancelDispatchFunction();
          if (response) {
            Swal.fire({
              title: props.successTitle || successTitle,
              text: props.successText || successText,
              icon: props.successIcon || successIcon,
              confirmButtonText:
                props.successConfirmButtonText || successConfirmButtonText,
              customClass: customSuccessClass,
            });
          } else {
            Swal.fire({
              title: props.errorTitle || errorTitle,
              text: props.errorText || errorText,
              icon: props.errorIcon || errorIcon,
              confirmButtonText:
                props.errorConfirmButtonText || errorConfirmButtonText,
              customClass: customErrorClass,
            });
          }
        }
      });
    },
    [isDarkMode, location.pathname]
  );
  return triggerAlert;
};

export default useConfirmationAlert;
