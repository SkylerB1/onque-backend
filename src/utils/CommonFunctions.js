const areMimeTypesEqual = (files) => {
  if (files?.length === 0) {
    return false;
  }

  const firstMimeType = files[0].mimetype;

  for (let i = 1; i < files?.length; i++) {
    if (files[i].mimetype !== firstMimeType) {
      return false;
    }
  }

  return true;
};

module.exports = {
  areMimeTypesEqual,
};
