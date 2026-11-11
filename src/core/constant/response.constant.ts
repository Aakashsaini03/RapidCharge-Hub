export const TOKEN_EXPIRED = 'Token is expired';
export const AUTHORIZATION_TOKEN_REQUIRED = 'Authorization Token Required';
export const VALID_TOKEN = 'Valid token';
export const SUCCESS = 'SUCCESS';
export const PASSWORD_UPDATE_SUCCESS = 'Password Reset Successfully';
export const INCORRECT_PASSWORD = 'Old password is incorrect';
export const SAME_OLD_AND_NEW_PASSWORD = 'Old and new password exactly match!';
export const USER_ALLREADY_EXIST='Email already exists.';
export const INVALID_USER='Invalid credentials.';
export const USER_BLACKLIST='User is Blacklisted';
export const PASSWORD_MISMATCH='Invalid credentials.';
export const INCORRECT_EMAIL_OR_PASSWORD='Invalid Credentials'
export const ACCOUNT_LOCKED_MESSAGE = (minutes: number): string =>
  `Account locked due to too many failed attempts. Try again in ${minutes} minutes.`;