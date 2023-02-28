const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();



/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/**
 * This endpoint return the rate of USD and EUR against ETH. If user already set own rate values, return these.
 * If this is the first access for the user, fetch the initial market rate from 3rd party(coingecko in our case) API and return these.
 *
 * @returns {number} usd - usd rate
 * @returns {number} eur - eur rate
 * @returns {number} initialized - false if user first access to our site and do not have any session ID in their cookies of browser. True if user has sessionId in his browser cookies.
 */
router.get('/getRates', async function(req, res, next) {

    console.log("session id: ", req.session.id);
    console.log("initialized: ", req.session.initialized);
    const sessionIdFromCookie = req.cookies['connect.sid'];
    console.log("sessionId from Cookie: ", sessionIdFromCookie);

    if(req.session.initialized===undefined){
        console.log("set up the rate");
        req.session.initialized = true;
        let rates = await initiateRate();
        req.session.usd = rates.usd;
        req.session.eur = rates.eur;
        res.json({
            'usd' : req.session.usd,
            'eur' : req.session.eur,
            'initialized' : false
        });
        return;
    }

    let usd = req.session.usd;
    let eur = req.session.eur;
    console.log('usd: ', usd);
    console.log('eur: ', eur);
    res.json({
        'usd' : usd,
        'eur' : eur,
        'initialized' : true
    });

});

async function initiateRate(){

    let usd, eur;
    await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
        .then(response => {
            usd = response.data.ethereum.usd;
        })
        .catch(error => {
            console.error(error);
        });

    // Fetch ETH/EUR price from API
    await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur')
        .then(response => {
            eur = response.data.ethereum.eur;
        })
        .catch(error => {
            console.error(error);
        });

    return {
        "usd": usd,
        "eur": eur
    }

}


/**
 * This endpoint updates the rate of given currency/ETH pair
 * @param {string} rate - updated rate
 * @param {string} currency - updated currency
 * @returns {number} usd - usd rate after updated
 * @returns {number} eur - eur rate after updated
 * @returns {number} status - return 1 if API was properly processed, otherwise 0.
 */
router.get('/updateRate', async function(req, res, next) {

    const currency = req.query.currency;
    const rate = req.query.rate;
    let result = false;

    if(!(["USD", "EUR"].includes(currency)) ){
        let response = {
            'status': 0,
            'msg': "currency is not supported: "+currency
        }
        return res.json(response);
    } else if (rate === undefined) { //TODO format check is needed
        let response = {
            'status': 0,
            'msg': "rate is missing"
        }
        return res.json(response);
    }

    if (req.cookies['connect.sid'] === undefined || req.session.initialized !== true){
        //finish with error message. no cookies information is sent
        return　res.status(500).json({
            status: 0,
            msg: "cookie and session id is not initialized properly"
        });
    }

    if (currency === "USD"){
        req.session.usd = rate;
    } else if(currency === "EUR") {
        req.session.eur = rate;
    }

    res.json({
        'status' : 1,
        'usd' : req.session.usd,
        'eur' : req.session.eur,
        'initialized' : true
    });


});


/**
 * This endpoint return the balance of given address with given currency unit
 * @param {string} address - address to check
 * @param {string} currency - currency
 * @returns {number} ethAmount - eth balance amount of given address
 * @returns {number} currencyAmount - given fiat currency balance amount of given address
 * @returns {number} status - return 1 if API was properly processed, otherwise 0.
 */
router.get('/getBalance', async function(req, res, next) {

    let currency = req.query.currency;
    const address = req.query.address;
    let rate = 0;
    let ethAmount = 0;
    let currencyAmount = 0;
    if(!(["USD", "EUR"].includes(currency)) ){
        let response = {
            'status': 0,
            'msg': "currency is not supported: "+currency
        }
        return res.json(response);
    } else if (address === undefined) {//TODO address format check is needed
        let response = {
            'status': 0,
            'msg': "address is missing"
        }
        return res.json(response);
    }

    if (req.cookies['connect.sid'] === undefined || req.session.initialized !== true){
        req.session.initialized = true;
        let rates = await initiateRate();
        req.session.usd = rates.usd;
        req.session.eur = rates.eur;

    }

    if (currency === "USD"){
        rate = req.session.usd;
    } else if(currency === "EUR") {
        rate = req.session.eur;
    }

    await axios.get(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.ETHERSCAN_API_KEY}`)
        .then(response => {
            // Convert balance from wei to ETH
            ethAmount = Number(response.data.result) / 10 ** 18;
        })
        .catch(error => {
            console.error(error);
        });

    currencyAmount = (ethAmount * rate).toFixed(2);

    let response = {
        'status': 1,
        'ethAmount': ethAmount,
        'currencyAmount': currencyAmount
    }
    return res.json(response);


});



/**
 * This endpoint check if the latest transaction of given address is older than one year ago
 * @param {string} address - address to check
 * @returns {boolean} result - return true only if the latest transaction of given address is older than one year ago. If no transaction, return false.
 * @returns {number} status - return 1 if API was properly processed, otherwise 0.
 */
router.get('/checkOldWallet', async function(req, res, next) {

    const walletAddress = req.query.address;
    let result = false;
    let status = 0;
    console.log(walletAddress);
    if(walletAddress === undefined){ //TODO address format check is needed
        let response = {
            'status': 0,
            'result': result,
            'msg': 'Address is missing'
        }
        return res.json(response);
    }

    let txlist = await axios.get(`https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&page=1&offset=3&sort=desc&APIKey=${process.env.ETHERSCAN_API_KEY}`)
    console.log('response.data.status', txlist.data.status);
    if(txlist.data.status === "0"){
        //TODO complete new account address having 0 transaction also categorized here and considered as wrong input.
        console.log(txlist.data);
        let response = {
            'status': 0,
            'result': result,
            'msg': 'No Transaction is found'
        }
        return res.json(response);
    }
    console.log('response.data.result[0] ', txlist.data.result[0]);
    result = isOverOneYear(txlist.data.result[0].timeStamp);
    console.log(`Log result:  ${result}`)

    let response = {
        'status': 1,
        'result': result,
        'msg': 'Success'
    }
    res.json(response);


});

/**
 * Judge if given timestamp is older than one year ago from current time.
 * @param timestamp
 * @returns {boolean}
 */
function isOverOneYear(timestamp) {
    // Get the current timestamp
    const now = Date.now() /1000;

    // Get the timestamp for one year ago
    const oneYearAgo = now - (365 * 24 * 60 * 60);
    console.log(timestamp);
    console.log(oneYearAgo);

    // Compare the given timestamp to the one year ago timestamp
    if (timestamp >= oneYearAgo && timestamp <= now) {
        return false;
    } else {
        return true;
    }
}


module.exports = router;
