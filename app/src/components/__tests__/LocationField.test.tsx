import React from 'react';
import renderer from 'react-test-renderer';
import {act} from 'react-test-renderer';
import {LocationField} from '../LocationField';

describe('LocationField', () => {
  it('renders empty placeholder', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(<LocationField label="Ubicación" />)
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders with address value', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(
          <LocationField
            value="Av. 7a con Calle 45, Bogotá"
            label="Ubicación"
            onPress={() => {}}
          />,
        )
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders disabled', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(
          <LocationField
            value="Calle 26, Bogotá"
            disabled
          />,
        )
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });
});
