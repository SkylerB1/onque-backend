var ValidationSource = {
    BODY: 'body',
    HEADER: 'headers',
    QUERY: 'query',
    PARAM: 'params',
}


var validator = (schema, source) => (
    req,
    res,
    next,
) => {
    try {
        const { error } = schema.validate(req[source]);
        if (!error) return next();
        const { details } = error;
        const message = details.map((i) => i.message.replace(/['"]+/g, '')).join(',');
        res.status(400).json({
            message: message,
        })
        // next();

    } catch (error) {
        next(error);
    }
}

module.exports = { validator, ValidationSource }