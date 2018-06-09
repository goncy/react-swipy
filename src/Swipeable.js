import React, {PureComponent, Fragment} from "react";
import {Spring} from "react-spring";
import {
  getDirection,
  getOpacity,
  getOffset,
  withX,
  getLimitOffset,
} from "./helpers";

const SWIPE_CONFIG = {tension: 390, friction: 30};

export default class Swipeable extends PureComponent {
  static defaultProps = {
    limit: 120,
  };

  state = {
    start: 0,
    offset: 0,
    swiped: false,
    moving: false,
    pristine: true,
  };

  componentDidMount() {
    window.addEventListener("touchmove", this.onDragMove);
    window.addEventListener("mousemove", this.onDragMove);
    window.addEventListener("touchend", this.onDragEnd);
    window.addEventListener("mouseup", this.onDragEnd);
  }

  componentWillUnmount() {
    window.removeEventListener("touchmove", this.onDragMove);
    window.removeEventListener("mousemove", this.onDragMove);
    window.removeEventListener("touchend", this.onDragEnd);
    window.removeEventListener("mouseup", this.onDragEnd);
  }

  onDragStart = withX(
    start =>
      !this.state.swiped &&
      this.setState({start, pristine: false, moving: true})
  );

  onDragMove = withX(
    end =>
      !this.state.swiped &&
      this.state.moving &&
      this.setState(({start}) => ({offset: getOffset(start, end)}))
  );

  onDragEnd = () => {
    if (this.state.swiped) return;

    const {offset} = this.state;
    const {limit} = this.props;

    if (Math.abs(offset) > limit) {
      this.onBeforeSwipe(getDirection(offset));
    } else {
      this.onCancelSwipe();
    }
  };

  onCancelSwipe = () => this.setState({start: 0, offset: 0, moving: false});

  onBeforeSwipe = direction => {
    const {onBeforeSwipe} = this.props;

    if (onBeforeSwipe) {
      onBeforeSwipe(
        _direction => this.onSwipe(_direction || direction),
        this.onCancelSwipe,
        direction
      );
    } else {
      this.onSwipe(direction);
    }
  };

  onSwipe = direction => {
    const {limit, onSwipe} = this.props;

    if (onSwipe) {
      onSwipe(direction);
    }

    this.setState({
      swiped: true,
      moving: false,
      offset: getLimitOffset(limit, direction),
    });
  };

  onAfterSwipe = () => {
    const {onAfterSwipe} = this.props;

    this.setState({
      pristine: true,
      swiped: false,
      start: 0,
      offset: 0,
      moving: false,
    });

    if (onAfterSwipe) {
      onAfterSwipe();
    }
  };

  forceSwipe = direction => {
    if (this.state.swiped) return;

    this.setState({
      pristine: false,
    });

    this.onBeforeSwipe(direction);
  };

  render() {
    const {offset, swiped, pristine} = this.state;
    const {children, limit, buttons} = this.props;

    return (
      <Fragment>
        <Spring
          from={{offset: 0, opacity: 1}}
          to={{
            offset,
            opacity: getOpacity(offset, limit),
          }}
          onRest={() => swiped && this.onAfterSwipe()}
          immediate={pristine}
          config={SWIPE_CONFIG}
        >
          {({offset, opacity}) => (
            <div
              data-test="swipeable"
              style={{
                opacity,
                transform: `translateX(${offset}px) rotate(${offset / 10}deg)`,
                height: "100%",
                width: "100%",
              }}
              onMouseDown={this.onDragStart}
              onTouchStart={this.onDragStart}
            >
              {children}
            </div>
          )}
        </Spring>
        {buttons &&
          buttons({
            right: () => this.forceSwipe("right"),
            left: () => this.forceSwipe("left"),
          })}
      </Fragment>
    );
  }
}
