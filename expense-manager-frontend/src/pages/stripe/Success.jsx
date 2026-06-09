import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { verifyTokenThunk } from "../../store/actions";

const Success = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { token } = useSelector((store) => store.Auth);
  const previousToken = useRef(token);

  useEffect(() => {
    if (params.token && params.token !== previousToken.current) {
      dispatch(verifyTokenThunk());
      previousToken.current = params.token;
    }
  }, [dispatch, token, params]);
  return (
    <div
      className={`vh-100 bg-success d-flex align-items-center justify-content-center display-3 fw-semibold text-white`}
    >
      Success
    </div>
  );
};

export default Success;
