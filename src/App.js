import React from 'react'
import Table from './components/Table'

const App = () =>
  (<div style={{ width: 'max-content' }}>
    <h1>Richie's Super Awesome Spreadsheet</h1>
    <Table x={26} y={26} />
  </div>)

export default App