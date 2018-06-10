export function getState(wrapper) {
  return wrapper.instance().state;
}

export function simulate(wrapper, method, ...values) {
  return wrapper.instance()[method](...values);
}

export function swipe(wrapper, offset) {
  wrapper.simulate("mouseDown", {
    pageX: offset,
    pageY: 0,
  });

  simulate(wrapper, "onDragMove", {
    pageX: 0,
    pageY: 0,
  });

  simulate(wrapper, "onDragEnd");
}

export function wait(time) {
  return new Promise(_ => setTimeout(_, time));
}
