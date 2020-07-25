
/*
 * All routes for Menu are defined here
 * Since this file is loaded in server.js into /menu,
 *   these routes are mounted onto /menu
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    db.query(`SELECT * FROM menu;`)
      .then(data => {
        const menu = data.rows[0];
        // res.json({ menu }); // returning a promise with the menu as object
        res.render('index',{ menu })
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};
