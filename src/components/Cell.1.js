import React, { Component } from 'react'
import PropTypes from 'prop-types'

const ALPHA = ' abcdefghijklmnopqrstuvwxyz'.split('')

/**
 * Cell reportesents the atomic element of a table
 * whatever that means
 */

 export default class Cell extends Component {

    static propTypes = {
        onChangedValue: PropTypes.func.isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        value: PropTypes.string.isRequired,
    }

    state = {
        editing: false,
        value: this.props.value,
    }

    display = 1
    // display = this.determineDisplay(
    //   { x: this.props.x, y: this.props.y },
    //   this.props.value
    // )

    timer = 0
    delay = 200
    prevent = false

    /**
    * Add listener to the `unselectAll` event used to broadcast the
    * unselect all event
    */
    componentDidMount() {
        window.document.addEventListener('unselectAll', this.handleUnselectAll)
    }

    /**
     * Before updating, execute the formula on the Cell value to
     * calculate the `display` value. Especially useful when a
     * redraw is pushed upon this cell when editing another cell
     * that this might depend upon
     */
    componentWillUpdate() {
        this.display = this.determineDisplay(
            { x: this.props.x, y: this.props.y }, this.state.value)
    }

    /**
     * Remove the `unselectAll` event listener added in
     * `componentDidMount()`
     */
    componentWillUnmount() {
        window.document.removeEventListener('unselectAll', this.handleUnselectAll)
    }

    /**
     * When a Cell value changes, re-determine the display value
     * by calling the formula calculation
     */
    onChange = (e) => {
        this.setState({ value: e.target.value})
        this.display = this.determineDisplay(
            { x: this.props.x, y: this.props.y }, e.target.value
        )
    }

    onKeyPressOnInput = (e) => {
        if (e.key === 'Enter') {
            this.hasNewValue(e.target.value)
        }
    }

    onKeyPressOnSpan = () => {
        if (!this.state.editing) {
            this.setState({ editing: true })
        }
    }

    onBlur = (e) => {
        this.hasNewValue(e.target.value)
    }

    handleUnselectAll = () => {
        if (this.state.selected || this.state.editing) {
            this.setState({ selected: false, editing: false })
        }
    }

    hasNewValue = (value) => {
        this.props.onChangedValue(
            {
                x: this.props.x,
                y: this.props.y,
            }
        )
    }

    emitUnselectAllEvent = () => {
        const unselectAllEvent = new Event('unselectAll')
        window.document.dispatchEvent(unselectAllEvent)
    }

    cicked = () => {
        //Prevent click and double click to conflict
        this.timer = setTimeout(() => {
            if (!this.prevent) {
                //Unselect all the other sells and set the current Cell state to 'selected'
                this.emitUnselectAllEvent()
                this.setState({selected: true})
            }
            this.prevent = false
        }, this.delay)
    }

    doubleClicked = () => {
        //Prevent clicked and double click to conflict
        clearTimeout(this.timer)
        this.prevent = true

        // Unselect all the other cells and set the current Cell state to 'selected' & 'editing'
        this.emitUnselectAllEvent()
        this.setState({ editing: true, selected: true })
    }

    determineDisplay = ({ x, y }, value) => {
        return value
    }

    calculateCss = () => {
        const css = {
            width: '80px',
            padding: '4px',
            margin: '0',
            height: '25px',
            boxSizing: 'border-box',
            position: 'relative',
            display: 'inline-block',
            color: 'black',
            border: '1px solid #cacaca',
            textAlign: 'left',
            verticalAlign: 'top',
            fontSize: '14px',
            lineHeight: '15px',
            overflow: 'hidden',
            fontFamily: 'Calibri, \'Segoe UI\', Thonburi, Arial, Verdana, sans-serif',
        }

        if (this.props.x === 0 || this.props.y === 0) {
            css.textAlign = 'center'
            css.backgroundColor = '#f0f0f0'
            css.fontWeight = 'bold'
        }

        if (this.state.selected) {
            css.outlineColor = 'lightblue'
            css.outlineStyle = 'dotted'
        }

        return {}
        // return css
    }

    headerRowCell = (
        <span style={this.calculateCss()}>
            {this.props.y}
        </span>
    )

    headerColumnCell = (
        <span
            onKeyPress={this.onKeyPressOnSpan}
            style={this.calculateCss()}
            role="presentation" // ????
        >
            {ALPHA[this.props.x]}
        </span>
    )

    cellInput = (
        <input
            style={this.calculateCss()}
            type="text"
            onBlur={this.onBlur}
            onKeyPress={this.onKeyPressOnInput}
            value={this.state.value}
        />
    )
    

    render() {
        if (this.props.x === 0) return this.headerRowCell
        if (this.props.y === 0) return this.headerColumnCell
        if (this.state.editing) return this.cellInput

        return (
            <span>
                onClick={this.clicked}
                ondoubleClick={this.doubleClicked}
                style={this.calculateCss()}
                role="presentation"
            >
                {this.display}
            </span>
        )
    }
 }
