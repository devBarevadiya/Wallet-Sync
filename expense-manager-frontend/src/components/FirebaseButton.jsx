import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toastError } from "../config/toastConfig";
import {
  googleLogin,
  appleLogin,
  handleFirebaseEvent,
} from "../firebase/config";
import { Button } from "react-bootstrap";
import { Image } from "../data/images";
import { ADMIN, ON_BOARDING, OTHER_AUTH } from "../constants/routes";
import PropTypes from "prop-types";
import { setIsSubScriptionScreen } from "../store/filters/slice";
import { eventEnum } from "../helpers/enum";

const FirebaseButton = ({
  callback,
  validation,
  otherValues = {},
  onSuccess,
  deepLinkToken,
}) => {
  const dispatch = useDispatch();
  const history = useNavigate();
  const imagePath = Image;
  const nav = useNavigate();
  // const user = useSelector(
  //   (store) => store.Auth.user,
  //   (prevUser, nextUser) => {
  //     if (nextUser && nextUser.currencies) {
  //       // navigate to dashboard or currency page
  //       nav(ADMIN.DASHBOARD.PATH);
  //     }
  //   }
  // );

  const login = async (provider, onSuccess) => {
    if (validation && !validation.values.currency) {
      validation.setFieldTouched("currency", true);
      validation.setFieldError("currency", "currency is required");
      return;
    }

    try {
      const response = await dispatch(
        callback({ values: provider, history, otherValues, deepLinkToken })
      );
      if (callback?.fulfilled?.match(response)) {
        onSuccess && onSuccess();
        if (response?.payload?.data?.currencies?.length > 0) {
          nav(ADMIN.DASHBOARD.PATH);
        } else {
          nav(ON_BOARDING);
        }
        onSuccess && onSuccess();
      }
    } catch (error) {
      // console.log(error);
      const result = error?.response?.data;
      toastError(result?.authorization || result?.data || result?.message);
    }
  };
  return (
    <div className="d-flex justify-content-center gap-3">
      <Button
        aria-label="googleLogin"
        className="socialLoginBtn"
        onClick={() => {
          dispatch(setIsSubScriptionScreen(true));
          login(googleLogin, handleFirebaseEvent(eventEnum.GOOGLE_LOGIN));
        }}
      >
        <img className="w-100" src={imagePath?.google} alt="" />
      </Button>
    </div>
  );
};

FirebaseButton.propTypes = {
  callback: PropTypes.any,
  validation: PropTypes.any,
  otherValues: PropTypes.any,
  onSuccess: PropTypes.any,
  deepLinkToken: PropTypes.string,
};

export default FirebaseButton;
