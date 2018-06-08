import React, { Component } from "react";
import { render } from "react-dom";

import Swipeable from "../../Swipeable"

const wrapperStyles = {position: "relative", width: "250px", height: "250px"};
const actionsStyles = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 12,
};

export default class Demo extends Component {
  state = {
    cards: ["First", "Second", "Third", "Fourth"],
    direction: ''
  };

  remove = () =>
    this.setState(({cards}) => ({
      cards: cards.slice(1, cards.length),
    }));

  setDirection = direction => this.setState({direction})

  render() {
    const {cards, direction} = this.state;

    return (
      <div>
        <div style={wrapperStyles}>
          {cards.length > 0 ? (
            <div style={wrapperStyles}>
              <Swipeable
                onAfterSwipe={this.remove}
                onSwipe={this.setDirection}
                {...this.props}
              >
                <div data-test="content">{cards[0]}</div>
              </Swipeable>
              {cards.length > 1 && <div style={{zIndex: -1}}>{cards[1]}</div>}
            </div>
          ) : (
            <div style={{zIndex: -2}}>No more cards</div>
          )}
        </div>
        <div data-test="direction">{direction}</div>
      </div>
    );
  }
}
