import React from 'react';
import renderer from 'react-test-renderer';
import {act} from 'react-test-renderer';
import {AppLogo} from '../AppLogo';

describe('AppLogo', () => {
  it('renders at default size', () => {
    let tree;
    act(() => {
      tree = renderer.create(<AppLogo />).toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders at custom size', () => {
    let tree;
    act(() => {
      tree = renderer.create(<AppLogo size={96} />).toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders small (hides monogram)', () => {
    let tree;
    act(() => {
      tree = renderer.create(<AppLogo size={32} />).toJSON();
    });
    expect(tree).toMatchSnapshot();
  });
});
