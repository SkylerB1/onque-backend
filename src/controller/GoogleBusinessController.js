const {
  GetBusinessLocations,
  SetBusinessLocation,
} = require("../utils/google-business/GoogleBusinessUtil");

const GetLocations = async (req, res) => {
  const { id } = req.user;
  const { brandId } = req.query;
  try {
    const response = await GetBusinessLocations(id, brandId);
    if (response.success) {
      res.status(200).json(response.data);
    } else {
      res.status(400).json({ msg: response.data });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: err });
  }
};

const ConnectLocation = async (req, res) => {
  const { id } = req.user;
  const data = req.body;
  const { brandId } = req.query;

  try {
    const response = await SetBusinessLocation(id, data, brandId);
    if (response.success) {
      res.status(200).json(response.data);
    } else {
      res.status(400).json({ msg: response.data });
    }
  } catch (err) {
    res.status(400).json({ msg: err });
  }
};

module.exports = { GetLocations, ConnectLocation };
