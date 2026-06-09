import * as APIHandler from "./api_helper";
import * as url from "./url_helper";

const api = APIHandler;

// Aws
export const aws = (data) => {
  return api.post(url.AWS, data);
};

// Auth
export const signIn = (data) => {
  return api.post(url.AUTH_API.LOGIN, data);
};

export const signUp = (data) => {
  return api.post(url.AUTH_API.REGISTER, data);
};

export const forgotPassword = (data) => {
  return api.post(url.AUTH_API.FORGOT_PASSWORD, data);
};

export const changePassword = (data) => {
  return api.patch(url.AUTH_API.CHANGE_PASSWORD, data);
};

export const resetPassword = ({ token, values }) => {
  return api.patch(url.AUTH_API.RESET_PASSWORD + `/${token}`, values);
};

export const socialLogin = (data) => {
  return api.post(url.AUTH_API.SOCIAL_LOGIN, data);
};

export const socialRegister = (data) => {
  return api.post(url.AUTH_API.SOCIAL_REGISTER, data);
};

export const verifyToken = () => {
  return api.get(url.AUTH_API.VERIFY_TOKEN);
};

export const deleteUserData = () => {
  return api.remove(url.AUTH_API.ALL_DATA);
};

export const deleteTransactions = () => {
  return api.remove(url.AUTH_API.TRANSACTIONS);
};

export const deleteTransactionsAppSettings = () => {
  return api.remove(url.AUTH_API.TRANSACTIONS_APP_SETTINGS);
};

export const changeBaseCurrency = (data) => {
  return api.patch(url.AUTH_API.BASE_CURRENCY, data);
};

export const updateUserProfile = (data, id) => {
  return api.patch(url.AUTH_API.BASE + `/${id}`, data);
};

export const userNotification = (data) => {
  return api.post(url.AUTH_API.BASE + "/notification", data);
};

export const userLogout = (data) => {
  return api.remove(url.AUTH_API.BASE + "/logout", data);
};

// other
export const getCurrency = () => {
  return api.get(url.CURRENCY_API.CURRENCY);
};

export const setCurrency = (data) => {
  return api.post(url.CURRENCY_API.SET_CURRENCY, data);
};

// account type

export const getAccountType = () => {
  return api.get(url.ACCOUNT_TYPE_API.ACCOUNT_TYPE);
};

export const postAccountType = (data) => {
  return api.post(url.ACCOUNT_TYPE_API.ACCOUNT_TYPE, data);
};

export const updateAccountType = (id, data) => {
  return api.patch(`${url.ACCOUNT_TYPE_API.ACCOUNT_TYPE}/${id}`, data);
};

export const deleteAccountType = (id) => {
  return api.remove(`${url.ACCOUNT_TYPE_API.ACCOUNT_TYPE}/${id}`);
};

// account

export const getAccount = () => {
  return api.get(url.ACCOUNT.ACCOUNT);
};

export const getAccountDetails = (id) => {
  return api.get(`${url.ACCOUNT.ACCOUNT}/${id}`);
};

export const postAccount = (data) => {
  return api.post(url.ACCOUNT.ACCOUNT, data);
};

export const deleteAccount = (id) => {
  return api.remove(`${url.ACCOUNT.ACCOUNT}/${id}`);
};

export const updateAccount = (data, id) => {
  return api.patch(url.ACCOUNT.ACCOUNT + `/${id}`, data);
};

// label

export const getLabel = () => {
  return api.get(url.LABEL);
};

export const createLabel = (data) => {
  return api.post(url.LABEL, data);
};

export const updateLabel = (data, id) => {
  return api.patch(url.LABEL + `/${id}`, data);
};

export const deleteLabel = (id) => {
  return api.remove(url.LABEL + `/${id}`);
};

// transaction

export const getTransaction = (data) => {
  return api.get(url.TRANSACTION.TRANSACTION, data);
};

export const createTransaction = (data) => {
  return api.post(url.TRANSACTION.TRANSACTION, data);
};

export const updateTransaction = (id, data) => {
  return api.patch(url.TRANSACTION.TRANSACTION + `/${id}`, data);
};

export const getTransactionFilterOptions = () => {
  return api.get(url.TRANSACTION.FILTER_OPTIONS);
};

export const deleteMultipleTransactions = (values) => {
  return api.remove(url.TRANSACTION.TRANSACTION, values);
};

// dashboard

export const lastRecord = () => {
  return api.get(url.DASHBOARD.LAST_RECORD);
};

export const spending = () => {
  return api.get(url.DASHBOARD.SPENDING);
};

export const analysts = (data) => {
  return api.post(url.DASHBOARD.ANALYTICS, data);
};

// category
export const getCategory = () => {
  return api.get(url.CATEGORY.CATEGORY);
};

export const createCategory = (data, id) => {
  return api.post(url.CATEGORY.CATEGORY + `/${id}`, data);
};

export const updateCategory = (data, id) => {
  return api.patch(url.CATEGORY.CATEGORY + `/${id}`, data);
};

export const createHead = (data) => {
  return api.post(url.CATEGORY.CATEGORY_HEAD, data);
};

export const updateHead = (data, id) => {
  return api.patch(url.CATEGORY.CATEGORY_HEAD + `/${id}`, data);
};

// blog
export const createBlog = (data) => {
  return api.post(url.BLOG.BASE, data);
};

export const getBlog = (query) => {
  return api.get(url.BLOG.BASE, query);
};

export const checkTitleAvailable = (title) => {
  return api.get(`${url.BLOG.BASE}/available?title=${title}`);
};

export const getBlogDetails = (slug) => {
  return api.get(`${url.BLOG.BASE}/${slug}/details`);
};

export const updateBlog = (slug, data) => {
  return api.patch(`${url.BLOG.BASE}/${slug}`, data);
};

export const deleteBlog = (id) => {
  return api.remove(`${url.BLOG.BASE}/${id}`);
};

// group
export const createGroup = (data) => {
  return api.post(url.GROUP.BASE, data);
};

export const getAllGroup = () => {
  return api.get(url.GROUP.BASE);
};

export const getGroupDetails = (id) => {
  return api.get(url.GROUP.BASE + `/${id}`);
};

export const updateGroup = (id, data) => {
  return api.patch(url.GROUP.BASE + `/${id}`, data);
};

export const switchGroup = (id) => {
  return api.patch(url.GROUP.SWITCH + `/${id}`);
};

export const deleteGroup = (id) => {
  return api.remove(url.GROUP.BASE + `/${id}`);
};

export const addMember = (id, data) => {
  return api.post(url.GROUP.BASE + `/${id}`, data);
};

export const removeMember = (groupId, id) => {
  return api.post(url.GROUP.REMOVE + `/${groupId}/${id}`);
};

export const leaveGroup = () => {
  return api.patch(url.GROUP.SWITCH + "/");
};

export const userLeaveGroup = (id) => {
  return api.post(url.GROUP.LEAVE + `/${id}`);
};

export const changePermission = (groupId, data) => {
  return api.patch(url.GROUP.BASE + `/${groupId}/permission`, data);
};

// notification

export const deviceToken = (data) => {
  return api.post(url.NOTIFICATION.DEVICE_TOKEN, data);
};

export const customNotification = (data) => {
  return api.post(url.NOTIFICATION.CUSTOM, data);
};

// payee

export const createPayee = (data) => {
  return api.post(url.PAYEE.BASE, data);
};

export const getAllPayee = () => {
  return api.get(url.PAYEE.BASE);
};

export const updatePayee = (id, data) => {
  return api.patch(url.PAYEE.BASE + `/${id}`, data);
};

export const deleteMultiplePayee = (ids) => {
  return api.remove(url.PAYEE.BASE, ids);
};

// Stripe

export const createStripeSession = (data) => {
  return api.post(url.STRIPE.SESSION, data);
};

export const getSubscription = (id) => {
  return api.get(`${url.STRIPE.SUBSCRIPTION}/${id}`);
};

export const cancelSubscription = (data) => {
  return api.remove(url.STRIPE.SUBSCRIPTION, data);
};

export const upgradeSubscription = (data) => {
  return api.patch(url.STRIPE.SUBSCRIPTION_PLAN, data);
};

// Planned

export const createPlanned = (data) => {
  return api.post(url.PLANNED.BASE, data);
};

export const getPlanned = () => {
  return api.get(url.PLANNED.BASE);
};

export const getPlannedByFilter = (data) => {
  return api.post(url.PLANNED.BASE + "/get", data);
};

export const updatePlanned = (id, data) => {
  return api.patch(url.PLANNED.BASE + `/${id}`, data);
};

export const deletePlanned = (id) => {
  return api.remove(url.PLANNED.BASE + `/${id}`);
};

// Payment

export const getAllPaymentPlanned = (id, page = 1) => {
  return api.get(`${url.PAYMENT.PAYEMNT_PLANNED}/${id}`, { page });
};

export const updatePayment = (id, data) => {
  return api.patch(`${url.PAYMENT.BASE}/${id}`, data);
};

export const deletePayment = (id) => {
  return api.remove(`${url.PAYMENT.BASE}/${id}`);
};

// Budget

export const createBudget = (data) => {
  return api.post(url.BUDGET.BASE, data);
};

export const getBudget = (data = {}) => {
  return api.post(url.BUDGET.GET_ALL, data);
};

export const deleteBudget = (id) => {
  return api.remove(`${url.BUDGET.BASE}/${id}`);
};

export const updateBudget = (id, data) => {
  return api.patch(`${url.BUDGET.BASE}/${id}`, data);
};

export const getBudgetDetails = (id) => {
  return api.get(`${url.BUDGET.BASE}/${id}`);
};

export const getBudgetTransaction = (id, data) => {
  return api.post(`${url.BUDGET.BASE}/${id}/get-transactions`, data);
};

export const addNewHeadCatgory = (id, value) => {
  return api.post(`${url.BUDGET.BASE}/${id}/head-category`, value);
};

export const addNewSubCatgory = (headId, id, value) => {
  return api.post(
    `${url.BUDGET.BASE}/${id}/head-category/${headId}/add-category`,
    value
  );
};

export const rolloverStatus = (id, data) => {
  return api.patch(`${url.BUDGET.BASE}/${id}/rollover`, data);
};

// template

export const createTemplate = (data) => {
  return api.post(url.TEMPLATE.BASE, data);
};

export const getTemplate = () => {
  return api.get(url.TEMPLATE.BASE);
};

export const deleteTemplate = (id) => {
  return api.remove(url.TEMPLATE.BASE + `/${id}`);
};

export const editTemplate = (id, data) => {
  return api.patch(url.TEMPLATE.BASE + `/${id}`, data);
};

// promo code

export const applyPromoCode = (data) => {
  return api.post(url.PROMO_CODE.APPLY, data);
};

export const generatePromoCode = (data) => {
  return api.post(url.PROMO_CODE.GENERATE, data);
};

export const getPromoCode = (data) => {
  return api.get(url.PROMO_CODE.BASE, data);
};

export const deletePromoCode = (data) => {
  return api.remove(url.PROMO_CODE.BASE, data);
};
