/* This file contains all the necessary codes required for form validation */

// helper function to determine that a field is not empty.
const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};

// helper function to limit length of username string.
const tooLong = (string) => {
  if (string.length > 20) return true;
  else return false;
};

// helper function to limit length of shrine name string
const shrineTooLong = (string) => {
  if (string.length > 30) return true;
  else return false;
};

// helper function to check for a valid email using regex
const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

// helper function to check for special characters
const specialChar = (string) => {
  // eslint-disable-next-line no-useless-escape
  const regEx = /\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\+|\=|\[|\{|\]|\}|\||\\|\'|\<|\,|\.|\>|\?|\/|""|\;|\:|\s/;
  if (string.match(regEx)) return true;
  else return false;
};

// validation of the signup data
exports.validateSignupData = (data) => {
  let errors = {};

  // check if the field is empty and the email is a valid one.
  if (isEmpty(data.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(data.email)) {
    errors.email = "Oops look again, valid email required";
  }

  // check that passwords are not empty and must match
  if (isEmpty(data.password)) errors.password = "Must not be empty";
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (isEmpty(data.username)) errors.username = "Must not be empty";
  if (tooLong(data.username))
    errors.username =
      "Naaaa, think again! not more than 20 characters required";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

// validation for edited shrine details
exports.validateEditedShrineData = (data) => {
  let errors = {};

  // check if field is empty
  if (isEmpty(data.name)) {
    errors.shrineName = "Must not be empty";
  }

  // check for white spaces and special characters in shrine name
  if (!isEmpty(data.name) && specialChar(data.name)) {
    errors.shrineName = "No special characters and spaces are allowed !";
  }

  // check if shrine name is more than 30 characters
  if (!isEmpty(data.name) && shrineTooLong(data.name)) {
    errors.shrineName = "Not more than 30 characters required!";
  }

  if (isEmpty(data.description)) {
    errors.description = "Please fill in a description for your shrine";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

// validation for edited post details
exports.validateEditedPostData = (data) => {
  let errors = {};

  // check if field is empty
  if (isEmpty(data.title)) {
    errors.title = "Must not be empty, please fill in a title for your post";
  }

  if (isEmpty(data.body)) {
    errors.body = "Must not be empty, please put content for your post";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

// validation for new shrine data
exports.validateNewShrineData = (data) => {
  let errors = {};

  // check if the field is empty
  if (isEmpty(data.categoryName)) {
    errors.categoryName = "Please pick a category for your shrine";
  }
  if (isEmpty(data.name)) {
    errors.shrineName = "Must not be empty";
  }

  // check is shrine name is more than 30 characters
  if (!isEmpty(data.name) && shrineTooLong(data.name)) {
    errors.shrineName = "Not more than 30 characters required!";
  }

  // check if description is empty
  if (isEmpty(data.description)) {
    errors.description = "Please fill in a description for your shrine";
  }

  // check fro white spaces and special characters in shrine name
  if (!isEmpty(data.name) && specialChar(data.name)) {
    errors.shrineName = "No special characters and spaces are allowed !";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

// validation for the login data
exports.validateLoginData = (data) => {
  let errors = {};

  // check that email and password fields are  not empty
  if (isEmpty(data.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(data.email)) {
    errors.email = "Oops look again, valid email required";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

// validation for update user profile data
exports.validateUserProfileData = (data) => {
  let errors = {};

  // check that username and email fields are not empty
  if (isEmpty(data.email)) {
    error.email = "Must not be empty, Email required";
  } else if (!isEmail(data.email)) {
    errors.email =
      "Hold on!! That looks like an address from space, enter valid email";
  } else if (isEmpty(data.username)) {
    errors.username = "Must not be empty, username required";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

// validation to ensure that there are no white spaces in the user details
exports.reduceUserDetails = (data) => {
  let userDetails = {};

  userDetails.about = data.about;
  userDetails.displayName = data.displayName;

  return userDetails;
};
