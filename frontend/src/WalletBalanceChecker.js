import React from 'react';
import axios from 'axios';
import './walletBalance.css';

const apiHost = process.env.REACT_APP_API_HOST;

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

    async handleSaveClick(event) {
        console.log(`New text: ${this.state.editedRate}`);
        this.setState({ isEditing: false });
        this.props.updateRate(this.state.currency, this.state.editedRate);
        await axios.get(`${apiHost}/updateRate?currency=${this.state.currency}&rate=${this.state.editedRate}`);
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
        console.log("test componentDidMount", apiHost);
        let rates = await axios.get(`${apiHost}/getRates`);
        console.log('rates: ', rates.data.usd);
        this.setState({ ethUsdPrice: rates.data.usd, ethEurPrice: rates.data.eur });


    }

    handleWalletAddressChange(event) {
        this.setState({ walletAddress: event.target.value });
    }

    handleCheckBalanceClick() {
        // Fetch ETH balance of specified wallet address from API
        axios.get(`${apiHost}/getBalance?currency=${this.state.currency}&address=${this.state.walletAddress}`)
            .then(response => {
                // Convert balance from wei to ETH
                //const ethBalance = Number(response.data.result) / 10 ** 18;
                const ethBalance = response.data.ethAmount;
                this.setState({ ethBalance });
            })
            .catch(error => {
                console.error(error);
            });

        // Check if the wallet is old
        axios.get(`${apiHost}/checkOldWallet?address=${this.state.walletAddress}`)
            .then(response => {
                this.setState({ isOld: response.data.result });
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


