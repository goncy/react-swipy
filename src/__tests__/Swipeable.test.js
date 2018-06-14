import React from "react";
import {mount} from "enzyme";

import Swipeable from "../Swipeable";
import {getOffset} from "../helpers";

import Demo from "./helpers/Demo";
import {getState, simulate, swipe, wait} from "./helpers/events";

describe("Lifecycles", () => {
  const wrapper = mount(
    <Swipeable>
      <span data-test="content">Hello</span>
    </Swipeable>
  );

  it("Should have content", () => {
    expect(wrapper.find('[data-test="content"]').length).toBe(1);
  });

  it("Should unmount correctly", () => {
    wrapper.unmount();

    expect(wrapper.find('[data-test="content"]').length).toBe(0);
  });
});

describe("Buttons", () => {
  const wrapper = mount(
    <Demo
      buttons={({right, left}) => (
        <div>
          <button data-test="right" onClick={right}>
            Accept
          </button>
          <button data-test="left" onClick={left}>
            Reject
          </button>
        </div>
      )}
    />
  );

  it("Should remove a card after an accept click", async () => {
    wrapper.find('[data-test="right"]').simulate("click");

    await wait(600);

    expect(wrapper.find('[data-test="content"]').text()).toEqual("Second");
  });

  it("Should remove a card after a reject click", async () => {
    wrapper.find('[data-test="left"]').simulate("click");

    await wait(600);

    expect(wrapper.find('[data-test="content"]').text()).toEqual("Third");
  });

  it("Should wait to remove a card to remove the next one", async () => {
    wrapper.find('[data-test="left"]').simulate("click");
    wrapper.find('[data-test="left"]').simulate("click");

    await wait(600);

    expect(wrapper.find('[data-test="content"]').text()).toEqual("Fourth");
  });
});

describe("onBeforeSwipe", () => {
  let shouldSwipe = true;
  let direction = null;

  const wrapper = mount(
    <Demo
      onBeforeSwipe={(swipe, cancel) =>
        shouldSwipe ? (direction ? swipe(direction) : swipe()) : cancel()
      }
      buttons={({right, left}) => (
        <div>
          <button data-test="right" onClick={right}>
            Accept
          </button>
          <button data-test="left" onClick={left}>
            Reject
          </button>
        </div>
      )}
    />
  );

  it("Should remove a card after forcing swipe", async () => {
    wrapper.find('[data-test="left"]').simulate("click");

    await wait(600);

    expect(wrapper.find('[data-test="content"]').text()).toEqual("Second");
  });

  it("Should cancel swipe correctly", async () => {
    shouldSwipe = false;

    wrapper.find('[data-test="left"]').simulate("click");

    await wait(600);

    expect(wrapper.find('[data-test="content"]').text()).toEqual("Second");
  });

  it("Can force the swipe direction", async () => {
    shouldSwipe = true;
    direction = "right";

    wrapper.find('[data-test="left"]').simulate("click");

    await wait(600);

    expect(wrapper.find('[data-test="content"]').text()).toEqual("Third");
    expect(wrapper.find('[data-test="direction"]').text()).toEqual("right");
  });
});

describe("Double swiping", () => {
  const wrapper = mount(<Swipeable>Hello</Swipeable>);

  it("Should have the same state after clicking twice", async () => {
    simulate(wrapper, "forceSwipe", "left");
    const first = getState(wrapper);

    await wait(100);

    simulate(wrapper, "forceSwipe", "right");
    const second = getState(wrapper);

    expect(first).toMatchObject(second);
  });

  it("Should not swipe manually as soon as the button is clicked", async () => {
    simulate(wrapper, "forceSwipe", "left");
    const first = getState(wrapper);

    await wait(100);

    swipe(wrapper, 250);
    const second = getState(wrapper);

    expect(first).toMatchObject(second);
  });
});

describe("Cancel", () => {
  const onSwipe = jest.fn();
  const wrapper = mount(
    <Swipeable limit={500} onSwipe={onSwipe}>
      Hello
    </Swipeable>
  );

  it("Should not swipe if the limit wasn't reached", async () => {
    swipe(wrapper, 200);

    expect(onSwipe).toHaveBeenCalledTimes(0);
  });
});

describe("Swipe", () => {
  it("Should remove a card after touch swipe", async () => {
    const onSwipe = jest.fn();
    const wrapper = mount(<Swipeable onSwipe={onSwipe}>Hello</Swipeable>);

    expect(getState(wrapper)).toMatchObject({
      start: 0,
      moving: false,
      pristine: true,
    });

    wrapper.simulate("touchStart", {
      touches: [
        {
          pageX: 500,
          pageY: 0,
        },
      ],
    });

    expect(getState(wrapper)).toMatchObject({
      start: 500,
      moving: true,
      pristine: false,
    });

    simulate(wrapper, "onDragMove", {
      touches: [
        {
          pageX: 0,
          pageY: 0,
        },
      ],
    });

    expect(getState(wrapper)).toMatchObject({
      start: 500,
      offset: getOffset(500, 0),
      moving: true,
      pristine: false,
    });

    simulate(wrapper, "onDragEnd");

    expect(onSwipe).toHaveBeenCalledTimes(1);
    expect(onSwipe).toHaveBeenCalledWith("left");
  });

  it("Should remove a card after mouse swipe", async () => {
    const onSwipe = jest.fn();
    const wrapper = mount(<Swipeable onSwipe={onSwipe} />);

    expect(getState(wrapper)).toMatchObject({
      start: 0,
      moving: false,
      pristine: true,
    });

    wrapper.simulate("mouseDown", {
      pageX: 0,
      pageY: 0,
    });

    expect(getState(wrapper)).toMatchObject({
      start: 0,
      moving: true,
      pristine: false,
    });

    simulate(wrapper, "onDragMove", {
      pageX: 500,
      pageY: 0,
    });

    expect(getState(wrapper)).toMatchObject({
      start: 0,
      offset: getOffset(0, 500),
      moving: true,
      pristine: false,
    });

    simulate(wrapper, "onDragEnd");

    expect(onSwipe).toHaveBeenCalledTimes(1);
    expect(onSwipe).toHaveBeenCalledWith("right");
  });
});

describe("onAfterSwipe", () => {
  it("Should call a handler after swiping", done => {
    const onAfterSwipe = jest.fn(() => {
      expect(onAfterSwipe).toHaveBeenCalledTimes(1);
      done();
    });

    const wrapper = mount(
      <Swipeable onAfterSwipe={onAfterSwipe}>Hello</Swipeable>
    );

    swipe(wrapper, 500);
  });
});
