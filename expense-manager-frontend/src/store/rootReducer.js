import { combineReducers } from "@reduxjs/toolkit";
import Auth from "./auth/slice";
import Currency from "./currency/slice";
import Filters from "./filters/slice";
import AccountType from "./accountType/slice";
import Account from "./account/slice";
import Label from "./label/slice";
import Transaction from "./transaction/slice";
import Dashboard from "./dashboard/slice";
import Category from "./category/slice";
import Blog from "./blog/slice";
import Aws from "./aws/slice";
import Group from "./group/slice";
import Notification from "./notification/slice";
import Payee from "./payee/slice";
import Stripe from "./stripe/slice";
import OnBoarding from "./onBoarding/slice";
import Planned from "./planned/slice";
import Payment from "./payment/slice";
import Budget from "./budget/slice";
import Template from "./template/slice";
import PromoCode from "./promoCode/slice";

export const appReducer = combineReducers({
  Auth,
  Currency,
  Filters,
  AccountType,
  Account,
  Label,
  Transaction,
  Dashboard,
  Category,
  Blog,
  Aws,
  Group,
  Notification,
  Payee,
  Stripe,
  OnBoarding,
  Planned,
  Payment,
  Budget,
  Template,
  PromoCode
});

export const rootReducer = (state, action) => {
  if (action.type == "RESET_STORE") {
    state = undefined;
  }
  return appReducer(state, action);
};
