import React, { Component } from 'react'

export default class Coperation extends Component {
    constructor(props) {
        super(props)
        this.state = {
            sheets: 0,
            result_round: 0,
            result_sheet: 0,
            round: 0
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit_round = this.handleSubmit_round.bind(this);
        this.handleSubmit_sheet = this.handleSubmit_sheet.bind(this);
    }
    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }
    handleSubmit_round(event) {
        event.preventDefault();
        if (this.state.round > 45) {
            let result = 72 + parseInt((this.state.round - 45) / 2) * 8 + (this.state.round - 45) % 2 * 2
            this.setState({
                result_round: result
            })
        }
        else {
            let all = parseInt(this.state.round / 5) * 8
            let mod = (this.state.round % 5)
            if (mod == 1) {
                all += 1
            }
            else if (mod == 2) {
                all += 2
            }
            else if (mod == 3) {
                all += 4
            }
            else if (mod == 4) {
                all += 5
            }
            this.setState({
                result_round: all
            })
        }
    }
    getFiveState = (num) => {
        let level = 0
        switch(num){
            case 0:
                level = 0
                break;
            case 1:
                level = 1
                break;
            case 2:
                level = 2
                break;
            case 3:
            case 4:
                level = 3
                break;
            case 5:
                level = 4
                break;
            default:
                level = 5
                break;
        }
        return level
    }
    handleSubmit_sheet(event) {
        event.preventDefault();
        if (this.state.sheets >= 72) {
            let result = Math.ceil((this.state.sheets - 72) / 4) + 45
            this.setState({
                result_sheet: result
            })
        }
        else {
            let result = parseInt(this.state.sheets / 8) * 5 + this.getFiveState(this.state.sheets % 8)
            this.setState({
                result_sheet: result
            })
        }
    }
    render() {
        const { result_round, result_sheet, sheets, round } = this.state
        return (
            <div>
                <h4>請輸入回合數</h4>
                <form onSubmit={this.handleSubmit_round}>
                    <input type="number" name="round" value={round} onChange={this.handleChange} />
                    <button>submit</button>
                </form>
                <h4>你會獲得{result_round}張</h4>
                <h4>請輸入目標張數</h4>
                <form onSubmit={this.handleSubmit_sheet}>
                    <input type="number" name="sheets" value={sheets} onChange={this.handleChange} />
                    <button>submit</button>
                </form>
                <h4>你會需要打到{result_sheet}回合</h4>
            </div>
        )
    }
}
