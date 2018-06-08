import React from "react";
import {mount} from 'enzyme';

import Demo from "./helpers/Demo"

describe('Swipeable', () => {
  describe('Lifecycles', () => {
    const wrapper = mount(<Demo />);

    it('Should have an initial First card', () => {
      expect(wrapper.find('[data-test="content"]').length).toBe(1);
    });

    it('Should unmount correctly', () => {
      wrapper.unmount();

      expect(wrapper.find('[data-test="content"]').length).toBe(0);
    })
  })

  describe('Buttons', () => {
    const wrapper = mount(
      <Demo
        buttons={({right, left}) => (
          <div>
            <button data-test="right" onClick={right}>Accept</button>
            <button data-test="left" onClick={left}>Reject</button>
          </div>
        )}
      />
    );

    it('Should remove a card after an accept click', (done) => {
      wrapper.find('[data-test="right"]').simulate('click');

      setTimeout(() => {
        expect(wrapper.find('[data-test="content"]').text()).toEqual("Second");
        done();
      }, 1000)

    })

    it('Should remove a card after a reject click', (done) => {
      wrapper.find('[data-test="left"]').simulate('click');

      setTimeout(() => {
        expect(wrapper.find('[data-test="content"]').text()).toEqual("Third");
        done();
      }, 1000)
    })

    it('Should remove only one card if a button is pressed twice quickly', (done) => {
      wrapper.find('[data-test="left"]').simulate('click');
      wrapper.find('[data-test="left"]').simulate('click');

      setTimeout(() => {
        expect(wrapper.find('[data-test="content"]').text()).toEqual("Fourth");
        done();
      }, 1000)
    })
  })

  describe("onBeforeSwipe", () => {
    let shouldSwipe = true;
    let direction = null;

    const wrapper = mount(
      <Demo
        onBeforeSwipe={(swipe, cancel, _direction) => shouldSwipe ? swipe(direction || _direction) : cancel()}
        buttons={({right, left}) => (
          <div>
            <button data-test="right" onClick={right}>Accept</button>
            <button data-test="left" onClick={left}>Reject</button>
          </div>
        )}
      />
    );

    it('Should remove a card after forcing swipe', (done) => {
      wrapper.find('[data-test="left"]').simulate('click');

      setTimeout(() => {
        expect(wrapper.find('[data-test="content"]').text()).toEqual("Second");
        done();
      }, 1000)
    })

    it('Should cancel swipe correctly', (done) => {
      shouldSwipe = false;

      wrapper.find('[data-test="left"]').simulate('click');

      setTimeout(() => {
        expect(wrapper.find('[data-test="content"]').text()).toEqual("Second");
        done();
      }, 1000)
    })

    it('Can force the swipe direction', (done) => {
      shouldSwipe = true;
      direction = "right"

      wrapper.find('[data-test="left"]').simulate('click');

      setTimeout(() => {
        expect(wrapper.find('[data-test="content"]').text()).toEqual("Third");
        expect(wrapper.find('[data-test="direction"]').text()).toEqual("right");
        done();
      }, 1000)
    })
  })
});
