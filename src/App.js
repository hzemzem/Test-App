import React, { Component } from 'react';
import Header from './components/header'
import './App.scss'

class App extends Component {

  constructor() {
    super()
    this.state = {
      mainData: {
        orders: [],
        provider_id: []
      }
    }
    this.getReports = this.getReports.bind(this)
  }

  getReports = async () => {
    const response = await fetch('https://bc-refunded-orders.herokuapp.com/all')
    const ordersData = await response.json()

    this.setState({
      mainData: {
        orders: ordersData.v3.data,
        provider_id: ordersData.v2
      }
    })
    
    // console.log(this.state.mainData)
    // console.log(this.state.provider_id)

    let orders = this.state.mainData.orders.map(order => ({
      ID: order.id,
      Order_ID: order.order_id,
      Date: order.created,
      Amount: `$ ${order.total_amount}`,
      Payment_Provider_Name: order.payments[0].provider_id,
      Payment_Provider_ID: this.state.mainData.provider_id.map(v2_Order => (
        order.order_id === v2_Order.id ? v2_Order.payment_provider_id : ''
      )).toString().replace(",", ""),
      Refund_Reason: order.reason
    }))

    // console.log(orders)
    const objectToCsv = (order) => {

      const csvRows = [];
      const headers = Object.keys(order[0])
      csvRows.push(headers);
      
      for (const row of order) {
        const values = headers.map(header => {
          const escaped = ('' + row[header]).replace(/"/g, '\\"')
          return `"${escaped}"`
        })
        csvRows.push(values)
      }
      
      return csvRows.join('\n')
    }
    
    let csvData = objectToCsv(orders)

    // console.log(csvData)

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', 'download.csv')
    document.body.appendChild(a)
    a.click()


    // console.log(order)
    // console.log(this.state.orders)
  }


  render() {
    return (
      <div className="App">
        <Header />
        <div className="body">
          <button onClick={this.getReports}>Download Refunded Orders Report</button>
        </div>
      </div>
    );
  }
}

export default App;
