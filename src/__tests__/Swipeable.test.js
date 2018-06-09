import React from "react";
import {mount} from "enzyme";

import Swipeable from "../Swipeable";
import {getOffset} from "../helpers";

import Demo from "./helpers/Demo";
import {getState, simulate, swipe} from "./helpers/events";

describe("Swipeable", () => {
  describe("Lifecycles", () => {
    const wrapper = mount(<Demo />);

    it("Should have an initial First card", () => {
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

    it("Should remove a card after an accept click", done => {
      wrapper.find('[data-test="right"]').simulate("click");

      setTimeout(() => {
        expect(wrapper.find('[data-test="content"]').text()).toEqual("Second");
        done();
      }, 1000);
    });

    it("Should remove a card after a reject click", done => {
      wrapper.find('[data-test="left"]').simulate("click");

      setTimeout(() => {
        expect(wrapper.find('[data-test="content"]').text()).toEqual("Third");
        done();
      }, 1000);
    });

    it("Should remove only one card if a button is pressed twice quickly", done => {
      wrapper.find('[data-test="left"]').simulate("click");
      wrapper.find('[data-test="left"]').simulate("click");

      setTimeout(() => {
        expect(wrapper.find('[data-test="content"]').text()).toEqual("Fourth");
        done();
      }, 1000);
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

    it("Should remove a card after forcing swipe", done => {
      wrapper.find('[data-test="left"]').simulate("click");

      setTimeout(() => {
        expect(wrapper.find('[data-test="content"]').text()).toEqual("Second");
        done();
      }, 1000);
    });

    it("Should cancel swipe correctly", done => {
      shouldSwipe = false;

      wrapper.find('[data-test="left"]').simulate("click");

      setTimeout(() => {
        expect(wrapper.find('[data-test="content"]').text()).toEqual("Second");
        done();
      }, 1000);
    });

    it("Can force the swipe direction", done => {
      shouldSwipe = true;
      direction = "right";

      wrapper.find('[data-test="left"]').simulate("click");

      setTimeout(() => {
        expect(wrapper.find('[data-test="content"]').text()).toEqual("Third");
        expect(wrapper.find('[data-test="direction"]').text()).toEqual("right");
        done();
      }, 1000);
    });
  });

  describe("Cancel", () => {
    it("Should not swipe if the limit wasn't reached", done => {
      const onSwipe = jest.fn();
      const wrapper = mount(
        <Swipeable limit={500} onSwipe={onSwipe}>
          Hello
        </Swipeable>
      );

      swipe(wrapper, 250);

      setTimeout(() => {
        expect(onSwipe).toHaveBeenCalledTimes(0);
        done();
      }, 1000);
    });

    it("Should not swipe if recently swiped", done => {
      const onSwipe = jest.fn();
      const wrapper = mount(<Swipeable onSwipe={onSwipe}>Hello</Swipeable>);

      swipe(wrapper, 500);
      swipe(wrapper, -500);

      setTimeout(() => {
        expect(onSwipe).toHaveBeenCalledTimes(1);
        done();
      }, 1000);
    });
  });

  describe("Swipe", () => {
    it("Should remove a card after touch swipe", done => {
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

      setTimeout(() => {
        expect(onSwipe).toHaveBeenCalledTimes(1);
        expect(onSwipe).toHaveBeenCalledWith("left");
        done();
      }, 1000);
    });

    it("Should remove a card after mouse swipe", done => {
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

      setTimeout(() => {
        expect(onSwipe).toHaveBeenCalledTimes(1);
        expect(onSwipe).toHaveBeenCalledWith("right");
        done();
      }, 1000);
    });
  });

  describe("onAfterSwipe", () => {
    it("Should call a handler after swiping", done => {
      const onAfterSwipe = jest.fn();
      const wrapper = mount(
        <Swipeable onAfterSwipe={onAfterSwipe}>Hello</Swipeable>
      );

      swipe(wrapper, 500);

      setTimeout(() => {
        expect(onAfterSwipe).toHaveBeenCalledTimes(1);
        done();
      }, 1000);
    });
  });
});
