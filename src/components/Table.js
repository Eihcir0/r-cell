import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Parser as FormulaParser } from 'hot-formula-parser'

import Row from './Row'


export default class Table extends Component {
    
    static propTypes = {
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }
    
    state = {
        data: {}
    }

    componentDidMount() {
        this.initializeCells()
    }

    getCellValue = (cellCoord, done) => {
            const x = cellCoord.column.index + 1
            const y = cellCoord.row.index + 1

        // Check if I have that coordinates tuple in the table range
        if (x > this.props.x || y > this.props.y) {
            throw this.parser.Error(this.parser.ERROR_NOT_AVAILABLE)
        }

        // Check that the cell is not self referencing REPLACE WITH DAG
        if (this.parser.cell.x === x && this.parser.cell.y === y) {
            throw this.parser.Error(this.parser.ERROR_REF)
        }

        if (!this.state.data[y] || !this.state.data[y][x]) {
            return done('')
        }

        // All fine
        return done(this.state.data[y][x])
    }

    getRangeValue = (startCellCoord, endCellCoord, done) => {
        const sx = startCellCoord.column.index + 1
        const sy = startCellCoord.row.index + 1
        const ex = endCellCoord.column.index + 1
        const ey = endCellCoord.row.index + 1
        const fragment = []

        for (let y = sy; y <= ey; y += 1) {
            const row = this.state.data[y]
            if (!row) continue
            
            const colFragment = []
            for (let x = sx; x <= ex; x += 1) {
                let value = row[x] || ''
                if (value.slice(0, 1) === '=') {
                    const res = this.executeFormula({ x, y }, value.slice(1))
                    if (res.error) throw this.parser.Error(res.error)
                    value = res.result
                }
                colFragment.push(value)
            }
            fragment.push(colFragment)
        }

        done(fragment)
        // if (fragment) {
        //     done(fragment)
        // }
    }

    initializeCells = () => {
        this.parser = new FormulaParser()

        // When a formula contains a cell value, this event lets us
        // hook and return an error value if necessary
        this.parser.on('callCellValue', this.getCellValue)

        // When a formula contains a range value, this event lets us
        // hook and return an error value if necessary
        this.parser.on('callRangeValue', this.getRangeValue)
    }

    handleChangedCell = ({ x, y }, value) => {
        const data = { ...this.state.data }
        if (!data[y]) data[y] = {}
        data[y][x] = value
        this.setState({ data})
    }

    updateCells = () => {
        this.forceUpdate()
    }

    /**
     * Executes the formula on the `value` using the
     * FormulaParser object
     */
    executeFormula = (cell, value) => {
        this.parser.cell = cell
        let res = this.parser.parse(value)
        if (res.error != null) {
            return res // tip: returning `res.error` shows more details
        }
        if (res.result.toString() === '') {
            return res
        }
        if (res.result.toString().slice(0, 1) === '=') {
            // formula points to formula
            res = this.executeFormula(cell, res.result.slice(1))
        }
        return res
    }

    render() {
        const rows = []
        for (let y = 0; y < this.props.y + 1; y += 1) {
            const rowData = this.state.data[y] || {}
            rows.push(
                <Row
                    executeFormula={this.executeFormula}
                    handleChangedCell={this.handleChangedCell}
                    updateCells={this.updateCells}
                    key={y}
                    y={y}
                    x={this.props.x + 1}
                    rowData={rowData}
                />,
            )
        }
        return (
            <div>
                {rows}
            </div>
        )
    }
}
