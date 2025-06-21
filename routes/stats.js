var express = require('express');
var router = express.Router();
const authenticate = require('../middleware/authenticate')

const stats_controller = require("../controllers/statsController");
/* GET stats */

router.get("/", authenticate, stats_controller.stats_list);

module.exports = router;
