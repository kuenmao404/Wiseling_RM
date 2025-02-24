import React, { Component } from 'react'
// import '../../styles/Randomdice.styl'
// import en108 from '../../img/en108.png'

export class RandomDice extends Component {
    constructor(props) {
        super(props)
        this.state = {
            result_round: 0,
            result_sheets: 0,
            challenge: 0
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit_round = this.handleSubmit_round.bind(this);
        this.handleSubmit_sheet = this.handleSubmit_sheet.bind(this);
    }
    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        switch (name) {
            case "result_round":
                this.handleSubmit_round(value)
                break
            case "result_sheets":
                this.handleSubmit_sheet(value)
                break
        }
    }
    handleSubmit_round(num) {
        if (num > 45) {
            let result = 72 + parseInt((num - 45) / 2) * 8 + (num - 45) % 2 * 2
            this.setState({
                result_round: result
            })
        }
        else {
            let all = parseInt(num / 5) * 8
            let mod = (num % 5)
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
        switch (num) {
            case 0:
                break
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
    getOddEven = (num) => {
        let isOdd = false;
        switch (num % 8) {
            case (1):
                isOdd = true;
                break;
            case (2):
                isOdd = true;
                break;
            default:
                break;
        }
        return isOdd;
    }


    fillSheet(){ // 補齊 1.5倍的

    }

    // Math.ceil(x / 2) * 2 + parseInt(x / 2) * 6 = y
    handleSubmit_sheet(num) {
        if (num >= 72) {
            let isOdd = this.getOddEven(num - 72);
            let result, challenge;
            if (isOdd) { //奇
                result = Math.ceil(((num - 72) + 2) / 4) + 45;
            }
            else { //偶
                result = parseInt((num - 72) / 4) + 45 + (parseInt(num - 72) % 8 == 0 ? 0 : parseInt(parseInt(num - 72) / 4) % 2 == 0 ? 2 : 1);
            }
            let cisOdd = this.getOddEven(parseInt(num / 1.5) - 72);
            if (isOdd) { //奇
                challenge = Math.ceil(((num / 1.5 - 72) + 2) / 4) + 45;
            }
            else { //偶
                challenge = parseInt((num / 1.5 - 72) / 4) + 45 + (parseInt(num / 1.5 - 72) % 8 == 0 ? 0 : parseInt(parseInt(num / 1.5 - 72) / 4) % 2 == 0 ? 2 : 1);
            }
            this.setState({
                result_sheets: result,
                challenge
            })
        }
        else {
            
            let result = parseInt(num / 8) * 5 + this.getFiveState(num % 8)

            let challenge = parseInt(Math.ceil(num / 1.5)  / 8) * 5 + this.getFiveState(Math.ceil(num / 1.5) % 8)
            console.log(num, result, challenge)
            this.setState({
                result_sheets: result,
                challenge
            })
        }
    }

    focus = (e) => {
        e.target.value = ''
        const name = e.target.name;
        this.setState({
            [name]: 0
        })
    }

    separator = (numb) => {
        var str = numb.toString().split(".");
        str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return str.join(".");
    }

    render() {
        const { result_round, result_sheets, challenge } = this.state
        return (
            <div className='randomdice flex-1-1'>
                <div className='randomdice-container'>
                    <h2 className='randomdice-h2'>請輸入回合數</h2>
                    <input className='randomdice-input' autoFocus type="number" min="0" name="result_round" onChange={this.handleChange} onFocus={this.focus} />
                    <h4 className={`randomdice-result ${result_round > 0 ? 'randomdice-result-appear' : ''}`}>你會獲得 <span className='randomdice-num'>{this.separator(result_round)}</span> 張</h4>
                    <h4 className={`randomdice-result ${result_round > 0 ? 'randomdice-result-appear' : ''}`}>
                        挑戰模式 <span className='randomdice-num'>{this.separator(result_round)}</span> + <span className='randomdice-num'>{this.separator(parseInt(result_round * 0.5))}</span> = <span className='randomdice-num'>{this.separator(parseInt(result_round * 1.5))}</span> 張</h4>
                </div>
                <div className='randomdice-container'>
                    <h2 className='randomdice-h2'>請輸入目標張數</h2>
                    <input className='randomdice-input' type="number" min="0" name="result_sheets" onChange={this.handleChange} onFocus={this.focus} />
                    <h4 className={`randomdice-result ${result_sheets > 0 ? 'randomdice-result-appear' : ''}`} >
                        你需要打到 <span className='randomdice-num'>{this.separator(result_sheets)}</span> 回合</h4>
                    <h4 className={`randomdice-result ${result_sheets > 0 ? 'randomdice-result-appear' : ''}`} >
                        挑戰模式需要打到 <span className='randomdice-num'>{this.separator(challenge)}</span> 回合</h4>
                </div>
                <div className='randomdice-en108'>
                    <h2>友站相挺</h2>
                    <div className='randomdice-friend'>
                        <a className='randomdice-friend-title' href='https://en108.wke.csie.ncnu.edu.tw/' target='_blank'>En108</a>
                        {/* <a href='https://en108.wke.csie.ncnu.edu.tw/' target='_blank' title='en108贊助'><img src={en108} alt="en108" className='randomdice-en108-img' /></a> */}
                    </div>
                </div>

            </div>
        )
    }
}

export default RandomDice