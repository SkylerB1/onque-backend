const { YoutubeCategories } = require("../utils/youtube/YoutubeUtils");

const getCategories = async (req, res) => {
  const { id } = req.user;
  try {
    const response = await YoutubeCategories(id);
    if (response.success) {
      res.status(200).json(response.data);
    } else {
      res.status(400).json({ msg: response.data });
    }
  } catch (err) {
    res.status(400).json({ msg: err });
  }
};

module.exports = { getCategories };
