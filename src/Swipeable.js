import React, {PureComponent, Fragment} from "react";
import {Spring} from "react-spring";
import {
  getDirection,
  getOpacity,
  getOffset,
  withX,
  getLimitOffset,
} from "./helpers";

const SWIPE_CONFIG = {
  tension: 390,
  friction: 30,
  restSpeedThreshold: 1,
  restDisplacementThreshold: 0.01,
  overshootClamping: true,
  lastVelocity: 1,
  mass: 0.1,
};

const DEFAULT_PROPS = {
  limit: 120,
};

const INITIAL_STATE = {
  start: 0,
  offset: 0,
  forced: false,
  swiped: false,
  moving: false,
  pristine: true,
};

export default class Swipeable extends PureComponent {
  static defaultProps = DEFAULT_PROPS;

  state = INITIAL_STATE;

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

  onDragStart = withX(start => {
    if (this.state.swiped) return;

    this.setState({start, pristine: false, moving: true});
  });

  onDragMove = withX(end => {
    const {start, swiped, moving} = this.state;

    if (swiped || !moving) return;

    this.setState({offset: getOffset(start, end)});
  });

  onDragEnd = () => {
    const {offset, swiped, moving} = this.state;
    const {limit} = this.props;

    if (swiped || !moving) return;

    if (Math.abs(offset) >= limit) {
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

    this.setState(INITIAL_STATE);

    if (onAfterSwipe) {
      onAfterSwipe();
    }
  };

  forceSwipe = direction => {
    if (this.state.swiped) return;

    this.setState({
      pristine: false,
      forced: true,
    });

    this.onBeforeSwipe(direction);
  };

  render() {
    const {offset, swiped, pristine, forced} = this.state;
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
          immediate={pristine || (!forced && Math.abs(offset) >= limit)}
          config={SWIPE_CONFIG}
        >
          {({offset, opacity}) => (
            <div
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
