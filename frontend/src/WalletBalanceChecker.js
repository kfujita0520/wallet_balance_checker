import React from 'react';
import axios from 'axios';
import './walletBalance.css';


class RateEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditing: false,
            editedRate: this.props.ethRate,
            currency: this.props.currency,
        };
        console.log("props.rate", this.state.editedRate);
        console.log("props.currency", this.state.currency);

        //this.handleCheckBalanceClick = this.handleCheckBalanceClick.bind(this);
    }

    handleEditClick(event) {
        this.setState({ isEditing: true });
    };

    // handleEditClick = () => {
    //     this.setState({ isEditing: true });
    // };

    handleSaveClick(event) {
        console.log(`New text: ${this.state.editedRate}`);
        this.setState({ isEditing: false });
        this.props.updateRate(this.state.currency, this.state.editedRate);
    };

    handleCancelClick() {
        // Discard the edited text
        this.setState({ editedRate: this.props.ethRate, isEditing: false });
    };

    handleEditedTextChange(event) {
        this.setState({ editedRate: event.target.value });
    };

    showRateInfo() {
        return (
            <p>Rate: {this.state.editedRate} {this.state.currency}/ETH</p>
        );
    }

    render() {
        const { isEditing } = this.state;

        if (isEditing) {
            return (
                <div>
                    <input type="text" value={this.state.editedRate} onChange={ (e) => { this.handleEditedTextChange(e) }} />
                    <button onClick={(e)=>{this.handleSaveClick(e)}}>Save</button>
                    <button onClick={()=>this.handleCancelClick()}>Cancel</button>
                </div>
            );
        } else {
            return (
                <div>
                    {this.showRateInfo()}
                    <button onClick={(e)=>{this.handleEditClick(e)}}>Edit</button>
                </div>
            );
        }
    }

}


class WalletBalanceChecker extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currency: 'USD',
            ethUsdPrice: '',
            ethEurPrice: '',
            ethBalance: '0.00',
            walletAddress: '',
            isOld: false,
        };

        // this.handleWalletAddressChange = this.handleWalletAddressChange.bind(this);
        // this.handleCheckBalanceClick = this.handleCheckBalanceClick.bind(this);
    }

    async componentDidMount() {
        // Fetch ETH/USD price from API
        await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
            .then(response => {
                this.setState({ ethUsdPrice: response.data.ethereum.usd });
            })
            .catch(error => {
                console.error(error);
            });

        // Fetch ETH/EUR price from API
        await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur')
            .then(response => {
                this.setState({ ethEurPrice: response.data.ethereum.eur });
            })
            .catch(error => {
                console.error(error);
            });

    }

    handleWalletAddressChange(event) {
        this.setState({ walletAddress: event.target.value });
    }

    handleCheckBalanceClick() {
        // Fetch ETH balance of specified wallet address from API
        axios.get(`https://api.etherscan.io/api?module=account&action=balance&address=${this.state.walletAddress}&tag=latest&apikey=YourApiKeyToken`)
            .then(response => {
                // Convert balance from wei to ETH
                const ethBalance = Number(response.data.result) / 10 ** 18;
                this.setState({ ethBalance });
            })
            .catch(error => {
                console.error(error);
            });

        // Fetch ETH/EUR price from API
        axios.get(`https://api.etherscan.io/api?module=account&action=txlist&address=${this.state.walletAddress}&startblock=0&page=1&offset=3&sort=desc&APIKey=NSZCD6S4TKVWRS13PMQFMVTNP6H7NAGHUY`)
            .then(response => {
                console.log(response.data.result[0]);
                console.log(this.isOverOneYearOld(response.data.result[0].timeStamp));
                this.setState({ isOld: this.isOverOneYearOld(response.data.result[0].timeStamp) });
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleCurrencyChange(event) {
        this.setState({currency: event.target.value});
    }

    updateRate(currency, rate) {
        console.log('currency', currency);
        console.log('rate', rate);
        if(currency === "USD"){
            this.setState({ethUsdPrice: rate});
        } else if(currency === "EUR") {
            this.setState({ethEurPrice: rate});
        }

    }

    isOverOneYearOld(timestamp) {
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


    showETHBalance() {
        if (this.state.currency === "USD"){
            return (this.state.ethBalance * this.state.ethUsdPrice).toFixed(2) + " USD";
        } else if (this.state.currency === "EUR") {
            return (this.state.ethBalance * this.state.ethEurPrice).toFixed(2) + " EUR";
        }
    }

    renderRateEditor() {
        let rate = "";
        if(this.state.currency === "USD") {
            rate = this.state.ethUsdPrice;
        } else if (this.state.currency === "EUR") {
            rate = this.state.ethEurPrice;
        }
        return <RateEditor ethRate={rate} currency = {this.state.currency} updateRate={(currency, rate) => this.updateRate(currency, rate)}/>
    }

    render() {

        return (
            <div>
                <h1>ETH Prices and Balance Checker</h1>

                <div className="blueBoxStyle">
                    <label>
                        Currency:{' '}
                        <select value={this.state.currency} onChange={e => this.handleCurrencyChange(e)}>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </label>
                    {/*<p>ETH/USD price: {this.state.ethUsdPrice} USD</p>*/}
                    {/*<p>ETH/EUR price: {this.state.ethEurPrice} EUR</p>*/}
                    {/*<p>---------------------------------</p>*/}
                    {/*should wait till RateEditor constructor has been populated with rate data being fetched through API*/}
                    { this.state.ethUsdPrice !== "" && this.state.currency === "USD" && this.renderRateEditor() }
                    { this.state.ethEurPrice !== "" && this.state.currency === "EUR" && this.renderRateEditor() }
                </div>
                <div className="blueBoxStyle">
                    <label>Wallet address: </label>
                    <input type="text" value={this.state.walletAddress} onChange={e => this.handleWalletAddressChange(e)}/>
                    <button onClick={() => this.handleCheckBalanceClick()}>Check balance</button>
                    { this.state.isOld ?
                        <p className="warningMessage"> this is old wallet</p> : ""
                    }
                    <p>ETH balance: {this.state.ethBalance} ETH</p>
                    <p>ETH balance: {this.showETHBalance()}</p>

                </div>
            </div>
        );
    }
}

export default WalletBalanceChecker;


