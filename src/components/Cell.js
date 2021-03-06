import React, { Component } from 'react'
import PropTypes from 'prop-types'

const ALPHA = ' abcdefghijklmnopqrstuvwxyz'.split('')

/**
 * Cell represents the atomic element of a table
 */
export default class Cell extends Component {
    static propTypes = {
        executeFormula: PropTypes.func.isRequired,
        onChangedValue: PropTypes.func.isRequired,
        onChangedSelected: PropTypes.func.isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        value: PropTypes.string.isRequired,
        selected: PropTypes.bool,
    }

    static defaultProps = {
        selected: false,
    }


    state = {
        editing: false,
        value: this.props.value,
    }

    
    componentDidMount() {
        this.display = this.determineDisplayValue({ x: this.props.x, y: this.props.y },this.props.value)
        this.timer = 0
        this.delay = 5
        this.prevent = false
    }

    /**
     * Before updating, execute the formula on the Cell value to
     * calculate the `display` value. Especially useful when a
     * redraw is pushed upon this cell when editing another cell
     * that this might depend upon
     */
    componentWillUpdate() {
        this.display = this.determineDisplayValue(
            { x: this.props.x, y: this.props.y }, this.state.value)
    }

    /**
    * Performance lifesaver as the cell not touched by a change can
    * decide to avoid a rerender
    */
    shouldComponentUpdate(nextProps, nextState) {
        // Has a formula value? could be affected by any change. Update
        if (this.state.value !== '' &&
            this.state.value.slice(0, 1) === '=') {
            return true
        }

        // Its own state values changed? Update
        // Its own value prop changed? Update
        if (nextState.value !== this.state.value ||
            nextState.editing !== this.state.editing ||
            nextProps.selected !== this.props.selected ||
            nextProps.value !== this.props.value) {
            return true
        }

        return false
    }

    /**
     * When a Cell value changes, re-determine the display value
     * by calling the formula calculation
     */
    onChange = (e) => {
        this.setState({ value: e.target.value })
        this.display = this.determineDisplayValue({ x: this.props.x, y: this.props.y }, e.target.value)
    }

    /**
     * Handle pressing a key when the Cell is an input element
     */
    onKeyPressOnInput = (e) => {
        if (e.key === 'Enter') {
            this.hasNewValue(e.target.value)
        }
    }

    /**
     * Handle pressing a key when the Cell is a span element,
     * not yet in editing mode
     */
    onKeyPressOnSpan = () => {
        if (!this.state.editing) {
            this.setState({ editing: true })
        }
    }

    /**
     * Handle moving away from a cell, stores the new value
     */
    onBlur = (e) => {
        this.hasNewValue(e.target.value)
    }

    /**
     * Called by the `onBlur` or `onKeyPressOnInput` event handlers,
     * it escalates the value changed event, and restore the editing
     * state to `false`.
     */
    hasNewValue = (value) => {
        const { x, y } = this.props
        this.props.onChangedValue({ x, y }, value)
        this.setState({ editing: false })
    }

    setSelected = (value) => {
        const { x, y } = this.props
        this.props.onChangedSelected({ x, y }, value)
    }
    
    /**
     * Handle clicking a Cell.
     */
    clicked = () => {
        // Prevent click and double click to conflict
        this.timer = setTimeout(() => {
            if (!this.prevent) {
                this.setSelected(true)
                this.setState({ editing: false })
            }
            this.prevent = false
        }, this.delay)
    }

    /**
     * Handle doubleclicking a Cell.
     */
    doubleClicked = () => {
        // Prevent click and double click to conflict
        clearTimeout(this.timer)
        this.prevent = true
        this.setSelected(true)
        this.setState({ editing: true })
    }

    determineDisplayValue = ({ x, y }, value) => {
        if (value.slice(0, 1) === '=') {
            const res = this.props.executeFormula({ x, y }, value.slice(1))
        if (res.error !== null) return 'INVALID'
        return res.result
    }
    return value
    }

    /**
     * Calculates a cell's CSS values
     */
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
            fontFamily: 'Calibri, \'Segoe UI\', Thonburi,Arial, Verdana, sans-serif',
        }

        if (this.props.x === 0 || this.props.y === 0) {
            css.textAlign = 'center'
            css.backgroundColor = '#f0f0f0'
            css.fontWeight = 'bold'
        }

        return css
    }

    headerColumnCell = (css) => {
        return (
            <span style={css}>
                {this.props.y}
            </span>
        )
    }

    headerRowCell = (css) => {
        return (
            <span
                onKeyPress={this.onKeyPressOnSpan}
                style={css}
                role="presentation"
            >
                {ALPHA[this.props.x]}
            </span>
        )
    }

    render() {
      const css = this.calculateCss()

      if (this.props.x === 0) return this.headerColumnCell(css)
      if (this.props.y === 0) return this.headerRowCell(css)

      if (this.props.selected) {
          css.outlineColor = 'lightblue'
          css.outlineStyle = 'dotted'
      }

      if (this.state.editing) {
          return (
            <input
                style={css}
                type="text"
                onBlur={this.onBlur}
                onKeyPress={this.onKeyPressOnInput}
                value={this.state.value}
                onChange={this.onChange}
                autoFocus
            />
          )
      }

      return (
          <span
            onClick={e => this.clicked(e)}
            onDoubleClick={e => this.doubleClicked(e)}
            style={css}
            role="presentation"
          >
            {this.display}
          </span>
      )
    }
}
