const Router = require("express").Router;
const Message = require("../models/message");
const ExpressError = require("../expressError");
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");
const router = new Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
    try {
        let result = await Message.get(id);
        if (result.from_user.username === req.user.username || result.to_user.username === req.user.username){
            return res.json({message: result})
        }
        throw new ExpressError(`Unauthorized to view message: ${id}`, 404);
    } catch(e) {
        return next(e);
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async (req, res, next) => {
    try {
        let {to_username, body} = req.body;
        let result = await Message.create(req.user.username, to_username, body);
        return res.json({message:result})
    } catch(e) {
        return next(e);
    }   
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async (req, res, next) => {
    try {
        let result = await Message.get(id);
        if (result.to_user.username === req.user.username){
            return res.json({message: result})
        }
        throw new ExpressError(`Unauthorized to read message: ${id}`, 404);
    } catch(e) {
        return next(e);
    }
});

module.exports = router;