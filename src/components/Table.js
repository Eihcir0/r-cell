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
        selected: { 1: { 1: true }},
        editing: {},
        values: {},
        
    }

    componentDidMount() {
        this.initializeCells()
        window.addEventListener('keydown', this.keydown.bind(this))
    }

    keydown = (e) => {
        console.log(e.keyCode)
        switch (e.keyCode) {
            case 13:
                e.preventDefault()
                this.toggleEditing()                
                break;        
            case 37:
                e.preventDefault()
                this.moveCursor(-1, 0)                
                break;        
            case 38:
                e.preventDefault()
                this.moveCursor(0, -1)                
                break;        
            case 39:
                e.preventDefault()
                this.moveCursor(1, 0)                
                break;        
            case 40:
                e.preventDefault()
                this.moveCursor(0, 1)                
                break;        
            default:
                break;
        }
    }

    selectedArray = () => {
        const y = Object.keys(this.state.selected)[0]
        const x = Object.keys(this.state.selected[y])[0]
        return [parseInt(x), parseInt(y)]
    }

    editingArray = () => {
        if (!Object.keys(this.state.editing).length)
        const y = Object.keys(this.state.editing)[0] 
        const x = Object.keys(this.state.editing[y])[0]
        return [parseInt(x), parseInt(y)]
    }

    moveCursor = (xDiff, yDiff) => {
        const [oldX, oldY] = this.selectedArray()
        const [x, y] = [oldX + parseInt(xDiff), oldY + parseInt(yDiff)]
        // check valid new pos
        this.handleChangedCellSelected({ x, y }, true)
        
    }
    
    toggleEditing = () => {
        debugger
        const [x, y] = this.editingArray()
        const { editing: { y: { x: editing }}} = this.state
        this.handleChangedCellEditing({ x, y }, !editing)       
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

        if (!this.state.values[y] || !this.state.values[y][x]) {
            return done('')
        }

        // All fine
        return done(this.state.values[y][x])
    }

    getRangeValue = (startCellCoord, endCellCoord, done) => {
        const sx = startCellCoord.column.index + 1
        const sy = startCellCoord.row.index + 1
        const ex = endCellCoord.column.index + 1
        const ey = endCellCoord.row.index + 1
        const fragment = []

        for (let y = sy; y <= ey; y += 1) {
            const row = this.state.values[y]
            if (!row) continue
            
            const colFragment = []
            for (let x = sx; x <= ex; x += 1) {
                let values = row[x] || ''
                if (values.slice(0, 1) === '=') {
                    const res = this.executeFormula({ x, y }, values.slice(1))
                    if (res.error) throw this.parser.Error(res.error)
                    values = res.result
                }
                colFragment.push(values)
            }
            fragment.push(colFragment)
        }

        done(fragment)  /// Did I do this??
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

    handleChangedCellValue = ({ x, y }, newValue) => {
        const values = { ...this.state.values }
        if (!values.hasOwnProperty(y)) values[y] = {}
        values[y][x] = newValue
        this.setState({ values })
    }

    handleChangedCellSelected = ({ x, y }, newSelected) => {
        const selected = {}
        selected[y] = {[x]: newSelected}
        this.setState({ selected })
    }

    handleChangedCellEditing = ({ x, y }, newEditing) => {
        const editing = {}
        editing[y] = {[x]: newEditing}
        this.setState({ editing }, () => console.log(this.state))
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
            const rowValues = this.state.values[y] || {}
            const rowSelected = this.state.selected[y] || {}
            const rowEditing = this.state.editing[y] || {}
            rows.push(
                <Row
                    executeFormula={this.executeFormula}
                    handleChangedCellValue={this.handleChangedCellValue} // Maybe these can get passed down in an object since they won't be changing -- or eliminated with REDUX
                    handleChangedCellSelected={this.handleChangedCellSelected}
                    handleChangedCellEditing={this.handleChangedCellEditing}
                    updateCells={this.updateCells}
                    key={y}
                    y={y}
                    x={this.props.x + 1}
                    rowValues={rowValues}
                    rowSelected={rowSelected}
                    rowEditing={rowEditing}
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
