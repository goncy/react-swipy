# React Swipy (`react-swipy`)
[![Build Status](https://travis-ci.org/goncy/react-swipy.svg?branch=master)](https://travis-ci.org/goncy/react-swipy)
[![Coverage Status](https://coveralls.io/repos/github/goncy/react-swipy/badge.svg?branch=master)](https://coveralls.io/github/goncy/react-swipy?branch=master)

A simple Tinder-like swipeable React component

## Installation
```sh
npm install --save react-swipy
```

## Why
I didn't like the lack of control on mose deck-based swipeable components out there

## How
[![See in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/5x53pnrn3x)
```jsx
import React, {Component} from "react";
import Swipeable from "react-swipy"

import Card from "./components/Card";
import Button from "./components/Button";

const wrapperStyles = {position: "relative", width: "250px", height: "250px"};
const actionsStyles = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 12,
};

class App extends Component {
  state = {
    cards: ["First", "Second", "Third"],
  };

  remove = () =>
    this.setState(({cards}) => ({
      cards: cards.slice(1, cards.length),
    }));

  render() {
    const {cards} = this.state;

    return (
      <div>
        <div style={wrapperStyles}>
          {cards.length > 0 ? (
            <div style={wrapperStyles}>
              <Swipeable
                buttons={({right, left}) => (
                  <div style={actionsStyles}>
                    <Button onClick={left}>Reject</Button>
                    <Button onClick={right}>Accept</Button>
                  </div>
                )}
                onAfterSwipe={this.remove}
              >
                <Card>{cards[0]}</Card>
              </Swipeable>
              {cards.length > 1 && <Card zIndex={-1}>{cards[1]}</Card>}
            </div>
          ) : (
            <Card zIndex={-2}>No more cards</Card>
          )}
        </div>
      </div>
    );
  }
}

export default App;
```
