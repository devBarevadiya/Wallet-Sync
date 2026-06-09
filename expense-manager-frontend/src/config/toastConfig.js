import toast from "react-hot-toast";
import { debounce } from "lodash";

export const toastSuccess = (message) => {
  toast.success(message, {
    position: "top-center",
  });
};

// export const toastSuccess = debounce(
//   (message) => {
//     toast.success(message, {
//       position: "top-center",
//     });
//   },
//   3000,
//   { leading: true, trailing: false }
// );

export const toastError = debounce(
  (error) => {
    toast.error(error, { position: "top-center" });
  },
  3000,
  { leading: true, trailing: false }
);
