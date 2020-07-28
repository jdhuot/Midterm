


const express = require('express');
const router  = express.Router();

const accountSid = process.env.DB_ACCOUNTSID;
const authToken = process.env.DB_AUTHTOKEN;



const client = require('twilio')(accountSid, authToken);



module.exports = (db) => {
  router.post("/", (req, res) => {
    let orderItems = [];
    let specialInstructions = req.body['special-instructions'];
    let orderPhone = req.body['customer-phone'];
    let orderName = req.body['customer-name'];
    let orderTotal = req.body['order-total'];

    for (let [key,value] of Object.entries(req.body)) {
      if (value) {
        if (key !== 'customer-name' && key !== 'customer-phone' && key !== 'special-instructions' && key !== 'order-total') {
        orderItems.push([key,value])
        }
      }
    }



    //put name, phone, total into orders table

    let tempData;

    db.query(`INSERT INTO orders (user_name, user_phone, total, status) VALUES ('${orderName}', ${orderPhone}, ${orderTotal}, 'pending') RETURNING *`)
    .then((data) => {
      for (let menuItem of orderItems) {
        tempData = data.rows[0];
          db.query(`INSERT INTO order_details (menu_id, order_id, qty) VALUES ((SELECT id FROM menu WHERE item_name = '${menuItem[0]}'), ${data.rows[0].id}, ${menuItem[1]})`);
      }
      res.redirect('/menu');
    })
    .then((data) => {
      db.query(`SELECT * FROM orders JOIN order_details ON orders.id = order_id JOIN menu ON menu_id = menu.id WHERE order_id = ${tempData.id}`)
      .then((data) => {
        console.log('data2.rows = ', data.rows);
        let orderBreakdown = `New order from ${data.rows[0].user_name}, who ordered `;
        for (let orderItem of data.rows) {
          orderBreakdown += `${orderItem.item_name} x ${orderItem.qty} `;
        }
        orderBreakdown += `Contact number is: ${orderPhone}`;
        if (specialInstructions) {
          orderBreakdown += ` Note from customer: ${specialInstructions}`;
        }
        orderBreakdown += ` Please confirm pickup time in minutes`;

        client.messages.create({
          to: '+17789298779',
          from: '+15879068570',
          body: orderBreakdown
        });

      })
    })
    .catch((err) => {
      console.log(err);
    })

  });
  return router;
};
