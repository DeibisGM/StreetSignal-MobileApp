import React from 'react';
import renderer from 'react-test-renderer';
import {LocationField} from '../LocationField';

describe('LocationField', () => {
  it('renders empty placeholder', () => {
    const tree = renderer
      .create(<LocationField label="Ubicación" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with address value', () => {
    const tree = renderer
      .create(
        <LocationField
          value="Av. 7a con Calle 45, Bogotá"
          label="Ubicación"
          onPress={() => {}}
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const tree = renderer
      .create(
        <LocationField
          value="Calle 26, Bogotá"
          disabled
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
