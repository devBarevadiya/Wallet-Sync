import { formatDate, getDateDaysAgo } from "../../helpers/commonFunctions";
import { addAccount, analyticsTypeEnum } from "../../helpers/enum";
import { IconsImage } from "../images";

export const accountTypeData = [
  // {
  //   img: IconsImage.grayColor.bank,
  //   title: "bank sync",
  //   description: "Connect to your bank account",
  // },
  // {
  //   img: IconsImage.grayColor.importing,
  //   title: "File Import",
  //   description: "Import CSV, Excel or OFX files",
  // },
  {
    img: IconsImage.grayColor.target,
    title: "Manual Input",
    description: "Update your account manually",
    enumTitle: addAccount,
  },
  // {
  //   img: IconsImage.grayColor.investment,
  //   title: "Investment",
  //   description: "Updated value of your investment",
  // },
];

export const accountColor = [
  "#5ED3DB",
  "#DD6FD2",
  "#6F6FDD",
  "#E58B4A",
  "#FA6838",
  "#6385FF",
  "#FDBD19",
];

const formattingDate = (date) => formatDate(date, "yyyy-MM-DD");

export const defaultDashboardData = {
  [analyticsTypeEnum.BALANCE_TREND]: [
    {
      date: formattingDate(getDateDaysAgo(4)),
      balance: {
        balance: 20000,
        createdAt: "2025-01-21T12:44:53.377Z",
      },
    },
    {
      date: formattingDate(getDateDaysAgo(3)),
      balance: {
        balance: 30000,
        createdAt: "2025-01-22T00:01:01.913Z",
      },
    },
    {
      date: formattingDate(getDateDaysAgo(2)),
      balance: {
        balance: 25000,
        createdAt: "2025-01-23T03:43:06.663Z",
      },
    },
    {
      date: formattingDate(getDateDaysAgo(1)),
      balance: {
        balance: 50000,
        createdAt: "2025-01-23T03:43:06.663Z",
      },
    },
    {
      date: formattingDate(getDateDaysAgo(0)),
      balance: {
        balance: 40000,
        createdAt: "2025-01-23T03:43:06.663Z",
      },
    },
  ],
  [analyticsTypeEnum.SPENDING]: [
    {
      title: "Groceries",
      color: "#f66263",
      amount: 1000,
      icon: "expense/category/78114c6a-c2e4-4dda-a38c-2c887b23a2ab.png",
    },
    {
      title: "Housing",
      color: "#BC79FF",
      amount: 1000,
      icon: "expense/Housing/cb6a623e-64ae-4914-bfdd-d83bbb804122.png",
    },
    {
      title: "Clothes & shoes",
      color: "#FF7A4E",
      amount: 1000,
      icon: "expense/Clothes & shoes/483624eb-f74f-4e0f-a164-dc9cea6fb3bb.png",
    },
  ],
  [analyticsTypeEnum.LAST_RECORD]: [
    {
      _id: "6791caf91b82a306209bc180",
      type: "EXPENSE",
      currency: {
        _id: "666696047ec03bf678a2bd2a",
        symbol: "₹",
      },
      amount: 1000,
      account: {
        _id: "678f96c51b82a3062099b6f3",
        title: "q",
      },
      category: {
        _id: "6784ddc38264b536482bf726",
        title: "Housing",
        color: "#BC79FF",
        icon: "expense/Housing/cb6a623e-64ae-4914-bfdd-d83bbb804122.png",
      },
      date: "2025-01-23T04:52:00.000Z",
      paymentType: "CASH",
    },
    {
      _id: "6791cba51b82a306209bc226",
      type: "EXPENSE",
      currency: {
        _id: "666696047ec03bf678a2bd2a",
        symbol: "₹",
      },
      amount: 1000,
      account: {
        _id: "678f96c51b82a3062099b6f3",
        title: "q",
      },
      category: {
        _id: "6784ddc38264b536482bf783",
        title: "Clothes & shoes",
        color: "#FF7A4E",
        icon: "expense/Clothes & shoes/483624eb-f74f-4e0f-a164-dc9cea6fb3bb.png",
      },
      date: "2025-01-23T04:52:00.000Z",
      paymentType: "CASH",
    },
    {
      _id: "6791cae61b82a306209bc101",
      type: "INCOME",
      currency: {
        _id: "666696047ec03bf678a2bd2a",
        symbol: "₹",
      },
      amount: 2000,
      account: {
        _id: "678f96c51b82a3062099b6f3",
        title: "q",
      },
      category: {
        _id: "6784ddc38264b536482bf7a6",
        title: "Income",
        color: "#FDBD19",
        icon: "expense/Income/cd200bd9-cb49-48b3-b04a-ffa811b3f0aa.png",
      },
      date: "2025-01-23T04:51:00.000Z",
      paymentType: "CASH",
    },
  ],
  [analyticsTypeEnum.COSTLY_EXPENSES]: [
    {
      _id: "6791baca1b82a306209bb7eb",
      type: "EXPENSE",
      currency: {
        _id: "666696047ec03bf678a2bd2a",
        symbol: "₹",
      },
      amount: 1000,
      account: {
        _id: "678f96c51b82a3062099b6f3",
        title: "q",
      },
      category: {
        _id: "6784ddc38264b536482bf71e",
        title: "Groceries",
        color: "#f66263",
        icon: "expense/category/78114c6a-c2e4-4dda-a38c-2c887b23a2ab.png",
      },
      date: "2025-01-23T03:43:00.000Z",
      paymentType: "CASH",
      createdAt: "2025-01-23T03:43:06.632Z",
      updatedAt: "2025-01-23T03:43:06.632Z",
    },
    {
      _id: "6791caf91b82a306209bc180",
      type: "EXPENSE",
      currency: {
        _id: "666696047ec03bf678a2bd2a",
        symbol: "₹",
      },
      amount: 1000,
      account: {
        _id: "678f96c51b82a3062099b6f3",
        title: "q",
      },
      category: {
        _id: "6784ddc38264b536482bf726",
        title: "Housing",
        color: "#BC79FF",
        icon: "expense/Housing/cb6a623e-64ae-4914-bfdd-d83bbb804122.png",
      },
      date: "2025-01-23T04:52:00.000Z",
      paymentType: "CASH",
      createdAt: "2025-01-23T04:52:09.507Z",
      updatedAt: "2025-01-23T04:52:09.507Z",
    },
    {
      _id: "6791cba51b82a306209bc226",
      type: "EXPENSE",
      currency: {
        _id: "666696047ec03bf678a2bd2a",
        symbol: "₹",
      },
      amount: 1000,
      account: {
        _id: "678f96c51b82a3062099b6f3",
        title: "q",
      },
      category: {
        _id: "6784ddc38264b536482bf783",
        title: "Clothes & shoes",
        color: "#FF7A4E",
        icon: "expense/Clothes & shoes/483624eb-f74f-4e0f-a164-dc9cea6fb3bb.png",
        iconType: "EMOJI",
      },
      date: "2025-01-23T04:52:00.000Z",
      paymentType: "CASH",
      createdAt: "2025-01-23T04:55:01.496Z",
    },
  ],
  [analyticsTypeEnum.CURRENCY]: [
    {
      _id: "666696047ec03bf678a2bd2a",
      symbol: "₹",
      currency: "Indian Rupee",
      code: "INR",
      balance: 20000,
    },
    {
      _id: "666696047ec03bf678a2bd26",
      symbol: "$",
      currency: "US Dollar",
      code: "USD",
      balance: 15000,
    },
    {
      _id: "666696047ec03bf678a2bd27",
      symbol: "€",
      currency: "Euro",
      code: "EUR",
      balance: 5000,
    },
  ],
  [analyticsTypeEnum.CASH_FLOW]: {
    balance: 10000,
    income: 2000,
    expense: 3000,
  },
  [analyticsTypeEnum.PLANNED]: [
    {
      _id: "6791cd3a1b82a306209bc444",
      type: "EXPENSE",
      title: "Summer Trip",
      account: {
        _id: "678f96c51b82a3062099b6f3",
        title: "q",
        currency: {
          _id: "666696047ec03bf678a2bd2a",
          symbol: "₹",
        },
        color: "#FAF2FF",
      },
      category: {
        _id: "6784ddc38264b536482bf73e",
        title: "Life & Entertainment",
        color: "#FF63F9",
        icon: "expense/category/29fdba65-2294-4c66-9b5a-48d6fa03c6e8.png",
        iconType: "EMOJI",
      },
      amount: 10000,
      scheduleDate: "2025-05-31T18:30:00.000Z",
      createdAt: "2025-01-23T05:01:46.244Z",
      updatedAt: "2025-01-23T05:01:46.252Z",
      nextPaymentDate: "2025-05-31T18:30:00.000Z",
    },
    {
      _id: "6791ccf91b82a306209bc3f3",
      type: "EXPENSE",
      title: "Transportation",
      account: {
        _id: "678f96c51b82a3062099b6f3",
        title: "q",
        currency: {
          _id: "666696047ec03bf678a2bd2a",
          symbol: "₹",
        },
        color: "#FAF2FF",
      },
      category: {
        _id: "6784ddc38264b536482bf734",
        title: "Transportaion",
        color: "#57CA60",
        icon: "expense/Transportaion/f07afe4f-0c83-40df-a9b6-b9683678f075.png",
        iconType: "EMOJI",
      },
      amount: 1000,
      scheduleDate: "2025-01-23T04:59:27.796Z",
      createdAt: "2025-01-23T05:00:41.720Z",
      updatedAt: "2025-01-23T05:00:41.738Z",
      nextPaymentDate: "2025-01-23T04:59:27.796Z",
    },
    {
      _id: "6791cc951b82a306209bc36f",
      type: "INCOME",
      title: "Food & Drinks",
      account: {
        _id: "678f96c51b82a3062099b6f3",
        title: "q",
        currency: {
          _id: "666696047ec03bf678a2bd2a",
          symbol: "₹",
        },
        color: "#FAF2FF",
      },
      category: {
        _id: "6784ddc38264b536482bf71f",
        title: "Restaurant, Fast - Food",
        color: "#FF6363",
        icon: "expense/Restaurant, Fast - Food/f5946e56-9dd9-45c9-ba26-282b59d70657.png",
        iconType: "EMOJI",
      },
      amount: 5000,
      scheduleDate: "2025-01-23T04:55:14.068Z",
      createdAt: "2025-01-23T04:59:01.582Z",
      updatedAt: "2025-01-23T04:59:25.966Z",
      nextPaymentDate: "2025-01-23T04:55:14.068Z",
    },
  ],
  [analyticsTypeEnum.BUDGET]: [
    {
      _id: "6791d0d41b82a306209bc9c6",
      name: "Cash",
      status: "OPEN",
      period: "WEEKLY",
      maxAmount: 100000,
      spendAmount: 40000,
      remainingAmount: 50000,
      createdAt: "2025-01-23T05:17:09.095Z",
      updatedAt: "2025-01-23T05:17:09.095Z",
    },
    {
      _id: "6791cd6d1b82a306209bc4d1",
      name: "Transportation",
      status: "OPEN",
      period: "WEEKLY",
      maxAmount: 50000,
      spendAmount: 50000,
      remainingAmount: 0,
      createdAt: "2025-01-23T05:02:38.012Z",
      updatedAt: "2025-01-23T05:02:38.012Z",
    },
    {
      _id: "6791cd551b82a306209bc464",
      name: "Personal",
      status: "OPEN",
      period: "MONTHLY",
      maxAmount: 10000,
      spendAmount: 7000,
      remainingAmount: 80000,
      createdAt: "2025-01-23T05:02:13.886Z",
      updatedAt: "2025-01-23T05:02:13.886Z",
    },
  ],
};
