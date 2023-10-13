const fs = require("fs");
const baseUrl = "https://api.jjmedia.appwrk.com:8080/files/";

const upload = async (req, res) => {
    try {
        if (req.file !== undefined) {
            res.status(200).send({
                file: req.file.originalname,
                message: "Uploaded the file successfully: " + req.files.originalname,
            });
        }

    } catch (err) {
        if (err.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: "File size cannot be larger than 2MB!",
            });
        }

        res.status(500).send({
            message: `Could not upload the file: ${req.file.originalname}. ${err}`,
        });
    }
};

const getListFiles = (req, res) => {
    const directoryPath = _basedir + "/assets/";

    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            res.status(500).send({
                message: "Unable to scan file",
            });
        } else {
            let fileInfos = [];
            files.forEach((file) => {
                fileInfos.push({
                    name: file,
                    url: baseUrl + file,
                });
            });
            res.status(200).send(fileInfos);

        }
    });
};

const download = (req, res) => {
    const fileName = req.params.name;
    const directoryPath = _basedir + "/assets/";

    res.download(directoryPath + fileName, fileName, (err) => {
        if (err) {
            res.status(500).send({
                message: "Could not download the file. " + err,
            });
        }
    });
};

module.exports = {
    upload,
    getListFiles,
    download,
};