//key can be anything but the value has to be the key specified in the ar.json and en.json file in i18n folder

export enum ResponseMessage {
  SERVER_ERROR = 'messages_server_error',
  NOT_FOUND = 'messages_item_not_found',
  BAD_REQUEST = 'messages_bad_request',
  USER_NOT_FOUND = 'user_not_found',
  USER_UNAUTHORIZED = 'messages_unauthorized',
  VALIDATION_ERROR = 'messages_validation_error',
  EMAIL_ALREADY_EXISTS = 'email_exists',
  OTP_NOT_FOUND = 'messages_otp_not_found',
  USER_REGISTERED = 'user_registered',
  ChECK_ORDER_PRODUCTS = 'check_order_products',
  ORDER_CREATED = 'order_created',
  GET_ZID_BRANCH_ERROR = 'get_zid_branch_error',
}
