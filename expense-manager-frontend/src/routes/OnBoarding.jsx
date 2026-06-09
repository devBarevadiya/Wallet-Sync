import { ON_BOARDING } from "../constants/routes";
import Financial from "../pages/onBoarding/Financial";
import Goal from "../pages/onBoarding/Goal";

const OnBoarding = () => {
  return [
    {
      path: ON_BOARDING,
      component: <Goal />,
    },
    {
      path: ON_BOARDING,
      component: <Financial />,
    },
  ];
};

export default OnBoarding;
