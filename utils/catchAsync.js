//a wrapper for an async function to cathc errors
// and pass them to next
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}