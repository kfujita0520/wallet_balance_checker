# Wallet balance checker

## 1. System Overview
The web system has the following functions.
- Check specified address if it is old or not based on the latest transaction date.
- Show the balance of specified address with ETH and fiat(USD, EUR) unit. 
- Show and Edit the fiat (USD/EUR) rate applying to balance conversion above.

The demo app can be seen on following playground.
(Note: this is built for demo purpose only. All functions are monolithically implemented on React frontend layer.)
https://kpvv7v.csb.app/

## 2. Architecture Overview
The system is composed of the frontend web module by ReactJS and backend API service by expressJS. 
### 1) Frontend
Developed with react framework under "frontend" folder.  
WalletBalanceChecker component is the main class, while RateEditor component takes care of USD/ETH, EUR/ETH rate editing.
#### Set up
Execute following commands under "frontend" folder
- npm install
- npx start

you will be able to access the app on http://localhost:3000/ 

### 2) Backend
For the simple application, edited rate information by each user will be stored in server memory, which is typically the session.
We use express-session with memoryStore module for this purpose.   
The session id for cookie will be issued when user first access the site and the lifetime of cookies is "session", the lifetime of browser. 
The lifetime of session on server will be set in initial configuration which is 24 hours for now. 

#### Set up
Execute following commands under "backend" folder
- npm install
- node app.js

the endpoint URL will be http://localhost:4000/

## 3. TODO
- Add code(method) explanation on backend API
- perform pretty format into the code 
- improve validation for each API.
- remove debug code such as console.log
