import React from 'react'
import PropTypes from 'prop-types'
import Cell from './Cell'

const Row = (props) => {
    const cells = []
    const y = props.y
    for (let x = 0; x < props.x; x += 1) {
        cells.push(
            <Cell
                key={`${x}-${y}`}
                y={y}
                x={x}
                onChangedValue={props.handleChangedCellValue}
                onChangedSelected={props.handleChangedCellSelected}
                onChangedEditing={props.handleChangedCellEditing}
                updateCells={props.updateCells}
                value={props.rowValues[x] || ''}
                selected={props.rowSelected[x]}
                editing={props.rowEditing[x]}
                executeFormula={props.executeFormula}
            />
        )
    }

    return (
        <div>
            {cells}
        </div>
    )
}

Row.propsTypes = {
    handleChangedCellValue: PropTypes.func.isRequired,
    handleChangedCellSelected: PropTypes.func.isRequired,
    handleChangedCellEditing: PropTypes.func.isRequired,
    executeFormula: PropTypes.func.isRequired,
    updateCells: PropTypes.func.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    rowValues: PropTypes.shape({
        string: PropTypes.string,
    }).isRequired,
    rowSelected: PropTypes.shape({
        string: PropTypes.bool,
    }).isRequired,
    rowEditing: PropTypes.shape({
        string: PropTypes.bool,
    }).isRequired
}

export default Row